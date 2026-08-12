/**
 * validate.js —— 校验所有课程局面的合法性
 * 检查项：
 *  1. demo/visual/move/quiz 的每个局面：每颗棋子都至少有 1 口气（非淡出帧不得有 0 气棋子）
 *  2. 所有 highlights / highlightLibertiesOf 必须指向合法的点（高亮落在棋子上的要警告）
 *  3. move 步骤：setup 必须合法；check 在落子后必须能达成
 *  4. demo 帧：相邻帧落子增量合理（提子除外）
 * 用法：node tools/validate.js
 */
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
require(path.join(root, 'js', 'go-core.js'));
require(path.join(root, 'js', 'lessons.js'));
const GO = globalThis.GO;
const LESSONS = globalThis.LESSONS;
const parseSetup = globalThis.parseSetup;

let issues = 0;
function report(lessonId, msg) {
  issues++;
  console.log('  [L' + lessonId + '] ' + msg);
}

/** 检查一个局面中是否有 0 气棋子 */
function checkNoDeadStones(board, label) {
  const size = board.size;
  for (let i = 0; i < board.grid.length; i++) {
    if (board.grid[i] === GO.EMPTY) continue;
    const g = board.groupOf(i);
    if (GoBoard.libertiesOf(board.grid, size, g).length === 0) {
      report(board.__lessonId, label + '：位置 ' + (Math.floor(i / 9) + 1) + ',' + (i % 9 + 1) + ' 的棋子有 0 口气（非法棋形）');
    }
  }
}

/** 检查高亮点是否落在空点上 */
function checkHighlights(board, highlights, label) {
  (highlights || []).forEach(h => {
    if (h.i == null) return;
    if (h.i < 0 || h.i >= 81) { report(board.__lessonId, label + '：高亮索引 ' + h.i + ' 越界'); return; }
    if (h.style === 'capture') return; // capture 样式专门标记棋子（将被提的子），允许落在棋子上
    if (board.grid[h.i] !== GO.EMPTY) {
      report(board.__lessonId, label + '：高亮 ' + h.i + '（' + (Math.floor(h.i / 9) + 1) + ',' + (h.i % 9 + 1) + '）落在棋子上了');
    }
  });
}

/** 检查 highlightLibertiesOf 指向的棋块气点是否都是空点 */
function checkLibOf(board, target, label) {
  if (target == null) return;
  const t = Array.isArray(target) ? target : [target];
  t.forEach(i => {
    if (board.grid[i] === GO.EMPTY) { report(board.__lessonId, label + '：highlightLibertiesOf ' + i + ' 指向空点'); return; }
    const libs = board.liberties(i);
    libs.forEach(li => {
      if (board.grid[li] !== GO.EMPTY) report(board.__lessonId, label + '：气点 ' + li + ' 不是空的');
    });
  });
}

function parseGrid(str) {
  const b = new GoBoard(9);
  if (str) b.grid = parseSetup(str);
  return b;
}

// ============ 对现有 + 新课程全量校验 ============
LESSONS.forEach(lesson => {
  const b = new GoBoard(9);
  b.__lessonId = lesson.id;
  lesson.steps.forEach((step, si) => {
    const label = '第' + lesson.id + '课 步骤' + (si + 1) + '(' + step.type + ')';
    if (step.type === 'visual' || step.type === 'quiz' || step.type === 'move') {
      const board = parseGrid(step.setup || '');
      board.__lessonId = lesson.id;
      checkNoDeadStones(board, label);
      checkHighlights(board, step.highlights, label);
      checkLibOf(board, step.highlightLibertiesOf, label);
    }
    if (step.type === 'demo') {
      let prev = null;
      (step.frames || []).forEach((f, fi) => {
        const board = parseGrid(f.board || '');
        board.__lessonId = lesson.id;
        const fl = label + ' 帧' + (fi + 1);
        // 淡出帧（flash）里被提的棋子允许 0 气——那是“正要被提掉”的动画
        if (f.flash == null) checkNoDeadStones(board, fl);
        checkHighlights(board, f.highlights, fl);
        checkLibOf(board, f.highlightLibs, fl);
        // 帧间增量检查（提子帧跳过）
        if (prev) {
          const delta = [];
          for (let i = 0; i < 81; i++) {
            if (board.grid[i] !== prev.grid[i]) delta.push({ i, from: prev.grid[i], to: board.grid[i] });
          }
          const added = delta.filter(d => d.from === GO.EMPTY && d.to !== GO.EMPTY);
          const removed = delta.filter(d => d.from !== GO.EMPTY && d.to === GO.EMPTY);
          if (added.length > 1) report(lesson.id, fl + '：一帧新增了 ' + added.length + ' 颗棋子（应每次只下 1 颗，除非是提子回合的瞬时）');
        }
        prev = { grid: board.grid.slice() };
      });
    }
  });
});

