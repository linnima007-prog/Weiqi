/**
 * main.js —— 应用主控制器
 * 负责：模式切换、教程流程（text/quiz/move/free 步骤）、自由对局、AI、数地
 */
(function () {
  'use strict';
  const GO = window.GO, GoBoard = window.GoBoard;
  const SIZE = 9;
  const KOMI = 7.5;
  const $ = id => document.getElementById(id);

  const canvas = $('boardCanvas');
  const canvasFree = $('boardCanvasFree');

  // ---------------- 应用状态 ----------------
  const app = {
    mode: 'tutorial',        // 'tutorial' | 'free'
    courseMode: 'tutorial',  // 自由对局时仍记住侧栏最后展示的课程目录
    lesson: 0,
    step: 0,
    tutorialLesson: 0,
    tutorialStep: 0,
    board: new GoBoard(SIZE),
    playerColor: GO.BLACK,
    turn: GO.BLACK,
    lastMove: null,
    passed: false,
    stepDone: false,
    hover: -1,
    // 自由对局
    freeType: 'ai',
    freeBoard: new GoBoard(SIZE),
    freeTurn: GO.BLACK,
    freeLast: -1,
    freePassCount: 0,
    freeEnded: false,
    scoreWarningAcknowledged: false,
    freeEmbedded: false,     // 是否处于课程嵌入式对局
    aiThinking: false,
    showingTerritory: false,   // 数地后是否在棋盘上标出地盘
    lastGameResult: null     // 最近一次数地结果（'黑'/'白'/'和'），用于毕业测试结算
  };

  // 进度持久化：{ lessonId: true }
  const progress = JSON.parse(localStorage.getItem('weiqiActionCourseProgressV1') || '{}');
  function saveProgress() { localStorage.setItem('weiqiActionCourseProgressV1', JSON.stringify(progress)); }
  function isCourseMode() { return app.mode === 'tutorial'; }
  function activeLessons() { return LESSONS; }
  function activeProgress() { return progress; }
  function saveActiveProgress() { saveProgress(); }
  function nextButtonLabel(lesson) {
    const lessons = activeLessons();
    if (app.step < lesson.steps.length - 1) return '下一步 →';
    if (app.lesson < lessons.length - 1) return '下一课 →';
    return '完成教程 🎉';
  }

  // ---------------- 工具函数 ----------------
  function canvasToIntersection(cv, e) {
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width / rect.width, scaleY = cv.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const PAD = 36, W = cv.width;
    const cell = (W - PAD * 2) / (SIZE - 1);
    const col = Math.round((x - PAD) / cell);
    const row = Math.round((y - PAD) / cell);
    if (col < 0 || col > SIZE - 1 || row < 0 || row > SIZE - 1) return -1;
    return row * SIZE + col;
  }

  function showMsg(html, type) {
    const box = $('messageBox');
    box.className = 'message ' + (type || '');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  function hideMsg() { $('messageBox').classList.add('hidden'); }

  function showModal(html) {
    $('modalBody').innerHTML = html;
    $('modal').classList.remove('hidden');
  }
  function closeModal() { $('modal').classList.add('hidden'); }

  function colorName(c) { return c === GO.BLACK ? '黑棋' : '白棋'; }
  function colorDot(c) {
    return '<span class="stone-mini ' + (c === GO.BLACK ? 'black' : 'white') + '"></span>';
  }

  // ---------------- 步骤高亮（气等） ----------------
  let animId = null;
  // 计算当前步骤要在棋盘上高亮的点：visual 步骤直接取 highlights；move 步骤可高亮某棋块的气
  function stepHighlights(step) {
    // visual 步骤的高亮带呼吸动画；highlightLibertiesOf 对 visual/quiz/move 所有步骤生效
    const animate = step.type === 'visual';
    const out = [];
    if (step.highlights) {
      for (const h of step.highlights) out.push({ i: h.i, style: h.style, label: h.label, animate });
    }
    if (step.highlightLibertiesOf != null) {
      const targets = Array.isArray(step.highlightLibertiesOf) ? step.highlightLibertiesOf : [step.highlightLibertiesOf];
      for (const i of targets) {
        if (app.board.grid[i] === GO.EMPTY) continue;
        app.board.liberties(i).forEach((li, k) => out.push({ i: li, label: k + 1, animate }));
      }
    }
    return out;
  }
  function stopHighlightAnim() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }
  function startHighlightAnim() {
    stopHighlightAnim();
    const start = performance.now();
    const loop = t => {
      const step = activeLessons()[app.lesson].steps[app.step];
      if (!isCourseMode() || step.type !== 'visual' || app.stepDone) { stopHighlightAnim(); return; }
      const phase = ((t - start) / 1000) % 1;
      const highlights = stepHighlights(step).map(h => ({ ...h, phase }));
      drawBoard(canvas, app.board, { highlights });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
  }

  // ---------------- 演示动画（demo 步骤） ----------------
  let demoTok = 0;
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function cancelDemo() {
    demoTok++; // 使正在进行的 runDemo 在下一个 await 处退出
    if (app._demoNextCleanup) { app._demoNextCleanup(); app._demoNextCleanup = null; } // 清理"下一帧"按钮监听
  }
  function buildDemoHighlights(f) {
    const out = [];
    // highlightLibs 可为单个坐标或数组（多个棋块分别标气）
    const targets = Array.isArray(f.highlightLibs) ? f.highlightLibs : (f.highlightLibs != null ? [f.highlightLibs] : []);
    let n = 1;
    for (const t of targets) {
      if (t == null || app.board.grid[t] === GO.EMPTY) continue;
      for (const li of app.board.liberties(t)) {
        if (!out.some(o => o.i === li)) out.push({ i: li, label: n++ });
      }
    }
    if (f.highlights) f.highlights.forEach(h => out.push({ i: h.i, style: h.style, label: h.label }));
    return out;
  }
  function updateDemoDots(idx) {
    const wrap = $('demoDots');
    if (!wrap) return;
    for (let i = 0; i < wrap.children.length; i++) {
      wrap.children[i].className = 'demo-dot' + (i === idx ? ' active' : '') + (i < idx ? ' done' : '');
    }
  }
  // 提子淡出动画（帧内效果，自动播放；播放完后停留等待玩家点"下一帧"）
  async function flashStone(idx, ms, tok) {
    const start = performance.now();
    await new Promise(resolve => {
      const loop = t => {
        if (demoTok !== tok) { resolve(); return; }
        const p = Math.min(1, (t - start) / ms);
        drawBoard(canvas, app.board, { last: app.lastMove, flash: idx, flashAlpha: 1 - p });
        if (p >= 1) { resolve(); return; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  }
  // 等待玩家点击"下一帧"按钮（手动播放，不再自动切帧）
  function waitForDemoNext() {
    return new Promise(resolve => {
      const btn = $('btnDemoNext');
      btn.classList.remove('hidden');
      const cleanup = () => {
        btn.classList.add('hidden');
        btn.removeEventListener('click', handler);
        if (app._demoNextCleanup === cleanup) app._demoNextCleanup = null;
      };
      function handler() { cleanup(); resolve(); }
      app._demoNextCleanup = cleanup;
      btn.addEventListener('click', handler);
    });
  }
  async function runDemo(step) {
    const tok = ++demoTok;
    const frames = step.frames || [];
    const cap = $('demoCaption');
    const next = $('btnNext');
    next.classList.add('hidden');
    $('btnDemoNext').classList.add('hidden');
    for (let i = 0; i < frames.length; i++) {
      if (demoTok !== tok) return;
      const f = frames[i];
      if (f.board) app.board.grid = window.parseSetup(f.board);
      if (cap) cap.innerHTML = f.text || '';
      updateDemoDots(i);
      drawBoard(canvas, app.board, { highlights: buildDemoHighlights(f), last: f.mark != null ? f.mark : -1 });
      // 帧内动画（提子淡出）自动播完，然后停留等待玩家点击"下一帧"
      if (f.flash != null) {
        await flashStone(f.flash, f.flashMs || 1500, tok);
        if (demoTok !== tok) return;
      }
      await waitForDemoNext();
      if (demoTok !== tok) return;
    }
    if (demoTok !== tok) return;
    updateDemoDots(frames.length - 1);
    next.textContent = '继续 →';
    next.classList.remove('hidden');
  }

  // ---------------- 课程目录 ----------------
  function isLessonUnlocked(index) {
    return index === 0 || progress[LESSONS[index - 1].id] === true;
  }

  function renderLessonList() {
    const lessons = activeLessons();
    const courseProgress = activeProgress();
    const ul = $('lessonList');
    ul.innerHTML = '';
    $('catalogTitle').textContent = '行动课程';
    $('catalogNote').classList.remove('hidden');
    $('catalogNote').textContent = '每课：学一个动作 → 两道局部题 → 短对局 → 复盘。';
    let renderedUnit = null;
    lessons.forEach((l, i) => {
      if (l.unit && l.unit !== renderedUnit) {
        renderedUnit = l.unit;
        const unit = document.createElement('li');
        unit.className = 'lesson-unit';
        unit.textContent = l.unit;
        ul.appendChild(unit);
      }
      const li = document.createElement('li');
      const unlocked = isLessonUnlocked(i);
      li.className = 'lesson-item' + (i === app.lesson ? ' active' : '') + (unlocked ? '' : ' locked');
      const done = courseProgress[l.id] === true;
      li.innerHTML = '<span class="lesson-num">' + l.id + '</span>' +
        '<span class="lesson-name">' + l.title + '</span>' +
        (done ? '<span class="lesson-check">✓</span>' : '');
      li.addEventListener('click', () => {
        if (!unlocked) {
          showMsg('请先完成上一课，再开启这一课。', 'warn');
          return;
        }
        if (!isCourseMode()) switchMode(app.courseMode);
        app.lesson = i; app.step = 0; renderStep();
      });
      ul.appendChild(li);
    });
    // 进度条
    let completed = 0;
    LESSONS.forEach(l => { if (progress[l.id]) completed++; });
    $('progressFill').style.width = (completed / LESSONS.length * 100) + '%';
    const completedCourses = LESSONS.slice(0, -1).filter(l => progress[l.id]).length;
    const graduationDone = progress[LESSONS[LESSONS.length - 1].id] === true;
    $('progressText').textContent = '已完成 ' + completedCourses + ' / ' + (LESSONS.length - 1) + ' 课' +
      (graduationDone ? ' · 已毕业' : ' · 毕业测试待完成');
  }

  // ---------------- 教程流程 ----------------
  function renderStepDots() {
    const lesson = activeLessons()[app.lesson];
    const dots = $('stepDots');
    dots.innerHTML = '';
    lesson.steps.forEach((s, i) => {
      const d = document.createElement('span');
      d.className = 'dot' + (i === app.step ? ' active' : '') + (i < app.step ? ' done' : '');
      d.textContent = i + 1;
      dots.appendChild(d);
    });
  }

  function renderQuiz(step) {
    const panel = $('stepPanel');
    const q = document.createElement('p');
    q.className = 'quiz-question';
    q.textContent = '❓ ' + step.question;
    panel.appendChild(q);
    const wrap = document.createElement('div');
    wrap.className = 'quiz-options';
    step.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (app.stepDone) return;
        const btns = wrap.querySelectorAll('.quiz-opt');
        btns.forEach(x => x.disabled = true);
        b.classList.add(i === step.answer ? 'correct' : 'wrong');
        btns[step.answer].classList.add('correct');
        app.stepDone = true;
        const exp = document.createElement('p');
        exp.className = 'quiz-explain';
        exp.innerHTML = (i === step.answer ? '✅ 答对了！' : '❌ 正确答案：') + step.options[step.answer] + '。<br>' + step.explanation;
        panel.appendChild(exp);
        const next = $('btnNext');
        next.textContent = nextButtonLabel(activeLessons()[app.lesson]);
        next.classList.remove('hidden');
      });
      wrap.appendChild(b);
    });
    panel.appendChild(wrap);
  }

  function renderStep() {
    stopHighlightAnim();
    cancelDemo();
    const lesson = activeLessons()[app.lesson];
    const step = lesson.steps[app.step];
    $('lessonTitle').textContent = '第 ' + lesson.id + ' 课 · ' + lesson.title;
    renderStepDots();

    const panel = $('stepPanel');
    panel.innerHTML = '';
    $('demoArea').classList.add('hidden');
    $('hintBox').classList.add('hidden');
    hideMsg();
    $('btnNext').classList.add('hidden');
    $('btnHint').classList.remove('hidden');
    $('btnRestartStep').classList.remove('hidden');
    $('btnPrev').disabled = app.step === 0;

    app.stepDone = false;
    app.lastMove = null;
    app.hover = -1;

    if (step.type === 'text') {
      const p = document.createElement('p');
      p.className = 'step-text';
      p.innerHTML = step.content;
      panel.appendChild(p);
      const next = $('btnNext');
      next.textContent = nextButtonLabel(lesson);
      next.classList.remove('hidden');
      // 文字步骤也刷新棋盘为空白，避免残留上一课的画面
      app.board = new GoBoard(SIZE);
      drawBoard(canvas, app.board, {});
    } else if (step.type === 'quiz') {
      renderQuiz(step);
      $('btnHint').classList.add('hidden');
      $('btnRestartStep').classList.add('hidden');
      // 选择题步骤：若带 setup/highlights 则展示参考棋盘（如第2课的气演示），否则显示空盘
      app.board = new GoBoard(SIZE);
      if (step.setup) app.board.grid = window.parseSetup(step.setup);
      drawBoard(canvas, app.board, { highlights: stepHighlights(step) });
    } else if (step.type === 'move') {
      app.playerColor = step.playerColor;
      app.turn = step.playerColor;
      app.board = new GoBoard(SIZE);
      if (step.setup) app.board.grid = window.parseSetup(step.setup);
      app.board.ko = (step.ko != null) ? step.ko : -1;
      const obj = document.createElement('p');
      obj.className = 'objective';
      obj.id = 'stepObjective';
      obj.innerHTML = '🎯 ' + step.objective;
      panel.appendChild(obj);
      const tag = document.createElement('div');
      tag.className = 'turn-tag';
      tag.id = 'stepTurnTag';
      tag.innerHTML = '现在轮到 ' + colorDot(app.turn) + ' ' + colorName(app.turn) + ' 落子';
      panel.appendChild(tag);
      drawBoard(canvas, app.board, { hover: -1, highlights: stepHighlights(step) });
    } else if (step.type === 'visual') {
      app.playerColor = GO.BLACK;
      app.turn = GO.BLACK;
      app.board = new GoBoard(SIZE);
      if (step.setup) app.board.grid = window.parseSetup(step.setup);
      const p = document.createElement('p');
      p.className = 'step-text';
      p.innerHTML = step.text;
      panel.appendChild(p);
      const next = $('btnNext');
      next.textContent = (app.step < lesson.steps.length - 1)
        ? '我看明白了，继续 →'
        : nextButtonLabel(lesson);
      next.classList.remove('hidden');
      $('btnRestartStep').classList.add('hidden');
      $('btnHint').classList.add('hidden');
      startHighlightAnim();
    } else if (step.type === 'demo') {
      app.playerColor = GO.BLACK;
      app.turn = GO.BLACK;
      app.board = new GoBoard(SIZE);
      $('demoArea').classList.remove('hidden');
      $('demoCaption').textContent = '';
      const wrap = $('demoDots');
      wrap.innerHTML = '';
      (step.frames || []).forEach(() => {
        const d = document.createElement('span');
        d.className = 'demo-dot';
        wrap.appendChild(d);
      });
      $('btnDemoNext').classList.add('hidden');
      $('btnHint').classList.add('hidden');
      $('btnRestartStep').classList.add('hidden');
      runDemo(step);
    } else if (step.type === 'free') {
      startEmbeddedFree(step);
    }
    renderLessonList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeStep(r) {
    app.stepDone = true;
    const objective = $('stepObjective');
    if (objective) objective.innerHTML = '✅ 本环节目标已完成。';
    const turnTag = $('stepTurnTag');
    if (turnTag) turnTag.textContent = '本环节已完成，可以进入下一步。';
    if (r && r.successMsg) showMsg(r.successMsg, 'success');
    else showMsg('✅ 完成本步！', 'success');
    const lesson = activeLessons()[app.lesson];
    const btn = $('btnNext');
    btn.textContent = nextButtonLabel(lesson);
    btn.classList.remove('hidden');
  }

  function playTutorialMove(i) {
    const step = activeLessons()[app.lesson].steps[app.step];
    const b = app.board;
    if (b.grid[i] !== GO.EMPTY) { showMsg('⚠️ 这个交叉点上已经有棋子了。', 'warn'); return; }
    if (!b.isLegal(app.turn, i)) {
      if (i === b.ko) showMsg('⛔ 打劫！你不能立刻在原位提回，请先下在别处（找劫材）。', 'warn');
      else showMsg('⛔ 这是禁入点！把棋子下在这里会“自杀”，规则不允许。请换个地方。', 'warn');
      return;
    }
    // 题目预设棋子不在 history 中，因此不能用 undo() 回退错误落子；
    // 保存完整局面，答错时原样恢复，避免把题面一起清空。
    const gridBeforeMove = b.grid.slice();
    const koBeforeMove = b.ko;
    const historyLengthBeforeMove = b.history.length;
    const res = b.play(app.turn, i);
    if (!res.ok) return;
    app.lastMove = i;
    drawBoard(canvas, b, { hover: -1, last: i, highlights: stepHighlights(step) });
    const r = step.check({ board: b, lastMove: i, passed: false });
    if (r.done) {
      completeStep(r);
      return;
    }
    if (r.retry) {
      b.grid = gridBeforeMove;
      b.ko = koBeforeMove;
      b.history.length = historyLengthBeforeMove;
      app.lastMove = b.history.length ? b.history[b.history.length - 1].idx : null;
      drawBoard(canvas, b, { hover: -1, last: app.lastMove, highlights: stepHighlights(step) });
      if (r.hint) showMsg(r.hint, 'hint');
      return;
    }
    if (r.replyMove != null) {
      const replyColor = r.replyColor != null ? r.replyColor : (3 - app.turn);
      if (!b.isLegal(replyColor, r.replyMove)) {
        showMsg('⚠️ 短对局的回应棋无法落下，请重做本步。', 'warn');
        return;
      }
      b.play(replyColor, r.replyMove);
      app.lastMove = r.replyMove;
      app.turn = step.playerColor;
      const tag = $('stepTurnTag');
      if (tag) tag.innerHTML = '现在轮到 ' + colorDot(app.turn) + ' ' + colorName(app.turn) + ' 落子';
      if (r.objective != null) {
        const obj = $('stepObjective');
        if (obj) obj.innerHTML = '🎯 ' + r.objective;
      }
      drawBoard(canvas, b, { hover: -1, last: app.lastMove, highlights: stepHighlights(step) });
      if (r.hint) showMsg(r.hint, 'hint');
      return;
    }
    if (r.nextPlayer != null) {
      // 多阶段移动：本手完成，切换到下一手（如“打二还一”中的“还一”）
      app.turn = r.nextPlayer;
      const tag = $('stepTurnTag');
      if (tag) tag.innerHTML = '现在轮到 ' + colorDot(app.turn) + ' ' + colorName(app.turn) + ' 落子';
      if (r.objective != null) {
        const obj = $('stepObjective');
        if (obj) obj.innerHTML = '🎯 ' + r.objective;
      }
      if (r.hint) showMsg(r.hint, 'hint');
    } else if (r.hint) {
      showMsg(r.hint, 'hint');
    }
  }

  // 教程棋盘事件
  canvas.addEventListener('click', e => {
    if (!isCourseMode() || app.freeEmbedded) return;
    const step = activeLessons()[app.lesson].steps[app.step];
    if (step.type !== 'move' || app.stepDone) return;
    const i = canvasToIntersection(canvas, e);
    if (i < 0) return;
    playTutorialMove(i);
  });
  canvas.addEventListener('mousemove', e => {
    if (!isCourseMode() || app.freeEmbedded) return;
    const step = activeLessons()[app.lesson].steps[app.step];
    if (step.type === 'visual' || step.type === 'demo') return; // 演示/动画步骤由各自绘制流程负责
    if (step.type !== 'move' || app.stepDone) { drawBoard(canvas, app.board, { last: app.lastMove, highlights: stepHighlights(step) }); return; }
    const i = canvasToIntersection(canvas, e);
    const illegal = i >= 0 && app.board.grid[i] === GO.EMPTY && !app.board.isLegal(app.turn, i);
    app.hover = i;
    drawBoard(canvas, app.board, { hover: i, last: app.lastMove, hoverColor: app.turn, illegal: !!illegal, highlights: stepHighlights(step) });
  });
  canvas.addEventListener('mouseleave', () => {
    const step = activeLessons()[app.lesson].steps[app.step];
    if (step.type === 'demo') return; // demo 画面由 runDemo 控制，避免重绘干扰帧内淡出
    drawBoard(canvas, app.board, { last: app.lastMove, highlights: stepHighlights(step) });
  });

  // 教程按钮
  $('btnHint').addEventListener('click', () => {
    const step = activeLessons()[app.lesson].steps[app.step];
    const hint = step.hint || '想一想，看看任务描述。';
    const box = $('hintBox');
    box.innerHTML = '💡 提示：' + hint;
    box.classList.remove('hidden');
  });
  $('btnRestartStep').addEventListener('click', renderStep);
  $('btnPrev').addEventListener('click', () => {
    if (app.step === 0) return;
    app.step--;
    renderStep();
  });
  $('btnNext').addEventListener('click', () => {
    const lessons = activeLessons();
    const lesson = lessons[app.lesson];
    if (app.step < lesson.steps.length - 1) {
      app.step++;
      renderStep();
    } else {
      activeProgress()[lesson.id] = true;
      saveActiveProgress();
      renderLessonList();
      if (app.lesson < lessons.length - 1) {
        app.lesson++;
        app.step = 0;
        renderStep();
      } else {
        showCompletion();
      }
    }
  });
  function showCompletion() {
    progress[LESSONS[LESSONS.length - 1].id] = true;
    saveProgress();
    renderLessonList();
    // 毕业测试的对局结果（玩家执黑）
    const res = app.lastGameResult;
    let resultHtml = '';
    if (res === '黑') resultHtml = '<p>🏆 毕业测试你<b>战胜了电脑</b>——实至名归，干得漂亮！</p>';
    else if (res === '白') resultHtml = '<p>毕业测试输给了电脑——没关系，完成即毕业，去自由对局多下几盘找回来！</p>';
    else if (res === '和') resultHtml = '<p>毕业测试下成了和棋——势均力敌的一局！</p>';
    showModal(
      '<h3>🎓 毕业啦！</h3>' +
      '<p>你完成了全部 ' + (LESSONS.length - 1) + ' 课和毕业测试。</p>' +
      resultHtml +
      '<p>你已掌握：落子、打吃、提子、逃跑、连接、切断、禁入点、做眼、打劫、围地、基本手筋与开局方向。</p>' +
      '<p>接下来继续用“观察弱棋 → 找候选点 → 计算几手 → 再落子”的顺序多下 9 路棋。</p>'
    );
    $('modalClose').textContent = '去自由对局 ▶';
    $('modalClose').onclick = () => { closeModal(); switchMode('free'); };
  }

  // ---------------- 课程嵌入式自由对局 ----------------
  function startEmbeddedFree(step) {
    app.freeEmbedded = true;
    app.mode = 'free';
    $('tutorialPanel').classList.add('hidden');
    $('freePanel').classList.remove('hidden');
    $('freeMode').value = 'ai';
    $('freeBanner').classList.remove('hidden');
    $('freeBanner').textContent = '🎯 ' + step.objective;
    initFree('ai');
  }

  // ---------------- 自由对局 ----------------
  function switchMode(mode) {
    stopHighlightAnim();
    cancelDemo();
    if (isCourseMode()) {
      app[app.mode + 'Lesson'] = app.lesson;
      app[app.mode + 'Step'] = app.step;
    }
    app.mode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    if (mode === 'tutorial') {
      app.courseMode = mode;
      app.lesson = app[mode + 'Lesson'] || 0;
      app.step = app[mode + 'Step'] || 0;
      app.freeEmbedded = false;
      $('freePanel').classList.add('hidden');
      $('tutorialPanel').classList.remove('hidden');
      renderStep();
    } else {
      $('tutorialPanel').classList.add('hidden');
      $('freePanel').classList.remove('hidden');
      $('freeBanner').classList.add('hidden');
      initFree(app.freeType);
    }
  }

  function initFree(type) {
    app.freeType = type;
    app.freeBoard = new GoBoard(SIZE);
    app.freeTurn = GO.BLACK;
    app.freeLast = -1;
    app.freePassCount = 0;
    app.freeEnded = false;
    app.scoreWarningAcknowledged = false;
    app.aiThinking = false;
    app.showingTerritory = false;
    hideScorePanel();
    updateFreeInfo();
    drawBoard(canvasFree, app.freeBoard, {});
  }

  function updateFreeInfo() {
    const b = app.freeBoard;
    const stones = b.countStones();
    let html = colorDot(app.freeTurn) + ' 轮到 <b>' + colorName(app.freeTurn) + '</b> 落子';
    if (app.freeType === 'ai' && app.freeTurn === GO.WHITE) html += '（电脑思考中…）';
    html += '　|　黑 ' + stones.b + ' 子　白 ' + stones.w + ' 子';
    $('freeInfo').innerHTML = html;
  }

  function doFreeMove(i) {
    const b = app.freeBoard;
    app.showingTerritory = false;
    hideScorePanel();
    if (b.grid[i] !== GO.EMPTY) { showModal('⚠️ 这个交叉点上已经有棋子了。'); return; }
    if (!b.isLegal(app.freeTurn, i)) {
      showModal(i === b.ko ? '⛔ 打劫！你不能立刻在原位提回，请先下在别处。' : '⛔ 禁入点（自杀），不能下在这里。');
      return;
    }
    const res = b.play(app.freeTurn, i);
    if (!res.ok) return;
    if (res.captured && res.captured.length) {
      showModal('🎯 提子！' + colorName(app.freeTurn) + ' 提掉了 ' + res.captured.length + ' 颗棋子。');
    }
    app.freeLast = i;
    app.freePassCount = 0;
    app.scoreWarningAcknowledged = false;
    app.freeTurn = 3 - app.freeTurn;
    updateFreeInfo();
    drawBoard(canvasFree, b, { last: app.freeLast });
  }

  // 电脑 AI（简单贪心）
  function aiMove() {
    if (app.mode !== 'free' || app.freeEnded || app.aiThinking) return;
    const board = app.freeBoard;
    const ai = GO.WHITE, human = GO.BLACK;
    app.aiThinking = true;
    setTimeout(() => {
      if (app.freeEnded) { app.aiThinking = false; return; }
      const legal = [];
      for (let i = 0; i < board.grid.length; i++) {
        if (board.grid[i] === GO.EMPTY && board.isLegal(ai, i)) legal.push(i);
      }
      let move = null;
      if (legal.length) {
        // 1. 提子
        for (const i of legal) {
          for (const n of board.neighbors(i)) {
            if (board.grid[n] === human && board.liberties(n).length === 1) { move = i; break; }
          }
          if (move !== null) break;
        }
        // 2. 逃命（自己的棋被打吃；但落入征子逃也白逃的，果断弃子不逃）
        if (move === null) {
          const checked = new Set();
          for (const i of legal) {
            for (const n of board.neighbors(i)) {
              if (board.grid[n] !== ai || checked.has(n)) continue;
              board.groupOf(n).forEach(x => checked.add(x));
              if (board.liberties(n).length !== 1) continue;
              if (board.ladderSucceeds(n)) continue; // 会被征死，弃子
              move = i; break;
            }
            if (move !== null) break;
          }
        }
        // 3. 贴近对方（进攻）
        if (move === null) {
          const adj = [];
          for (const i of legal) {
            for (const n of board.neighbors(i)) {
              if (board.grid[n] === human) { adj.push(i); break; }
            }
          }
          if (adj.length) move = adj[Math.floor(Math.random() * adj.length)];
        }
        // 4. 随机
        if (move === null) move = legal[Math.floor(Math.random() * legal.length)];
      }
      app.aiThinking = false;
      if (move !== null) {
        board.play(ai, move);
        app.freeLast = move;
        app.freePassCount = 0;
        app.scoreWarningAcknowledged = false;
        app.freeTurn = human;
      } else {
        // 电脑无法落子，算作放弃一手
        app.freePassCount++;
        app.freeTurn = human;
        if (app.freePassCount >= 2) { pauseForScoring(); return; }
      }
      updateFreeInfo();
      drawBoard(canvasFree, board, { last: app.freeLast });
      if (app.freePassCount >= 2) pauseForScoring();
    }, 600);
  }

  // ---------------- 数地 ----------------
  // 数地后在地盘空点上生成高亮（黑地绿、白地蓝）
  function territoryHighlights() {
    const out = [];
    const regions = app.freeBoard.territoryMap();
    regions.forEach(reg => {
      if (reg.owner === 0) return;
      const color = reg.owner === GO.BLACK ? '#2ecc71' : '#3498db';
      reg.points.forEach(p => out.push({ i: p, style: 'territory', color }));
    });
    return out;
  }

  // ---------------- 数地 ----------------
  function pauseForScoring() {
    app.freePassCount = 0;
    app.scoreWarningAcknowledged = true;
    updateFreeInfo();
    drawBoard(canvasFree, app.freeBoard, { last: app.freeLast });
    showModal('⏸️ <b>双方已经连续停一手。</b><br>请先确认盘上死子已经提净：若仍有未提死子，收起提示后继续落子；若已提净，请点击“数地”结算。');
  }

  function showScore() {
    const b = app.freeBoard;
    const t = b.territory();
    const s = b.countStones();
    const blackTotal = s.b + t.black;
    const whiteTotal = s.w + t.white + KOMI;
    const winner = blackTotal > whiteTotal ? '黑' : (whiteTotal > blackTotal ? '白' : '和');
    app.lastGameResult = winner;
    // 在棋盘上画出双方地盘（黑地绿、白地蓝），结果面板显示在棋盘旁边，不遮挡棋盘
    app.showingTerritory = true;
    drawBoard(canvasFree, b, { last: app.freeLast, highlights: territoryHighlights() });
    $('scoreTable').innerHTML =
      '<tr><th></th><th>棋子</th><th>地盘(空点)</th><th>合计</th></tr>' +
      '<tr><td>' + colorDot(GO.BLACK) + ' 黑棋</td><td>' + s.b + '</td><td>' + t.black + '</td><td><b>' + blackTotal + '</b></td></tr>' +
      '<tr><td>' + colorDot(GO.WHITE) + ' 白棋</td><td>' + s.w + '</td><td>' + t.white + ' + ' + KOMI + ' (贴目)</td><td><b>' + whiteTotal + '</b></td></tr>';
    $('scoreWinner').innerHTML = '🏆 本局胜者：<b>' + winner + '棋</b>';
    $('btnScoreFinish').classList.toggle('hidden', !app.freeEmbedded);
    $('scorePanel').classList.remove('hidden');
    app.freeEnded = true;
  }

  function hideScorePanel() {
    $('scorePanel').classList.add('hidden');
  }

  $('btnScoreClose').addEventListener('click', hideScorePanel);
  $('btnScoreFinish').addEventListener('click', () => {
    hideScorePanel();
    const isLast = app.lesson === LESSONS.length - 1;
    progress[LESSONS[app.lesson].id] = true;
    saveProgress();
    app.freeEmbedded = false;
    if (!isLast) {
      app.lesson++;
      app.step = 0;
      switchMode('tutorial');
    } else {
      // 毕业测试完成：回到教程界面并弹出毕业结算（不重新进入对局）
      app.mode = 'tutorial';
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === 'tutorial'));
      $('freePanel').classList.add('hidden');
      $('freeBanner').classList.add('hidden');
      $('tutorialPanel').classList.remove('hidden');
      renderLessonList();
      showCompletion();
    }
  });

  // 自由棋盘事件
  canvasFree.addEventListener('click', e => {
    if (app.mode !== 'free') return;
    if (app.freeEnded) return;
    if (app.freeType === 'ai' && (app.freeTurn === GO.WHITE || app.aiThinking)) return;
    const i = canvasToIntersection(canvasFree, e);
    if (i < 0) return;
    doFreeMove(i);
    if (app.freeType === 'ai' && !app.freeEnded) aiMove();
  });
  canvasFree.addEventListener('mousemove', e => {
    if (app.mode !== 'free') return;
    const hl = app.showingTerritory ? territoryHighlights() : undefined;
    if (app.freeEnded || (app.freeType === 'ai' && (app.freeTurn === GO.WHITE || app.aiThinking))) {
      drawBoard(canvasFree, app.freeBoard, { last: app.freeLast, highlights: hl });
      return;
    }
    const i = canvasToIntersection(canvasFree, e);
    const illegal = i >= 0 && app.freeBoard.grid[i] === GO.EMPTY && !app.freeBoard.isLegal(app.freeTurn, i);
    drawBoard(canvasFree, app.freeBoard, { hover: i, last: app.freeLast, hoverColor: app.freeTurn, illegal: !!illegal, highlights: hl });
  });
  canvasFree.addEventListener('mouseleave', () => {
    drawBoard(canvasFree, app.freeBoard, { last: app.freeLast, highlights: app.showingTerritory ? territoryHighlights() : undefined });
  });

  // 自由对局按钮
  $('freeMode').addEventListener('change', e => {
    initFree(e.target.value);
  });
  $('btnUndo').addEventListener('click', () => {
    if (app.freeEnded) return;
    const b = app.freeBoard;
    if (app.freeType === 'ai') {
      b.undo(); b.undo(); // 撤回电脑 + 玩家各一手
      app.freeTurn = GO.BLACK;
    } else {
      if (!b.history.length) return;
      b.undo();
      app.freeTurn = 3 - app.freeTurn;
    }
    app.freeLast = b.history.length ? b.history[b.history.length - 1].idx : -1;
    app.freePassCount = 0;
    app.scoreWarningAcknowledged = false;
    updateFreeInfo();
    drawBoard(canvasFree, b, { last: app.freeLast });
  });
  $('btnPassFree').addEventListener('click', () => {
    if (app.freeEnded) return;
    app.freePassCount++;
    app.freeLast = -1;
    app.freeTurn = 3 - app.freeTurn;
    if (app.freePassCount >= 2) { pauseForScoring(); return; }
    updateFreeInfo();
    drawBoard(canvasFree, app.freeBoard, {});
    if (app.freeType === 'ai' && app.freeTurn === GO.WHITE) aiMove();
  });
  $('btnNew').addEventListener('click', () => { initFree(app.freeType); });
  $('btnScore').addEventListener('click', () => {
    if (!app.scoreWarningAcknowledged) {
      app.scoreWarningAcknowledged = true;
      showModal('⚠️ <b>数地前请先把死子提净。</b><br>本程序使用“盘上活子 + 围住空点”的简化面积计分，不会自动判断死子。<br>如果盘上还有未提的死棋，请先收起提示继续下；确认已提净后，再点一次“数地”。');
      return;
    }
    showScore();
  });

  // 模式切换
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => switchMode(t.dataset.mode));
  });

  // ---------------- 启动 ----------------
  $('modalClose').addEventListener('click', closeModal);
  renderLessonList();
  renderStep();
})();
