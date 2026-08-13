/**
 * coords-to-letter.js —— 把课程提示文本中的 "(行,列)" 坐标统一转换为国际标准 "字母+数字"（如 (5,5)→E5）
 *
 * 用法：node tools/coords-to-letter.js [文件路径]（默认 js/lessons.js）
 *
 * 规则：
 *   - 只转换带括号的坐标（半角 "(5,5)" / 全角 "（5,5）"），这些是面向玩家的提示文本；
 *   - setup 字符串里的坐标（不带括号，如 'B 5,5 4,4'）与代码逻辑不受影响；
 *   - 跳过以 // 开头的注释行（其中可能有 0-indexed 坐标，不属于 1-based setup 坐标，避免误转）。
 *
 * 映射：setup 坐标 (r, c)，r 为 1-based 行（自顶部起）、c 为 1-based 列（自左起）
 *   → 列字母 = LETTERS[c-1]（A~K 跳过 I）；行号 = 9 - r + 1（自底部数）
 *   例如 (5,5)→E5（天元）、(6,5)→E4、(1,7)→G9
 */
'use strict';
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', 'js', 'lessons.js');
const LETTERS = 'ABCDEFGHJK'; // 9 路棋盘：A~K，跳过 I（避免与 1 混淆）
const SIZE = 9;

/** setup 坐标 (r,c)（r 自顶部数，1-based）→ 国际坐标 字母+数字 */
function toCoord(r, c) {
  const col = LETTERS[c - 1];  // 列：1→A ... 9→J
  const row = SIZE - r + 1;    // 行：自底部数（第1线在底部）
  return col + row;
}

const lines = fs.readFileSync(file, 'utf8').split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^\s*\/\//.test(line)) continue; // 注释行跳过（可能含 0-indexed 坐标）
  let l = line;
  // 第一步：给相邻的两个坐标之间加顿号，如 (1,7)(2,7) → (1,7)、(2,7)
  l = l.replace(/([)）])(\s*)([（(])(?=\d+\s*,\s*\d+[）)])/g, '$1、$2$3');
  // 第二步：转换所有带括号的坐标
  l = l.replace(/[（(](\d+)\s*,\s*(\d+)[）)]/g, (m, r, c) => {
    count++;
    return toCoord(+r, +c);
  });
  lines[i] = l;
}

fs.writeFileSync(file, lines.join('\n'));
console.log('已转换 ' + count + ' 处坐标 → ' + file);