// ============ 设计辅助：暴力搜索一条合法的征子序列 ============
// 目标：黑先，白(4,4)【0-idx】被黑追，白每次只能向“逃路”跑，黑每一手都是打吃，最后逼到边角被提
function searchLadder() {
  const B = 1, W = 2;
  const startWhite = [4, 4];
  const size = 9;
  function legal(board, color, r, c) {
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const b = new GoBoard(9);
    b.grid = board.slice();
    return b.isLegal(color, r * 9 + c);
  }
  function atariTargets(board, whiteIdx) {
    // 白棋块气数
    const b = new GoBoard(9); b.grid = board.slice();
    const libs = b.liberties(whiteIdx);
    return libs;
  }
  // 黑先手，先摆上追子：白(4,4)，黑(5,4),(4,5)
  let board = new Array(81).fill(0);
  board[4 * 9 + 4] = W;
  board[5 * 9 + 4] = B;
  board[4 * 9 + 5] = B;
  const seq = [];
  let whiteIdx = 4 * 9 + 4;
  for (let step = 0; step < 12; step++) {
    // 找黑棋的“打吃”手：落在白棋气上，且落子后白棋气=1
    const libs = atariTargets(board, whiteIdx);
    if (libs.length === 0) { seq.push({ type: 'CAPTURED' }); break; }
    let atariMove = null;
    for (const li of libs) {
      if (!legal(board, B, Math.floor(li / 9), li % 9)) continue;
      const b = new GoBoard(9); b.grid = board.slice();
      b.play(B, li);
      // 落子后白棋是否还剩 1 气（打吃）
      const g = b.groupOf(whiteIdx);
      if (g.length === 0) { atariMove = { li, captured: true }; break; }
      const nb = b.liberties(whiteIdx);
      if (nb.length === 1) { atariMove = { li }; break; }
    }
    if (!atariMove) { seq.push({ type: 'NO_ATARI', libs }); break; }
    board[Math.floor(atariMove.li / 9) * 9 + (atariMove.li % 9)] = B;
    if (atariMove.captured) { seq.push({ type: 'CAPTURED', li: atariMove.li }); break; }
    seq.push({ type: 'B_ATARI', li: atariMove.li });
    // 白逃：白棋的唯一气（真实征子里白只能往一个方向跑；这里先试所有合法逃点）
    const bl = new GoBoard(9); bl.grid = board.slice();
    const wl = bl.liberties(whiteIdx);
    if (wl.length !== 1) { seq.push({ type: 'UNEXPECTED', wl }); break; }
    const esc = wl[0];
    board[Math.floor(esc / 9) * 9 + (esc % 9)] = W;
    whiteIdx = esc; // 追的是整块，用任一子即可，这里记录最新逃子
    seq.push({ type: 'W_ESCAPE', li: esc });
  }
  return seq;
}

