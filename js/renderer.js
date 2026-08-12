/**
 * renderer.js —— 使用 Canvas 绘制棋盘、棋子、坐标与落子标记
 */
(function (global) {
  'use strict';
  const GO = global.GO;

  // 9 路棋盘的星位
  const STAR_POINTS_9 = [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];

  /**
   * 绘制棋盘
   * @param {HTMLCanvasElement} canvas
   * @param {GoBoard} board
   * @param {object} opts { hover, last, hoverColor, illegal }
   */
  function drawBoard(canvas, board, opts) {
    opts = opts || {};
    const size = board.size;
    const PAD = 36;
    const W = canvas.width, H = canvas.height;
    const cell = (W - PAD * 2) / (size - 1);
    const c = canvas.getContext('2d');

    // 木质背景
    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#e0ac64');
    bg.addColorStop(0.5, '#d39b4f');
    bg.addColorStop(1, '#c58a3c');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // 细木纹
    c.strokeStyle = 'rgba(120,80,30,0.12)';
    c.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const y = Math.random() * H;
      c.beginPath(); c.moveTo(0, y);
      c.bezierCurveTo(W * 0.3, y + 6, W * 0.6, y - 6, W, y + 3);
      c.stroke();
    }

    // 网格线
    c.strokeStyle = '#5a3d1e';
    c.lineWidth = 1;
    for (let i = 0; i < size; i++) {
      const x = PAD + i * cell, y = PAD + i * cell;
      c.beginPath(); c.moveTo(PAD, y); c.lineTo(W - PAD, y); c.stroke();
      c.beginPath(); c.moveTo(x, PAD); c.lineTo(x, H - PAD); c.stroke();
    }
    // 外框加粗
    c.strokeStyle = '#4a3015';
    c.lineWidth = 2.5;
    c.strokeRect(PAD, PAD, W - 2 * PAD, H - 2 * PAD);

    // 星位
    c.fillStyle = '#4a3015';
    for (const [r, col] of STAR_POINTS_9) {
      c.beginPath(); c.arc(PAD + col * cell, PAD + r * cell, 4, 0, Math.PI * 2); c.fill();
    }

    // 坐标：左侧数字，底部字母
    c.fillStyle = '#5a3d1e';
    c.font = '13px sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const letters = 'ABCDEFGHJK';
    for (let i = 0; i < size; i++) {
      c.fillText(String(size - i), PAD - 16, PAD + i * cell);
      c.fillText(letters[i], PAD + i * cell, H - PAD + 17);
    }

    // 棋子
    for (let i = 0; i < board.grid.length; i++) {
      const v = board.grid[i];
      if (v === GO.EMPTY) continue;
      const r = Math.floor(i / size), col = i % size;
      const x = PAD + col * cell, y = PAD + r * cell;
      if (i === opts.flash) {
        // 淡出效果（演示提子）
        c.globalAlpha = (opts.flashAlpha != null) ? opts.flashAlpha : 1;
        drawStone(c, x, y, cell * 0.46, v);
        c.globalAlpha = 1;
      } else {
        drawStone(c, x, y, cell * 0.46, v);
      }
    }

    // 上一手标记
    if (opts.last != null && opts.last >= 0 && board.grid[opts.last] !== GO.EMPTY) {
      const r = Math.floor(opts.last / size), col = opts.last % size;
      const x = PAD + col * cell, y = PAD + r * cell;
      c.fillStyle = board.grid[opts.last] === GO.BLACK ? '#fff' : '#222';
      c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill();
    }

    // 悬停预览
    if (opts.hover != null && opts.hover >= 0 && opts.hover < board.grid.length && board.grid[opts.hover] === GO.EMPTY) {
      const r = Math.floor(opts.hover / size), col = opts.hover % size;
      const x = PAD + col * cell, y = PAD + r * cell;
      const color = opts.hoverColor || GO.BLACK;
      if (opts.illegal) {
        c.strokeStyle = '#e53935';
        c.lineWidth = 3;
        c.beginPath(); c.arc(x, y, cell * 0.44, 0, Math.PI * 2); c.stroke();
      } else {
        c.globalAlpha = 0.55;
        drawStone(c, x, y, cell * 0.46, color);
        c.globalAlpha = 1;
      }
    }

    // 高亮标记（气、禁入点等）：画在最上层
    if (opts.highlights) {
      for (const h of opts.highlights) {
        const hi = h.i;
        if (hi == null || hi < 0 || hi >= board.grid.length) continue;
        const hr = Math.floor(hi / size), hc = hi % size;
        const hx = PAD + hc * cell, hy = PAD + hr * cell;
        const style = h.style || 'liberty';
        const phase = (h.phase != null) ? h.phase : 0;
        const pulse = (h.animate) ? 0.5 + 0.5 * Math.sin(phase * Math.PI * 2) : 1;
        const rad = cell * 0.44 + pulse * 3;
        if (style === 'forbidden') {
          // 禁入点：红色发光圆环 + ✕
          c.save();
          c.shadowColor = 'rgba(231, 76, 60, 0.95)';
          c.shadowBlur = 12;
          c.strokeStyle = '#e74c3c';
          c.lineWidth = 3;
          c.beginPath(); c.arc(hx, hy, rad, 0, Math.PI * 2); c.stroke();
          c.restore();
          const s = cell * 0.2;
          c.strokeStyle = '#e74c3c';
          c.lineWidth = 3.5;
          c.beginPath();
          c.moveTo(hx - s, hy - s); c.lineTo(hx + s, hy + s);
          c.moveTo(hx + s, hy - s); c.lineTo(hx - s, hy + s);
          c.stroke();
        } else if (style === 'capture') {
          // 将被提的子：红色发光圆环（无 ✕，避免和禁入点混淆）
          c.save();
          c.shadowColor = 'rgba(231, 76, 60, 0.95)';
          c.shadowBlur = 12;
          c.strokeStyle = '#e74c3c';
          c.lineWidth = 3;
          c.beginPath(); c.arc(hx, hy, rad, 0, Math.PI * 2); c.stroke();
          c.restore();
        } else if (style === 'territory') {
          // 地盘：半透明色块 + 圆环（颜色由 h.color 指定，如黑地绿/白地蓝）
          const col = h.color || '#2ecc71';
          c.globalAlpha = 0.4;
          c.fillStyle = col;
          c.beginPath(); c.arc(hx, hy, cell * 0.4, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          c.strokeStyle = col;
          c.lineWidth = 2.5;
          c.beginPath(); c.arc(hx, hy, cell * 0.4, 0, Math.PI * 2); c.stroke();
        } else {
          // 气（默认）：绿色发光圆环 + 圆点 + 序号
          c.save();
          c.shadowColor = 'rgba(46, 204, 113, 0.95)';
          c.shadowBlur = 12;
          c.strokeStyle = '#2ecc71';
          c.lineWidth = 3;
          c.beginPath(); c.arc(hx, hy, rad, 0, Math.PI * 2); c.stroke();
          c.restore();
          c.fillStyle = '#2ecc71';
          c.beginPath(); c.arc(hx, hy, 5, 0, Math.PI * 2); c.fill();
          if (h.label != null) {
            c.fillStyle = '#ffffff';
            c.font = 'bold 11px sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText(String(h.label), hx, hy + 0.5);
          }
        }
      }
    }
  }

  function drawStone(c, x, y, rad, color) {
    const grad = c.createRadialGradient(x - rad * 0.3, y - rad * 0.3, rad * 0.12, x, y, rad);
    if (color === GO.BLACK) {
      grad.addColorStop(0, '#555555');
      grad.addColorStop(1, '#0a0a0a');
      c.fillStyle = grad;
      c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
      // 高光
      c.fillStyle = 'rgba(255,255,255,0.25)';
      c.beginPath(); c.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.25, 0, Math.PI * 2); c.fill();
    } else {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#c9c9c9');
      c.fillStyle = grad;
      c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#999';
      c.lineWidth = 1;
      c.stroke();
    }
  }

  global.drawBoard = drawBoard;
  global.STAR_POINTS_9 = STAR_POINTS_9;
})(typeof window !== 'undefined' ? window : globalThis);
