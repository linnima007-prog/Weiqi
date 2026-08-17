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
          type: 'visual',
          setup: '',
          highlights: [
            { i: 40, style: 'mark', label: 'E5·天元' },
            { i: 20, style: 'mark', label: 'C7·星位' },
            { i: 60, style: 'mark', label: 'G3·星位' }
          ],
          text: '怎么报位置？先看棋盘边上的坐标：<b>底部字母</b>是横坐标（列），9 路棋盘从左到右为 A、B、C、D、E、F、G、H、J（跳过 I，避免与 1 混淆）；<b>左侧数字</b>是纵坐标（行），从下到上为 1～9。<br>每个交叉点都写作“<b>字母＋数字</b>”，例如正中央的“<b>天元</b>”就是 <b>E5</b>（第 E 列、第 5 行，画面上已标出），四角附近的“<b>星位</b>”分别是 C3、G3、C7、G7。<br>中文里也习惯按“<b>第几路</b>”来叫，把某点说成“<b>X 之 Y</b>”：比如“<b>三三</b>点”（第 3 路 × 第 3 路）、“<b>三五</b>点”（第 3 路 × 第 5 路，又叫“目外”）、“<b>四四</b>”（第 4 路 × 第 4 路）。'
        },
        {
          type: 'quiz',
          setup: '',
          highlights: [{ i: 40, style: 'mark' }],
          question: '来个小测验！棋盘上被<b>蓝色圆圈</b>标出的这个点（正中央的天元），按“字母＋数字”的写法，它的位置是？',
          options: ['C3', 'G7', 'E5'],
          answer: 2,
          explanation: '天元在正中央：底部看列是 E（第 5 列），左侧看行是 5（第 5 行），所以是 <b>E5</b>。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: '',
          objective: '请把第一颗黑子落在棋盘正中央的交叉点E5，也就是“天元”。',
          hint: '棋盘正中央的那一个点，横 5、纵 5，叫做“天元”。',
          check: ({ lastMove }) => ({
            done: lastMove === 40,
            hint: lastMove === 40 ? null : '这一步的目标是天元 E5，也就是棋盘正中央的交叉点。',
            successMsg: '很好！你下在了“天元”。这里用它练习坐标；实战第一手还有很多合理选择。'
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
            { board: 'B 4,5 5,4 5,6 6,5 W 5,5', text: '黑棋下在最后一口气 E4，白棋的气全被堵死了！', mark: 49, flash: 40, flashMs: 900 },
            { board: 'B 4,5 5,4 5,6 6,5', text: '白棋被 <b>“提子”</b>拿走——这就是“吃子”！', mark: 49, duration: 1500 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 4,5 5,4 5,6 W 5,5',
          highlightLibertiesOf: 40,
          question: '看画面：白棋只剩 1 口气了。黑棋应该怎么做？',
          options: ['下得离它远远的', '下在最后那口气上，把它提掉', '等白棋自己走掉'],
          answer: 1,
          explanation: '就是画面上白棋剩下的那 1 口气：下在最后那口气上，它就没气了，会被立刻提掉。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 4,5 5,4 5,6 W 5,5',
          objective: '中央的白棋被黑棋打吃，只剩最后一口气。请下在 E4，把它提掉！',
          hint: '白棋最后的一口气在天元正下方，也就是 E4。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 49 && board.grid[40] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '白棋最后的一口气在 E4，下在那里就能提掉它。',
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
          options: ['好位置，应该下这里', '白棋的气', '禁入点，不能落子'],
          answer: 2,
          explanation: '它就是禁入点：下过去会“自杀”。除非你这一步能提掉对方，否则不能在那里落子。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 4,5 5,4 5,6 6,5',
          highlights: [{ i: 40, style: 'forbidden' }],
          objective: '现在轮到你执黑。<b>红色 ✕</b> 标出的 E5 就是禁入点。请避开它，下在其他任意合法的空点。',
          hint: '先点一下红色 ✕ 的 E5 试试，看看程序会怎么说；然后换一个合法的位置落子。',
          check: ({ lastMove }) => {
            if (lastMove === null) return { done: false };
            return {
              done: true,
              successMsg: '正确！你避开了禁入点。刚才如果你点 E5，程序会拒绝你——因为那里是“禁入点”。'
            };
          }
        },
        {
          type: 'visual',
          setup: 'W 5,5 5,7 4,6 6,6 B 5,4 4,5 6,5',
          highlights: [{ i: 41, style: 'forbidden' }],
          text: '但禁入点有一个<b>重要的例外</b>！<br>看这个画面：中间这个空点 F5 被 <b>4 颗白子围住</b>（红 ✕ 处）——和第 1 节那个禁入点<b>一模一样</b>，黑棋直接下这里会 0 气。<br><b>但注意左边那颗白子 E5</b>：它被黑棋打吃，只剩 F5 这一口气了。黑棋下在 F5，能直接把它提掉！<br><b>规则规定：只要这一步能提掉对方的棋子，就可以下！</b>这个“能提子就能下”的例外，以后吃子、扑都会用到。<br><b>⚠️ 但有一个特殊情况</b>：如果提回会造成“打劫”（双方反复提同一颗子），那就<b>不能立刻下</b>——这条特殊规则我们到第 6 课再学。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,5 5,7 4,6 6,6 B 5,4 4,5 6,5',
          highlights: [{ i: 41, style: 'forbidden' }],
          objective: '现在轮到你执黑。请大胆下在 <b>F5</b>（红 ✕ 处）——它看着像禁入点，但能提掉被打吃的白子 E5！',
          hint: '点 F5：黑子落下后，白子 E5 最后的气被堵死、被提走，黑子反而有了气。',
          check: ({ lastMove }) => {
            const done = lastMove === 41;
            return {
              done,
              hint: done ? null : '请下在 F5——红 ✕ 处。黑子落下能提掉白子 E5，所以这是合法的！',
              successMsg: done ? '漂亮！你下了看似“禁入点”的 F5，但它提掉了白子 E5，所以完全合法！这就是禁入点的例外：<b>能提掉对方，就能下</b>。' : null
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
            { board: 'B 5,4 5,5 5,6', text: '黑棋下在中间 E5，三颗子连成<b>一个整体</b>、共享所有气——这就是<b>“连接”</b>。连接让棋更难被吃。', mark: 40, highlightLibs: 40, duration: 1900 },
            { board: 'B 5,4 5,6', text: '可要是黑棋偷懒不及时连接，白棋就会抓住机会……', highlightLibs: [39, 41], duration: 1400 },
            { board: 'B 5,4 5,6 W 5,5', text: '白棋落在中间 E5，把黑棋<b>“切断”</b>成两块——每颗黑子各自的气（绿圈）都<b>变少、变弱</b>了，这就是<b>“切断”</b>。', mark: 40, highlightLibs: [39, 41], duration: 2200 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 5,4 5,5 5,6',
          highlightLibertiesOf: 40,
          question: '看画面：这三颗黑子连成了什么？以下说法正确的是？',
          options: ['棋子越分散越好', '连在一起的棋子会共享气，更安全', '连接没有任何好处'],
          answer: 1,
          explanation: '画面上的三颗黑子连成一个整体、共享所有的气，所以更难被吃——这就是连接的价值。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 5,4 5,6 W 6,5',
          objective: '黑棋的两颗子被白棋隔开了。请下在中间的空点 E5，把它们连接起来。',
          hint: '两颗黑子中间的空点是 E5。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const done = board.groupOf(40).length >= 3;
            return {
              done,
              hint: done ? null : '请下在中间的空点 E5，把两颗黑子连起来。',
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
            { board: 'B 1,2 2,1 3,2 2,3 1,9 W 1,3 3,3 2,4', text: '黑棋下在 C8，把白棋 B8 提掉了！现在黑子只剩 <b>1 口气</b>（绿圈处）。', mark: 11, highlightLibs: 11, duration: 2400 },
            { board: 'B 1,2 2,1 3,2 2,3 1,9 W 1,3 3,3 2,4 2,9', text: '白棋这一手<b>能提掉</b>黑子（第 4 课学过“能提子就能下”）——但这里有个例外：黑棋刚提走一颗白子，白棋若立刻在原位 B8 提回，会回到刚才的局面、造成无限循环。<br>所以<b>打劫规则</b>：<b>不能立刻在原位提回</b>，必须先在别处落一手。这里白棋下 J8，正好打吃右上角黑子；这种能逼对方回应的别处手，后面会专门学习“劫材”。', mark: 17, highlightLibs: 8, duration: 2800 },
            { board: 'B 1,2 2,1 3,2 2,3 1,9 1,8 W 1,3 3,3 2,4 2,9', text: '黑棋<b>应劫</b>——在 H9 救回右上角的黑子，打劫限制随之解除。', mark: 7, duration: 2300 },
            { board: 'B 1,2 2,1 3,2 1,9 1,8 W 2,2 1,3 3,3 2,4 2,9', text: '白棋回到原位 B8，把黑棋提回！', mark: 10, duration: 1800 },
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
          objective: '现在黑棋可以提掉一颗白子。请下在 C8，完成提子。',
          hint: '提子点在 C8，落子后白棋 B8 那颗子就会被提掉。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 11 && board.grid[10] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '请下在 C8，把白棋 B8 那颗子提掉。',
              successMsg: done ? '你提掉了白子！注意看：C8 的黑子现在只有一口气，白方在 B8 明明“能提回”——但这是<b>打劫</b>，不允许立刻提回（要先找劫材）。' : null
            };
          }
        },
        {
          type: 'move',
          playerColor: GO.WHITE,
          setup: 'B 1,2 2,1 3,2 2,3 W 1,3 3,3 2,4',
          ko: 10,
          objective: '现在轮到你执白。请先试试下在 B8 原位提回——程序会告诉你这是“打劫”，不允许立刻下。然后在别处落一手，解除“立刻提回”的限制。',
          hint: '试试直接点 B8，看程序的提示；然后选一个别的位置落子。真正能逼对方应的“劫材”会在第 36 课学习。',
          check: ({ lastMove }) => {
            if (lastMove !== null) return { done: true, successMsg: '很好！你先在别处落了一手，打劫的“不能立刻提回”限制已经解除。之后再回来提，才是合法顺序。' };
            return { done: false };
          }
        }
      ]
    },
    // ============ 第 7 课：眼与活棋 ============
    {
      id: 7,
      title: '眼与活棋',
      intro: '“眼”是棋块内部被己方围住的空点。一块棋做出两只彼此独立的真眼，对方就无法把它的气全部填完，这块棋就活了。',
      steps: [
        {
          type: 'visual',
          setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 3,8 4,3 4,4 4,5 4,6 4,7 4,8',
          highlights: [{ i: 21, style: 'liberty', label: '眼' }, { i: 24, style: 'liberty', label: '眼' }],
          text: '“眼”是棋块内部被己方围住的空点。只有一只眼时，对方先紧完外面的气，最后仍可下进眼里并提掉整块棋；因此<b>一只眼还不够</b>。<br>看画面：这块黑棋围出了<b>两只彼此独立的眼</b>（绿色标记处）。白棋不可能同时填掉两只眼，所以它是<b>“活棋”</b>。'
        },
        {
          type: 'quiz',
          setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 3,8 4,3 4,4 4,5 4,6 4,7 4,8',
          highlights: [{ i: 21, style: 'liberty', label: '眼' }, { i: 24, style: 'liberty', label: '眼' }],
          question: '看画面：黑棋有两只眼，它会怎样？',
          options: ['只要外面的气被填完，两只眼会一起消失', '它已经做出两只独立的真眼，是活棋', '有一只眼就一定活了'],
          answer: 1,
          explanation: '只有一只眼时，对方可以先紧外气，再落入眼里提子；但两只独立的真眼不能被同时填掉，所以这块黑棋已经活了。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 4,3 4,4 4,5 4,6 4,7 4,8',
          objective: '黑棋现在只有一只眼，很危险。请下在 H7，做出第二只眼，让黑棋变成活棋。',
          hint: '把黑子下在 H7，让右下那个空点被黑棋完全围住，形成第二只眼。',
          check: ({ board }) => {
            const eyes = board.eyePoints(GO.BLACK).length;
            const done = eyes >= 2;
            return {
              done,
              hint: done ? null : '目前黑棋只有 1 只眼。请下在 H7，做出第二只眼。',
              successMsg: done ? '太棒了！黑棋现在做出两只独立的眼，成为了活棋。' : null
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
          question: '学了这么多，来回顾一下：下围棋的最终目标是什么？',
          options: ['吃掉对方所有的棋子', '围出比对方更大的地盘', '把棋子尽量下满棋盘'],
          answer: 1,
          explanation: '围棋的目标是“占地”。吃子只是手段，围地才是目的——就像刚才看到的，围住更多空点的人获胜。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,5 6,6',
          highlights: [{ i: 30 }, { i: 31 }, { i: 39 }, { i: 40 }],
          question: '看画面：黑棋围住的空点（绿圈处）有什么用？',
          options: ['空点没有用', '空点会给对方加分', '空点是自己的地盘，越多越好'],
          answer: 2,
          explanation: '画面里被绿圈标出的 4 个空点都是黑棋的地盘，是决定胜负的关键。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,6',
          objective: '黑棋用棋子围了三面墙，只差最后一块石头。请下在 E4，把缺口堵上，围住里面的地盘。',
          hint: '缺口在底边中央 E4，把黑子下在那里就能围住 4 个空点。',
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
              hint: done ? null : '缺口在底边中央 E4，把黑子下在那里才能把地盘围住。',
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
          options: ['先下别处，等会儿再说', '赶紧逃跑或连接', '直接认输'],
          answer: 1,
          explanation: '画面里黑子只剩绿圈那一口气，非常危险，必须立刻逃跑或连接，否则下一手就会被提掉。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 5,5 W 4,5 5,4 6,5',
          objective: '天元上的黑子被白棋打吃了！请立刻下在 F5 逃跑，给它续上气。',
          hint: '快下在 F5！黑子连出去后就有新的气了。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const done = board.groupOf(40).length >= 2;
            return {
              done,
              hint: done ? null : '快下在 F5 逃命！',
              successMsg: done ? '好样的！黑子逃出了打吃，现在有了更多的气，暂时安全了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 10 课：固定残局数地 ============
    {
      id: 10,
      title: '终局与数地 · 固定残局',
      intro: '不用下一整盘，直接面对已经清完死子的终局：先自己数一遍，再用选择题核对答案。',
      steps: [
        {
          type: 'visual',
          setup: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 7,9 8,4 8,5 8,6 8,7 8,9 9,7 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 6,2 6,4 7,2 8,1 8,3 9,2 9,3 9,4 9,5 9,6',
          text: '这是一盘已经结束、并且清完死子的真实 9 路终局。现在不用落子，先自己数：<br>① 黑棋有多少颗盘上活子，围住多少个空点？<br>② 白棋有多少颗盘上活子，围住多少个空点？<br>③ 双方分别把“活子数 + 围住的空点数”相加，最后白棋再加 <b>7.5 目贴目</b>。<br><b>先在心里或纸上写下黑白总分和胜负，再进入选择题。</b>'
        },
        {
          type: 'quiz',
          setup: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 7,9 8,4 8,5 8,6 8,7 8,9 9,7 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 6,2 6,4 7,2 8,1 8,3 9,2 9,3 9,4 9,5 9,6',
          question: '你数完了吗？这盘棋按中国式面积计分，最后结果是哪一个？',
          options: ['黑棋胜 5 目，因为黑棋盘面多 5 点', '白棋胜 2.5 目：黑 43，白 38 + 7.5 = 45.5', '双方和棋'],
          answer: 1,
          explanation: '答案：<b>白棋胜 2.5 目。</b><br>黑棋：25 颗活子 + 18 个空点 = 43。<br>白棋：19 颗活子 + 19 个空点 = 38，再加 7.5 目贴目，得到 45.5。<br>所以 45.5 − 43 = 2.5。黑棋虽然盘面多 5 点，但白棋加上贴目后反超；判断胜负不能只看哪一方棋子更多。'
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
            { board: 'W 5,5 B 5,6 6,5 4,4 4,3 4,5', text: '黑棋下在 E6，<b>打吃</b>！白棋只剩左边 D5 一口气。', mark: 31, highlightLibs: 40, duration: 1900 },
            { board: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5', text: '白棋逃到 D5。但黑棋像“下楼梯”一样继续追……', mark: 39, duration: 1400 },
            { board: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5 6,4', text: '黑棋再打吃 D4——白棋又只剩一口气！', mark: 48, highlightLibs: 39, duration: 1700 },
            { board: 'W 5,5 5,4 5,3 B 5,6 6,5 4,4 4,3 4,5 6,4', text: '白棋再逃 C5。只要没有“接应”，白棋就只能一路往边线跑。', mark: 38, duration: 1400 },
            { board: 'W 5,5 5,4 5,3 B 5,6 6,5 4,4 4,3 4,5 6,4 6,3', text: '黑棋再打吃 C4……就这样一路追到边线，白棋<b>永远逃不掉</b>——这就是<b>“征子”</b>！', mark: 47, highlightLibs: 38, duration: 2400 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 5,5 B 5,6 6,5 4,4 4,3 4,5',
          highlightLibertiesOf: 40,
          question: '看画面：白棋被打吃、只剩 1 口气。它一直往边线逃，最后会怎样？',
          options: ['总能找到地方跑掉', '一路被黑棋打吃追到边线，逃不掉', '白棋一定能反吃黑棋'],
          answer: 1,
          explanation: '征子就是“每手都打吃”的追杀：白棋每逃一步都被黑棋追上打吃，像下楼梯一样被逼到边线，最终被吃掉——除非中途有白棋的“接应”破坏征子。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,5 B 5,6 6,5 4,4 4,3',
          objective: '现在轮到你执黑。请下在 E6，<b>打吃</b>白棋，让白棋只剩一口气——征子就这样开始了。',
          hint: '白棋的上方是 E6，下在那里白棋就只剩 D5 一口气了。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 31 && board.liberties(40).length === 1;
            return {
              done,
              hint: done ? null : '请下在 E6，堵住白棋上方的气。',
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
          setup: 'W 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4',
          highlights: [{ i: 36 }, { i: 38 }],
          text: '看画面：白棋贴着左边线，只剩 <b>两条出路</b>（绿色标记 A5 和 C5）。黑棋已在周围布好一张<b>“网”</b>——注意它不急着打吃。<br>白棋往 A5 跑，黑棋下 C5 一步把它提掉；往 C5 跑，黑棋下 A5 一步提掉。<b>怎么跑都跑不掉</b>——这种<b>“一网罩住”</b>的吃法，就叫<b>“枷吃”</b>。'
        },
        {
          type: 'quiz',
          setup: 'W 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4',
          highlights: [{ i: 36 }, { i: 38 }],
          question: '看画面：黑棋布好网罩住白棋、不让它逃跑，这种吃法叫什么？',
          options: ['征子（追杀）', '打劫', '枷吃（网住）'],
          answer: 2,
          explanation: '画面里黑棋像网一样把白棋罩住：白棋往 A5 跑，黑下 C5 提；往 C5 跑，黑下 A5 提——有气却跑不出去，这就是“枷吃”（网住）。征子是“追”，枷是“罩”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,2 5,1 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4',
          objective: '白棋忍不住往 <b>A5</b> 逃了一步（贴边）。现在轮到你执黑：下在 <b>C5</b>，把逃跑的白棋<b>一步提掉</b>。',
          hint: '白棋逃跑后只剩 C5 这最后一口气，下在那里就能提掉它。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 38 && board.grid[37] === GO.EMPTY && board.grid[36] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '请下在 C5——白棋往 A5 逃后，只剩这最后一口气。',
              successMsg: done ? '漂亮！白棋往边上逃，你下 C5 一步把两子全提——这就是枷吃的厉害：网已布好，怎么逃都是死。' : null
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
          text: '看画面：两颗白子各被三颗黑子围住，而它们<strong>共用同一个气口</strong>——中间的 <b>E6</b>（绿色标记处）。<br>黑棋只要下在 E6，两颗白子就会<b>同时被打吃</b>——这就是<b>“双叫吃”</b>。白棋一次只能救一颗，另一颗必死。'
        },
        {
          type: 'quiz',
          setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6',
          highlights: [{ i: 31 }],
          question: '看画面：黑棋下在 E6，会发生什么？',
          options: ['只能打吃一颗白子', '两颗白子同时被打吃（双叫吃）', '黑棋会输'],
          answer: 1,
          explanation: 'E6 是两颗白子共用的气口，黑棋下在那里，两颗白子同时只剩 1 口气——白棋救得了一颗，救不了另一颗。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6',
          objective: '现在轮到你执黑。请下在 <b>E6</b>，同时打吃两颗白子（双叫吃）。',
          hint: '两颗白子中间的气口就是 E6。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 31 && board.liberties(30).length === 1 && board.liberties(32).length === 1;
            return {
              done,
              hint: done ? null : '请下在 E6——那是两颗白子共用的气口。',
              successMsg: done ? '完美！这就是双叫吃：一手棋同时打吃两块棋，白棋只能救其中一块。' : null
            };
          }
        }
      ]
    },
    // ============ 第 14 课：扑（倒扑） ============
    {
      id: 14,
      title: '吃子技巧④ · 扑与倒扑',
      intro: '“扑”是故意送一子给对方提；若对方提后整块棋反而只剩一口气、你能回提吃掉它，这个完整手法叫“倒扑”。关键顺序是<b>扑 → 对方提 → 回提</b>。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7', text: '看画面：白棋两块被黑棋团团围住，各自只剩 G9、G8 两个气口——白棋已经逃不掉了。<br>黑棋想吃白，有两种下法：直接下 G8 收气，或者用妙手<b>“扑”</b>。哪种吃得更多？', highlights: [{ i: 6 }, { i: 15 }], duration: 2600 },
            { board: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,7 1,9 2,9 3,9 4,8 3,7', text: '黑棋把一颗子<b>“扑”</b>进 G9——这是白棋两块之间的连接点，<b>送一子</b>给白棋。这颗黑子只剩 G8 一口气，白棋必须提它。', mark: 6, duration: 2400 },
            { board: 'W 1,6 2,6 2,7 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7', text: '白棋只好在 G8 提掉黑子。但一提子，两块白棋连成整块，反而只剩 G9 一口气——<b>“接不归”</b>了！', mark: 15, duration: 2800 },
            { board: 'W 1,6 2,6 2,7 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,7 1,9 2,9 3,9 4,8 3,7', text: '黑棋再下 G9！这里四周全是白棋（红圈处），看起来像“禁入点”？——还记得第 4 课吗？<b>能提掉对方，就能下</b>！黑子一落，白棋整块 <b>7 颗子全被提走</b>，黑子立刻重获气。<b>送 1 子、吃 7 子！</b><br>⚠️ 这和打劫<b>不一样</b>：打劫是回提<b>同一颗单子</b>（1 换 1，无限循环）；这里黑棋吃的是白棋<b>一整块 7 颗</b>，白棋被吃光、没法再提回黑子，<b>一次性结束</b>——所以不是打劫，完全合法！', mark: 6, highlights: [{ i: 5, style: 'capture' }, { i: 7, style: 'capture' }, { i: 15, style: 'capture' }], flash: [5, 14, 23, 7, 16, 25, 15], flashMs: 2000, duration: 3600 },
            { board: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 2,7 1,9 2,9 3,9 4,8 3,7', text: '对比一下：如果黑棋<b>不扑</b>、直接下 G8 收气——白棋只剩 G9 一个禁入点（红 ✕），黑棋再下 G9 只能吃 <b>6 颗子</b>。<br>而扑 G9 让白棋被迫提子、整块连起来，黑棋一次吃掉 <b>7 颗子</b>——<b>送子换吃大块</b>，这就是“扑”（倒扑）！', mark: 15, highlights: [{ i: 6, style: 'forbidden' }], duration: 3600 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7',
          highlights: [{ i: 6 }, { i: 15 }],
          question: '看画面：白棋两块各剩 G9、G8 两个气口。黑棋想吃得最多，应该下在哪里？',
          options: ['G8——直接收气，但只能吃 6 子', '随便下，都只能吃 3 子', 'G9——扑进连接点送一子，白棋提子后接不归，黑棋回提整块 7 子'],
          answer: 2,
          explanation: '黑棋下 G9 扑入连接点：白棋提掉黑子（下 G8）后，两块白棋连成整块、只剩 G9 一口气，黑棋再下 G9 就能回提整块 7 子（禁入点例外：能提子就能下）。这不是打劫——黑棋吃的是白棋一整块（1 换 7），不是回提同一颗子，白棋被吃光后没法再提回，一次性结束。这就是“扑”（倒扑）——送一子、吃大块。直接下 G8 收气只能吃 6 子。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7',
          objective: '现在轮到你执黑。请下在 <b>G9</b>（两块白棋之间的连接点），把黑子“扑”进去，送一子给白棋。',
          hint: '两块白棋之间的连接点在 G9。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 6;
            return {
              done,
              hint: done ? null : '请下在 G9——两块白棋之间的连接点。',
              successMsg: done ? '好！你扑入 G9，送了一颗子。白棋提掉它后整块就“接不归”了（只剩 G9 一口气），黑棋再下 G9 就能回提整块 7 子。注意这不是打劫——黑棋吃的是白棋一整块（1 换 7），不是回提同一颗子，一次性结束。这就是“扑”（倒扑）：送一子、吃大块！' : null
            };
          }
        },
        {
          type: 'move',
          playerColor: GO.WHITE,
          setup: 'W 1,6 2,6 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,7 1,9 2,9 3,9 4,8 3,7',
          objective: '第二步，换你执白。黑棋刚扑在 G9，只剩 G8 一口气。请在 <b>G8</b> 提掉这颗黑子，看看白棋会发生什么。',
          hint: '黑棋 G9 唯一的气在 G8；下在 G8 就能提掉它。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 15 && board.grid[6] === GO.EMPTY && board.liberties(15).length === 1;
            return {
              done,
              hint: done ? null : '请下在 G8，提掉 G9 的黑子。',
              successMsg: done ? '白棋提掉了黑子，却把原本两块棋连成一块，而且整块只剩 <b>G9</b> 一口气。这就是“接不归”：看似连上，实际上逃不掉。' : null
            };
          }
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 1,6 2,6 2,7 3,6 1,8 2,8 3,8 B 1,5 2,5 3,5 4,6 1,9 2,9 3,9 4,8 3,7',
          objective: '第三步，轮到你执黑。白棋整块只剩 G9 一口气。请回到 <b>G9</b>，一次提掉整块白棋。',
          hint: '虽然 G9 四周都是白棋，但这一手会提掉白棋整块，所以不是禁入点。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 6 && board.grid.filter(v => v === GO.WHITE).length === 0;
            return {
              done,
              hint: done ? null : '请下在 G9，提掉只剩一口气的白棋整块。',
              successMsg: done ? '漂亮！你完成了完整倒扑：<b>扑入送子 → 白棋提子接不归 → 黑棋回提整块</b>。这不是打劫，因为白棋整块被提掉后不能立刻再提回。' : null
            };
          }
        },
        {
          type: 'text',
          content: '<b>名称要分清：</b>先送进去的那一手叫“扑”；<b>扑 → 对方提 → 回提吃整块</b>的完整结果叫“倒扑”。<br>判断时问：<b>对方提掉扑子后，自己会不会只剩一口气？</b>若会，再确认回提能吃掉整块。回提点看似像禁入点也不用怕：<b>能提掉对方就能下</b>。<br><b>和打劫的区别</b>：打劫会立刻回到原局面；倒扑回提的是整块棋，一次性结束。'
        }
      ]
    },
    // ============ 第 15 课：真眼与假眼 ============
    {
      id: 15,
      title: '死活基础① · 真眼与假眼',
      intro: '“眼”也有真假。判断时不只看上下左右，还要检查围眼的棋是否真正连成一块、有没有断点，以及对手能否落入眼位并提掉支撑子。能被这样破掉的是假眼。',
      steps: [
        {
          type: 'visual',
          setup: 'B 4,4 4,5 4,6 5,4 5,6 6,4 6,5 6,6',
          highlights: [{ i: 40, label: '真眼' }],
          text: '<b>真眼</b>：看画面，中间这个空点（绿色标记处）的<b>上下左右都被黑棋连在一起</b>，白棋一颗都填不进来（是禁入点），这个眼是<b>牢靠的“真眼”</b>。'
        },
        {
          type: 'visual',
          setup: 'B 4,4 4,5 4,6 5,4 5,6 6,5 W 6,4 6,6 7,5',
          highlights: [{ i: 40, label: '假眼' }],
          highlightLibertiesOf: 49,
          text: '<b>假眼</b>：中间 E5 看起来被黑棋围住，但下面的黑子 <b>E4</b> 已被三颗白棋包围，只剩 E5 一口气（绿圈）。<br>白棋能下在 E5，顺手提掉 E4；这个“眼”立刻被白棋占住，所以是假眼。'
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 4,4 4,5 4,6 5,4 5,6 6,5 W 6,4 6,6 7,5', text: '上方五颗黑子已经连成一整块；再看支撑这只眼的黑子 E4，它只剩 E5 一口气。只要它被提掉，E5 就不再是黑棋的眼。', highlightLibs: 49, duration: 2400 },
            { board: 'B 4,4 4,5 4,6 5,4 5,6 W 5,5 6,4 6,6 7,5', text: '白棋下在 E5，提掉孤立的黑子 E4。现在白棋占住了原来的“眼”，黑棋没有做成两眼。<b>有可被吃掉的支撑子，就是假眼。</b>', mark: 40, flash: 49, flashMs: 900, duration: 2800 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 4,4 4,5 4,6 5,4 5,6 6,5 W 6,4 6,6 7,5',
          highlights: [{ i: 40, label: '假眼' }],
          question: '看画面：中间这个眼，为什么是“假眼”？',
          options: ['因为白棋不能下进去', '白棋能下在 E5，提掉只剩一口气的黑子 E4', '因为黑棋围得太多了'],
          answer: 1,
          explanation: 'E4 的唯一气就是 E5。白棋落在 E5 会先提掉 E4，自己又站在 E5 上，所以这个空点不能算黑棋的真眼。'
        },
        {
          type: 'move',
          playerColor: GO.WHITE,
          setup: 'B 4,4 4,5 4,6 5,4 5,6 6,5 W 6,4 6,6 7,5',
          objective: '现在轮到你执白。请下在 <b>E5</b>，提掉支撑假眼的黑子 E4，亲手把假眼填破。',
          hint: '黑子 E4 只剩 E5 一口气；下在 E5 会提掉它。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 40 && board.grid[49] === GO.EMPTY && board.grid[40] === GO.WHITE;
            return {
              done,
              hint: done ? null : '请下在 E5，提掉只剩一口气的黑子 E4。',
              successMsg: done ? '很好！你亲手填破了假眼。以后看到“眼”时，先检查附近有没有一颗被打吃的支撑子。' : null
            };
          }
        },
        {
          type: 'text',
          content: '<b>真眼检查口诀</b>：先看眼位，再看围眼的棋是否连结、是否有断点或已被打吃。本题是最直接的一种假眼；实战中还要检查斜角和外围棋形。做活时，先补断点、先救支撑子，再谈做眼。'
        }
      ]
    },
    // ============ 第 16 课：大眼死活 ============
    {
      id: 16,
      title: '死活基础② · 大眼形状',
      intro: '“大眼”是围出的多个空点。空点多不等于一定活，关键要看：<b>一手棋能不能把这块空分成两个彼此独立的眼？</b>直四可以，刀五则必须先抢急所。',
      steps: [
        {
          type: 'visual',
          setup: 'B 2,2 2,3 2,4 2,5 2,6 2,7 3,2 3,7 4,2 4,3 4,4 4,5 4,6 4,7',
          highlights: [{ i: 20 }, { i: 21 }, { i: 22 }, { i: 23 }],
          text: '<b>直四（本图中是活棋）</b>：黑棋围住四个连成一线的空点（绿色标记处）。在这块棋的外面已安定、没有劫等特殊条件时，白棋先占其中一点后，剩下的空间仍能分成两处，黑棋能保留两只眼。<br>所以“封闭直四”通常不用再补；实战先确认外围没有断点或劫。'
        },
        {
          type: 'visual',
          setup: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8',
          highlights: [{ i: 30 }, { i: 31 }, { i: 32, label: '急所 F6' }, { i: 33 }, { i: 41 }],
          text: '<b>刀五（本图中需要补）</b>：黑棋围出五个空点，形状像一把“刀”。中间的 <b>F6</b> 是急所：黑棋先下这里，能把空间分成两眼；白棋先下这里，黑棋的眼位就被压成一团。<br>所以不能只按空点数判断死活；先找急所，再确认外围条件。'
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8', text: '刀五的五个空点里，F6 是唯一的急所。先抢这里，才有机会把大眼切成两部分。', highlights: [{ i: 32, label: '急所' }], duration: 2200 },
            { board: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,6 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8', text: '黑棋先下 F6 后，剩下的两个空点各自被黑棋围住，形成两只眼。黑棋活了。', highlights: [{ i: 33, label: '眼 1' }, { i: 41, label: '眼 2' }], mark: 32, duration: 2600 },
            { board: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8 W 4,6', text: '如果白棋先抢到 F6，黑棋就不能再把空点分成两眼。<b>急所必须抢先。</b>', mark: 32, duration: 2500 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 2,2 2,3 2,4 2,5 2,6 2,7 3,2 3,7 4,2 4,3 4,4 4,5 4,6 4,7',
          highlights: [{ i: 20 }, { i: 21 }, { i: 22 }, { i: 23 }],
          question: '看画面：黑棋围出四个连成一线的空点（直四），这个形状是活棋吗？',
          options: ['不是，一定会死', '是，这个完整的直四已经活了', '要看运气'],
          answer: 1,
          explanation: '直四有四个空点，白棋点进去任何一个，黑棋都能在另一边做出两只眼——所以直四天生就是活棋。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8',
          highlights: [{ i: 32, label: '急所 F6' }],
          question: '刀五为什么要抢 F6 这个急所？',
          options: ['因为 F6 离棋盘中央最近', '五个空点本来就一定活，不需要下', '黑棋先下 F6，能把大眼分成两只眼'],
          answer: 2,
          explanation: '刀五的关键不在“有五个空点”，而在能否抢到 F6。黑棋先下这里，剩余空间分成两眼；白棋先抢，这个大眼就会被破坏。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 3,4 3,5 3,6 3,7 3,8 4,3 4,8 5,3 5,4 5,5 5,7 5,8 6,3 6,4 6,5 6,6 6,7 6,8',
          objective: '现在轮到你执黑。这块“刀五”要被补一手才能活。请下在 <b>F6</b>（刀五的急所），把大眼分成两只眼。',
          hint: '刀五的急所在 F6，也就是四个空点中间那个。',
          check: ({ board, lastMove }) => {
            const eyes = board.eyePoints(GO.BLACK);
            const done = lastMove === 32 && eyes.includes(33) && eyes.includes(41);
            return {
              done,
              hint: done ? null : '请下在 F6——刀五形状的急所。',
              successMsg: done ? '正确！你抢到 F6 后，G6 和 F5 成了两只独立的眼。你不是在背坐标，而是在把一个大眼分成两眼。' : null
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
          text: '<b>“金角银边草肚皮”</b>：看画面，星位标出的角部（C7、G7、C3、G3）靠着<b>两条边</b>，围地最省棋子、最划算；边上（如 G7 所在的上边）只有<b>一条边</b>可用，次之；中央天元 E5 四面受敌，围地最费棋子。<br>所以布局的顺序是：<b>先占角 → 再占边 → 最后才下中央</b>。'
        },
        {
          type: 'quiz',
          setup: '',
          question: '围棋谚语“金角银边草肚皮”告诉我们，下棋时应该先下在哪里？',
          options: ['先下天元（中央）', '先占角（角部最划算）', '随便下哪里都一样'],
          answer: 1,
          explanation: '角部靠着两条边，围地最省棋子；中央四面受敌最不划算。所以布局要先占角，这就是“金角”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: '',
          objective: '现在轮到你执黑。请把第一颗黑子下在左上角的星位 <b>C7</b>，先“占角”。',
          hint: '左上角的星位是 C7——那里有个星位标记点。',
          check: ({ lastMove }) => ({
            done: lastMove === 20,
            hint: lastMove === 20 ? null : '请下在左上角的 C7。',
            successMsg: '很好！你占了角——围棋谚语说“金角”，角是最值得先下的地方。'
          })
        }
      ]
    },
    // ============ 第 18 课：布局入门 · 拆边 ============
    {
      id: 18,
      title: '布局入门② · 星位与拆边',
      intro: '占角后可以沿边发展，但距离和方向要看对手的位置。本课先练习一个没有对手干扰时的常见拆边点。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,3 3,7',
          text: '看画面：黑棋先占左上角星位 C7，又沿上边<b>“拆边”</b>到 G7。这两子展开得很大，能影响上边，但中间仍有空隙，<b>还不是牢固连接，也还不是确定地盘</b>。<br>布局时可以用“占角 → 向边上展开”作为思考起点，同时要注意对方的打入和分断。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3',
          question: '黑棋占了左上角星位 C7。为了沿上边发展、扩充地盘，黑棋下一步最好下在哪里？',
          options: ['E5：下到中央', 'G7：沿边展开，与 C7 呼应', 'A9：紧贴角落'],
          answer: 1,
          explanation: 'G7 能与 C7 呼应、向上边展开。但它们相隔较远，目前只是势力范围，不是牢固连接，也不能直接当成地盘。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3',
          objective: '现在轮到你执黑。请沿上边<b>“拆边”</b>，下在 <b>G7</b>，把上边的地盘扩展开。',
          hint: '沿上边向右，隔 3 个点的地方是 G7。',
          check: ({ lastMove }) => ({
            done: lastMove === 24,
            hint: lastMove === 24 ? null : '请沿上边拆边到 G7。',
            successMsg: '很好！你学会了向边上展开。这一手扩大了黑棋的势力范围，但后续还要根据白棋的打入决定如何应对。'
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
          text: '第 5 课学过“怎样连接”；现在多问一步：<b>哪块棋最弱，哪里最急？</b><br>看画面：黑棋有两块棋被白棋隔开，中间 <b>E7</b>（绿色标记处）是断点。白棋若抢到这里，黑棋会分成两块；在这个局部没有更急战斗时，E7 就是该优先处理的弱点。'
        },
        {
          type: 'quiz',
          setup: 'B 3,3 3,4 3,6 3,7 W 4,4 4,6',
          highlights: [{ i: 22 }],
          question: '看画面：黑棋的两块棋中间有个断点（绿圈处），黑棋应该怎么办？',
          options: ['下到别处去，不管它', '主动把断点让给白棋', '先下在 E7 把两块连起来'],
          answer: 2,
          explanation: '被切断的棋会变弱。黑棋要先抢占断点 E7，把两块棋连成一块厚棋——中盘时“连接”常常是最大的要点。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 3,4 3,6 3,7 W 4,4 4,6',
          objective: '局部练习：本题没有更急的战斗，请下在 <b>E7</b>，优先处理黑棋的断点。',
          hint: '两块黑棋之间的断点就是 E7。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            const done = board.groupOf(22).length >= 5;
            return {
              done,
              hint: done ? null : '请下在 E7，把两块黑棋连起来。',
              successMsg: done ? '漂亮！你连接了两块黑棋，变成了一块厚棋——白棋再想切断就难了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 20 课：真实对局① · 从布局到中盘 ============
    {
      id: 20,
      title: '真实对局① · 从布局到中盘',
      intro: '前19课学的是一个个知识点；这一课第一次跟随一盘<b>真实9路职业棋手示例棋</b>，只观察它怎样从布局自然进入中盘战斗。形势判断、收官和最终胜负留到后面的第39、40课。',
      steps: [
        {
          type: 'text',
          content: '<b>棋谱来源：</b><a href="https://media-iframe.britgo.org/intro/intro3.html" target="_blank" rel="noopener">英国围棋协会公开的9路职业棋手示例棋</a>。<br><br>本课只回答两个问题：<br>① 布局时，双方怎样用少量棋子确定发展方向？<br>② 黑白棋接触后，为什么必须先处理弱棋和切断？<br><br>暂时不要急着数地或判断最终胜负。'
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 5,5 W ', text: '<b>布局·第1手：</b>黑棋先下天元 E5。9路棋盘很小，中央对四周影响很大。', mark: 40, duration: 1800 },
            { board: 'B 5,5 W 5,3', text: '<b>第2手：</b>白棋下 C5，准备经营左上方。', mark: 38, duration: 1200 },
            { board: 'B 5,5 5,7 W 5,3', text: '<b>第3手：</b>黑棋下 G5，与中央黑棋呼应，影响右侧。', mark: 42, duration: 1200 },
            { board: 'B 5,5 5,7 W 3,4 5,3', text: '<b>第4手：</b>白棋下 D7，左上两颗白棋形成呼应。', mark: 21, duration: 1200 },
            { board: 'B 5,5 5,7 6,3 W 3,4 5,3', text: '<b>第5手：</b>黑棋转到 C4，希望限制白棋向下扩张。布局已经为后面的接触战定下方向。', mark: 47, duration: 1500 },
            { board: 'B 5,5 5,7 6,3 W 3,4 5,3 6,2', text: '<b>第6手：</b>白棋贴在 B4，直接压缩黑 C4 的气。9路棋盘只走几手就可能进入接触。', mark: 46, duration: 1600 },
            { board: 'B 5,5 5,7 6,3 7,3 W 3,4 5,3 6,2', text: '<b>布局·第7手：</b>黑棋长到 C3，使 C4 这块棋从两口气增加到四口气。布局的方向开始转化为具体的强弱问题。', mark: 56, duration: 2200 }
          ]
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2', text: '<b>中盘·第14手：</b>同一盘棋快进到第14手。双方已在上下两处接触，白棋下 D4 向黑棋下方阵地挤入。', mark: 48, duration: 2100 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2', text: '<b>第15手：</b>黑棋挡在 D3，试图守住右下方。', mark: 57, duration: 1200 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5', text: '<b>第16手：</b>白棋下 E3，切断黑棋！下方三颗黑子只剩两口气。棋局已经进入中盘，必须先处理弱棋。', mark: 58, highlightLibs: 57, duration: 2400 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 8,5 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5', text: '<b>第17手：</b>黑棋下 E2，一边帮助弱棋逃命，一边把白 E3 打吃。', mark: 67, highlightLibs: 58, duration: 1700 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 8,5 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5 7,6', text: '<b>第18手：</b>白棋逃到 F3，保持切断。', mark: 59, duration: 1200 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 8,5 8,6 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5 7,6', text: '<b>第19手：</b>黑棋再下 F2，又一次威胁白棋。', mark: 68, duration: 1200 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 8,5 8,6 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5 7,6 7,7', text: '<b>第20手：</b>白棋逃到 G3。双方都在一边进攻、一边处理自己的弱棋。', mark: 60, duration: 1300 },
            { board: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 8,2 8,5 8,6 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5 7,6 7,7', text: '<b>中盘·第21手：</b>黑棋下 B2，让下方黑棋稳定下来，同时把三颗白棋困住。接下来全局焦点是：这些白子能否做活，或能否弃掉换取别处利益。', mark: 64, duration: 2600 }
          ]
        },
        {
          type: 'visual',
          setup: 'B 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5',
          text: '<b>中盘·第39手：</b>第22—39手发生了弃子与提子交换。白棋牺牲右下方棋子，换到破坏黑棋下边潜力和取得先手。<br><br>这一课先停在这里：交换后究竟谁更有利、白棋下一步该去哪里，将在第39课专门学习；第40手以后的收官与最终胜负放到第40课。'
        },
        {
          type: 'quiz',
          setup: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5',
          highlights: [{ i: 67, label: 'E2' }],
          question: '白16切断后，下方三颗黑棋变弱。黑棋现在最重要的任务是什么？',
          options: ['去远处抢一个空点', '先处理弱棋，并寻找带攻击性的逃法', '立即开始数地'],
          answer: 1,
          explanation: '进入中盘后先看强弱。实战黑17下 E2，既帮助下方黑棋长气，又把白 E3 打吃，一手兼顾防守和进攻。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5',
          objective: '复现实战第17手：请下在 <b>E2</b>，一边帮助下方黑棋逃命，一边打吃白 E3。',
          hint: '下在 E2 后，白 E3 将只剩 F3 一口气。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 67 && board.grid[58] === GO.WHITE &&
              board.liberties(58).length === 1 && board.liberties(58)[0] === 59;
            return {
              done,
              hint: done ? null : '请下在 E2：既给下方黑棋长气，也把白 E3 打吃。',
              successMsg: done ? '正确！这就是从布局进入中盘后思考重点的变化：先处理弱棋，并尽量一手兼顾攻防。' : null
            };
          }
        },
        {
          type: 'text',
          content: '<b>第20课只记住两件事：</b><br>布局时，用少量棋子确定发展方向；<br>黑白棋接触并出现切断、弱棋后，就进入中盘，先处理强弱再谈围地。<br><br>这盘棋暂时停在第39手。第39课会接着判断交换后的优劣，第40课再完成收官和终局计分。'
        }
      ]
    },
    // ============ 第 21 课：虎口与关门吃 ============
    {
      id: 21,
      title: '吃子技巧⑤ · 虎口与关门吃',
      intro: '“虎口”是棋子围出的狭窄缺口；在本课图形里，对方下进去会只剩一口气。“关门吃”是堵住对方唯一的逃路并提子。',
      steps: [
        {
          type: 'visual',
          setup: 'B 4,4 4,6 5,5',
          highlights: [{ i: 31, label: '虎口' }],
          text: '<b>虎口</b>：看画面，三颗黑子像“品”字围出中间这个空点（绿色标记处）。<br>白棋如果下进去，它的上下左右有 <b>3 颗黑子</b>，只剩 <b>1 口气</b>——黑棋随时能把它提掉。这个点就是<b>“虎口”</b>，对白棋很危险。'
        },
        {
          type: 'quiz',
          setup: 'B 4,4 4,6 5,5',
          highlights: [{ i: 31 }],
          question: '白棋下进“虎口”（绿圈处）后会发生什么？',
          options: ['立刻只剩一口气，随时被黑棋提掉', '变得非常安全', '可以立刻吃掉黑棋'],
          answer: 0,
          explanation: '虎口是三颗黑子围出的缺口，白棋下进去上下左右被黑子包围，只剩一口气，黑棋下一手就能提掉它——所以虎口是危险点。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 4,4 B 3,4 4,3 4,5',
          objective: '现在轮到你执黑。白棋 D6 的上下左三面都被黑棋围住，只剩 <b>D5</b> 一个出口（门口）。请下在 <b>D5</b>“关门”，把它提掉——这就是<b>关门吃</b>。',
          hint: '白棋唯一的气在 D5，下在那里“关门”提子。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 39 && board.grid[30] === GO.EMPTY;
            return {
              done,
              hint: done ? null : '请下在 D5，堵住白棋唯一的出口。',
              successMsg: done ? '好！你“关门”了——白棋三个方向都被黑棋围住，唯一的门口被堵上，整颗白子被提掉。这就是关门吃：把对方逼到只剩一口气，再堵上门口。' : null
            };
          }
        }
      ]
    },
    // ============ 第 22 课：抱吃（吃子方向） ============
    {
      id: 22,
      title: '吃子技巧⑥ · 抱吃（吃子方向）',
      intro: '“抱吃”的关键是方向：把对方往<b>自己棋子多的一边</b>赶，让它逃到哪都被抱住；往空旷方向赶，对方就跑了。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 3,4 4,3 3,5 5,5 W 4,4', text: '看画面：白棋 D6 有两条路可逃——<b>D5</b>（下）和 <b>E6</b>（右上）。黑棋该从哪个方向“抱吃”它？', highlightLibs: 30, duration: 2200 },
            { board: 'B 3,4 4,3 3,5 5,5 5,4 W 4,4', text: '黑棋下 <b>D5</b>，把白棋往右上赶！白棋只剩 <b>E6</b> 一个方向。', mark: 39, duration: 1800 },
            { board: 'B 3,4 4,3 3,5 5,5 5,4 W 4,4 4,5', text: '白棋逃到 E6——但它的出口 <b>E7</b> 和 <b>E5</b> 早已是黑子，白棋只剩 <b>F6</b> 一口气！<br>黑棋下一手就能提掉它——这就是<b>“抱吃”</b>：往己方方向赶，对方逃到哪都被抱住。', mark: 31, highlightLibs: 31, duration: 3000 },
            { board: 'B 3,4 4,3 3,5 5,5 4,5 W 4,4', text: '<b>对比</b>：如果黑棋下 <b>E6</b>——也是打吃，但<b>方向错了</b>！这等于把白棋往空旷的下方赶。', mark: 31, duration: 2400 },
            { board: 'B 3,4 4,3 3,5 5,5 4,5 W 4,4 5,4', text: '白棋往 <b>D5</b> 一逃——前方空空荡荡，还有 C5、D4 两口气（绿圈），黑棋再也抱不住它了。<br>所以抱吃一定要看清方向：<b>往己方棋子多的一边赶</b>！', mark: 39, highlightLibs: 39, duration: 3000 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 3,4 4,3 3,5 5,5 W 4,4',
          question: '黑棋想“抱吃”白棋 D6，应该下在哪里？',
          options: ['D5：往己方方向赶，白逃 E6 后被抱住', 'E6：白能从 D5 跑掉', '随便下，白棋必死'],
          answer: 0,
          explanation: '黑棋下 D5，把白棋往己方棋子多的一边（右上）赶；白棋逃到 E6 后，出口被黑 E7、E5 堵住，只剩一口气，下一手被提。这就是抱吃——吃子方向很关键！'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,4 4,3 3,5 5,5 W 4,4',
          objective: '现在轮到你执黑。请下在 <b>D5</b>，从正确的方向“抱吃”白棋（把它往己方棋子多的一边赶）。',
          hint: '往下方赶：下 D5，让白棋只能逃向己方棋子已堵住的 E6 方向。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 39;
            return {
              done,
              hint: done ? null : '请下在 D5——把白棋往右上己方棋子多的一边赶。',
              successMsg: done ? '正确！你选择了正确的吃子方向：把白棋往己方棋子多的一边赶，白棋逃到 E6 后只剩一口气，下一手就能提掉——这就是“抱吃”。' : null
            };
          }
        }
      ]
    },
    // ============ 第 23 课：接不归 ============
    {
      id: 23,
      title: '吃子技巧⑦ · 接不归',
      intro: '“接不归”：把一颗子下在对方想连接的“断点”上，对方提掉它后，反而整块只剩一口气（连不回去），被一口吃掉。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 4,8 4,9 6,8 6,9 7,8 B 3,8 3,9 4,7 5,7 7,9 7,7 8,8 6,7', text: '看画面：白棋有两块棋——上方 H6、J6 和下方 L 形的 H4、J4、H3，被黑棋团团围住，各自只剩 <b>J5、H5</b> 两个气口——它们<b>想连成一块</b>。', highlights: [{ i: 44 }, { i: 43 }], duration: 2600 },
            { board: 'W 4,8 4,9 6,8 6,9 7,8 B 3,8 3,9 4,7 5,9 5,7 7,9 7,7 8,8 6,7', text: '黑棋把一颗子<b>“扑”</b>进连接点 <b>J5</b>！这颗黑子只剩 H5 一口气，白棋必须提它。', mark: 44, duration: 2200 },
            { board: 'W 4,8 4,9 5,8 6,8 6,9 7,8 B 3,8 3,9 4,7 5,7 7,9 7,7 8,8 6,7', text: '白棋只好在 H5 提掉黑子。一提子，上下两块白棋连成整块，反而只剩 <b>J5 一口气</b>——<b>“接不归”</b>了！黑棋再下 J5 就能吃掉整块。', mark: 43, duration: 2800 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 4,8 4,9 6,8 6,9 7,8 B 3,8 3,9 4,7 5,7 7,9 7,7 8,8 6,7',
          highlights: [{ i: 44 }, { i: 43 }],
          question: '看画面：白棋两块想连接，黑棋应该下在哪里？',
          options: ['J5：扑入连接点，白提子后接不归', 'H5：扑这里黑子有 2 口气，白不必提，不是接不归', '黑棋吃不到白棋'],
          answer: 0,
          explanation: '黑棋下 J5 扑入两块白棋之间的连接点：这颗黑子只剩 H5 一口气，白棋只能提掉它；一提子两块连成整块反而只剩一口气（接不归），黑棋再下 J5 就一口吃掉。这就是“接不归”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 4,8 4,9 6,8 6,9 7,8 B 3,8 3,9 4,7 5,7 7,9 7,7 8,8 6,7',
          objective: '现在轮到你执黑。请下在 <b>J5</b>（两块白棋之间的连接点），制造“接不归”。',
          hint: '两块白棋之间的连接点在 J5。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 44;
            return {
              done,
              hint: done ? null : '请下在 J5——两块白棋之间的连接点。',
              successMsg: done ? '好！你扑入了连接点 J5。白棋只能提掉它，一提子上下两块白棋连成整块、反而只剩 J5 一口气（接不归），黑棋再下 J5 就能吃掉整块——这就是“接不归”！' : null
            };
          }
        }
      ]
    },
    // ============ 第 24 课：打二还一 ============
    {
      id: 24,
      title: '吃子技巧⑧ · 打二还一',
      intro: '“打二还一”：对方一口气提掉你<b>两颗</b>子（打二），你可以<b>立刻回提</b>他一颗子（还一）——这不是打劫！因为不是“一换一”的循环。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 3,3 3,4 2,2 4,2 3,1 B 2,3 2,4 4,3 4,4 3,5', text: '看画面：白棋 C7、D7 两颗子只剩 <b>B7</b> 一口气（绿圈处）——被黑棋<b>“打二”</b>了，黑棋下一手就能提掉它们。', highlightLibs: 20, duration: 2600 },
            { board: 'W 2,2 4,2 3,1 B 2,3 2,4 4,3 4,4 3,5 3,2', text: '黑棋下 B7，一口气提掉白棋<b>两颗子</b>——这就是“打二”。', mark: 19, flash: [20, 21], flashMs: 1600, duration: 2200 },
            { board: 'W 2,2 4,2 3,1 3,3 B 2,3 2,4 4,3 4,4 3,5', text: '轮到白棋。<b>注意</b>：黑棋刚提的是<b>两颗</b>子，不是一颗——所以白棋可以<b>立刻回提</b>！白棋下 C7，提掉黑棋 B7 这一颗子，这叫<b>“还一”</b>。<br>这不是打劫——打劫是“1 换 1”的无限循环；这里是“2 换 1”，一手就结束了。', mark: 20, flash: [19], flashMs: 1600, duration: 3200 },
            { board: 'W 2,2 4,2 3,1 3,3 B 2,3 2,4 4,3 4,4 3,5', text: '黑棋能马上再下 B7 提回来吗？<b>不能</b>——白棋 C7 还有 D7 这口气，黑棋下 B7 是禁入点（红 ✕）。<br>所以“打二还一”到此为止：黑提两子、白回提一子，<b>一手结束，不会循环</b>。', highlights: [{ i: 19, style: 'forbidden' }], duration: 3200 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 3,3 3,4 2,2 4,2 3,1 B 2,3 2,4 4,3 4,4 3,5',
          question: '黑棋下 B7 提掉白棋两颗子（打二）后，白棋能立刻回提吗？',
          options: ['能——黑提的是两颗子，不是“1 换 1”的打劫', '不能——必须先隔一手', '永远不能下回那里'],
          answer: 0,
          explanation: '打二还一：黑棋一次提掉白棋两颗子，白棋立刻回提黑棋一颗子（还一）是合法的。因为这不是“1 换 1”的打劫循环——白棋回提后，黑棋反而不能再下回去（禁入点），一手就结束了。'
        },
        {
          type: 'quiz',
          setup: 'W 2,2 4,2 3,1 3,3 B 2,3 2,4 4,3 4,4 3,5',
          highlights: [{ i: 19, style: 'forbidden' }],
          question: '白棋“还一”提回一颗子后（看画面），黑棋能立刻下回 B7（红 ✕ 处）把白棋 C7 再提掉吗？',
          options: ['不能——B7 是禁入点，下进去自己没气；打二还一一手就结束了', '能——马上再提回来', '可以，只要隔一手就能下回去'],
          answer: 0,
          explanation: '白棋“还一”后，B7 对黑棋是禁入点（下进去自己没有气）——所以打二还一一手结束、不会循环，黑棋别“随手”再下回去。实战提醒：对方“送子”给你提时（扑、打二还一），先数清提完之后双方的气，再决定动不动手。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 3,3 3,4 2,2 4,2 3,1 B 2,3 2,4 4,3 4,4 3,5',
          objective: '现在轮到你执黑。白棋 C7、D7 两颗子只剩一口气了——请下在 <b>B7</b>，一口气提掉这两颗白子（打二）。',
          hint: '白棋两颗子共用的最后一口气在 B7。',
          check: ({ board, lastMove }) => {
            const b = board;
            // 阶段二完成：白棋最后下在 (3,3) 回提，黑 (3,2) 已被提掉 —— “还一”
            if (lastMove === 20 && b.grid[20] === GO.WHITE && b.grid[19] === GO.EMPTY) {
              return {
                done: true,
                successMsg: '完美！你完成了完整的<b>“打二还一”</b>：一口气提掉两颗白子（打二），又立刻回提黑棋一颗子（还一）。这不是打劫——不是“1 换 1”的循环；还完之后黑棋不能再下回 B7（禁入点），一手就结束了。'
              };
            }
            // 阶段一完成：黑棋已下 (3,2) 打二提两子 → 切换到白棋“还一”
            if (lastMove === 19 && b.grid[20] === GO.EMPTY && b.grid[21] === GO.EMPTY) {
              return {
                done: false,
                nextPlayer: GO.WHITE,
                objective: '现在轮到你执白。请下在 <b>C7</b>，提掉黑棋 B7 这一颗子——这就是“<b>还一</b>”！',
                hint: '白棋下在 C7，正好提掉黑棋 B7 那一颗子。'
              };
            }
            // 已打二、等待白棋回提（可能下错了点）
            if (b.grid[19] === GO.BLACK && b.grid[20] === GO.EMPTY) {
              return { done: false, hint: '现在轮到你执白“还一”！请下在 C7，提掉黑棋 B7 这颗子。' };
            }
            return { done: false, hint: '请下在 B7——那是两颗白子共用的最后一口气。' };
          }
        }
      ]
    },
    // ============ 第 25 课：征子的方向与引征 ============
    {
      id: 25,
      title: '吃子技巧⑨ · 征子的方向与引征',
      intro: '征子能不能成功，要看逃跑路线上有没有对方的“引征”棋子——有引征，征子就会失败；没有引征，才能放心起征。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'W 5,5 7,2 B 5,6 6,5 4,4 4,3', text: '看画面：白棋 E5 被黑棋夹住。注意左下那颗白子 <b>B3</b>——它正好在白棋征子逃跑的路线上，这就是<b>“引征”</b>（金色圆环标记）！有引征，征子会失败。', highlights: [{ i: 55, style: 'mark', label: '引征' }], duration: 2400 },
            { board: 'W 5,5 7,2 B 5,6 6,5 4,4 4,3 4,5', text: '黑棋下 E6 打吃白棋，白棋只剩 D5 一口气。', mark: 31, highlightLibs: 40, duration: 1700 },
            { board: 'W 5,5 5,4 7,2 B 5,6 6,5 4,4 4,3 4,5', text: '白棋逃到 D5。黑棋继续“下楼梯”打吃……', mark: 39, duration: 1300 },
            { board: 'W 5,5 5,4 7,2 B 5,6 6,5 4,4 4,3 4,5 5,3', text: '黑棋从左侧 C5 再打吃，白棋只剩 D4 一口气。', mark: 38, highlightLibs: 39, duration: 1600 },
            { board: 'W 5,5 5,4 6,4 7,2 B 5,6 6,5 4,4 4,3 4,5 5,3', text: '白棋逃到 D4。', mark: 48, duration: 1200 },
            { board: 'W 5,5 5,4 6,4 7,2 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4', text: '黑棋 D3 继续打吃，白棋只剩 C4 一口气。', mark: 57, duration: 1400 },
            { board: 'W 5,5 5,4 6,4 6,3 7,2 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4', text: '白棋逃到 C4——离引征子越来越近了……', mark: 47, duration: 1200 },
            { board: 'W 5,5 5,4 6,4 6,3 7,2 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4 6,2', text: '黑棋 B4 再打吃，白棋只剩 C3 一口气——但下一步……', mark: 46, highlightLibs: 47, duration: 1700 },
            { board: 'W 5,5 5,4 6,4 6,3 7,3 7,2 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4 6,2', text: '白棋逃到 <b>C3</b>——看！它和引征子 <b>B3</b> 连上了！白棋气一下子变多（绿圈），黑棋再也征不动。<br>所以：<b>征子前要看清逃跑路线上有没有对方的引征子</b>，有就征不动。', mark: 56, highlightLibs: 56, duration: 3000 },
            { board: 'W 5,5 5,4 6,4 6,3 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4 6,2', text: '<b>对比</b>：如果把引征子拿掉，回到黑棋 B4 打吃的局面——白棋还是只剩 <b>C3</b> 一口气（绿圈），只能继续逃。', highlightLibs: 47, duration: 2400 },
            { board: 'W 5,5 5,4 6,4 6,3 7,3 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4 6,2', text: '白棋逃到 <b>C3</b>——这次周围空空如也，<b>没有引征子可连</b>！整块白棋依然只剩 C2 一口气（绿圈）。', mark: 56, highlightLibs: 56, duration: 2400 },
            { board: 'W 5,5 5,4 6,4 6,3 7,3 B 5,6 6,5 4,4 4,3 4,5 5,3 7,4 6,2 8,3', text: '黑棋 <b>C2</b> 继续打吃，白棋接着逃 B3……就这样一路“下楼梯”追到边线，白棋最终逃不掉。<br>结论：<b>没有引征，放心征；有引征，千万别征！</b>', mark: 65, highlightLibs: 56, duration: 3000 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 5,5 7,2 B 5,6 6,5 4,4 4,3 4,5',
          highlights: [{ i: 55, style: 'mark', label: '引征' }],
          question: '白棋在征子逃跑路线上有颗引征子 B3，黑棋能征死白棋吗？',
          options: ['不能，白棋一路逃下去会连上 B3，气变多，征子失败', '能，引征不影响征子', '征子永远成功'],
          answer: 0,
          explanation: '引征：白棋逃跑路线上有己方棋子。白棋一路逃到 C3 就与引征子 B3 连上，气变多，黑棋无法继续打吃，征子失败。所以征子前要先看清有没有引征。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 5,5 B 5,6 6,5 4,4 4,3',
          objective: '现在轮到你执黑。这条逃跑路线上没有引征，可以放心起征。请下在 <b>E6</b>，打吃白棋，让白棋只剩一口气——征子开始了。',
          hint: '白棋的上方是 E6，下在那里白棋就只剩 D5 一口气。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 31 && board.liberties(40).length === 1;
            return {
              done,
              hint: done ? null : '请下在 E6，堵住白棋上方的气，起征。',
              successMsg: done ? '正确！你起征了。这条征子路线没有引征，白棋一路逃下去都会被黑棋打吃，最终被追到角部吃掉。' : null
            };
          }
        }
      ]
    },
    // ============ 第 26 课：边线吃棋 ============
    {
      id: 26,
      title: '吃子技巧⑩ · 边线吃棋',
      intro: '边线就像一堵“墙”：一线棋子最多 3 口气、角上只有 2 口气。学会把对方往这堵墙上“赶”，吃子就轻松多了。',
      steps: [
        {
          type: 'visual',
          setup: 'B 1,1 1,5 5,5',
          highlights: [
            { i: 1, label: '1' }, { i: 9, label: '2' },
            { i: 3, label: '1' }, { i: 5, label: '2' }, { i: 13, label: '3' },
            { i: 31, label: '1' }, { i: 39, label: '2' }, { i: 41, label: '3' }, { i: 49, label: '4' }
          ],
          text: '看画面：同样一颗棋，<b>位置不同、气就不同</b>（绿圈数出了每颗子的气）。<br>· 角上的 A9：只有 <b>2 口气</b>——两条边把它挡住了；<br>· 边线上的 E9：只有 <b>3 口气</b>；<br>· 中央的 E5：有 <b>4 口气</b>。<br><b>边线就是一堵墙</b>：棋子越靠边，气越少、越容易被吃。'
        },
        {
          type: 'demo',
          frames: [
            { board: 'W 2,2 B 2,1 3,2 1,1', text: '看画面：白棋 B8 在二线，左边 A8 和下面 B7 都被黑棋堵住，只剩 <b>C8 往中腹</b>、<b>B9 往边线</b> 两条出路（绿圈）。', highlightLibs: 10, duration: 2800 },
            { board: 'W 2,2 B 2,1 3,2 1,1 2,3', text: '黑棋下 <b>C8</b>，先把往中腹的门关上——白棋只剩 B9 一口气，被打吃了！这就是<b>“赶”</b>：不急着提，先把对方逼向边线。', mark: 11, highlightLibs: 10, duration: 2600 },
            { board: 'W 2,2 1,2 B 2,1 3,2 1,1 2,3', text: '白棋只好往一线逃，下 B9。可一线是棋盘的尽头——两颗白子加在一起，也只剩 <b>C9</b> 一口气（绿圈）！', mark: 1, highlightLibs: 1, duration: 2600 },
            { board: 'B 2,1 3,2 1,1 2,3 1,3', text: '黑棋下 <b>C9</b>，提掉两颗白子！<br>记住这个套路：<b>关门 → 赶上边线 → 提子</b>。边线那堵“墙”帮你省了追赶的手数。', mark: 2, flash: [1, 10], flashMs: 1600, duration: 2800 }
          ]
        },
        {
          type: 'quiz',
          setup: 'W 2,2 1,2 B 2,1 3,2 1,1 2,3',
          highlightLibertiesOf: 1,
          question: '看画面：白棋被赶上了一线，为什么再也跑不掉了？',
          options: ['一线是棋盘尽头，贴边的棋气最少，黑棋下一手 C9 就能提', '边线上的棋子不能移动', '白棋两颗子加在一起气反而变多了'],
          answer: 0,
          explanation: '边线是一堵“墙”：一线棋子最多 3 口气。白棋被赶上边线后，往棋盘外的方向根本不存在，可逃的路骤减——所以“把对方赶向边线”是吃子的好办法。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 2,2 B 2,1 3,2 1,1',
          objective: '轮到你执黑。白棋 B8 只剩 C8、B9 两条出路。请下在 <b>C8</b>，关上它往中腹的门——把它<b>赶向边线</b>！',
          hint: '下在 C8，白棋往中腹的路就被关上了。',
          check: ({ board, lastMove }) => {
            const b = board;
            // 阶段三完成：黑棋下 (1,3)，提掉 (2,2)(1,2) 两颗白子
            if (lastMove === 2 && b.grid[10] === GO.EMPTY && b.grid[1] === GO.EMPTY) {
              return {
                done: true,
                successMsg: '漂亮！这就是完整的<b>“边线吃棋”</b>：<b>关门 C8 → 白棋被赶上一线 → 提子 C9</b>。边线像一堵墙，被赶上去的棋气最少、插翅难逃。以后看到对方的棋靠近边线，就试着把它往墙上“赶”！'
              };
            }
            // 阶段二完成：白棋下 (1,2) 逃上一线 → 切换黑棋提子
            if (lastMove === 1 && b.grid[1] === GO.WHITE && b.grid[11] === GO.BLACK) {
              return {
                done: false,
                nextPlayer: GO.BLACK,
                objective: '白棋逃上了一线——但边线是墙！两颗白子只剩 <b>C9</b> 一口气。轮到你执黑，下 <b>C9</b> 把它们提掉。',
                hint: '白棋最后一口气在 C9。'
              };
            }
            // 阶段一完成：黑棋下 (2,3) 关门 → 切换白棋逃跑
            if (lastMove === 11 && b.grid[11] === GO.BLACK && b.grid[10] === GO.WHITE && b.grid[1] === GO.EMPTY) {
              return {
                done: false,
                nextPlayer: GO.WHITE,
                objective: '门关上了，白棋只剩边线一条路。现在轮到你执白——下 <b>B9</b> 往一线逃，试试看能不能逃掉。',
                hint: '白棋唯一的气在 B9。'
              };
            }
            // 下错了点：按当前局面给出提示
            if (b.grid[1] === GO.WHITE && b.grid[11] === GO.BLACK) {
              return { done: false, hint: '白棋只剩 C9 一口气了，执黑下在 C9 提掉它。' };
            }
            if (b.grid[11] === GO.BLACK && b.grid[10] === GO.WHITE) {
              return { done: false, hint: '轮到白棋逃跑：请下在 B9，那是白棋唯一的气。' };
            }
            return { done: false, hint: '请下在 C8——关上白棋往中腹的门，把它赶向边线。' };
          }
        }
      ]
    },
    // ============ 第 27 课：长气与紧气 ============
    {
      id: 27,
      title: '对杀入门① · 长气与紧气',
      intro: '“气”是棋子的生命。自己棋快被吃时，下在它旁边多长一口气叫“长气”；下在对方气上叫“紧气”。谁的气多、谁会先紧气，谁就占便宜。',
      steps: [
        {
          type: 'visual',
          setup: 'B 4,4 4,5 W 3,4 3,5 5,4 5,5',
          highlightLibertiesOf: 30,
          text: '看画面：黑棋 D6、E6 被白棋上下夹住，只剩 <b>C6、F6</b> 两个方向的出口（绿圈标出）——气很紧，白棋下一步就要“紧气”<b>打吃</b>它了（2 气变 1 气）。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 4,4 4,5 W 3,4 3,5 5,4 5,5',
          objective: '现在轮到你执黑。你的黑棋只剩 2 口气。请下在 <b>C6</b> 或 <b>F6</b>“长气”（两边都行），把黑棋的气从 2 个变多。',
          hint: '下在 C6 或 F6，让黑棋多一个方向的气。',
          check: ({ board, lastMove }) => {
            const done = (lastMove === 29 || lastMove === 32) && board.liberties(30).length >= 3;
            return {
              done,
              hint: done ? null : '请下在 C6 或 F6 长气，黑棋的气会变多。',
              successMsg: done ? '好！你“长气”了：黑棋从 2 口气变成 4 口气，白棋没那么容易吃掉它了。这就是长气——让自己的棋多一口气。' : null
            };
          }
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 4,4 4,5 B 3,4 3,5 5,4 5,5 3,6 5,6',
          objective: '这一次轮到你进攻。白棋 D6、E6 只剩 <b>C6、F6</b> 两口气。请下在 <b>C6</b>“紧气”打吃它——注意方向：白棋往 F6 逃也没用，那边有黑棋 F7、F5 守着。',
          hint: '下在 C6——下在对方的气上，就是“紧气”。',
          check: ({ board, lastMove }) => {
            const b = board;
            // 阶段三完成：黑棋下 (4,7)，提掉三颗白子 —— 长气救己、紧气杀敌
            if (lastMove === 33 && b.grid[30] === GO.EMPTY) {
              return {
                done: true,
                successMsg: '漂亮！这就是<b>“紧气”</b>杀敌：下在对方的气上，一手一手把气收紧。你先看准方向下 C6，白棋逃 F6 还是只剩一口气，再紧一手 G6 就提掉三颗子。<b>长气救己、紧气杀敌</b>——对杀就是比谁的账算得清！'
              };
            }
            // 阶段二完成：白棋下 (4,6) 逃 → 切换黑棋再紧一手
            if (lastMove === 32 && b.grid[32] === GO.WHITE && b.grid[29] === GO.BLACK && b.grid[30] === GO.WHITE) {
              return {
                done: false,
                nextPlayer: GO.BLACK,
                objective: '白棋逃到了 F6——但 F7、F5 有黑棋守着，它还是只剩 <b>G6</b> 一口气！轮到你执黑，下 <b>G6</b> 再紧一手，提掉白棋。',
                hint: '白棋最后一口气在 G6。'
              };
            }
            // 阶段一完成：黑棋下 (4,3) 紧气打吃 → 切换白棋逃跑
            if (lastMove === 29 && b.grid[29] === GO.BLACK && b.grid[30] === GO.WHITE && b.grid[32] === GO.EMPTY) {
              return {
                done: false,
                nextPlayer: GO.WHITE,
                objective: '白棋被你打吃了，只剩 F6 一口气。现在轮到你执白——下 <b>F6</b> 长气逃跑，试试看能不能跑掉。',
                hint: '白棋唯一的气在 F6。'
              };
            }
            // 下错了点：按当前局面给出提示
            if (b.grid[30] === GO.EMPTY) {
              return { done: false, hint: '白棋已经被提掉了。点“重玩本步”再来一次：先下 C6 紧气，白棋逃 F6，再下 G6 提子。' };
            }
            if (b.grid[32] === GO.BLACK) {
              return { done: false, hint: '方向反了！下 F6 也是紧气，但白棋往 C6 一逃就海阔天空了。点“重玩本步”，改从下 C6 紧气——那一头白棋的逃路被 F7、F5 堵死了。' };
            }
            if (b.grid[32] === GO.WHITE && b.grid[29] === GO.BLACK) {
              return { done: false, hint: '白棋只剩 G6 一口气了，执黑下在 G6 提掉它。' };
            }
            if (b.grid[29] === GO.BLACK) {
              return { done: false, hint: '轮到白棋逃跑：请下在 F6，那是白棋唯一的气。' };
            }
            return { done: false, hint: '请下在 C6——下在白棋的气上紧气，这个方向白棋逃不掉。' };
          }
        }
      ]
    },
    // ============ 第 28 课：对杀① 分辨对象与数气 ============
    {
      id: 28,
      title: '对杀入门② · 分辨对象与数气',
      intro: '“对杀”是两块相互接触、又都没有安全逃路的棋互相紧气，比谁先吃谁。判断前先分清哪两块棋在对杀，再数它们的气。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
          highlights: [{ i: 30, label: '白气' }, { i: 40, label: '白气' }, { i: 33, label: '黑气' }, { i: 41, label: '黑气' }],
          text: '看中间相互紧贴的两颗子：白棋 E6 和黑棋 F6 都被外围棋子封住，往外长也不会增加气，所以它们是真正的对杀对象。<br>白 E6 有 <b>D6、E5</b> 两口气；黑 F6 有 <b>G6、F5</b> 两口气。外围其他棋子只是封锁逃路，不要把它们的气算进来。'
        },
        {
          type: 'quiz',
          setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
          highlights: [{ i: 30 }, { i: 40 }, { i: 33 }, { i: 41 }],
          question: '只数中间对杀的白 E6 和黑 F6：它们各有几口气？',
          options: ['白 3 气、黑 2 气', '白 2 气、黑 2 气', '白 4 气、黑 4 气'],
          answer: 1,
          explanation: '白 E6 的气是 D6、E5；黑 F6 的气是 G6、F5。双方都只有 2 气，而且没有能增加气的逃路。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
          highlights: [{ i: 30, label: '白气' }, { i: 40, label: '白气' }],
          objective: '现在轮到黑棋。不看坐标，直接在棋盘上点白棋 E6 的任意一口气（绿圈），把它从 2 气紧到 1 气。',
          hint: '找中间白子 E6，它的两口气已用绿圈标出。',
          check: ({ board, lastMove }) => {
            const done = (lastMove === 30 || lastMove === 40) && board.liberties(31).length === 1;
            return {
              done,
              hint: done ? null : '要紧气，必须下在白 E6 相邻的绿圈空点上。',
              successMsg: done ? '正确！白 E6 现在只剩 1 口气，被打吃了。' : null
            };
          }
        }
      ]
    },
    // ============ 第 29 课：对杀② 同气先走者胜 ============
    {
      id: 29,
      title: '对杀入门③ · 同气对杀先走者胜',
      intro: '在没有共气、没有眼，也没有可以长气逃走的简单对杀中，双方气一样多时，先紧气的一方能先吃掉对手。这个结论有明确前提，不能套用到所有对杀。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
          highlights: [{ i: 30, label: '1' }, { i: 33, label: '2' }, { i: 40, label: '3' }],
          text: '还是上一课的封闭对杀：白 E6 和黑 F6 各 2 气，没有共气和眼。<br>黑先下 D6 紧白棋；白棋若在 G6 反过来紧黑棋，黑棋再下 E5，会比白棋早一手提子。这次不只点第一手，要把完整顺序走完。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
          objective: '完成同气对杀的三手读棋：黑先下 <b>D6</b> 紧白，然后按棋盘提示分别帮白、黑走完后续，直到黑棋提掉白 E6。',
          hint: '第一手黑 D6；白棋会在 G6 反紧；黑棋再到 E5 提子。',
          check: ({ board, lastMove }) => {
            if (lastMove === 30 && board.grid[31] === GO.WHITE && board.grid[33] === GO.EMPTY) {
              return { done: false, nextPlayer: GO.WHITE, objective: '现在换白棋反紧：请下在 <b>G6</b>，把黑 F6 紧到一口气。', hint: '白棋下 G6，紧黑 F6 的气。' };
            }
            if (lastMove === 33 && board.grid[31] === GO.WHITE) {
              return { done: false, nextPlayer: GO.BLACK, objective: '白棋已经反紧。轮到黑棋：请下在 <b>E5</b>，先一手提掉白 E6。', hint: '白 E6 的最后一口气在 E5。' };
            }
            const done = lastMove === 40 && board.grid[31] === GO.EMPTY;
            return { done, hint: done ? null : '按顺序读棋：黑 D6 → 白 G6 → 黑 E5。', successMsg: done ? '完整读对了！在这个没有共气、没有眼、不能长气的对杀里，同气时先走的黑棋早一手提子。' : null };
          }
        }
      ]
    },
    // ============ 第 30 课：对杀③ 有眼杀无眼 ============
    {
      id: 30,
      title: '对杀入门④ · 有眼杀无眼',
      intro: '在对杀中，眼位也是气，但对方不能在外气还没填完时直接下入。所以当双方外气相同时，有眼方通常多一个关键手数；复杂棋形仍要另算共气、大眼和劫。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 1,2 2,1 2,2 3,1 3,2 W 4,1 4,2', text: '看画面：黑棋的外气是 C9、C8、C7，另外还有眼位 A9；白棋的外气是 A5、B5、C6。<br>双方各有 3 口外气，但黑棋还多一只眼，所以在手数上占优。', highlights: [{ i: 0, label: '眼' }], duration: 2600 },
            { board: 'B 1,2 2,1 2,2 3,1 3,2 W 4,1 4,2', text: '现在白棋不能直接下进 A9，因为黑棋还有外气，白子落下后既没气也提不掉黑棋。<br><b>注意：这不是说眼永远不能填。</b>如果黑棋的外气全被紧完，白棋下入 A9 能提掉整块黑棋，就会变成合法。', highlights: [{ i: 0, style: 'forbidden' }], duration: 3200 },
            { board: 'B 1,2 2,1 2,2 3,1 3,2 4,3 W 4,1 4,2', text: '黑棋先下 C6，把白棋的外气从 3 口紧到 2 口。在这道外气相同的基础题里，黑棋的眼位多提供了一个手数，因而黑棋能先吃白棋。', mark: 29, duration: 2600 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 1,2 2,1 2,2 3,1 3,2 W 4,1 4,2',
          highlights: [{ i: 0, style: 'forbidden' }],
          question: '在这道封闭对杀题里，黑棋为什么占优？',
          options: ['因为黑棋的棋子数比白棋多', '因为有眼的棋块永远不可能被吃', '双方外气同为 3，黑棋还多一个暂时不能被填的眼位'],
          answer: 2,
          explanation: '这道题中双方外气相同，黑棋的眼位又多提供一个手数。白棋只能在黑棋外气被全部紧完后才下入眼位提子，不是“永远不能填眼”。'
        }
      ]
    },
    // ============ 第 31 课：好形与愚形 ============
    {
      id: 31,
      title: '棋形① · 好形与愚形',
      intro: '棋子要下得“高效”。跳、飞、长常常能让棋形舒展；空三角通常会让棋子拥挤。但“好形、愚形”都要结合气、断点和当前战斗判断，不是看到形状就自动对或错。',
      steps: [
        {
          type: 'visual',
          setup: 'B 4,4 4,6',
          text: '看画面：黑棋两颗子隔着一个空点 <b>“跳”</b>——棋形开阔、效率较高。<br>但“跳”不是牢固连接：对方靠近时，中间可能成为断点。它是布局中常见的高效形状，不代表任何局面都能“随时连上”。'
        },
        {
          type: 'visual',
          setup: 'B 4,4 4,5 5,4',
          highlights: [{ i: 40 }],
          text: '再看画面：黑棋三颗子围出一个<b>“空三角”</b>（愚形三角）——三颗子挤在一起，通常没有充分扩展作用，所以效率偏低。<br>实战中若为了提子、做眼或强行连接，空三角也可能是正确的。先看功能，再评价形状。'
        },
        {
          type: 'quiz',
          setup: 'B 4,4 4,6',
          question: '下面哪种棋形是“好形”（舒展、高效）？',
          options: ['两颗子隔空“跳”，棋形开阔', '三颗子挤成“空三角”，互相堵塞', '四颗子全挤在一个小角落'],
          answer: 0,
          explanation: '在没有迫切战斗的布局里，跳、飞等舒展棋形通常更高效；空三角通常效率较低。这是判断起点，不是没有例外的规则。'
        }
      ]
    },
    // ============ 第 32 课：手筋① 扳 ============
    {
      id: 32,
      title: '手筋① · 扳（二子头必扳）',
      intro: '“扳”是借助己方棋子，从斜角绕到对方棋形头上的着法。“二子头必扳”是提醒你优先检查扳头，不是不管全局都必须下的命令。',
      steps: [
        {
          type: 'visual',
          setup: 'W 3,4 3,5 B 4,4 4,5',
          text: '看画面：白棋两颗子 D7、E7 并排，黑棋在下面。<br>白棋的“头”（棋形向上的出口）在 <b>D8、E8</b>。黑棋应该抢先把白棋的头扳住，不让它往上发展。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 3,4 3,5 B 4,4 4,5',
          objective: '本题中黑棋没有断点可补。请下在 <b>D8</b>，扳住白棋二子头的左侧。',
          hint: '白棋二子头的上方是 D8、E8，下在 D8 扳头。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 12;
            return {
              done,
              hint: done ? null : '请下在 D8，扳住白棋的头。',
              successMsg: done ? '好！在这个局部里，扳头压低了白棋。记住：口诀用来发现候选点，最后还要读断点和征子。' : null
            };
          }
        }
      ]
    },
    // ============ 第 33 课：手筋② 尖 ============
    {
      id: 33,
      title: '手筋② · 尖（紧凑的棋形）',
      intro: '“尖”是下在己方棋子的斜对角。它比跳、飞更紧凑，常用来补强弱点或让两块棋相互照应；但斜向相邻不等于实连，对方仍可能从两个共同断点切断。',
      steps: [
        {
          type: 'visual',
          setup: 'B 4,4 6,6 W 5,4 5,6',
          text: '看画面：黑棋 D6 和 F4 相隔较远，中间 E5 同时在两颗黑子的斜对角。<br>黑下 E5 后，三颗子形成紧凑的斜向照应，比原先容易处理；但这还不是上下左右相连的一块棋，遇到切断时仍要读棋。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 4,4 6,6 W 5,4 5,6',
          objective: '现在轮到你执黑。请下在 <b>E5</b> 做一手“尖”，让两边的黑棋形成更紧凑的照应。',
          hint: 'E5 同时是 D6、F4 的斜对角。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 40;
            return {
              done,
              hint: done ? null : '请下在 E5——用尖联络两块黑棋。',
              successMsg: done ? '好！你下出了“尖”。它让棋形更紧凑，但别忘了：斜向照应不等于实连。' : null
            };
          }
        }
      ]
    },
    // ============ 第 34 课：手筋③ 夹 ============
    {
      id: 34,
      title: '手筋③ · 夹攻（限制发展方向）',
      intro: '“夹攻”是在对方靠近己方角部后，从另一侧落子，让对方受到两边夹击。夹攻的目的是限制发展、发起攻势，不代表被夹的棋会立刻被吃。',
      steps: [
        {
          type: 'visual',
          setup: 'B 3,3 W 4,4',
          highlights: [{ i: 32, label: '夹攻' }],
          text: '看画面：黑棋 C7 占了左上角，白棋 D6 靠近。黑棋可以在白棋另一侧的 F6 夹攻，与角上黑子一起限制白棋展开。<br>白棋仍然有多种逃路，所以这是攻势的开始，不是“夹住就必死”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 W 4,4',
          objective: '现在轮到你执黑。请下在白 D6 另一侧的 <b>F6</b> 夹攻，限制白棋沿上边展开。',
          hint: '黑 C7 在白棋左侧；下到 F6，从右侧形成夹攻。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 32;
            return {
              done,
              hint: done ? null : '请下在 F6，从另一侧夹攻白棋。',
              successMsg: done ? '好！黑棋从两边限制了白棋。接下来要根据白棋的逃路继续攻击，不能把“夹攻”当成已经吃子。' : null
            };
          }
        }
      ]
    },
    // ============ 第 35 课：切断的手筋 · 挖 ============
    {
      id: 35,
      title: '切断的手筋 · 挖',
      intro: '“挖”是下在对方两颗斜向相邻的棋之间，同时接触两颗子，制造切断和弃子变化。挖只是战斗开始，能否吃子还要继续读双方的反打、连接和征子。',
      steps: [
        {
          type: 'visual',
          setup: 'W 3,3 4,4 B 2,4 4,3',
          highlights: [{ i: 21, label: '挖' }],
          text: '看画面：白棋 C7 和 D6 斜向照应，中间有 D7、C6 两个共同断点。<br>黑棋有 D8、C6 作为支援，可以下在 D7，同时接触两颗白子并制造切断——这才是典型的“挖”。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'W 3,3 4,4 B 2,4 4,3',
          objective: '现在轮到你执黑。请下在 <b>D7</b> “挖”，同时接触白 C7、D6，制造两个断点。',
          hint: '白 C7、D6 斜向相邻；D7 是同时贴住两颗白子的挖点。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 21;
            return {
              done,
              hint: done ? null : '请下在 D7，挖断白棋的联络。',
              successMsg: done ? '好！这手黑棋同时接触两颗白子，形成了“挖”的战斗形。实战中还要继续读白棋的打吃和连接，不能在这一手就宣布吃子。' : null
            };
          }
        }
      ]
    },
    // ============ 第 36 课：劫争入门 · 找劫材 ============
    {
      id: 36,
      title: '劫争入门 · 找劫材',
      intro: '打劫时，不能立刻提回劫，要先在别处下“劫材”（威胁对方的棋），等对方“应劫”后，才能回来提劫。会找劫材、会应劫，才能赢下劫争。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 1,2 2,1 3,2 8,8 W 2,2 1,3 3,3 2,4 8,9 9,8', text: '看画面：<b>左边</b>是一个劫形——白棋 B8 只剩一口气（绿圈），黑棋可以提它。<br><b>右下</b>黑棋 H2 被白棋夹攻，也是白棋将来可以用的<b>“劫材”</b>（绿圈是它的气）。', highlightLibs: [10, 70], duration: 2800 },
            { board: 'B 1,2 2,1 3,2 2,3 8,8 W 1,3 3,3 2,4 8,9 9,8', text: '黑棋下 C8，提掉白棋 B8——<b>提劫</b>！现在黑子只剩 1 口气（绿圈），白棋“能提回”，但打劫规则禁止立刻提回。', mark: 11, highlightLibs: 11, duration: 2400 },
            { board: 'B 1,2 2,1 3,2 2,3 8,8 W 1,3 3,3 2,4 7,8 8,9 9,8', text: '白棋先在别处下 <b>H3</b>——这是白棋的<b>“劫材”</b>，打吃黑棋 H2！黑棋如果不应，整块黑棋就要被吃，所以黑棋必须“应劫”。', mark: 61, highlightLibs: 70, duration: 2600 },
            { board: 'B 1,2 2,1 3,2 2,3 8,8 8,7 W 1,3 3,3 2,4 7,8 8,9 9,8', text: '黑棋只好在 G2 应劫，救回 H2。<b>应劫之后，打劫限制解除</b>——白棋现在可以回来提劫了！', mark: 69, duration: 2200 },
            { board: 'B 1,2 2,1 3,2 8,8 8,7 W 2,2 1,3 3,3 2,4 7,8 8,9 9,8', text: '白棋回到原位 <b>B8</b>，把黑棋提回！<br>完整的劫争：<b>提劫 → 找劫材 → 应劫 → 再提劫</b>。劫材多、会应劫的一方，才能赢下劫争。', mark: 10, duration: 2600 }
          ]
        },
        {
          type: 'quiz',
          setup: 'B 1,2 2,1 3,2 2,3 8,8 W 1,3 3,3 2,4 8,9 9,8',
          highlightLibertiesOf: 11,
          question: '黑棋刚提了劫（C8 只剩 1 口气）。白棋可以立刻在 B8 提回吗？',
          options: ['不可以，要先在别处找劫材，等黑棋应劫后才能提回', '可以，直接提回', '规则没有规定'],
          answer: 0,
          explanation: '打劫规则：不能立刻提回同一颗子。白棋要先在别处下劫材（威胁黑棋），黑棋应劫后，才能回来提劫。这就是劫争的完整过程。'
        },
        {
          type: 'move',
          playerColor: GO.WHITE,
          setup: 'B 1,2 2,1 3,2 2,3 8,8 W 1,3 3,3 2,4 8,9 9,8',
          ko: 10,
          objective: '现在轮到你执白。先试试直接点 B8 提回——程序会告诉你这是打劫，不允许。然后请在别处落子<b>找劫材</b>：下一手能<b>打吃黑棋 H2</b> 的棋，逼黑棋应劫。',
          hint: '先点 B8 看提示；黑棋 H2 的气在 H3 和 G2，下在其中一处就能打吃它——这才是劫材。',
          check: ({ board, lastMove }) => {
            if (lastMove === null) return { done: false };
            // 劫材判定：落子后黑棋 (8,8)【0-idx 70】只剩 1 口气（被打吃），黑棋不得不应
            const threat = board.grid[70] === GO.BLACK && board.liberties(70).length === 1;
            return {
              done: threat,
              hint: threat ? null : '这手棋没有威胁到黑棋，黑棋不用应——不是劫材。请下在 H3 或 G2，打吃黑棋 H2。',
              successMsg: threat ? '很好！你打吃了黑棋 H2，黑棋必须应劫——应劫之后打劫限制解除，你就能回来提劫了。这就是“找劫材”！' : null
            };
          }
        }
      ]
    },
    // ============ 第 37 课：角部原则 · 小目挂角 ============
    {
      id: 37,
      title: '角部原则① · 小目挂角',
      intro: '对方占据小目后，从附近靠近这个角，叫“挂角”。入门阶段先理解挂角和守角的目的，不把某一条变化背成唯一定式。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 3,4', text: '黑棋先在左上小目 <b>D7</b> 占角。', mark: 21, duration: 1500 },
            { board: 'B 3,4 W 4,6', text: '白棋下在 <b>F6</b>，以小飞的距离靠近黑角——这是一种常见的挂角。白棋想限制黑棋完整守住角地。', mark: 32, duration: 2100 },
            { board: 'B 3,4 4,3 W 4,6', text: '黑棋可以在 <b>C6</b> 尖一手加强角部。这是强调守角的选择，不是对挂角的唯一答案。', mark: 29, duration: 2300 },
            { board: 'B 3,4 4,3 W 4,6 4,7', text: '白棋在 <b>G6</b> 长出，向右边发展。<br>这个示例只展示取舍：黑棋加强角，白棋获得外面发展。棋局还没有“按定式结束”。', mark: 33, duration: 2600 }
          ]
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,4 W 4,6',
          objective: '白棋 F6 挂角后，轮到黑棋。请下在 <b>C6</b> 加强左上角，体会“黑守角、白向外发展”的取舍。',
          hint: '下在 C6，与黑 D7 形成紧凑的守角。',
          check: ({ lastMove }) => {
            const done = lastMove === 29;
            return {
              done,
              hint: done ? null : '请下在 C6 加强角部。',
              successMsg: done ? '好！你选择了守角。记住：挂角后要理解双方的取舍，不要把一手棋背成唯一定式。' : null
            };
          }
        }
      ]
    },
    // ============ 第 38 课：角部原则 · 三三入侵 ============
    {
      id: 38,
      title: '角部原则② · 三三入侵',
      intro: '三三入侵的目的，是用角地交换对方的外势。本课只练习局部取舍：白棋想要角地，黑棋想保持外面连络。演示只是简化片段，不表示局部已经定型，也不要求死背。',
      steps: [
        {
          type: 'demo',
          frames: [
            { board: 'B 4,4', text: '黑棋先在 <b>D6</b> 的四四位置占角，兼顾角地和外面的发展。', mark: 30, duration: 1500 },
            { board: 'B 4,4 W 3,3', text: '白棋在 <b>C7</b> 的三三位置入侵，目标是抢到角地。', mark: 20, duration: 1800 },
            { board: 'B 4,4 3,4 W 3,3', text: '黑棋在 <b>D7</b> 挡住白棋，先把外面的方向守住。', mark: 21, duration: 1600 },
            { board: 'B 4,4 3,4 W 3,3 4,3', text: '白棋在 <b>C6</b> 爬一手，继续向角里安定。', mark: 29, duration: 1500 },
            { board: 'B 4,4 3,4 3,5 W 3,3 4,3', text: '黑棋在 <b>E7</b> 再挡，保持外侧的厚势。', mark: 22, duration: 1600 },
            { board: 'B 4,4 3,4 3,5 W 3,3 4,3 5,3', text: '白棋在 <b>C5</b> 延伸。这里的重点不是背顺序，而是看清取舍：白棋争角地，黑棋争外势。', mark: 38, duration: 2400 }
          ]
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 4,4 W 3,3',
          objective: '现在轮到你执黑。白棋在 C7 三三入侵，请下在 <b>D7</b> 挡住它，先守住外侧方向。',
          hint: '下在 D7，挡住白棋往上方发展。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 21;
            return {
              done,
              hint: done ? null : '请下在 D7，挡住白棋的三三入侵。',
              successMsg: done ? '好！你守住了外侧方向。记住这里的取舍：白棋争角地，黑棋争外势；先理解目的，再慢慢熟悉局部手法。' : null
            };
          }
        }
      ]
    },
    // ============ 第 39 课：真实对局② · 形势判断 ============
    {
      id: 39,
      title: '真实对局② · 形势判断',
      intro: '接续第20课的同一盘真实棋。现在不急着精确数地，而是学习中盘判断：谁有主动、哪些棋强弱未定、一次弃子交换究竟换到了什么。',
      steps: [
        {
          type: 'text',
          content: '<b>中盘判断先看四件事：</b><br>① 哪些棋已经安定，哪些棋仍可能被攻击；<br>② 双方较确定的地盘和仍可被破坏的势力；<br>③ 吃子与弃子换到了什么补偿；<br>④ 战斗结束后谁拿到先手，能先抢全盘最大处。<br><br>边界和死活尚未确定时，只能判断趋势，不能把模糊的空全部算成实地。'
        },
        {
          type: 'visual',
          setup: 'B 3,5 3,6 5,5 5,7 6,3 6,5 7,3 7,4 8,2 8,5 8,6 W 2,5 3,4 5,3 5,4 6,2 6,4 7,2 7,5 7,6 7,7',
          text: '<b>回看第21手：</b>黑棋已经救出下方弱棋，并把三颗白子困在黑方影响范围中。<br><b>判断：</b>黑棋掌握攻击主动，局部暂时有利；但白棋还可以选择做活或弃子换取外围利益，所以此时不能宣布黑棋已经赢了。'
        },
        {
          type: 'visual',
          setup: 'B 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5',
          highlights: [{ i: 12, label: '全盘大处' }],
          text: '<b>第39手：</b>白棋牺牲右下方七颗子，也提掉一颗黑子、破坏了黑棋原本想围的下边，并取得先手。<br><b>判断：</b>不能只看“白棋死了七颗”就断言黑棋大优；要把白棋破掉的黑地、左下所得和下一手先手价值一起考虑。现在双方边界仍未完全确定，只能说形势接近、下一手非常重要。'
        },
        {
          type: 'quiz',
          setup: 'B 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5',
          highlights: [{ i: 12, label: 'D8' }],
          question: '第39手战斗结束后，白棋该怎样利用手中的先手？',
          options: ['继续在已经结束的右下局部填子', '立刻宣布白棋输了七颗子，投子认输', '转到 D8，抢双方尚未确定的全盘最大边界'],
          answer: 2,
          explanation: '白棋的弃子已经换到局部补偿和先手。D8 附近是双方地盘边界最宽、最不确定的大处，先走能同时扩张白地并压缩黑地。'
        },
        {
          type: 'move',
          playerColor: GO.WHITE,
          setup: 'B 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5',
          objective: '轮到你执白。请复现实战第40手 <b>D8</b>，把中盘战斗取得的先手用在全盘最大处。',
          hint: '不要继续在右下填子。看棋盘上方白地与黑地之间最不确定的边界。',
          check: ({ board, lastMove }) => {
            const done = lastMove === 12;
            return {
              done,
              hint: done ? null : '请下在 D8，抢占全盘最大且尚未确定的边界。',
              successMsg: done ? '正确！白棋把中盘交换取得的先手兑现到全盘最大处。下一课将从这手开始进入收官。' : null
            };
          }
        },
        {
          type: 'text',
          content: '<b>形势判断不是只数棋子：</b><br>黑棋在第21手拥有攻击主动；白棋随后用弃子换到破坏黑地和先手；第39手后，白棋又先抢到最大边界。优势会随着每次交换改变。<br><br>到这里仍不宣布最终胜负。第40课会从白40的 D8 开始完成收官，等边界和死子都确定后再精确计分。'
        }
      ]
    },
    // ============ 第 40 课：真实对局③ · 收官与终局 ============
    {
      id: 40,
      title: '真实对局③ · 收官与终局',
      intro: '接续第20、39课的同一盘真实棋。白40抢到 D8 后，双方开始确定最后边界；这一课学习先手与后手、走完收官、清理死子，并算出最终胜负。',
      steps: [
        {
          type: 'text',
          content: '<b>收官先问两个问题：</b><br>① 哪个尚未确定的边界价值最大？<br>② 我下完后，对方若不应，是否会遭受明确损失？<br><br>对方不应就会被吃、被穿入或明显亏损，这手具有<b>先手</b>性质；对方可以放心去抢别处，这手通常是<b>后手</b>。先手不等于一定最大，仍要比较价值。'
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 1,2 2,1 3,1 W 2,2', text: '<b>先手收官小例子：</b>白棋 B8 只剩 C8、B7 两口气。', highlightLibs: 10, duration: 1900 },
            { board: 'B 1,2 2,1 2,3 3,1 W 2,2', text: '黑棋下 C8，白 B8 只剩 B7 一口气。如果白棋不应，黑下一手就会提子。', mark: 11, highlightLibs: 10, duration: 2100 },
            { board: 'B 1,2 2,1 2,3 3,1 W 2,2 3,2', text: '白棋通常要下 B7 长气。白棋应完后，黑棋还能先去别处——这就是带有真实威胁的先手收官。', mark: 19, duration: 2400 }
          ]
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 1,2 2,1 3,1 W 2,2',
          objective: '走完先手收官示例：黑先下 <b>C8</b> 打吃，再换白棋在 <b>B7</b> 应一手。',
          hint: '黑 C8 把白 B8 打吃；白棋再到 B7 长气。',
          check: ({ board, lastMove }) => {
            if (lastMove === 11 && board.grid[10] === GO.WHITE && board.grid[19] === GO.EMPTY) {
              return { done: false, nextPlayer: GO.WHITE, objective: '黑 C8 已打吃。现在换白棋：请下 <b>B7</b> 长气应对。', hint: '白 B8 最后一口气在 B7。' };
            }
            const done = lastMove === 19 && board.grid[10] === GO.WHITE;
            return { done, hint: done ? null : '按顺序下：黑 C8 → 白 B7。', successMsg: done ? '完成！判断先手不看谁先下，而看对方是否面对真实损失、通常必须应对。' : null };
          }
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>实战收官·第39手后：</b>右下战斗结束，白棋拿着先手。D8 是全盘最大、最不确定的边界。', highlights: [{ i: 12, label: '最大边界' }], duration: 2300 },
            { board: 'B 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,4 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第40手：</b>白棋下 D8，同时扩张白地、压缩黑地。', mark: 12, duration: 1600 },
            { board: 'B 2,6 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 2,4 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第41手：</b>黑棋下 F8，挡住白棋前进路线。', mark: 14, duration: 1200 },
            { board: 'B 2,6 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,6 2,4 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第42手：</b>白棋扳到 F9，继续争夺上边。', mark: 5, duration: 1100 },
            { board: 'B 1,7 2,6 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,6 2,4 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第43手：</b>黑棋挡在 G9。', mark: 6, duration: 1100 },
            { board: 'B 1,7 2,6 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,5 1,6 2,4 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第44手：</b>白棋下 E9，收住白方一侧。', mark: 4, duration: 1100 },
            { board: 'B 1,7 2,6 2,7 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,5 1,6 2,4 2,5 3,4 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第45手：</b>黑棋下 G8。第40—45手围绕同一个大边界连续应对，右上归属基本确定。', mark: 15, duration: 2100 }
          ]
        },
        {
          type: 'demo',
          frames: [
            { board: 'B 1,7 2,6 2,7 3,5 3,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,5 1,6 2,4 2,5 3,4 4,5 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第46手：</b>白棋钻进黑棋最后一个缺口 E6。', mark: 31, duration: 1500 },
            { board: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,5 1,6 2,4 2,5 3,4 4,5 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第47手：</b>黑棋下 F6，把白棋挡在外面。', mark: 32, duration: 1200 },
            { board: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 8,4 8,5 8,6 8,7 8,9 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 5,8 6,2 6,4 6,7 7,2 7,5 7,6 7,7 7,8 8,1 8,3 8,8 9,2 9,4 9,5', text: '<b>第48手：</b>白棋补在 D6，防止 E6 被提。实质上的边界争夺结束。', mark: 30, duration: 1900 },
            { board: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 7,9 8,4 8,5 8,6 8,7 8,9 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 5,8 6,2 6,4 7,2 8,1 8,3 9,2 9,4 9,5', text: '<b>第49手：</b>黑棋下 J3，提掉此前被包围的六颗白子。', mark: 62, duration: 2300 }
          ]
        },
        {
          type: 'visual',
          setup: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 7,9 8,4 8,5 8,6 8,7 8,9 9,7 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 5,8 6,2 6,4 7,2 8,1 8,3 9,2 9,3 9,4 9,5 9,6',
          highlights: [{ i: 43, style: 'capture', label: '死子' }],
          text: '<b>终局·第52手：</b>最后整理完成后双方停一手。H5 白子无法做活或逃出，是死子；正式数地前必须先拿掉。'
        },
        {
          type: 'visual',
          setup: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 7,9 8,4 8,5 8,6 8,7 8,9 9,7 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 6,2 6,4 7,2 8,1 8,3 9,2 9,3 9,4 9,5 9,6',
          text: '<b>移除死子，按中国面积规则计算：</b><br>黑棋：25颗活子 + 18个围住空点 = <b>43点</b>。<br>白棋：19颗活子 + 19个围住空点 = 38点，再加7.5贴目 = <b>45.5点</b>。<br><br>黑棋盘面领先5点，但白棋加入贴目后反超，最终<b>白胜2.5点</b>。'
        },
        {
          type: 'quiz',
          setup: 'B 1,7 2,6 2,7 3,5 3,6 4,6 4,8 5,5 5,6 5,7 6,3 6,5 6,6 6,8 6,9 7,3 7,4 7,9 8,4 8,5 8,6 8,7 8,9 9,7 9,8 W 1,5 1,6 2,4 2,5 3,4 4,4 4,5 5,3 5,4 6,2 6,4 7,2 8,1 8,3 9,2 9,3 9,4 9,5 9,6',
          question: '移除死子后，黑棋43点，白棋盘面38点并有7.5贴目。最终谁赢？',
          options: ['黑棋胜5点', '白棋胜2.5点：38 + 7.5 = 45.5，超过黑棋43点', '白棋胜7.5点'],
          answer: 1,
          explanation: '黑棋盘面成果多5点，但白棋有7.5贴目。45.5 − 43 = 2.5，所以最终白棋胜2.5点。'
        },
        {
          type: 'text',
          content: '<b>三课合起来就是一盘完整棋：</b><br>第20课：布局方向转为中盘强弱；<br>第39课：判断攻击、弃子补偿与先手价值；<br>第40课：从最大边界开始收官，清死子并精确计分。<br><br>记住：暂时主动、盘面领先和最终获胜是三个不同概念。'
        }
      ]
    },
    // ============ 第 41 课：毕业测试 ============
    {
      id: 41,
      title: '🎓 毕业测试 · 实战检验',
      intro: '学成出师前的最后一战：把 40 课学到的东西，用在一整局实战里。',
      steps: [
        {
          type: 'text',
          content: '恭喜你学完全部课程！最后是<b>毕业测试</b>：和电脑独立下完一整盘 9 路棋。<br>对局时试着用上你学到的：<b>围地为主、吃子为辅</b>；注意连接、小心断点；<b>被征子就别跑了</b>（电脑现在会征你）；收官时先确认威胁是否真的成立。终局先把死子提净，再点击“数地”查看胜负——完成这一局，你就毕业了！'
        },
        {
          type: 'free',
          playerColor: GO.BLACK,
          objective: '🎓 毕业测试：执黑对战电脑，独立下完一整局。结算前先把死子提净，再点击“数地”查看胜负。完成这一局，你就毕业了！'
        }
      ]
    }
  ];

  global.parseSetup = parseSetup;
  global.LESSONS = LESSONS;
})(typeof window !== 'undefined' ? window : globalThis);