// ============ 设计辅助：打印一个局面的各组气 ============
function printGroups(str, label) {
  const b = parseGrid(str);
  console.log('--- ' + label + ' ---');
  const seen = new Set();
  for (let i = 0; i < 81; i++) {
    if (b.grid[i] === GO.EMPTY || seen.has(i)) continue;
    const g = b.groupOf(i);
    g.forEach(x => seen.add(x));
    const libs = GoBoard.libertiesOf(b.grid, 9, g);
    console.log('  棋块 @' + g.map(x => (Math.floor(x / 9) + 1) + ',' + (x % 9 + 1)).join(' ') +
      ' (' + (b.grid[i] === 1 ? '黑' : '白') + ') 气=' + libs.map(x => (Math.floor(x / 9) + 1) + ',' + (x % 9 + 1)).join(' '));
  }
}

// ============ 第11课：征子逐帧验证（白沿第4行向左跑，黑下方追，黑上方支撑） ============
console.log('=== L11 征子逐帧 ===');
(function () {
  // 0-idx：白(4,4)(4,3)(4,2)；黑(4,5)追右侧、黑(5,4)(5,3)(5,2)追下方、黑(3,3)(3,2)支撑上方
  // 1-idx 字符串（setup 格式）
  const frames = [
    'W 5,5 B 5,6 6,5 4,4 4,3',
    'W 5,5 B 5,6 6,5 4,4 4,3 4,5',   // +黑(3,4)=1-idx(4,5) 打吃
    'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5', // +白(4,3)=1-idx(5,4) 逃
    'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5 6,4', // +黑(5,3)=1-idx(6,4) 打吃
    'W 5,5 5,4 5,3 B 5,6 6,5 4,4 4,3 4,5 6,4', // +白(4,2)=1-idx(5,3) 逃
    'W 5,5 5,4 5,3 B 5,6 6,5 4,4 4,3 4,5 6,4 6,3', // +黑(5,2)=1-idx(6,3) 打吃
  ];
  frames.forEach((s, i) => {
    const b = parseGrid(s);
    const whiteIdxs = [];
    b.grid.forEach((v, k) => { if (v === GO.WHITE) whiteIdxs.push(k); });
    const libs = b.liberties(whiteIdxs[0]);
    console.log('  帧' + (i + 1) + ' 白棋气数=' + libs.length + (libs.length === 1 ? ' [打吃]' : '') + '  白子=' + whiteIdxs.length + ' 黑子=' + b.countStones().b);
  });
})();

// ============ 第12课：枷吃（白棋逃不出：白有≥2气，但每个逃点后黑都能吃） ============
console.log('=== L12 枷吃候选 ===');
(function () {
  const setups = [
    'W 5,5 B 6,5 5,7 7,5',
    'W 5,5 B 6,5 5,7 7,5 4,5',
    'W 5,5 B 6,5 4,6 7,5 4,5',
  ];
  setups.forEach((s, si) => {
    const b = parseGrid(s);
    const whiteIdx = b.grid.findIndex(v => v === GO.WHITE);
    const libs = b.liberties(whiteIdx);
    console.log('  候选' + si + ': 白气=' + libs.map(x => (Math.floor(x / 9) + 1) + ',' + (x % 9 + 1)).join(' '));
    let allTrapped = true;
    libs.forEach(li => {
      const b2 = parseGrid(s);
      b2.grid[li] = GO.WHITE;
      const wg = b2.groupOf(whiteIdx);
      const wl = GoBoard.libertiesOf(b2.grid, 9, wg);
      let canCap = false;
      for (const wl2 of wl) {
        const b3 = new GoBoard(9); b3.grid = b2.grid.slice();
        if (b3.isLegal(GO.BLACK, wl2)) { const r = b3.play(GO.BLACK, wl2); if (r.captured && r.captured.length >= wg.length) canCap = true; }
      }
      if (!canCap) allTrapped = false;
      console.log('    白逃(' + (Math.floor(li / 9) + 1) + ',' + (li % 9 + 1) + ')后 → 黑可提=' + canCap);
    });
    console.log('    => 全部逃点都被抓=' + allTrapped);
  });
})();

