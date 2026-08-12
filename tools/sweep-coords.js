/**
 * sweep-coords.js —— 课程文案坐标全面扫描
 * 提取所有 text/question/options/explanation/objective/hint/demo字幕 中的 (行,列) 坐标，
 * 与该步骤局面的“合法提及点”比对：棋盘上的棋子、高亮点、mark、demo新增棋子、
 * highlightLibertiesOf 目标及其气、move 步骤的可行落子点。
 * 对不上任何一项的坐标列出来人工复核。
 * 用法：node tools/sweep-coords.js
 */
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'js', 'go-core.js'));
require(path.join(root, 'js', 'lessons.js'));
const GO = globalThis.GO, LESSONS = globalThis.LESSONS, parseSetup = globalThis.parseSetup;
const rc = i => (Math.floor(i / 9) + 1) + ',' + (i % 9 + 1);

let flagged = 0;

/** 从文本中提取坐标提及（1-idx），返回索引数组 */
function extractCoords(text) {
  if (!text) return [];
  const out = [];
  const re = /[（(]\s*([1-9])\s*[,，]\s*([1-9])\s*[)）]/g;
  let m;
  while ((m = re.exec(text))) out.push({ idx: (Number(m[1]) - 1) * 9 + (Number(m[2]) - 1), raw: m[0] });
  return out;
}

/** 局面 s（setup 字符串）的所有棋子索引 */
function stonesOf(setupStr) {
  const g = parseSetup(setupStr || '');
  const out = new Set();
  g.forEach((v, i) => { if (v !== GO.EMPTY) out.add(i); });
  return out;
}

/** move 步骤的可行落子点（能让 check done 的点） */
function feasiblePoints(step) {
  const b = new GoBoard(9);
  if (step.setup) b.grid = parseSetup(step.setup);
  b.ko = (step.ko != null) ? step.ko : -1;
  const out = new Set();
  for (let i = 0; i < 81; i++) {
    if (b.grid[i] !== GO.EMPTY) continue;
    const b2 = new GoBoard(9); b2.grid = b.grid.slice(); b2.ko = b.ko;
    if (!b2.isLegal(step.playerColor, i)) continue;
    b2.play(step.playerColor, i);
    const r = step.check({ board: b2, lastMove: i, passed: false });
    if (r && r.done) out.add(i);
  }
  return out;
}

function checkText(lessonId, label, text, allowed) {
  for (const c of extractCoords(text)) {
    if (!allowed.has(c.idx)) {
      flagged++;
      console.log('  [L' + lessonId + '] ' + label + '：文案提到 (' + rc(c.idx) + ')，但该点既不是棋子/高亮/mark/可行落子/相关气点');
    }
  }
}

LESSONS.forEach(lesson => {
  lesson.steps.forEach((step, si) => {
    const label = '步骤' + (si + 1) + '(' + step.type + ')';
    if (step.type === 'demo') {
      let prev = null;
      (step.frames || []).forEach((f, fi) => {
        const allowed = stonesOf(f.board);
        (f.highlights || []).forEach(h => allowed.add(h.i));
        if (f.mark != null) allowed.add(f.mark);
        const libs = Array.isArray(f.highlightLibs) ? f.highlightLibs : (f.highlightLibs != null ? [f.highlightLibs] : []);
        const b = new GoBoard(9); b.grid = parseSetup(f.board || '');
        libs.forEach(t => { allowed.add(t); b.liberties(t).forEach(li => allowed.add(li)); });
        // 与上一帧相比新增的棋子也允许（文案常引用“刚下的这手”）
        if (prev) {
          const g = parseSetup(f.board || '');
          g.forEach((v, i) => { if (prev[i] === GO.EMPTY && v !== GO.EMPTY) allowed.add(i); });
        }
        checkText(lesson.id, label + ' 帧' + (fi + 1), f.text, allowed);
        prev = parseSetup(f.board || '');
      });
    } else {
      const allowed = stonesOf(step.setup);
      (step.highlights || []).forEach(h => allowed.add(h.i));
      const b = new GoBoard(9);
      if (step.setup) b.grid = parseSetup(step.setup);
      if (step.highlightLibertiesOf != null) {
        const t = step.highlightLibertiesOf;
        allowed.add(t);
        b.liberties(t).forEach(li => allowed.add(li));
      }
      if (step.type === 'move') {
        feasiblePoints(step).forEach(i => allowed.add(i));
        // move 文案也常引用目标棋块的气（如“白棋唯一的气在 (5,4)”）
        for (let i = 0; i < 81; i++) {
          if (b.grid[i] !== GO.EMPTY) b.liberties(i).forEach(li => allowed.add(li));
        }
      }
      checkText(lesson.id, label + ' objective', step.objective, allowed);
      checkText(lesson.id, label + ' hint', step.hint, allowed);
      checkText(lesson.id, label + ' text', step.text || step.content, allowed);
      checkText(lesson.id, label + ' question', step.question, allowed);
      (step.options || []).forEach((o, oi) => checkText(lesson.id, label + ' 选项' + (oi + 1), o, allowed));
      checkText(lesson.id, label + ' explanation', step.explanation, allowed);
    }
  });
});

console.log('=========== 坐标扫描结束，待复核数：' + flagged + ' ===========');
