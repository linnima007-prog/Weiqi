/**
 * 校验行动课程：局面合法、坐标有效、每道落子题的标准答案可完成。
 */
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'js', 'go-core.js'));
require(path.join(root, 'js', 'lessons.js'));

const GO = globalThis.GO;
const GoBoard = globalThis.GoBoard;
const LESSONS = globalThis.LESSONS;
const parseSetup = globalThis.parseSetup;
let issues = 0;

function report(label, message) {
  issues++;
  console.log('  [问题] ' + label + '：' + message);
}

function boardFrom(setup, ko) {
  const board = new GoBoard(9);
  board.grid = parseSetup(setup || '');
  board.ko = ko == null ? -1 : ko;
  return board;
}

function validatePosition(board, label, allowDead) {
  for (let i = 0; i < board.grid.length; i++) {
    if (board.grid[i] === GO.EMPTY) continue;
    const group = board.groupOf(i);
    const libs = GoBoard.libertiesOf(board.grid, 9, group);
    if (!allowDead && libs.length === 0) report(label, '初始局面含无气棋子：' + i);
  }
}

function validateHighlights(highlights, label) {
  for (const h of highlights || []) {
    const idx = typeof h === 'number' ? h : h.i;
    if (idx == null || idx < 0 || idx >= 81) report(label, '高亮坐标越界：' + idx);
  }
}

function validateMoveStep(step, label) {
  const board = boardFrom(step.setup, step.ko);
  validatePosition(board, label, false);
  validateHighlights(step.highlights, label);
  if (!Array.isArray(step.solution) || !step.solution.length) {
    report(label, '落子题缺少 solution');
    return;
  }
  let completed = false;
  for (const idx of step.solution) {
    if (!board.isLegal(step.playerColor, idx)) {
      report(label, '标准答案不是合法落子：' + idx);
      return;
    }
    board.play(step.playerColor, idx);
    const result = step.check({ board, lastMove: idx, passed: false });
    if (result.retry) {
      report(label, '标准答案被判定为重试：' + idx);
      return;
    }
    if (result.done) {
      completed = true;
      break;
    }
    if (result.replyMove != null) {
      const replyColor = result.replyColor == null ? 3 - step.playerColor : result.replyColor;
      if (!board.isLegal(replyColor, result.replyMove)) {
        report(label, '短对局回应不是合法落子：' + result.replyMove);
        return;
      }
      board.play(replyColor, result.replyMove);
    }
  }
  if (!completed) report(label, '走完标准答案后没有完成');
}

console.log('=== 行动课程通用校验 ===');
for (const lesson of LESSONS) {
  console.log('L' + lesson.id + ' ' + lesson.title + '：' + lesson.steps.length + ' 个环节');
  lesson.steps.forEach((step, index) => {
    const label = 'L' + lesson.id + '-S' + (index + 1);
    if (step.type === 'move') validateMoveStep(step, label);
    if (step.type === 'quiz' || step.type === 'visual') {
      const board = boardFrom(step.setup);
      validatePosition(board, label, false);
      validateHighlights(step.highlights, label);
      if (step.type === 'quiz' && (step.answer < 0 || step.answer >= step.options.length)) {
        report(label, '选择题答案下标越界');
      }
    }
    if (step.type === 'demo') {
      (step.frames || []).forEach((frame, frameIndex) => {
        const board = boardFrom(frame.board);
        validatePosition(board, label + '-F' + (frameIndex + 1), !!frame.flash);
        validateHighlights(frame.highlights, label + '-F' + (frameIndex + 1));
      });
    }
  });
}

console.log('课程数：' + LESSONS.length + '，问题数：' + issues);
if (issues) process.exitCode = 1;