// ============ 第13课：双叫吃 + 倒扑 ============
console.log('=== L13 双叫吃 ===');
(function () {
  // 1-idx：黑(3,4)(5,4)(3,6)(5,6)，白(4,4)(4,6)；黑下(4,5)【0-idx(3,4)=31】
  const s = 'B 3,4 5,4 3,6 5,6 W 4,4 4,6';
  const b2 = parseGrid(s);
  const r = b2.play(GO.BLACK, 31); // 0-idx(3,4)
  const w1 = b2.groupOf(30), w2 = b2.groupOf(32); // 0-idx(3,3)=30,(3,5)=32
  console.log('  落子合法=' + r.ok + ' 白(4,4)气=' + GoBoard.libertiesOf(b2.grid, 9, w1).length + ' 白(4,6)气=' + GoBoard.libertiesOf(b2.grid, 9, w2).length + '  [各=1则为双叫吃]');
})();
console.log('=== L13 倒扑（搜索合法扑点） ===');
(function () {
  // 白棋矩形块，黑环周围留缺口；扫描所有可扑点：黑扑→白提→黑回提整块
  const B = 1, W = 2;
  const idx = (r, c) => r * 9 + c;
  // 白块 (1,1)(1,2)(2,1)(2,2) 0-idx；黑环其余；缺口位置参数化
  const white = [[1,1],[1,2],[2,1],[2,2]];
  const ring = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (white.some(([wr, wc]) => wr === r && wc === c)) continue;
    if ((r === 0 || r === 3 || c === 0 || c === 3)) ring.push([r, c]);
  }
  // 在环上挖掉两个缺口（白的气口），其余放黑
  const found = [];
  for (let a = 0; a < ring.length && found.length === 0; a++) {
    for (let b = a + 1; b < ring.length && found.length === 0; b++) {
      const grid = new Array(81).fill(0);
      white.forEach(([r, c]) => grid[idx(r, c)] = W);
      ring.forEach(([r, c], k) => { if (k !== a && k !== b) grid[idx(r, c)] = B; });
      const board = new GoBoard(9); board.grid = grid;
      // 白块气应正好 = 两个缺口
      const wg = board.groupOf(idx(1, 1));
      const libs = GoBoard.libertiesOf(grid, 9, wg);
      if (libs.length !== 2) continue;
      for (const X of libs) {
        const b2 = new GoBoard(9); b2.grid = grid.slice();
        if (!b2.isLegal(B, X)) continue;
        b2.play(B, X);
        // 白提 X
        const b3 = new GoBoard(9); b3.grid = b2.grid.slice();
        if (!b3.isLegal(W, X)) continue;
        b3.play(W, X);
        if (b3.grid[X] !== 0) continue;
        // 黑回提整块
        const wi = b3.grid.findIndex(v => v === W);
        if (wi < 0) continue;
        const wg3 = b3.groupOf(wi);
        const wl3 = GoBoard.libertiesOf(b3.grid, 9, wg3);
        for (const Y of wl3) {
          const b4 = new GoBoard(9); b4.grid = b3.grid.slice();
          if (b4.isLegal(B, Y)) { const rr = b4.play(B, Y); if (rr.captured && rr.captured.length >= wg3.length) {
            const setupStr = [];
            grid.forEach((v, k) => { if (v !== 0) setupStr.push((v === B ? 'B ' : 'W ') + (Math.floor(k / 9) + 1) + ',' + (k % 9 + 1)); });
            console.log('    ✔ 白块气=' + libs.map(x => (Math.floor(x / 9) + 1) + ',' + (x % 9 + 1)).join(' ') + ' 黑扑(' + (Math.floor(X / 9) + 1) + ',' + (X % 9 + 1) + ') → 白提 → 黑回提于(' + (Math.floor(Y / 9) + 1) + ',' + (Y % 9 + 1) + ')');
            console.log('      setup: ' + setupStr.join(' '));
            found.push({ grid, X, Y });
            break;
          }}
        }
      }
    }
  }
  if (!found.length) console.log('  (未找到——需调整白块形状/环)');
})();

