/**
 * go-core.js —— 围棋核心规则引擎（9 路棋盘）
 * 包含：落子、气、提子、禁入点（自杀）、打劫（Ko）等规则
 */
(function (global) {
  'use strict';

  const EMPTY = 0, BLACK = 1, WHITE = 2;
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  class GoBoard {
    constructor(size = 9) {
      this.size = size;
      this.reset();
    }

    reset() {
      this.grid = new Array(this.size * this.size).fill(EMPTY);
      this.ko = -1;          // 打劫点（上一手被提掉单子的位置）
      this.history = [];     // 落子历史
    }

    idx(r, c) { return r * this.size + c; }
    rc(i) { return [Math.floor(i / this.size), i % this.size]; }
    inBounds(r, c) { return r >= 0 && r < this.size && c >= 0 && c < this.size; }

    neighbors(i) {
      const [r, c] = this.rc(i), out = [];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (this.inBounds(nr, nc)) out.push(this.idx(nr, nc));
      }
      return out;
    }

    /** 计算 grid 中 i 位置同色相连的整块棋 */
    static groupOf(grid, size, i, color) {
      const stack = [i], seen = new Set([i]);
      while (stack.length) {
        const p = stack.pop();
        const [r, c] = [Math.floor(p / size), p % size];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          const q = nr * size + nc;
          if (!seen.has(q) && grid[q] === color) { seen.add(q); stack.push(q); }
        }
      }
      return [...seen];
    }

    /** i 位置所在棋块 */
    groupOf(i) {
      const color = this.grid[i];
      if (color === EMPTY) return [];
      return GoBoard.groupOf(this.grid, this.size, i, color);
    }

    /** 棋块的气（相邻空点） */
    static libertiesOf(grid, size, group) {
      const libs = new Set();
      for (const p of group) {
        const [r, c] = [Math.floor(p / size), p % size];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          const q = nr * size + nc;
          if (grid[q] === EMPTY) libs.add(q);
        }
      }
      return [...libs];
    }

    /** i 位置棋块的气 */
    liberties(i) {
      const color = this.grid[i];
      if (color === EMPTY) return [];
      return GoBoard.libertiesOf(this.grid, this.size, this.groupOf(i));
    }

    /** 判断 color 落在 i 是否合法 */
    isLegal(color, i) {
      if (i < 0 || i >= this.grid.length || this.grid[i] !== EMPTY) return false;
      const size = this.size, opp = 3 - color;
      const copy = this.grid.slice(); copy[i] = color;
      const capturedSet = new Set();
      for (const n of this.neighbors(i)) {
        if (copy[n] === opp) {
          const g = GoBoard.groupOf(copy, size, n, opp);
          if (GoBoard.libertiesOf(copy, size, g).length === 0) g.forEach(x => capturedSet.add(x));
        }
      }
      const captured = [...capturedSet];
      if (captured.length > 0) {
        // 打劫规则：若在劫点上落子且恰好只提一子，则禁止
        if (i === this.ko && captured.length === 1) return false;
        return true;
      }
      // 无提子时必须不是自杀
      const myG = GoBoard.groupOf(copy, size, i, color);
      return GoBoard.libertiesOf(copy, size, myG).length > 0;
    }

    /** 落子，返回 {ok, captured, koPoint} */
    play(color, i) {
      if (!this.isLegal(color, i)) return { ok: false };
      const size = this.size, opp = 3 - color;
      const copy = this.grid.slice(); copy[i] = color;
      const capturedSet = new Set();
      for (const n of this.neighbors(i)) {
        if (copy[n] === opp) {
          const g = GoBoard.groupOf(copy, size, n, opp);
          if (GoBoard.libertiesOf(copy, size, g).length === 0) g.forEach(x => capturedSet.add(x));
        }
      }
      const captured = [...capturedSet];
      for (const c of captured) copy[c] = EMPTY;
      const myG = GoBoard.groupOf(copy, size, i, color);
      const myLibs = GoBoard.libertiesOf(copy, size, myG);
      if (myLibs.length === 0) return { ok: false, reason: 'suicide' };
      // 打劫：仅在“提一子，且提子方是单子、只剩一口气”时才设劫点，
      // 否则对方在原位落子（靠外气成活，不提回同一颗子）是合法的
      const koAfter = (captured.length === 1 && myG.length === 1 && myLibs.length === 1) ? captured[0] : -1;
      this.history.push({ color, idx: i, captured, koAfter });
      this.grid = copy;
      this.ko = koAfter;
      return { ok: true, captured, koPoint: koAfter };
    }

    /** 悔棋（回退一手） */
    undo() {
      if (!this.history.length) return false;
      this.history.pop();
      this.grid = new Array(this.size * this.size).fill(EMPTY);
      this.ko = -1;
      for (const h of this.history) {
        this.grid[h.idx] = h.color;
        for (const cap of h.captured) this.grid[cap] = EMPTY;
        this.ko = h.koAfter;
      }
      return true;
    }

    countStones() {
      let b = 0, w = 0;
      for (const v of this.grid) { if (v === BLACK) b++; else if (v === WHITE) w++; }
      return { b, w };
    }

    /** 简单眼位检测：空点，其所有在棋盘上的相邻点都是己方颜色 */
    eyePoints(color) {
      const out = [];
      for (let i = 0; i < this.grid.length; i++) {
        if (this.grid[i] !== EMPTY) continue;
        const ns = this.neighbors(i);
        if (ns.length < 2) continue;
        if (ns.every(n => this.grid[n] === color)) out.push(i);
      }
      return out;
    }

    /** 数地：把空区域按相邻棋子归属计数 */
    territory() {
      const size = this.size, seen = new Set();
      const result = { black: 0, white: 0, neutral: 0 };
      for (let i = 0; i < this.grid.length; i++) {
        if (this.grid[i] !== EMPTY || seen.has(i)) continue;
        const region = [], stack = [i], adj = new Set();
        seen.add(i);
        while (stack.length) {
          const p = stack.pop(); region.push(p);
          for (const n of this.neighbors(p)) {
            const v = this.grid[n];
            if (v === EMPTY) { if (!seen.has(n)) { seen.add(n); stack.push(n); } }
            else adj.add(v);
          }
        }
        if (adj.size === 1) result[adj.has(BLACK) ? 'black' : 'white'] += region.length;
        else result.neutral += region.length;
      }
      return result;
    }

    /** 数地明细：返回每个空区域及其归属（owner 0=中立/1=黑/2=白） */
    territoryMap() {
      const size = this.size, seen = new Set(), regions = [];
      for (let i = 0; i < this.grid.length; i++) {
        if (this.grid[i] !== EMPTY || seen.has(i)) continue;
        const region = [], stack = [i], adj = new Set();
        seen.add(i);
        while (stack.length) {
          const p = stack.pop(); region.push(p);
          for (const n of this.neighbors(p)) {
            const v = this.grid[n];
            if (v === EMPTY) { if (!seen.has(n)) { seen.add(n); stack.push(n); } }
            else adj.add(v);
          }
        }
        regions.push({ points: region, owner: adj.size === 1 ? [...adj][0] : 0 });
      }
      return regions;
    }

    /** 是否还有合法落子点 */
    hasLegalMove(color) {
      for (let i = 0; i < this.grid.length; i++) {
        if (this.grid[i] === EMPTY && this.isLegal(color, i)) return true;
      }
      return false;
    }

    /** 征子判定：位于 i 的棋块（当前只剩 1 气）若逃跑，是否会被对方征死。
     *  递归模拟：逃跑方每手只能下唯一的气（被迫），攻击方枚举所有“安全的打吃手”
     * （对方剩 1 气且自身块气≥2，不是送吃），存在一条追杀到底的路线即征死。
     *  返回 true = 逃不掉（应弃子），false = 能逃掉（气变多、连上引征子或对方无安全打吃手）。 */
    ladderSucceeds(i) {
      const size = this.size, victim = this.grid[i];
      if (victim === EMPTY) return false;
      const attacker = 3 - victim;
      const MAXDEPTH = size * size;
      const libsOf = (grid, cur) => {
        const b = new GoBoard(size); b.grid = grid;
        return GoBoard.libertiesOf(grid, size, b.groupOf(cur));
      };
      const tryPlay = (grid, color, idx) => {
        const b = new GoBoard(size); b.grid = grid.slice();
        if (!b.isLegal(color, idx)) return null;
        const r = b.play(color, idx);
        return r.ok ? { grid: b.grid, captured: r.captured || [] } : null;
      };
      // search：victim 方被打吃（1 气），轮到 victim 逃；返回 true = 攻击方必胜
      const search = (grid, cur, depth) => {
        if (depth > MAXDEPTH) return true; // 兜底：棋盘有限，追杀到底算征死
        const libs = libsOf(grid, cur);
        if (libs.length === 0) return true;  // 已被提
        if (libs.length !== 1) return false; // 不在被打吃状态
        // 逃跑方被迫下唯一的气
        const esc = tryPlay(grid, victim, libs[0]);
        if (!esc) return true;               // 无处可逃（如劫争限制）
        if (esc.captured.length) return false; // 逃跑时反提对方，征子崩溃
        const libs2 = libsOf(esc.grid, cur);
        if (libs2.length >= 3) return false; // 气变多（如连上引征子），逃掉
        if (libs2.length === 1) {            // 长完仍只有 1 气：攻击方收气即提
          return tryPlay(esc.grid, attacker, libs2[0]) !== null;
        }
        // 2 气：攻击方枚举所有安全的打吃手，任一能追杀到底即胜
        for (const c of libs2) {
          const p = tryPlay(esc.grid, attacker, c);
          if (!p) continue;
          if (libsOf(p.grid, cur).length !== 1) continue; // 没形成打吃
          const bg = new GoBoard(size); bg.grid = p.grid;
          if (bg.liberties(c).length < 2) continue;       // 打吃手自身会被立即回提，属送吃
          if (search(p.grid, cur, depth + 1)) return true;
        }
        return false;
      };
      return search(this.grid.slice(), i, 0);
    }
  }

  global.GoBoard = GoBoard;
  global.GO = { EMPTY, BLACK, WHITE };
})(typeof window !== 'undefined' ? window : globalThis);
