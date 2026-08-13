// 临时工具：从给定局面提取一条必胜征子路线（黑每手打吃、白被迫逃），打印 setup 字符串
const path = require('path');
require(path.join(__dirname, '..', 'js', 'go-core.js'));
const GO = globalThis.GO;
const parse = s => {
  const g = new Array(81).fill(GO.EMPTY);
  let color = null;
  for (const t of s.trim().split(/\s+/)) {
    if (t === 'B') { color = GO.BLACK; continue; }
    if (t === 'W') { color = GO.WHITE; continue; }
    const [r, c] = t.split(',').map(Number);
    g[(r - 1) * 9 + (c - 1)] = color;
  }
  return g;
};
const toStr = grid => {
  const bs = [], ws = [];
  grid.forEach((v, i) => {
    const rc = (Math.floor(i / 9) + 1) + ',' + (i % 9 + 1);
    if (v === GO.BLACK) bs.push(rc); else if (v === GO.WHITE) ws.push(rc);
  });
  return 'B ' + bs.join(' ') + ' W ' + ws.join(' ');
};
const rc = i => (Math.floor(i / 9) + 1) + ',' + (i % 9 + 1);

let b = new GoBoard(9);
b.grid = parse('W 5,5 B 5,6 6,5 4,4 4,3 4,5'); // L25 起征后：白(5,5)只剩(5,4)一气
console.log('起始: ' + toStr(b.grid) + '  白气=' + b.liberties(40).map(rc).join(' '));

const steps = [];
for (let n = 0; n < 30; n++) {
  const libs = b.liberties(40);
  if (libs.length === 0) { steps.push('白棋被提'); break; }
  if (libs.length !== 1) { steps.push('!! 白棋气=' + libs.length + '（不在打吃状态）'); break; }
  // 白被迫逃
  const esc = libs[0];
  let r = b.play(GO.WHITE, esc);
  if (!r.ok) { steps.push('白无处可逃'); break; }
  steps.push('白逃 ' + rc(esc) + '  白气=' + b.liberties(40).length);
  // 黑找一手打吃（留 1 气）或直接提，且保持征子必胜
  const wlibs = b.liberties(40);
  let chosen = null;
  for (let i = 0; i < 81; i++) {
    if (b.grid[i] !== GO.EMPTY) continue;
    const t = new GoBoard(9); t.grid = b.grid.slice();
    if (!t.isLegal(GO.BLACK, i)) continue;
    t.play(GO.BLACK, i);
    const l = t.liberties(40).length;
    if (l === 0) { chosen = { i, cap: true }; break; }
    if (l === 1 && t.ladderSucceeds(40)) { chosen = { i }; break; }
  }
  if (!chosen) { steps.push('!! 黑找不到保持必胜的打吃手'); break; }
  b.play(GO.BLACK, chosen.i);
  steps.push('黑' + (chosen.cap ? '提 ' : '打吃 ') + rc(chosen.i) + (chosen.cap ? '' : '  白气=1'));
  steps.push('   局面: ' + toStr(b.grid));
  if (chosen.cap) break;
}
steps.forEach(s => console.log(s));
