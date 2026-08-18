/**
 * lessons.js —— 9 路围棋行动课程
 *
 * 固定课型：动作示范 → 2 道局部题 → 短对局 → 简短复盘。
 * setup 坐标使用“行,列”，均从 1 开始。
 */
(function (global) {
  'use strict';
  const GO = global.GO;
  const at = (row, col) => (row - 1) * 9 + (col - 1);

  function parseSetup(str) {
    const grid = new Array(81).fill(GO.EMPTY);
    if (!str) return grid;
    let color = null;
    for (const token of str.trim().split(/\s+/)) {
      if (token === 'B') { color = GO.BLACK; continue; }
      if (token === 'W') { color = GO.WHITE; continue; }
      const [r, c] = token.split(',').map(Number);
      grid[at(r, c)] = color;
    }
    return grid;
  }

  function moveTask({ color = GO.BLACK, setup = '', target, targets, objective, hint, success, highlights, ko }) {
    const allowed = targets || [target];
    return {
      type: 'move', playerColor: color, setup, ko, highlights,
      objective, hint, solution: [allowed[0]],
      check: ({ lastMove }) => {
        const done = allowed.includes(lastMove);
        return done
          ? { done: true, successMsg: success }
          : { done: false, retry: true, hint };
      }
    };
  }

  function sequenceTask({ color = GO.BLACK, setup = '', targets, replies = [], objective, prompts = [], hint, success, highlights, ko }) {
    return {
      type: 'move', playerColor: color, setup, ko, highlights,
      objective: '<b>短对局：</b>' + objective,
      hint, solution: targets.slice(),
      check: ({ board, lastMove }) => {
        const playerMoves = board.history.filter(h => h.color === color);
        const turnIndex = playerMoves.length - 1;
        if (turnIndex < 0 || targets[turnIndex] !== lastMove) {
          return { done: false, retry: true, hint };
        }
        if (turnIndex === targets.length - 1) return { done: true, successMsg: success };
        return {
          done: false,
          replyMove: replies[turnIndex],
          replyColor: 3 - color,
          objective: '<b>短对局：</b>' + (prompts[turnIndex] || objective),
          hint: prompts[turnIndex] || '对手已经回应，继续完成目标。'
        };
      }
    };
  }

  function review(action, exception, next) {
    return {
      type: 'text',
      content: '<span class="course-kicker">本课复盘</span><br><b>这一课只记一个动作：</b>' + action +
        '<br><b>别机械照搬：</b>' + exception +
        '<br><b>下一盘这样做：</b>' + next
    };
  }

  function actionLesson(id, unit, title, intro, demo, puzzles, challenge, recap) {
    return { id, unit, title, intro, steps: [demo, ...puzzles, challenge, recap] };
  }

  const LESSONS = [
    actionLesson(1, '第一阶段 · 先下起来', '轮流在交叉点落子', '目标：完成黑白交替落子，知道棋子落下后不移动。',
      {
        type: 'demo', frames: [
          { board: '', text: '围棋从空棋盘开始。棋子下在横线与竖线的<b>交叉点</b>上。' },
          { board: 'B 5,5', text: '黑棋先下，一次只放一颗棋。棋子落下后不会移动。', mark: at(5,5) },
          { board: 'B 5,5 W 3,3', text: '然后白棋落子，双方轮流进行。', mark: at(3,3) }
        ]
      },
      [
        moveTask({ target: at(5,5), objective: '执黑下在棋盘中央 <b>E5</b>。', hint: '找到中央交叉点 E5。', success: '完成第一手：黑棋落在 E5。' }),
        moveTask({ color: GO.WHITE, setup: 'B 3,3', target: at(7,7), objective: '黑棋已经落子。现在执白下在 <b>G3</b>。', hint: '轮到白棋，目标是 G3。', success: '正确，黑白双方各完成了一手。' })
      ],
      sequenceTask({
        setup: '', color: GO.BLACK,
        targets: [at(3,3), at(7,7), at(5,5)], replies: [at(3,7), at(7,3)],
        objective: '黑先下 C7，完成三轮交替落子。',
        prompts: ['白棋下了 G7。轮到黑棋下 G3。', '白棋下了 C3。轮到黑棋下 E5。'],
        hint: '按顺序下 C7 → G3 → E5。',
        success: '短对局完成：你和白棋交替下了五手，没有跳过回合。'
      }),
      review('看清轮到谁，把棋下在空的交叉点上。', '棋子落下后不能搬动，但可能被对方提走。', '每次落子前先确认“轮到哪一方”。')
    ),

    actionLesson(2, '第二阶段 · 会吃也会逃', '堵住一口气，让对方被打吃', '目标：做出“堵气”动作，让对方只剩一口气；棋仍留在盘上。',
      {
        type: 'demo', frames: [
          { board: 'W 5,5', text: '白棋 E5 周围四个相邻空点都是它的<b>气</b>。', highlightLibs: at(5,5) },
          { board: 'W 5,5 B 4,5 5,4', text: '黑棋堵住两口气，白棋还剩两口。', highlightLibs: at(5,5) },
          { board: 'W 5,5 B 4,5 5,4 5,6', text: '<b>动作：</b>黑棋再堵一口气。<br><b>状态：</b>白棋只剩一口气，处于“被打吃”状态。也常说“黑棋这手在打吃白棋”。<br><br><b>注意：白棋还在棋盘上，并没有被吃掉。</b>下一课再堵最后一口气，才会真正提子。', highlightLibs: at(5,5), mark: at(5,6) }
        ]
      },
      [
        moveTask({ setup: 'W 5,5 B 4,5 5,4', target: at(5,6), objective: '下在 <b>F5</b>，堵住白棋一口气，让它只剩一口气。', hint: '白棋现在有 E4、F5 两口气；堵住 F5。', success: '白棋只剩 E4 一口气，进入“被打吃”状态。它仍在盘上；这一步还不是提子。' }),
        moveTask({ setup: 'W 2,2 B 1,2 2,1', target: at(3,2), objective: '下在 <b>B7</b>，堵住边上白棋的一口气。', hint: '堵住白棋下方的气 B7。', success: '白棋现在只剩 C8 一口气，处于被打吃状态，但还没有被提走。' })
      ],
      sequenceTask({
        setup: 'W 3,3 7,7 B 2,3 3,2 6,7 7,6',
        targets: [at(4,3), at(8,7)], replies: [at(3,4)],
        objective: '先下 C6 堵气，让左上白棋只剩一口气。',
        prompts: ['左上白棋沿最后一口气逃到了 D7。现在下 G2，让右下白棋只剩一口气。'],
        hint: '依次下 C6、G2。',
        success: '你连续做了两次堵气动作，让两块白棋分别进入被打吃状态。白棋逃跑也说明：被打吃不等于已经被吃。'
      }),
      review('堵住对方一口气，让它只剩一口气。这个状态叫“被打吃”。', '被打吃的棋仍在盘上；再堵最后一口气并拿走棋子，才叫提子。', '记住：剩一口气＝被打吃；剩零口气并离盘＝被提子。')
    ),

    actionLesson(3, '第二阶段 · 会吃也会逃', '堵住最后一口气，完成提子', '目标：识别最后一口气，落子后把无气棋块拿掉。',
      {
        type: 'demo', frames: [
          { board: 'W 5,5 B 4,5 5,4 6,5', text: '白棋只剩 F5 最后一口气。', highlightLibs: at(5,5) },
          { board: 'B 4,5 5,4 5,6 6,5', text: '黑棋下 F5，白棋没有气，必须从棋盘上提走。', mark: at(5,6), flash: at(5,5) }
        ]
      },
      [
        moveTask({ setup: 'W 5,5 B 4,5 5,4 6,5', target: at(5,6), objective: '下在 <b>F5</b>，提掉白棋。', hint: 'F5 是白棋最后一口气。', success: '提子成功：白棋已经离开棋盘。' }),
        moveTask({ setup: 'W 4,4 4,5 B 3,4 3,5 4,3 4,6 5,4', target: at(5,5), objective: '两颗白棋共用最后一口气。下在 <b>E5</b> 提掉它们。', hint: '两颗白棋最后的共同气在 E5。', success: '一次提掉两颗棋：相连棋块要作为整体计算气。' })
      ],
      sequenceTask({
        setup: 'W 2,2 B 1,1 2,1 3,2',
        targets: [at(2,3), at(1,3)], replies: [at(1,2)],
        objective: '下 C8，把白棋赶向边线。',
        prompts: ['白棋逃到 B9。下 C9，提掉两颗白棋。'],
        hint: '顺序是 C8 → C9。',
        success: '短对局完成：你先打吃，再在边线上提掉了两颗白棋。'
      }),
      review('堵住最后一口气，把整块无气棋提走。', '只看一颗棋会漏算；相连的同色棋要整体数气。', '看到“打吃”后，继续确认下一手能否真正提子。')
    ),

    actionLesson(4, '第二阶段 · 会吃也会逃', '被打吃时，沿着最后一口气逃跑', '目标：自己的棋只剩一口气时，立即长出去增加气。',
      {
        type: 'demo', frames: [
          { board: 'B 5,5 W 4,5 5,4 6,5', text: '黑棋 E5 只剩 F5 一口气，被白棋打吃。', highlightLibs: at(5,5) },
          { board: 'B 5,5 5,6 W 4,5 5,4 6,5', text: '黑棋沿最后一口气长到 F5，连成两子并获得新气。', mark: at(5,6), highlightLibs: at(5,6) }
        ]
      },
      [
        moveTask({ setup: 'B 5,5 W 4,5 5,4 6,5', target: at(5,6), objective: '黑棋被打吃。下在 <b>F5</b> 逃跑。', hint: '黑棋唯一的气在 F5。', success: '逃跑成功，黑棋获得了新的气。' }),
        moveTask({ setup: 'B 2,2 W 1,2 2,1', target: at(2,3), objective: '边上的黑棋只剩 C8 一口气。请长到 <b>C8</b>。', hint: '沿唯一的气 C8 长出去。', success: '正确，边上的黑棋暂时安全了。' })
      ],
      sequenceTask({
        setup: 'B 3,3 7,7 W 2,3 3,2 4,3 6,7 7,6 8,7',
        targets: [at(3,4), at(7,8)], replies: [at(5,5)],
        objective: '先救左上黑棋，下 D7。',
        prompts: ['白棋在中央落子。右下黑棋也被打吃，请下 H3 逃跑。'],
        hint: '依次下 D7、H3。',
        success: '你在连续两次威胁中都先处理了被打吃的棋。'
      }),
      review('被打吃时，优先沿最后一口气长出去。', '长一手不一定真能逃掉；若对方还能连续打吃，要继续计算。', '每次落子前先检查自己的棋有没有只剩一口气。')
    ),

    actionLesson(5, '第二阶段 · 会吃也会逃', '连接自己的棋', '目标：下在断点，把两块棋连成一个共享气的整体。',
      {
        type: 'demo', frames: [
          { board: 'B 5,4 5,6', text: 'D5 与 F5 是两块分开的黑棋。' },
          { board: 'B 5,4 5,5 5,6', text: '黑棋下 E5，三颗棋连成一个整体，共享所有气。', mark: at(5,5), highlightLibs: at(5,5) }
        ]
      },
      [
        moveTask({ setup: 'B 5,4 5,6 W 6,5', target: at(5,5), objective: '下在 <b>E5</b>，连接两颗黑棋。', hint: '两颗黑棋之间的断点是 E5。', success: '连接成功，三颗黑棋成为一个整体。' }),
        moveTask({ setup: 'B 3,3 3,5 W 2,4', target: at(3,4), objective: '下在 <b>D7</b>，连接上方两颗黑棋。', hint: '连接点在 D7。', success: '正确，你抢在白棋切断前完成了连接。' })
      ],
      sequenceTask({
        setup: 'B 3,3 3,5 7,3 7,5 W 2,4 8,4',
        targets: [at(3,4), at(7,4)], replies: [at(5,5)],
        objective: '先连接上方黑棋，下 D7。',
        prompts: ['白棋在中央落子。再下 D3，连接下方黑棋。'],
        hint: '依次下 D7、D3。',
        success: '短对局完成：你连续守住了两个断点。'
      }),
      review('下在断点，把分开的棋连成整体。', '连接很安全，但不是每个断点都同样紧急；先看对方能否立即切断。', '对方落子前，先找一找自己的断点。')
    ),

    actionLesson(6, '第二阶段 · 会吃也会逃', '切断对方的棋', '目标：抢占对方两块棋之间的断点，让它们不能共享气。',
      {
        type: 'demo', frames: [
          { board: 'W 5,4 5,6', text: '两颗白棋之间留着 E5 断点。' },
          { board: 'W 5,4 5,6 B 5,5', text: '黑棋下 E5，把白棋切成两块，之后可以分别攻击。', mark: at(5,5) }
        ]
      },
      [
        moveTask({ setup: 'W 5,4 5,6 B 6,5', target: at(5,5), objective: '下在 <b>E5</b>，切断两颗白棋。', hint: '断点就在两颗白棋中间。', success: '切断成功，白棋变成两块。' }),
        moveTask({
          setup: 'W 3,2 3,3 3,5 3,6 B 2,4 4,4',
          target: at(3,4),
          objective: '左右各有一条白棋链。下在它们共同的连接点 <b>D7</b>，把两条链切开。',
          hint: '不要只看单颗棋：先把相连的白棋看成两块，再找两块之间唯一的空点。',
          success: '正确。你切断的是两条白棋链，不只是两颗单独的棋。'
        })
      ],
      sequenceTask({
        setup: 'W 3,3 3,5 7,3 7,5 B 4,4 6,4',
        targets: [at(3,4), at(7,4)], replies: [at(5,5)],
        objective: '先下 D7，切断上方白棋。',
        prompts: ['白棋在中央补了一手。再下 D3，切断下方白棋。'],
        hint: '依次下 D7、D3。',
        success: '你连续抓住了两个断点，让白棋无法合成大块。'
      }),
      review('抢占对方两块棋之间的断点。', '切断后自己的切断棋也可能变弱，要确认它有足够的气。', '先找断点，再检查切断棋能否安全站住。')
    ),

    actionLesson(7, '第二阶段 · 会吃也会逃', '避开禁入点，识别提子例外', '目标：不下无气自杀棋；若能先提掉对方，则允许落子。',
      {
        type: 'demo', frames: [
          { board: 'W 4,5 5,4 5,6 6,5', text: 'E5 四周都是白棋。黑棋直接下进去没有气，也提不到棋，因此是禁入点。', highlights: [{ i: at(5,5), style: 'forbidden' }] },
          { board: 'W 5,5 5,7 4,6 6,6 B 5,4 4,5 6,5', text: 'F5 看似无气，但黑棋落下能提掉 E5 白子，所以这一手合法。', highlights: [{ i: at(5,6), style: 'mark' }] }
        ]
      },
      [
        {
          type: 'quiz', setup: 'W 4,5 5,4 5,6 6,5', highlights: [{ i: at(5,5), style: 'forbidden' }],
          question: '黑棋能直接下在 E5 吗？',
          options: ['能，因为中央最重要', '不能，下后无气且不能提子', '任何被围住的点都能下'],
          answer: 1, explanation: '这一步既没有气，也提不到白棋，因此是禁入点。'
        },
        moveTask({ setup: 'W 5,5 5,7 4,6 6,6 B 5,4 4,5 6,5', target: at(5,6), objective: '下在 <b>F5</b>，利用提子例外吃掉 E5 白棋。', hint: 'F5 落子后会堵住白棋最后一口气。', success: '合法落子：你先提掉白棋，因此黑棋重新获得了气。' })
      ],
      sequenceTask({
        setup: 'W 4,5 5,4 5,6 6,5 B 2,2',
        targets: [at(3,3), at(7,7)], replies: [at(2,3)],
        objective: '避开中央禁入点，先下 C7。',
        prompts: ['白棋回应。继续避开禁入点，下 G3。'],
        hint: '不要点 E5；依次下 C7、G3。',
        success: '短对局中你两次检查了落点是否有气。'
      }),
      review('落子前检查：下完后自己的棋是否有气。', '若这一手能先提掉对方，无气点也可能合法；打劫另有额外限制。', '遇到被围住的空点，先问“能不能提子”。')
    ),

    actionLesson(8, '第三阶段 · 会活也会围', '围出一只真眼', '目标：用同一块棋围住一个对手不能直接填入的空点。',
      {
        type: 'demo', frames: [
          { board: 'B 4,5 5,4 5,6 6,5', text: '黑棋围住 E5，形成一只眼。白棋直接下入没有气。', highlights: [{ i: at(5,5), label: '眼' }] },
          { board: 'B 4,5 5,4 5,6', text: '如果围眼的棋有缺口，这个空点就不牢靠。', highlights: [{ i: at(6,5), label: '缺口' }] }
        ]
      },
      [
        moveTask({ setup: 'B 4,5 5,4 5,6', target: at(6,5), objective: '下在 <b>E4</b> 补住缺口，围出 E5 眼位。', hint: '缺口在眼位下方 E4。', success: '你围出了一只完整的眼。' }),
        {
          type: 'quiz', setup: 'B 4,5 5,4 5,6 6,5', highlights: [{ i: at(5,5), label: '眼' }],
          question: '为什么白棋不能直接下进 E5？',
          options: ['因为中央永远不能下', '白棋落下后无气，而且提不到黑棋', '因为黑棋数量比较多'],
          answer: 1, explanation: '眼位被黑棋围住，白棋直接下入既无气又不能提子。'
        }
      ],
      sequenceTask({
        setup: 'B 3,4 4,3 4,5 6,6 7,7 8,6',
        targets: [at(5,4), at(7,5)], replies: [at(5,8)],
        objective: '先下 D5，围好左侧眼位 D6。',
        prompts: ['白棋在别处落子。再下 E3，围好右下眼位 F3。'],
        hint: '依次下 D5、E3。',
        success: '你在对局中识别并补住了两个围眼缺口。'
      }),
      review('补住围棋块的缺口，留下对手不能直接填入的空点。', '只有一只眼的棋仍可能被吃；下一课要学两眼活棋。', '弱棋受攻时，先找能否围出眼位。')
    ),

    actionLesson(9, '第三阶段 · 会活也会围', '做出两只眼，让棋活下来', '目标：让同一块棋拥有两只彼此独立的真眼。',
      {
        type: 'demo', frames: [
          { board: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 3,8 4,3 4,4 4,5 4,6 4,7 4,8', text: '这块黑棋有两只独立的眼。白棋无法同时填掉两眼，因此黑棋已经活了。', highlights: [{ i: at(3,4), label: '眼1' }, { i: at(3,7), label: '眼2' }] }
        ]
      },
      [
        {
          type: 'quiz', setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 3,8 4,3 4,4 4,5 4,6 4,7 4,8',
          highlights: [{ i: at(3,4), label: '眼1' }, { i: at(3,7), label: '眼2' }],
          question: '黑棋为什么已经安全？', options: ['棋子很多就不会被吃', '它有两只独立真眼', '它靠近棋盘边'], answer: 1,
          explanation: '对方无法同时填掉两只真眼，所以这块棋不会被整体提走。'
        },
        moveTask({ setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 4,3 4,4 4,5 4,6 4,7 4,8', target: at(3,8), objective: '下在 <b>H7</b>，围出第二只眼。', hint: '右侧缺口在 H7。', success: '第二只眼完成，这块黑棋成为活棋。' })
      ],
      sequenceTask({
        setup: 'B 2,3 2,4 2,5 2,6 2,7 3,3 3,5 3,6 4,3 4,4 4,5 4,6 4,7 4,8 W 6,7',
        targets: [at(3,8), at(5,8)], replies: [at(6,6)],
        objective: '先下 H7 做出第二只眼。',
        prompts: ['白棋从外面靠近。下 H5 向外长，保持外气。'],
        hint: '依次下 H7、H5。',
        success: '你先确保两眼，再从外面增加气，没有只顾逃跑。'
      }),
      review('让同一块棋拥有两只独立的真眼。', '看似两个空点不一定是真眼；要检查缺口和假眼。', '受攻时先数眼：已有两眼就不必继续逃。')
    ),

    actionLesson(10, '第三阶段 · 会活也会围', '打劫时先在别处下一手', '目标：理解不能立即原位回提，并完成“找劫材—应劫—再提”。',
      {
        type: 'demo', frames: [
          { board: 'B 1,2 2,1 3,2 W 2,2 1,3 3,3 2,4', text: '黑棋可以在 C8 提掉白棋 B8。' },
          { board: 'B 1,2 2,1 3,2 2,3 W 1,3 3,3 2,4', text: '提子后形成劫。白棋不能立刻回到 B8 提回。', mark: at(2,3), highlights: [{ i: at(2,2), style: 'forbidden' }] }
        ]
      },
      [
        moveTask({ setup: 'B 1,2 2,1 3,2 W 2,2 1,3 3,3 2,4', target: at(2,3), objective: '下在 <b>C8</b>，提掉 B8 白棋并形成劫。', hint: '提子点在 C8。', success: '你提起了劫。对方不能立即在 B8 回提。' }),
        {
          type: 'quiz', setup: 'B 1,2 2,1 3,2 2,3 W 1,3 3,3 2,4', highlights: [{ i: at(2,2), style: 'forbidden' }],
          question: '白棋现在应该怎么做？', options: ['立刻在 B8 回提', '先在别处下一手，再寻找机会回提', '永远放弃这块棋'], answer: 1,
          explanation: '劫争禁止立即恢复原局面；白棋必须先在别处落子。'
        }
      ],
      sequenceTask({
        color: GO.WHITE,
        setup: 'B 1,2 2,1 3,2 2,3 1,9 W 1,3 3,3 2,4', ko: at(2,2),
        targets: [at(2,9), at(2,2)], replies: [at(1,8)],
        objective: '不能立即回提。先下 J8，威胁右上黑棋。',
        prompts: ['黑棋应在 H9。现在回到 B8，提回劫子。'],
        hint: '顺序是 J8 → B8。',
        success: '完整劫争完成：找劫材、对方应劫、再回提。'
      }),
      review('形成劫后，不能立即原位回提；先在别处落一手。', '随便下在别处未必有用，好的劫材要能逼对方回应。', '遇到劫先找“对方不能不管”的威胁。')
    ),

    actionLesson(11, '第三阶段 · 会活也会围', '堵住缺口，围成地盘', '目标：识别围地边界并把开放区域封闭。',
      {
        type: 'demo', frames: [
          { board: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,5 6,6', text: '黑棋围住中央四个空点。这些空点是黑棋的地盘。', highlights: [{ i: at(4,4) }, { i: at(4,5) }, { i: at(5,4) }, { i: at(5,5) }] },
          { board: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,6', text: '如果边界有缺口，空点会连到外面，还不能算作确定地盘。', highlights: [{ i: at(6,5), label: '缺口' }] }
        ]
      },
      [
        moveTask({ setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,6', target: at(6,5), objective: '下在 <b>E4</b>，堵住缺口。', hint: '围墙底边缺少 E4。', success: '缺口被堵住，中央空点成为黑棋地盘。' }),
        {
          type: 'quiz', setup: 'B 3,3 3,4 3,5 3,6 4,3 4,6 5,3 5,6 6,3 6,4 6,5 6,6',
          highlights: [{ i: at(4,4) }, { i: at(4,5) }, { i: at(5,4) }, { i: at(5,5) }],
          question: '黑棋围住了多少个空点？', options: ['2 个', '4 个', '12 个'], answer: 1,
          explanation: '围墙内部共有四个空交叉点，都是黑棋地盘。'
        }
      ],
      sequenceTask({
        setup: 'B 2,2 2,3 2,4 3,2 3,4 4,2 4,3 6,6 6,7 6,8 7,6 7,8 8,6 8,7',
        targets: [at(4,4), at(8,8)], replies: [at(5,5)],
        objective: '先下 D6，堵住黑地缺口。',
        prompts: ['白棋在中央落子。再下 H2，堵住右下黑地缺口。'],
        hint: '依次下 D6、H2。',
        success: '你连续封住两块黑地的边界，理解了地盘必须闭合。'
      }),
      review('找到围地边界的缺口并把它堵住。', '看起来被包围不等于已经是地；还要确认对方不能打入做活。', '终局前沿着双方边界走一圈，检查是否还有缺口。')
    ),

    actionLesson(12, '第四阶段 · 基本手筋', '一手同时打吃两块棋', '目标：找到两块敌棋共用的要点，走出双叫吃。',
      {
        type: 'demo', frames: [
          { board: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6', text: '两颗白棋各自只有两口气，中间 E6 是共同要点。', highlights: [{ i: at(4,5), label: '共同点' }] },
          { board: 'B 3,4 5,4 3,6 5,6 4,5 W 4,4 4,6', text: '黑棋下 E6，两块白棋同时被打吃。白棋只能救一边。', mark: at(4,5) }
        ]
      },
      [
        moveTask({ setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6', target: at(4,5), objective: '下在 <b>E6</b>，同时打吃两颗白棋。', hint: '两颗白棋中间的共同要点是 E6。', success: '双叫吃成功，白棋只能救其中一块。' }),
        moveTask({ setup: 'B 4,3 6,3 4,5 6,5 W 5,3 5,5', target: at(5,4), objective: '下在 <b>D5</b>，走出另一道双叫吃。', hint: '两颗白棋中间是 D5。', success: '正确，一手棋同时攻击两块。' })
      ],
      sequenceTask({
        setup: 'B 3,4 5,4 3,6 5,6 W 4,4 4,6',
        targets: [at(4,5), at(4,7)], replies: [at(4,3)],
        objective: '先下 E6 双叫吃。',
        prompts: ['白棋救了左边。下 G6，提掉右边白棋。'],
        hint: '顺序是 E6 → G6。',
        success: '你利用双叫吃制造了两个威胁，并兑现了其中一个。'
      }),
      review('寻找能一手同时打吃两块棋的共同要点。', '双叫吃不保证两边都能吃；通常只能兑现其中一个。', '看到两块未连接的弱棋时，先找它们之间的要点。')
    ),

    actionLesson(13, '第四阶段 · 基本手筋', '每手打吃，完成征子', '目标：让对方每次逃跑后仍只剩一口气，一路追向边线。',
      {
        type: 'demo', frames: [
          { board: 'W 5,5 B 5,6 6,5 4,4 4,3', text: '黑棋从 E6 开始打吃白棋。' },
          { board: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5', text: '白棋逃到 D5，黑棋下一手仍要继续打吃。', mark: at(5,4) },
          { board: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5 6,4', text: '黑棋下 D4，白棋再次只剩一口气。征子像楼梯一样延伸。', mark: at(6,4) }
        ]
      },
      [
        moveTask({ setup: 'W 5,5 B 5,6 6,5 4,4 4,3', target: at(4,5), objective: '下在 <b>E6</b>，开始征子。', hint: '堵住白棋上方的气 E6。', success: '第一手打吃正确，白棋只能向 D5 逃。' }),
        {
          type: 'quiz', setup: 'W 5,5 5,4 B 5,6 6,5 4,4 4,3 4,5',
          question: '白棋逃到 D5 后，黑棋的任务是什么？', options: ['改下别处', '继续让白棋只剩一口气', '主动连接白棋'], answer: 1,
          explanation: '征子的关键是每一手都保持打吃，不给对方增加多口气。'
        }
      ],
      sequenceTask({
        setup: 'W 5,5 B 5,6 6,5 4,4 4,3',
        targets: [at(4,5), at(6,4), at(6,3)], replies: [at(5,4), at(5,3)],
        objective: '先下 E6 打吃。',
        prompts: ['白棋逃到 D5。下 D4 继续打吃。', '白棋逃到 C5。下 C4 继续打吃。'],
        hint: '顺序是 E6 → D4 → C4。',
        success: '你连续三手保持打吃，走出了征子的楼梯路线。'
      }),
      review('对方每逃一步，都继续把它紧到一口气。', '征子路线遇到对方接应子时可能失败，开始前要先看前方。', '追之前沿斜线看向边线，检查有没有对方棋子。')
    ),

    actionLesson(14, '第四阶段 · 基本手筋', '张网封住逃路，完成枷吃', '目标：不急着连续打吃，先让对方所有逃路都无效。',
      {
        type: 'demo', frames: [
          { board: 'W 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4', text: '白棋虽然有 A5、C5 两条路，但黑棋已经把外围封住。', highlights: [{ i: at(5,1), label: '路1' }, { i: at(5,3), label: '路2' }] },
          { board: 'W 5,1 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4', text: '白棋若逃到 A5，黑棋下 C5 就能把它提掉。另一边同理。' }
        ]
      },
      [
        {
          type: 'quiz', setup: 'W 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4',
          question: '枷吃与征子最大的区别是什么？', options: ['枷吃先张网封路，征子连续打吃追赶', '枷吃必须发生在角上', '两者完全一样'], answer: 0,
          explanation: '征子靠连续打吃追赶；枷吃先控制所有逃路，让对方有气也跑不掉。'
        },
        moveTask({ setup: 'W 5,1 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4', target: at(5,3), objective: '白棋逃到 A5。下在 <b>C5</b>，提掉两颗白棋。', hint: '白棋最后一口气在 C5。', success: '枷网生效：白棋逃跑后仍被一步提掉。' })
      ],
      sequenceTask({
        color: GO.WHITE,
        setup: 'W 5,2 B 4,1 6,1 4,2 6,2 4,3 6,3 5,4',
        targets: [at(5,1), at(3,1)], replies: [at(5,3)],
        objective: '执白尝试从 A5 逃跑。',
        prompts: ['黑棋在 C5 把逃跑白棋提掉。现在在 A7 落一手，观察网已经封死。'],
        hint: '依次下 A5、A7。',
        success: '你亲自验证了：枷网形成后，局部白棋已经没有有效逃路。'
      }),
      review('先封住所有逃路，再等对方进入最后一口气。', '网若有缺口，对方就可能跑掉；必须逐条检查逃路。', '看到弱棋时，不只找打吃，也找能同时罩住多条路的一手。')
    ),

    actionLesson(15, '第四阶段 · 基本手筋', '对杀时先数气，再紧气', '目标：分清正在对杀的两块棋，比较气数并走在对方气上。',
      {
        type: 'demo', frames: [
          { board: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6', text: '中间白 E6 与黑 F6 互相接触，双方各有两口气。', highlights: [{ i: at(4,4), label: '白气' }, { i: at(5,5), label: '白气' }, { i: at(4,7), label: '黑气' }, { i: at(5,6), label: '黑气' }] },
          { board: 'B 3,4 3,5 4,6 5,4 6,5 4,4 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6', text: '黑棋先紧白棋一口气，白棋只剩一口。', mark: at(4,4) }
        ]
      },
      [
        {
          type: 'quiz', setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
          question: '中间白 E6 与黑 F6 各有几口气？', options: ['各 1 气', '各 2 气', '各 4 气'], answer: 1,
          explanation: '白棋气在 D6、E5；黑棋气在 G6、F5。双方各两气。'
        },
        moveTask({ setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6', target: at(4,4), objective: '下在 <b>D6</b>，把白 E6 从两气紧到一气。', hint: '白 E6 的一口气在 D6。', success: '白棋被紧到一口气，黑棋在对杀中领先一步。' })
      ],
      sequenceTask({
        setup: 'B 3,4 3,5 4,6 5,4 6,5 W 3,3 3,6 3,7 4,5 5,7 6,3 6,4 6,6',
        targets: [at(4,4), at(5,5)], replies: [at(4,7)],
        objective: '黑先下 D6 紧白棋。',
        prompts: ['白棋下 G6 反紧。黑下 E5，先一手提掉白 E6。'],
        hint: '顺序是 D6 → E5。',
        success: '你完成了同气对杀：先紧气的一方先一步提子。'
      }),
      review('先分清对杀对象，数清双方气，再下在对方气上。', '有共气、有眼或能长气时，不能直接套“气多者胜”。', '对杀前把双方的气逐一点出来，再决定先后。')
    ),

    actionLesson(16, '第五阶段 · 进入完整对局', '开局先占角，再沿边发展', '目标：利用棋盘边界提高布局效率，在前几手建立多个发展点。',
      {
        type: 'demo', frames: [
          { board: 'B 1,4 2,4 3,4 4,1 4,2 4,3 4,4', text: '角能借两条棋盘边，用较少棋子围出空间。' },
          { board: 'B 1,3 2,3 3,3 1,7 2,7 3,7 4,3 4,4 4,5 4,6 4,7', text: '边只能借一条棋盘边，因此开局通常先角、后边。' }
        ]
      },
      [
        moveTask({ setup: '', targets: [at(3,3), at(3,7), at(7,3), at(7,7)], objective: '从四个角落星位中任选一点作为第一手。', hint: '选择 C7、G7、C3、G3 中任意一点。', success: '正确，先利用角的两条棋盘边。', highlights: [{i:at(3,3),label:'A'},{i:at(3,7),label:'B'},{i:at(7,3),label:'C'},{i:at(7,7),label:'D'}] }),
        {
          type: 'quiz', setup: 'B 3,3 W 3,7 B 7,7 W 7,3',
          question: '四个角都有棋后，下一步通常先观察哪里？', options: ['沿边的发展空间和双方弱棋', '只盯住中央一点', '随便填自己的棋眼'], answer: 0,
          explanation: '角是起点。之后沿边展开，并根据敌我棋块强弱选择方向。'
        }
      ],
      sequenceTask({
        setup: '', targets: [at(3,3), at(7,7), at(5,3)], replies: [at(3,7), at(7,3)],
        objective: '黑先占 C7。',
        prompts: ['白占 G7。黑再占 G3。', '白占 C3。黑沿左边下 C5，开始向边上发展。'],
        hint: '顺序是 C7 → G3 → C5。',
        success: '你完成了一个清晰开局：先占两个角，再从角向边发展。'
      }),
      review('开局先利用角，再根据全盘沿边发展。', '“先角后边”是找候选点的方法；若有棋被打吃，必须先处理急处。', '前十手尽量让每颗棋都有发展空间，不要挤成一团。')
    ),

    {
      id: 17,
      unit: '第五阶段 · 进入完整对局',
      title: '🎓 毕业对局 · 独立下完一盘 9 路棋',
      intro: '把所有动作放回真实对局：观察弱棋、选择候选、计算一小段，再落子。',
      steps: [
        {
          type: 'text',
          content: '<span class="course-kicker">毕业任务</span><br>独立和电脑完成一盘 9 路棋。每次落子前按这个顺序检查：<br>① 自己有没有被打吃的棋；<br>② 能不能提子、连接或切断；<br>③ 没有急事时，再考虑围地和扩大。<br><br>双方连续停一手后，先确认死子已经提净，再数地完成毕业。'
        },
        {
          type: 'free', playerColor: GO.BLACK,
          objective: '🎓 毕业对局：执黑对战电脑，独立下完一盘 9 路棋。双方连续停一手后提净死子并数地。'
        }
      ]
    }
  ];

  global.parseSetup = parseSetup;
  global.LESSONS = LESSONS;
})(typeof window !== 'undefined' ? window : globalThis);