// ============ 第14课：真眼假眼 ============
console.log('=== L14 真眼假眼 ===');
(function () {
  // 真眼：黑环(1,1)0-idx 四周全黑
  const t1 = 'B 1,2 2,1 2,3 3,2';
  const b1 = parseGrid(t1);
  console.log('  真眼候选: eyePoints=' + b1.eyePoints(GO.BLACK).map(x => (Math.floor(x / 9) + 1) + ',' + (x % 9 + 1)).join(' '));
  // 假眼：看起来围住(1,1)，但下方(3,2)是单独黑子没连上（白可从(2,1)?）——检查(1,1)是否真眼
  const f1 = 'B 1,2 2,1 2,3 W 3,2';
  const b2 = parseGrid(f1);
  console.log('  假眼候选(下方被白占): eyePoints=' + b2.eyePoints(GO.BLACK).map(x => (Math.floor(x / 9) + 1) + ',' + (x % 9 + 1)).join(' '));
})();

// ============ 第15课：大眼死活 ============
console.log('=== L15 直四 / 曲四 / 丁四 / 刀五 / 梅花五 ===');
(function () {
  const shapes = [
    ['直四', 'B 2,2 2,3 2,4 2,5 2,6 2,7 3,2 3,7 4,2 4,3 4,4 4,5 4,6 4,7', [3,3,3,4,3,5,3,6]],
    ['曲四', 'B 2,2 2,3 2,4 2,5 3,2 3,5 4,2 4,3 4,5 5,3 5,4 5,5', [3,3,3,4,4,4]],
    ['丁四', 'B 2,2 2,3 2,4 2,5 2,6 3,2 3,6 4,2 4,3 4,4 4,5 4,6', [3,3,3,4,3,5]],
    ['刀五', 'B 2,2 2,3 2,4 2,5 3,2 3,5 4,2 4,3 4,4', [3,3,3,4,4,3]],
    ['梅花五', 'B 2,2 2,3 2,4 3,2 3,4 4,2 4,3 4,4', [3,3,3,4,4,3]],
  ];
  shapes.forEach(([name, s, interior]) => {
    const b = parseGrid(s);
    // 检查 interior 是否都是空的
    const ok = interior.every(i => b.grid[i] === GO.EMPTY);
    console.log('  ' + name + ': 内部空点=' + ok + ' 棋块气=' + GoBoard.libertiesOf(b.grid, 9, b.groupOf(b.grid.findIndex(v => v === GO.BLACK))).length);
  });
})();

// ============ move 步骤模拟：按预期落子并调用 check ============
console.log('=== move 步骤模拟（预期落子 → check 必须 done） ===');
LESSONS.forEach(lesson => {
  lesson.steps.forEach((step, si) => {
    if (step.type !== 'move') return;
    const b = new GoBoard(9);
    b.__lessonId = lesson.id;
    if (step.setup) b.grid = parseSetup(step.setup);
    b.ko = (step.ko != null) ? step.ko : -1;
    // 尝试所有空点落子，找出能让 check done 的点
    const targets = [];
    for (let i = 0; i < 81; i++) {
      if (b.grid[i] !== GO.EMPTY) continue;
      const b2 = new GoBoard(9); b2.grid = b.grid.slice(); b2.ko = b.ko;
      if (!b2.isLegal(step.playerColor, i)) continue;
      b2.play(step.playerColor, i);
      const r = step.check({ board: b2, lastMove: i, passed: false });
      if (r && r.done) targets.push((Math.floor(i / 9) + 1) + ',' + (i % 9 + 1));
    }
    // 若该步骤允许放弃，也试 passed
    let passOk = false;
    const p = step.check({ board: b, lastMove: null, passed: true });
    if (p && p.done) passOk = true;
    if (targets.length === 0 && !passOk) {
      report(lesson.id, '步骤' + (si + 1) + '(move)：没有任何落子能让 check 通过！');
    } else {
      console.log('  L' + lesson.id + ' 步骤' + (si + 1) + '：可行落子=' + targets.join(' ') + (passOk ? ' 或放弃一手' : ''));
    }
  });
});

console.log('=========== 校验结束，问题数：' + issues + ' ===========');
process.exit(issues ? 1 : 0);
