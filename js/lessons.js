/**
 * lessons.js —— 新手教程课程数据
 * 步骤类型：
 *   text  文字讲解
 *   quiz  选择题（answer 为正确选项下标）
 *   move  落子任务（setup 为棋盘初始布局，check 判断目标是否达成）
 *   free  自由对局任务（最后一课）
 *
 * setup 字符串格式：'B 3,3 4,4 W 2,2'（1 起始坐标）
 * check 接收 { board, lastMove, passed }，返回 { done, hint, successMsg }
 */
(function (global) {
  'use strict';
  const GO = global.GO;

  /** 解析 setup 字符串为 9x9 棋盘数组 */
  function parseSetup(str) {
    const grid = new Array(81).fill(GO.EMPTY);
    if (!str) return grid;
    let color = null;
    const tokens = str.trim().split(/\s+/);
    for (const t of tokens) {
      if (t === 'B') { color = GO.BLACK; continue; }
      if (t === 'W') { color = GO.WHITE; continue; }
      const [r, c] = t.split(',').map(Number);
      grid[(r - 1) * 9 + (c - 1)] = color;
    }
    return grid;
  }

  const LESSONS = [
    // ============ 第 1 课：认识围棋 ============
    {
      id: 1,
      title: '认识围棋',
      intro: '围棋是源自中国的古老策略游戏。黑白双方轮流落子，最后围出更多“地盘”的一方获胜。',
      steps: [
        { type: 'text', content: '围棋的棋盘由横竖交错的线组成，棋子下在线的交叉点上。9 路棋盘共有 81 个交叉点。本教程会带你一步步从零学会下围棋！' },
        {
          type: 'quiz',
          question: '下围棋的最终目标是什么？',
          options: ['吃掉对方所有的棋子', '围出比对方更大的地盘', '把棋子尽量下满棋盘'],
          answer: 1,
          explanation: '围棋的目标是“占地”。吃子只是手段，围地才是目的。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: '',
          objective: '请把第一颗黑子落在棋盘正中央的交叉点（5,5），也就是“天元”。',
          hint: '棋盘正中央的那一个点，横 5、纵 5，叫做“天元”。',
          check: ({ lastMove }) => ({
            done: lastMove === 40,
            hint: lastMove === 40 ? null : '这一步的目标是天元 (5,5)，也就是棋盘正中央的交叉点。',
            successMsg: '很好！你下在了“天元”——9 路棋盘的战略要地。'
          })
        }
      ]
    },
    // ============ 第 2 课：气 ============
    {
      id: 2,
      title: '气（生命线）',
      intro: '“气”是棋子生存的根本。这一课我们认识什么是气。',
      steps: [
        {
          type: 'visual',
          setup: 'W 5,5',
          highlights: [{ i: 31, label: 1 }, { i: 41, label: 2 }, { i: 49, label: 3 }, { i: 39, label: 4 }],
          text: '一颗棋子上下左右相邻的空交叉点，叫它的<b>“气”</b>——气就是棋子的生命线，气被堵死，棋子就会被吃掉。<br>看画面：中央这颗白子的上下左右，有 <b>4 个被绿色发光圆环标出的空点</b>，这就是它的 <b>4 口气</b>。'
        },
        {
          type: 'quiz',
          setup: 'W 5,5',
          highlights: [{ i: 31, label: 1 }, { i: 41, label: 2 }, { i: 49, label: 3 }, { i: 39, label: 4 }],
          question: '看画面：中央的白棋有几口气？',
          options: ['2 口', '3 口', '4 口', '5 口'],
          answer: 2,
          explanation: '就是画面上那 4 个被绿圈标出的点——上下左右各 1 口，共 4 口气。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,5',
          highlightLibertiesOf: 40,
          objective: '现在轮到你执黑。白棋的 <b>4 口气</b>已用绿圈标出，请堵住其中 <b>任意一口气</b>（下在被圈出的点上）。下完后看看白棋还剩几口气。',
          hint: '白棋被绿圈标出的 4 个点就是它的气，下在任意一个上即可堵住一口气。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const ok = board.neighbors(40).includes(lastMove);
            const remain = board.liberties(40).length;
            return {
              done: ok,
              hint: ok ? null : '要堵气，就要下在白棋旁边的交叉点（被绿圈标出的气）。',
              successMsg: ok ? '很好！你堵住了白棋的一口气，现在白棋只剩 <b>' + remain + ' 口气</b>了——看看画面上剩下的绿圈。' : null
            };
          }
        }
      ]
    },
    // ============ 第 3 课：提子 ============
    {
      id: 3,
      title: '打吃与提子',
      intro: '让对方的棋子只剩一口气叫“打吃”，堵死最后一口气就能“提子”吃掉它。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 5,5', text: '一颗白子站在天元，拥有 <b>4 口气</b>。', highlightLibs: 40, duration: 1300 },
            { board: 'B 4,5 W 5,5', text: '黑棋堵住上方，白棋剩 <b>3 口气</b>。', highlightLibs: 40, mark: 31, duration: 1200 },
            { board: 'B 4,5 5,4 W 5,5', text: '黑棋堵住左方，白棋剩 <b>2 口气</b>。', highlightLibs: 40, mark: 39, duration: 1200 },
            { board: 'B 4,5 5,4 5,6 W 5,5', text: '黑棋再堵右方——白棋只剩 <b>1 口气</b>！这就是<b>“打吃”</b>（Atari）。', highlightLibs: 40, mark: 41, duration: 1500 },
            { board: 'B 4,5 5,4 5,6 6,5 W 5,5', text: '黑棋下在最后一口气 (6,5)，白棋的气全被堵死了！', mark: 49, flash: 40, flashMs: 900 },
            { board: 'B 4,5 5,4 5,6 6,5', text: '白棋被 <b>“提子”</b>拿走——这就是“吃子”！', mark: 49, duration: 1500 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 4,5 5,4 5,6 W 5,5',
          highlightLibertiesOf: 40,
          question: '看画面：白棋只剩 1 口气了。黑棋应该怎么做？',
          options: ['下在最后那口气上，把它提掉', '下得离它远远的', '等白棋自己走掉'],
          answer: 0,
          explanation: '就是画面上白棋剩下的那 1 口气：下在最后那口气上，它就没气了，会被立刻提掉。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 4,5 5,4 5,6 W 5,5',
          objective: '中央的白棋被黑棋打吃，只剩最后一口气。请下在 (6,5)，把它提掉！',
          hint: '白棋最后的一口气在天元正下方，也就是 (6,5)。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 49 && board.grid[40] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '白棋最后的一口气在 (6,5)，下在那里就能提掉它。',
              successMsg: done ? '漂亮！你提掉了白棋。被提的子会从棋盘上拿走——这就是“吃子”。' : null
            };
          }
        }
      ]
    },
    // ============ 第 4 课：禁入点 ============
    {
      id: 4,
      title: '禁入点（自杀规则）',
      intro: '你无法把棋子下在没有气的地方（除非这一步能提掉对方）。这样的点叫“禁入点”。',
      steps: [
        {
          type: 'visual',
          setup: 'W 4,5 5,4 5,6 6,5',
          highlights: [{ i: 40, style: 'forbidden' }],
          text: '规则规定：你不能把棋子下在“没有任何气”的空点上（除非这一步能提掉对方的棋子），这叫<b>“禁入点”</b>，也叫“自杀”。<br>看画面：棋盘中央这个被 4 颗白子团团围住的空点，被一个<b>红色发光圆环 + ✕</b> 标了出来——它就是禁入点，黑棋下在这里等于“自杀”，所以规则不允许。'
        },
        {
          type: 'quiz',
          setup: 'W 4,5 5,4 5,6 6,5',
          highlights: [{ i: 40, style: 'forbidden' }],
          question: '看画面：被红色 ✕ 标出的那个点，是什么？',
          options: ['禁入点，不能落子', '好位置，应该下这里', '白棋的气'],
          answer: 0,
          explanation: '它就是禁入点：下过去会“自杀”。除非你这一步能提掉对方，否则不能在那里落子。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 4,5 5,4 5,6 6,5',
          highlights: [{ i: 40, style: 'forbidden' }],
          objective: '现在轮到你执黑。<b>红色 ✕</b> 标出的 (5,5) 就是禁入点。请避开它，下在其他任意合法的空点。',
          hint: '先点一下红色 ✕ 的 (5,5) 试试，看看程序会怎么说；然后换一个合法的位置落子。',
          check: ({ lastMove }) => {
            if (lastMove === null) return { done: false };
            return {
              done: true,
              successMsg: '正确！你避开了禁入点。刚才如果你点 (5,5)，程序会拒绝你——因为那里是“禁入点”。'
            };
          }
        },
        {
          type: 'visual',
          setup: 'W 5,5 5,7 4,6 6,6 B 5,4 4,5 6,5',
          highlights: [{ i: 41, style: 'forbidden' }],
          text: '但禁入点有一个<b>重要的例外</b>！<br>看这个画面：中间这个空点 (5,6) 被 <b>4 颗白子围住</b>（红 ✕ 处）——和第 1 节那个禁入点<b>一模一样</b>，黑棋直接下这里会 0 气。<br><b>但注意左边那颗白子 (5,5)</b>：它被黑棋打吃，只剩 (5,6) 这一口气了。黑棋下在 (5,6)，能直接把它提掉！<br><b>规则规定：只要这一步能提掉对方的棋子，就可以下！</b>这个“能提子就能下”的例外，以后吃子、扑都会用到。<br><b>⚠️ 但有一个特殊情况</b>：如果提回会造成“打劫”（双方反复提同一颗子），那就<b>不能立刻下</b>——这条特殊规则我们到第 6 课再学。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,5 5,7 4,6 6,6 B 5,4 4,5 6,5',
          highlights: [{ i: 41, style: 'forbidden' }],
          objective: '现在轮到你执黑。请大胆下在 <b>(5,6)</b>（红 ✕ 处）——它看着像禁入点，但能提掉被打吃的白子 (5,5)！',
          hint: '点 (5,6)：黑子落下后，白子 (5,5) 最后的气被堵死、被提走，黑子反而有了气。',
          check: ({ lastMove }) => {
            const done = lastMove === 41;
            return {
              done,
              hint: done ? null : '请下在 (5,6)——红 ✕ 处。黑子落下能提掉白子 (5,5)，所以这是合法的！',
              successMsg: done ? '漂亮！你下了看似“禁入点”的 (5,6)，但它提掉了白子 (5,5)，所以完全合法！这就是禁入点的例外：<b>能提掉对方，就能下</b>。' : null
            };
          }
        }
      ]
    },
    // ============ 第 5 课：连接与切断 ============
    {
      id: 5,
      title: '连接与切断',
      intro: '相邻的同色棋子连成一体、共享气，会更安全。切断对方则可以削弱它。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 5,4 5,6', text: '看画面：两颗黑子中间隔着空点，它们是<b>两块独立的棋</b>，各有各的气。', highlightLibs: [39, 41], duration: 1600 },
            { board: 'B 5,4 5,5 5,6', text: '黑棋下在中间 (5,5)，三颗子连成<b>一个整体</b>、共享所有气——这就是<b>“连接”</b>。连接让棋更难被吃。', mark: 40, highlightLibs: 40, duration: 1900 },
            { board: 'B 5,4 5,6', text: '可要是黑棋偷懒不及时连接，白棋就会抓住机会……', highlightLibs: [39, 41], duration: 1400 },
            { board: 'B 5,4 5,6 W 5,5', text: '白棋落在中间 (5,5)，把黑棋<b>“切断”</b>成两块——每颗黑子各自的气（绿圈）都<b>变少、变弱</b>了，这就是<b>“切断”</b>。', mark: 40, highlightLibs: [39, 41], duration: 2200 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 5,4 5,5 5,6',
          highlightLibertiesOf: 40,
          question: '看画面：这三颗黑子连成了什么？以下说法正确的是？',
          options: ['连在一起的棋子会共享气，更安全', '棋子越分散越好', '连接没有任何好处'],
          answer: 0,
          explanation: '画面上的三颗黑子连成一个整体、共享所有的气，所以更难被吃——这就是连接的价值。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 5,4 5,6 W 6,5',
          objective: '黑棋的两颗子被白棋隔开了。请下在中间的空点 (5,5)，把它们连接起来。',
          hint: '两颗黑子中间的空点是 (5,5)。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const done = board.groupOf(40).length >= 3;
            return {
              done,
              hint: done ? null : '请下在中间的空点 (5,5)，把两颗黑子连起来。',
              successMsg: done ? '连接成功！三颗黑子连成一体、气变多了，白棋更难吃掉它们。' : null
            };
          }
        }
      ]
    },
    // ============ 第 6 课：打劫 ============
    {
      id: 6,
      title: '打劫（Ko）',
      intro: '“打劫”是一条特殊规则：虽然“能提子”，但不能立刻在原位提回同一颗子——防止双方无限提来提去。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 1,2 2,1 3,2 1,9 W 2,2 1,3 3,3 2,4', text: '看画面：这是一块典型的<b>“打劫”</b>棋形，黑棋可以提掉中央那颗白子。', duration: 1800 },
            { board: 'B 1,2 2,1 3,2 2,3 1,9 W 1,3 3,3 2,4', text: '黑棋下在 (2,3)，把白棋 (2,2) 提掉了！现在黑子只剩 <b>1 口气</b>（绿圈处）。', mark: 11, highlightLibs: 11, duration: 2400 },
            { board: 'B 1,2 2,1 3,2 2,3 1,9 W 1,3 3,3 2,4 2,9', text: '白棋这一手<b>能提掉</b>黑子（第 4 课学过“能提子就能下”）——但这里有个<b>例外中的例外</b>！黑棋刚提走一颗白子，白棋只能在原位 (2,2) 立刻提回这<b>同一颗子</b>，会<b>无限循环</b>。<br>所以<b>打劫规则</b>：<b>不能立刻在原位提回</b>，只能先去<b>别处找劫材</b>——于是下在 (2,9)，打吃右上角黑子（绿圈是它仅剩的一口气）。', mark: 17, highlightLibs: 8, duration: 2800 },
            { board: 'B 1,2 2,1 3,2 2,3 1,9 1,8 W 1,3 3,3 2,4 2,9', text: '黑棋<b>应劫</b>——在 (1,8) 救回右上角的黑子，打劫限制随之解除。', mark: 7, duration: 2300 },
            { board: 'B 1,2 2,1 3,2 1,9 1,8 W 2,2 1,3 3,3 2,4 2,9', text: '白棋回到原位 (2,2)，把黑棋提回！', mark: 10, duration: 1800 },
            { board: 'B 1,2 2,1 3,2 1,9 1,8 W 2,2 1,3 3,3 2,4 2,9', text: '完整打劫循环：<b>提子 → 不能立刻提回 → 找劫材 → 应劫 → 再提回</b>。实战中学会找劫材、应劫，才能赢得劫争！', duration: 2600 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 1,2 2,1 3,2 2,3 W 1,3 3,3 2,4',
          highlightLibertiesOf: 11,
          question: '看画面：黑棋刚提掉白子，只剩 1 口气（绿圈处）。白方可以立刻在原位提回吗？',
          options: ['可以，没问题', '不可以，必须先在别处下一手', '规则没有规定'],
          answer: 1,
          explanation: '虽然这一手在技术上“能提子”（不是禁入点），但打劫规则限制它：不能立刻在原位提回，要先在别处下一手（找劫材），之后才能回来提。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 1,2 2,1 3,2 W 2,2 1,3 3,3 2,4',
          objective: '现在黑棋可以提掉一颗白子。请下在 (2,3)，完成提子。',
          hint: '提子点在 (2,3)，落子后白棋 (2,2) 那颗子就会被提掉。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 11 && board.grid[10] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '请下在 (2,3)，把白棋 (2,2) 那颗子提掉。',
              successMsg: done ? '你提掉了白子！注意看：(2,3) 的黑子现在只有一口气，白方在 (2,2) 明明“能提回”——但这是<b>打劫</b>，不允许立刻提回（要先找劫材）。' : null
            };
          }
        },
        {
          type: 'move',
          playerColor: GO.WHITE,
          setup: 'B 1,2 2,1 3,2 2,3 W 1,3 3,3 2,4',
          ko: 10,
          objective: '现在轮到你执白。请先试试下在 (2,2) 原位提回——虽然“能提子”，但程序会告诉你这是“打劫”，不允许立刻下。然后请下在别处（找劫材）。',
          hint: '试试直接点 (2,2)，看程序的提示；然后选一个别的位置落子（找劫材）。',
          check: ({ lastMove }) => {
            if (lastMove !== null) return { done: true, successMsg: '很好！你选择先在别处落子（找劫材），这正是应对打劫的正确方式。' };
            return { done: false };
          }
        }
      ]
    },
    // ============ 第 7 课：眼与活棋 ============
    {
      id: 7,
      title: '眼与活棋',
      intro: '“眼”是被己方棋子围住的空点。有两只眼的棋就是“活棋”，永远不会被吃。',
      steps: [
        {
          type: 'visual',
          setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 3,8 4,3 4,4 4,5 4,6 4,7 4,8',
          highlights: [{ i: 21, style: 'liberty', label: '眼' }, { i: 24, style: 'liberty', label: '眼' }],
          text: '“眼”是被己方棋子围住的空点，对方不能在眼里落子（那是禁入点）。<br>看画面：这块黑棋围出了<b>两只眼</b>（绿色标记处），白棋两只都填不掉——所以它是<b>“活棋”</b>，永远吃不掉。'
        },
        {
          type: 'quiz',
          setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 3,8 4,3 4,4 4,5 4,6 4,7 4,8',
          highlights: [{ i: 21, style: 'liberty', label: '眼' }, { i: 24, style: 'liberty', label: '眼' }],
          question: '看画面：黑棋有两只眼，它会怎样？',
          options: ['它是活棋，永远不会被吃掉', '它还是会被吃掉', '它只能多活一会儿'],
          answer: 0,
          explanation: '画面里黑棋的两只眼（绿圈处）白棋都填不掉（那是禁入点），所以这块黑棋是活棋，永远安全。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 4,3 4,4 4,5 4,6 4,7 4,8',
          objective: '黑棋现在只有一只眼，很危险。请下在 (3,8)，做出第二只眼，让黑棋变成活棋。',
          hint: '把黑子下在 (3,8)，让右下那个空点被黑棋完全围住，形成第二只眼。',
          check: ({ board }) => {
            const eyes = board.eyePoints(GO.BLACK).length;
            const done = eyes >= 2;
            return {
              done,
              hint: done ? null : '目前黑棋只有 1 只眼。请下在 (3,8)，做出第二只眼。',
              successMsg: done ? '太棒了！黑棋现在有两只眼，成为了“活棋”，白棋再也吃不掉它。' : null
            };
          }
        }
      ]
    },
    // ============ 第 8 课：围地 ============
    {
      id: 8,
      title: '围地（占地盘）',
      intro: '用棋子围住的空点就是你的地盘。这一课我们来围一块地。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,5 6,6',
          highlights: [{ i: 30 }, { i: 31 }, { i: 39 }, { i: 40 }],
          text: '围棋的最终目标是<b>“围地”</b>：用棋子围住的空交叉点，就是你的地盘。<br>看画面：黑棋用一圈棋子围住了中间 <b>4 个空点</b>（绿色标记处），它们都是黑棋的地盘，会成为黑棋的得分。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,5 6,6',
          highlights: [{ i: 30 }, { i: 31 }, { i: 39 }, { i: 40 }],
          question: '看画面：黑棋围住的空点（绿圈处）有什么用？',
          options: ['空点是自己的地盘，越多越好', '空点没有用', '空点会给对方加分'],
          answer: 0,
          explanation: '画面里被绿圈标出的 4 个空点都是黑棋的地盘，是决定胜负的关键。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,6',
          objective: '黑棋用棋子围了三面墙，只差最后一块石头。请下在 (6,5)，把缺口堵上，围住里面的地盘。',
          hint: '缺口在底边中央 (6,5)，把黑子下在那里就能围住 4 个空点。',
          check: ({ board }) => {
            // 检查包含内部点 (4,4)【0-indexed (3,3)=30】的空区域是否被黑棋完全包围、且未触及棋盘边缘
            const size = board.size, start = 30;
            if (board.grid[start] !== GO.EMPTY) return { done: false };
            const region = [], stack = [start], seen = new Set([start]);
            while (stack.length) {
              const p = stack.pop(); region.push(p);
              const [r, c] = board.rc(p);
              for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const nr = r + dr, nc = c + dc;
                if (!board.inBounds(nr, nc)) continue;
                const q = board.idx(nr, nc);
                if (board.grid[q] === GO.EMPTY && !seen.has(q)) { seen.add(q); stack.push(q); }
              }
            }
            let edge = false;
            const adj = new Set();
            for (const p of region) {
              const [r, c] = board.rc(p);
              if (r === 0 || r === size - 1 || c === 0 || c === size - 1) edge = true;
              for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const nr = r + dr, nc = c + dc;
                if (!board.inBounds(nr, nc)) continue;
                const q = board.idx(nr, nc);
                if (board.grid[q] !== GO.EMPTY) adj.add(board.grid[q]);
              }
            }
            const done = !edge && adj.size === 1 && adj.has(GO.BLACK) && region.length >= 4;
            return {
              done,
              hint: done ? null : '缺口在底边中央 (6,5)，把黑子下在那里才能把地盘围住。',
              successMsg: done ? '围地成功！你圈住了 ' + region.length + ' 个空点，它们现在都是黑棋的地盘了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 9 课：打吃与逃命 ============
    {
      id: 9,
      title: '打吃与逃命',
      intro: '自己的棋被打吃时要赶紧处理；反过来，打吃对方则是进攻的起点。',
      steps: [
        {
          type: 'visual',
          setup: 'B 5,5 W 4,5 5,4 6,5',
          highlights: [{ i: 41 }],
          text: '当你的棋子被打吃（只剩 <b>1 口气</b>）时，要赶紧想办法：逃跑、连接，或反过来提掉对方。<br>看画面：天元这颗黑子被三颗白子围住，只剩 <b>1 口气</b>（绿圈处）——它被<b>“打吃”</b>了！'
        },
        {
          type: 'quiz',
          setup: 'B 5,5 W 4,5 5,4 6,5',
          highlightLibertiesOf: 40,
          question: '看画面：黑子只剩 1 口气（绿圈处），最好怎么办？',
          options: ['赶紧逃跑或连接', '先下别处，等会儿再说', '直接认输'],
          answer: 0,
          explanation: '画面里黑子只剩绿圈那一口气，非常危险，必须立刻逃跑或连接，否则下一手就会被提掉。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 5,5 W 4,5 5,4 6,5',
          objective: '天元上的黑子被白棋打吃了！请立刻下在 (5,6) 逃跑，给它续上气。',
          hint: '快下在 (5,6)！黑子连出去后就有新的气了。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const done = board.groupOf(40).length >= 2;
            return {
              done,
              hint: done ? null : '快下在 (5,6) 逃命！',
              successMsg: done ? '好样的！黑子逃出了打吃，现在有了更多的气，暂时安全了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 10 课：终局与数地 ============
    {
      id: 10,
      title: '终局与数地',
      intro: '对局结束后来“数地”判定胜负。学完这一课，你就可以去自由对局实战了！',
      steps: [
        {
          type: 'visual',
          setup: 'B 2,2 2,3 2,4 2,5 3,2 3,5 4,2 4,3 4,4 4,5 W 6,5 6,6 6,7 6,8 7,5 7,8 8,5 8,6 8,7 8,8',
          highlights: [{ i: 20 }, { i: 21 }, { i: 59 }, { i: 60 }],
          text: '当双方都觉得没有棋可下时（通常双方都连续“放弃一手”），对局就结束了。<br>看画面：黑棋在左上围了 <b>2 个空点</b>（绿圈），白棋在右下也围了 <b>2 个空点</b>（绿圈）——把各自的<b>棋子数 + 围住的空点数</b>加起来，就能判定胜负。黑棋先手有优势，所以要“贴目”（这里白棋加 7.5 目）。'
        },
        {
          type: 'quiz',
          setup: 'B 2,2 2,3 2,4 2,5 3,2 3,5 4,2 4,3 4,4 4,5 W 6,5 6,6 6,7 6,8 7,5 7,8 8,5 8,6 8,7 8,8',
          highlights: [{ i: 20 }, { i: 21 }, { i: 59 }, { i: 60 }],
          question: '看画面：黑棋、白棋围住的空点（绿圈处）有什么用？',
          options: ['数双方的地盘和棋子，多者获胜', '看谁棋子下得多', '先动手的人赢'],
          answer: 0,
          explanation: '画面里绿圈标出的就是各自的地盘空点，数“棋子 + 围住的空点”来判定胜负，黑方还要减去贴目（白棋加 7.5 目）。'
        },
        {
          type: 'free',
          playerColor: GO.BLACK,
          objective: '最后一课：完成一盘自由对局吧！执黑对战电脑，围出比对方更大的地盘。当你觉得下完了，点击“数地”查看结果。'
        }
      ]
    },
    // ============ 第 11 课：征子 ============
    {
      id: 11,
      title: '吃子技巧① · 征子',
      intro: '“征子”又叫“追杀”：黑棋每手都打吃白棋，白棋只能一路逃跑，最后被逼到边线吃掉。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 5,5 B 5,6 6,5 4,4 4,3', text: '白棋从下方和右方被黑棋夹住，只剩向上和向左两个方向。', highlightLibs: 40, duration: 1600 },
            { board: 'W 5,5 B 5,6 6,5 4,4 4,3 4,5', text: '黑棋下在 (4,5)，<b>打吃</b>！白棋只剩左边 (5,4) 一口气。', mark: 31, highlightLibs: 40, duration: 1900 },
            { board: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5', text: '白棋逃到 (5,4)。但黑棋像“下楼梯”一样继续追……', mark: 39, duration: 1400 },
            { board: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5 6,4', text: '黑棋再打吃 (6,4)——白棋又只剩一口气！', mark: 48, highlightLibs: 39, duration: 1700 },
            { board: 'W 5,5 5,4 5,3 B 5,6 6,5 4,4 4,3 4,5 6,4', text: '白棋再逃 (5,3)。只要没有“接应”，白棋就只能一路往边线跑。', mark: 38, duration: 1400 },
            { board: 'W 5,5 5,4 5,3 B 5,6 6,5 4,4 4,3 4,5 6,4 6,3', text: '黑棋再打吃 (6,3)……就这样一路追到边线，白棋<b>永远逃不掉</b>——这就是<b>“征子”</b>！', mark: 47, highlightLibs: 38, duration: 2400 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 5,5 B 5,6 6,5 4,4 4,3 4,5',
          highlightLibertiesOf: 40,
          question: '看画面：白棋被打吃、只剩 1 口气。它一直往边线逃，最后会怎样？',
          options: ['一路被黑棋打吃追到边线，逃不掉', '总能找到地方跑掉', '白棋一定能反吃黑棋'],
          answer: 0,
          explanation: '征子就是“每手都打吃”的追杀：白棋每逃一步都被黑棋追上打吃，像下楼梯一样被逼到边线，最终被吃掉——除非中途有白棋的“接应”破坏征子。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,5 B 5,6 6,5 4,4 4,3',
          objective: '现在轮到你执黑。请下在 (4,5)，<b>打吃</b>白棋，让白棋只剩一口气——征子就这样开始了。',
          hint: '白棋的上方是 (4,5)，下在那里白棋就只剩 (5,4) 一口气了。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 31 && board.liberties(40).length === 1;
            return {
              done,
              hint: done ? null : '请下在 (4,5)，堵住白棋上方的气。',
              successMsg: done ? '正确！你打吃了白棋。记住：征子就是“每手打吃、一路追杀”，白棋只能往边线逃，逃不掉。' : null
            };
          }
        }
      ]
    },
    // ============ 第 12 课：枷吃 ============
    {
      id: 12,
      title: '吃子技巧② · 枷吃',
      intro: '“枷吃”又叫“网”：不急着打吃，而是像一张网把对方罩住，让它怎么跑都跑不掉。',
      steps: [
        {
          type: 'visual',
          setup: 'W 5,2 B 4,2 6,2 5,4',
          highlights: [{ i: 36 }, { i: 38 }],
          text: '看画面：白棋贴着左边线，只剩 <b>两条出路</b>（绿色标记处）。黑棋用三颗子把它罩住——这就是一张<b>“网”</b>。<br>白棋往哪条路跑，黑棋都能一步抓住它：这种<b>“一网罩住”</b>的吃法，就叫<b>“枷吃”</b>。'
        },
        {
          type: 'quiz',
          setup: 'W 5,2 B 4,2 6,2 5,4',
          highlights: [{ i: 36 }, { i: 38 }],
          question: '看画面：黑棋用三颗子罩住白棋、不让它逃跑，这种吃法叫什么？',
          options: ['枷吃（网住）', '征子（追杀）', '打劫'],
          answer: 0,
          explanation: '画面里黑棋像网一样把白棋罩住，白棋有气却跑不出去——这就是“枷吃”（网住）。征子是“追”，枷是“罩”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,2 B 4,2 6,2 5,4',
          objective: '现在轮到你执黑。请下在 (5,3)（绿圈处），<b>收紧网口</b>，让白棋只剩贴边的那一口气。',
          hint: '白棋两条出路之一在 (5,3)，下在那里就把它网死了。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 38 && board.liberties(37).length === 1;
            return {
              done,
              hint: done ? null : '请下在 (5,3)，堵住白棋通向棋盘中间的那条路。',
              successMsg: done ? '漂亮！你收紧网口，白棋被“枷”住了——它只剩贴边一口气，怎么跑都逃不出黑棋的网。' : null
            };
          }
        }
      ]
    },
    // ============ 第 13 课：双叫吃 ============
    {
      id: 13,
      title: '吃子技巧③ · 双叫吃',
      intro: '“双叫吃”：一手棋同时打吃对方两块棋，对方只能救其中一块。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6',
          highlights: [{ i: 31 }],
          text: '看画面：两颗白子各被三颗黑子围住，而它们<strong>共用同一个气口</strong>——中间的 <b>(4,5)</b>（绿色标记处）。<br>黑棋只要下在 (4,5)，两颗白子就会<b>同时被打吃</b>——这就是<b>“双叫吃”</b>。白棋一次只能救一颗，另一颗必死。'
        },
        {
          type: 'quiz',
          setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6',
          highlights: [{ i: 31 }],
          question: '看画面：黑棋下在 (4,5)，会发生什么？',
          options: ['两颗白子同时被打吃（双叫吃）', '只能打吃一颗白子', '黑棋会输'],
          answer: 0,
          explanation: '(4,5) 是两颗白子共用的气口，黑棋下在那里，两颗白子同时只剩 1 口气——白棋救得了一颗，救不了另一颗。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6',
          objective: '现在轮到你执黑。请下在 <b>(4,5)</b>，同时打吃两颗白子（双叫吃）。',
          hint: '两颗白子中间的气口就是 (4,5)。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 31 && board.liberties(30).length === 1 && board.liberties(32).length === 1;
            return {
              done,
              hint: done ? null : '请下在 (4,5)——那是两颗白子共用的气口。',
              successMsg: done ? '完美！这就是双叫吃：一手棋同时打吃两块棋，白棋只能救其中一块。' : null
            };
          }
        }
      ]
    },
    // ============ 第 14 课：扑（倒扑） ============
    {
      id: 14,
      title: '吃子技巧④ · 扑（倒扑）',
      intro: '“扑”（也叫倒扑）：故意把一颗子送进对方嘴里，对方提掉它后，反而接不归（只剩一口气），黑棋再回提，把对方整块吃掉——送一子、吃大块。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7', text: '看画面：白棋两块被黑棋团团围住，各自只剩 (1,7)(2,7) 两个气口——白棋已经逃不掉了。<br>黑棋想吃白，有两种下法：直接下 (2,7) 收气，或者用妙手<b>“扑”</b>。哪种吃得更多？', highlights: [{ i: 6 }, { i: 15 }], duration: 2600 },
            { board: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,7 1,9 2,9 3,9 4,8 3,7', text: '黑棋把一颗子<b>“扑”</b>进 (1,7)——这是白棋两块之间的连接点，<b>送一子</b>给白棋。这颗黑子只剩 (2,7) 一口气，白棋必须提它。', mark: 6, duration: 2400 },
            { board: 'W 1,6 2,6 2,7 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7', text: '白棋只好在 (2,7) 提掉黑子。但一提子，两块白棋连成整块，反而只剩 (1,7) 一口气——<b>“接不归”</b>了！', mark: 15, duration: 2800 },
            { board: 'W 1,6 2,6 2,7 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,7 1,9 2,9 3,9 4,8 3,7', text: '黑棋再下 (1,7)！这里四周全是白棋（红圈处），看起来像“禁入点”？——还记得第 4 课吗？<b>能提掉对方，就能下</b>！黑子一落，白棋整块 <b>7 颗子全被提走</b>，黑子立刻重获气。<b>送 1 子、吃 7 子！</b><br>⚠️ 这和打劫<b>不一样</b>：打劫是回提<b>同一颗单子</b>（1 换 1，无限循环）；这里黑棋吃的是白棋<b>一整块 7 颗</b>，白棋被吃光、没法再提回黑子，<b>一次性结束</b>——所以不是打劫，完全合法！', mark: 6, highlights: [{ i: 5, style: 'capture' }, { i: 7, style: 'capture' }, { i: 15, style: 'capture' }], flash: [5, 14, 23, 7, 16, 25, 15], flashMs: 2000, duration: 3600 },
            { board: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 2,7 1,9 2,9 3,9 4,8 3,7', text: '对比一下：如果黑棋<b>不扑</b>、直接下 (2,7) 收气——白棋只剩 (1,7) 一个禁入点（红 ✕），黑棋再下 (1,7) 只能吃 <b>6 颗子</b>。<br>而扑 (1,7) 让白棋被迫提子、整块连起来，黑棋一次吃掉 <b>7 颗子</b>——<b>送子换吃大块</b>，这就是“扑”（倒扑）！', mark: 15, highlights: [{ i: 6, style: 'forbidden' }], duration: 3600 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7',
          highlights: [{ i: 6 }, { i: 15 }],
          question: '看画面：白棋两块各剩 (1,7)(2,7) 两个气口。黑棋想吃得最多，应该下在哪里？',
          options: ['(1,7)——扑进连接点送一子，白棋提子后接不归，黑棋回提整块 7 子', '(2,7)——直接收气，但只能吃 6 子', '随便下，都只能吃 3 子'],
          answer: 0,
          explanation: '黑棋下 (1,7) 扑入连接点：白棋提掉黑子（下 (2,7)）后，两块白棋连成整块、只剩 (1,7) 一口气，黑棋再下 (1,7) 就能回提整块 7 子（禁入点例外：能提子就能下）。这不是打劫——黑棋吃的是白棋一整块（1 换 7），不是回提同一颗子，白棋被吃光后没法再提回，一次性结束。这就是“扑”（倒扑）——送一子、吃大块。直接下 (2,7) 收气只能吃 6 子。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7',
          objective: '现在轮到你执黑。请下在 <b>(1,7)</b>（两块白棋之间的连接点），把黑子“扑”进去，送一子给白棋。',
          hint: '两块白棋之间的连接点在 (1,7)。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 6;
            return {
              done,
              hint: done ? null : '请下在 (1,7)——两块白棋之间的连接点。',
              successMsg: done ? '好！你扑入 (1,7)，送了一颗子。白棋提掉它后整块就“接不归”了（只剩 (1,7) 一口气），黑棋再下 (1,7) 就能回提整块 7 子。注意这不是打劫——黑棋吃的是白棋一整块（1 换 7），不是回提同一颗子，一次性结束。这就是“扑”（倒扑）：送一子、吃大块！' : null
            };
          }
        },
        {
          type: 'text',
          content: '“扑”（倒扑）的精髓：<b>送一颗子给对方提，换取回提吃掉一整块</b>。<br>关键：黑棋把一颗子下在对方<b>想连接的关键点</b>（连接点/眼位），白棋提掉它，反而<b>接不归</b>（整块只剩一口气）。黑棋再下回那个点，看起来像“禁入点”？——<b>能提掉对方，就能下</b>（第 4 课学的例外），白棋整块被提。<br><b>和“打劫”的区别（重点）</b>：打劫是<b>回提同一颗单子</b>（1 换 1），会无限循环，所以禁止立刻提回（第 6 课）；倒扑是<b>吃对方一整块</b>（1 换 7），白棋被吃光、没法再提回黑子，<b>一次性结束，不是打劫</b>。<br>实战中，当对方两块棋想连接、或只剩一口气时，扑是吃得最多的妙手。'
        }
      ]
    },
    // ============ 第 15 课：真眼与假眼 ============
    {
      id: 15,
      title: '死活基础① · 真眼与假眼',
      intro: '“眼”也有真假：真眼四周都被自己的棋连住，假眼则有一处没连住，随时会破。',
      steps: [
        {
          type: 'visual',
          setup: 'B 1,1 1,2 1,3 2,1 2,3 3,1 3,2 3,3',
          highlights: [{ i: 10, label: '真眼' }],
          text: '<b>真眼</b>：看画面，中间这个空点（绿色标记处）的<b>上下左右都被黑棋连在一起</b>，白棋一颗都填不进来（是禁入点），这个眼是<b>牢靠的“真眼”</b>。'
        },
        {
          type: 'visual',
          setup: 'B 1,1 1,2 1,3 2,1 2,3 3,2',
          highlights: [{ i: 10, label: '假眼' }],
          text: '<b>假眼</b>：看画面，中间这个空点（绿色标记处）看起来也被黑棋围住了，但下面那颗黑子 <b>(3,2)</b> 是<b>单独的、没和整块黑棋连上</b>。<br>白棋可以吃掉它，假眼立刻就会破掉——所以它只是<b>“假眼”</b>。做活时必须把假眼补成真眼。'
        },
        {
          type: 'quiz',
          setup: 'B 1,1 1,2 1,3 2,1 2,3 3,2',
          highlights: [{ i: 10, label: '假眼' }],
          question: '看画面：中间这个眼，为什么是“假眼”？',
          options: ['下面那颗黑子 (3,2) 是单独的，没连上，会被吃掉', '因为白棋不能下进去', '因为黑棋围得太多了'],
          answer: 0,
          explanation: '中间空点下面那颗黑子 (3,2) 与整块黑棋没连上，白棋能吃掉它，这个眼就会破——所以是假眼。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 1,1 1,2 1,3 2,1 2,3 3,1 3,3',
          objective: '现在轮到你执黑。这颗“假眼”下面缺一块。请下在 <b>(3,2)</b>，把下面连上，把假眼<b>补成真眼</b>。',
          hint: '下在 (3,2)，让整块黑棋连成一个整体。',
          check: ({ board }) => {
            const done = board.eyePoints(GO.BLACK).includes(10);
            return {
              done,
              hint: done ? null : '请下在 (3,2)，把下面那颗“断点”连上。',
              successMsg: done ? '很好！现在中间这颗眼上下左右都被黑棋连住了，假眼变成了牢靠的真眼。' : null
            };
          }
        }
      ]
    },
    // ============ 第 16 课：大眼死活 ============
    {
      id: 16,
      title: '死活基础② · 大眼形状',
      intro: '“大眼”是围出多个空点的形状。有的天生是活棋（直四），有的需要补一手才能活（刀五）。',
      steps: [
        {
          type: 'visual',
          setup: 'B 2,2 2,3 2,4 2,5 2,6 2,7 3,2 3,7 4,2 4,3 4,4 4,5 4,6 4,7',
          highlights: [{ i: 20 }, { i: 21 }, { i: 22 }, { i: 23 }],
          text: '<b>直四（活棋）</b>：看画面，黑棋围住四个连成一线的空点（绿色标记处）。<br>白棋无论点在哪，黑棋总能做出<b>两只眼</b>——所以直四<b>天生就是活棋</b>，不用再补。'
        },
        {
          type: 'visual',
          setup: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8',
          highlights: [{ i: 30 }, { i: 31 }, { i: 32 }, { i: 33 }, { i: 41 }],
          text: '<b>刀五（需要补）</b>：看画面，黑棋围出五个空点，形状像一把“刀”（绿色标记处）。<br>这个形状<b>必须补一手</b>才能做活；如果被白棋抢到中间的急所点进去，黑棋就死了。'
        },
        {
          type: 'quiz',
          setup: 'B 2,2 2,3 2,4 2,5 2,6 2,7 3,2 3,7 4,2 4,3 4,4 4,5 4,6 4,7',
          highlights: [{ i: 20 }, { i: 21 }, { i: 22 }, { i: 23 }],
          question: '看画面：黑棋围出四个连成一线的空点（直四），这个形状是活棋吗？',
          options: ['是，直四是活棋，不用再补', '不是，一定会死', '要看运气'],
          answer: 0,
          explanation: '直四有四个空点，白棋点进去任何一个，黑棋都能在另一边做出两只眼——所以直四天生就是活棋。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8',
          objective: '现在轮到你执黑。这块“刀五”要被补一手才能活。请下在 <b>(4,6)</b>（刀五的急所），把大眼分成两只眼。',
          hint: '刀五的急所在 (4,6)，也就是四个空点中间那个。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 32;
            return {
              done,
              hint: done ? null : '请下在 (4,6)——刀五形状的急所。',
              successMsg: done ? '正确！你在刀五的急所补了一手，把大眼分成两只眼，这块黑棋就活了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 17 课：金角银边草肚皮 ============
    {
      id: 17,
      title: '布局入门① · 金角银边草肚皮',
      intro: '同样是围地，在角上最划算：两条边就是现成的“墙”。所以布局要先占角、再占边、最后才下中央。',
      steps: [
        {
          type: 'visual',
          setup: '',
          highlights: [{ i: 20 }, { i: 24 }, { i: 56 }, { i: 60 }, { i: 40 }],
          text: '<b>“金角银边草肚皮”</b>：看画面，星位标出的角部（(3,3)、(3,7)、(7,3)、(7,7)）靠着<b>两条边</b>，围地最省棋子、最划算；边上（如 (3,7) 所在的上边）只有<b>一条边</b>可用，次之；中央天元 (5,5) 四面受敌，围地最费棋子。<br>所以布局的顺序是：<b>先占角 → 再占边 → 最后才下中央</b>。'
        },
        {
          type: 'quiz',
          setup: '',
          question: '围棋谚语“金角银边草肚皮”告诉我们，下棋时应该先下在哪里？',
          options: ['先占角（角部最划算）', '先下天元（中央）', '随便下哪里都一样'],
          answer: 0,
          explanation: '角部靠着两条边，围地最省棋子；中央四面受敌最不划算。所以布局要先占角，这就是“金角”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: '',
          objective: '现在轮到你执黑。请把第一颗黑子下在左上角的星位 <b>(3,3)</b>，先“占角”。',
          hint: '左上角的星位是 (3,3)——那里有个星位标记点。',
          check: ({ lastMove }) => ({
            done: lastMove === 20,
            hint: lastMove === 20 ? null : '请下在左上角的 (3,3)。',
            successMsg: '很好！你占了角——围棋谚语说“金角”，角是最值得先下的地方。'
          })
        }
      ]
    },
    // ============ 第 18 课：布局入门 · 拆边 ============
    {
      id: 18,
      title: '布局入门② · 星位与拆边',
      intro: '占角之后，要“守角”和“拆边”：沿着边把自己的地盘扩展开，同时准备围更大的地。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,3 3,7',
          text: '看画面：黑棋先占左上角星位 (3,3)，又沿上边<b>“拆边”</b>到 (3,7)——两个子隔着 3 个点，既不容易被切断，又占住了上边一大片地盘。<br>布局时，<b>占角 → 守角 → 拆边</b>，是扩充地盘的基本套路。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3',
          question: '黑棋占了左上角星位 (3,3)。为了沿上边发展、扩充地盘，黑棋下一步最好下在哪里？',
          options: ['(3,7)：沿边拆边，占住上边地盘', '(5,5)：下到中央', '(1,1)：紧贴角落'],
          answer: 0,
          explanation: '占角之后要“拆边”，沿边扩张。(3,7) 与 (3,3) 隔着 3 个点，占住了上边一大片，是最常见的拆边。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3',
          objective: '现在轮到你执黑。请沿上边<b>“拆边”</b>，下在 <b>(3,7)</b>，把上边的地盘扩展开。',
          hint: '沿上边向右，隔 3 个点的地方是 (3,7)。',
          check: ({ lastMove }) => ({
            done: lastMove === 24,
            hint: lastMove === 24 ? null : '请沿上边拆边到 (3,7)。',
            successMsg: '很好！你学会了拆边——黑棋占住了上边的一大片地盘。布局就从“占角 + 拆边”开始了。'
          })
        }
      ]
    },
    // ============ 第 19 课：中盘攻防 ============
    {
      id: 19,
      title: '中盘基础 · 连接与断点',
      intro: '进入中盘，双方的棋开始接触。这时“连接”自己的弱棋、切断对方的棋，是最关键的战斗要点。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,3 3,4 3,6 3,7 W 4,4 4,6',
          highlights: [{ i: 22 }],
          text: '看画面：黑棋有两块棋被白棋隔开，中间 <b>(3,5)</b>（绿色标记处）是个“断点”。<br>如果白棋先下在 (3,5)，黑棋就被彻底切断；黑棋先连上，就变成一块厚棋。<b>抢先连接自己的断点</b>，是中盘的重要思路。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3 3,4 3,6 3,7 W 4,4 4,6',
          highlights: [{ i: 22 }],
          question: '看画面：黑棋的两块棋中间有个断点（绿圈处），黑棋应该怎么办？',
          options: ['先下在 (3,5) 把两块连起来', '下到别处去，不管它', '主动把断点让给白棋'],
          answer: 0,
          explanation: '被切断的棋会变弱。黑棋要先抢占断点 (3,5)，把两块棋连成一块厚棋——中盘时“连接”常常是最大的要点。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 3,4 3,6 3,7 W 4,4 4,6',
          objective: '现在轮到你执黑。请下在 <b>(3,5)</b>，把两块黑棋连接起来。',
          hint: '两块黑棋之间的断点就是 (3,5)。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const done = board.groupOf(22).length >= 5;
            return {
              done,
              hint: done ? null : '请下在 (3,5)，把两块黑棋连起来。',
              successMsg: done ? '漂亮！你连接了两块黑棋，变成了一块厚棋——白棋再想切断就难了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 20 课：收官与全局思路 ============
    {
      id: 20,
      title: '收官与全局思路',
      intro: '一局棋的节奏：布局（占角拆边）→ 中盘（战斗）→ 收官（收尾）。本课回顾整盘棋的思路。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 3,3', text: '开局先<b>占角</b>：黑棋下在左上角星位，角上靠两条边，最划算。', mark: 20, duration: 1600 },
            { board: 'B 3,3 W 7,7', text: '白棋也在右下角<b>占角</b>。双方先抢“金角”。', mark: 60, duration: 1600 },
            { board: 'B 3,3 3,7 W 7,7', text: '黑棋沿上边<b>拆边</b>到 (3,7)，扩大地盘。', mark: 24, duration: 1700 },
            { board: 'B 3,3 3,7 W 7,7 7,3', text: '白棋也沿下边<b>拆边</b>到 (7,3)。布局完成：双方各占了角、拓了边。', mark: 56, duration: 2200 }
          ]
        },
        {
          type: 'quiz',
          setup: '',
          question: '一局棋的正常节奏是什么？',
          options: ['布局 → 中盘 → 收官', '收官 → 中盘 → 布局', '从头到尾都在中央混战'],
          answer: 0,
          explanation: '先布局（占角、拆边建立根据地），再中盘（接触、战斗、连接切断），最后收官（收尾、把地盘围牢）。这就是全局思路。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 1,2 2,1 2,3 W 2,2',
          objective: '收官阶段：这块白棋被困在角里、只剩一口气。请下在 <b>(3,2)</b>，把它提掉（收官提子）。',
          hint: '白棋 (2,2) 只剩最后一口气 (3,2)，下在那里就能提掉它。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 19 && board.grid[10] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '白棋 (2,2) 只剩一口气，下在 (3,2) 提掉它。',
              successMsg: done ? '很好！收官时把能吃掉的白子提掉、把地盘围牢，最后再数地判断胜负。你已掌握一局棋的完整流程！' : null
            };
          }
        },
        {
          type: 'text',
          content: '恭喜你学完了进阶课程！你现在掌握了：征子、枷吃、双叫吃、倒扑、真眼假眼、大眼死活、金角银边、拆边和中盘思路。剩下的就是多下棋、多做死活题，慢慢把棋力练上来——去自由对局实战吧！'
        }
      ]
    }
  ];

  global.parseSetup = parseSetup;
  global.LESSONS = LESSONS;
})(typeof window !== 'undefined' ? window : globalThis);
