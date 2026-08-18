/**
 * video-course.js —— 根据用户提供的 10 分钟围棋视频重构的对照实验课
 *
 * 目标不是逐句复刻旁白，而是把视频的叙事优势转成可操作的学习闭环：
 * 先猜结论 → 看棋盘验证 → 自己落子 → 在新局面里迁移。
 */
(function (global) {
  'use strict';
  const GO = global.GO;
  const at = (row, col) => (row - 1) * 9 + (col - 1);
  const territory = (points, color) => points.map(([r, c]) => ({
    i: at(r, c),
    style: 'territory',
    color: color || '#f1c40f'
  }));

  const cornerNine = territory([
    [1, 1], [1, 2], [1, 3],
    [2, 1], [2, 2], [2, 3],
    [3, 1], [3, 2], [3, 3]
  ]);
  const sideNine = territory([
    [1, 4], [1, 5], [1, 6],
    [2, 4], [2, 5], [2, 6],
    [3, 4], [3, 5], [3, 6]
  ]);
  const centerNine = territory([
    [4, 4], [4, 5], [4, 6],
    [5, 4], [5, 5], [5, 6],
    [6, 4], [6, 5], [6, 6]
  ]);

  const VIDEO_LESSONS = [
    {
      id: 'V1',
      title: '从 11 手棋看懂布局效率',
      intro: '把原视频重构成一门约 12 分钟的互动课：不先背口诀，而是用数字、棋形和落子选择推导结论。',
      steps: [
        {
          type: 'text',
          content: '<span class="video-course-kicker">视频转课实验 · 约 12 分钟</span><br><b>一张数学课本里的围棋图，为什么前四手都在角上？</b><br><br>这一课不要求你记住原视频的每句话。你只要亲手解决三个问题：<br>① “围”到底围什么；<br>② 棋子为什么不能挤得太近，也不能离得太远；<br>③ 两个方向都能走时，怎样选出一手兼顾双方的棋。'
        },
        {
          type: 'demo',
          frames: [
            {
              board: 'B 4,5 5,4 5,6 W 5,5',
              text: '<b>第一种“围”：围棋子。</b>中央白棋只剩一口气。绿色圆圈就是它最后的生命线。',
              highlightLibs: at(5, 5)
            },
            {
              board: 'B 4,5 5,4 5,6 6,5 W 5,5',
              text: '黑棋堵住最后一口气，白棋被提。这里的“围”解决的是<b>棋子的生死</b>。',
              mark: at(6, 5),
              flash: at(5, 5),
              flashMs: 900
            },
            {
              board: 'B 4,5 5,4 5,6 6,5',
              text: '白棋离开棋盘。记住：<b>没有气的棋子必须提走</b>。'
            }
          ]
        },
        {
          type: 'visual',
          setup: 'B 1,4 2,4 3,4 4,1 4,2 4,3 4,4',
          highlights: cornerNine,
          text: '<b>第二种“围”：围空点。</b>黑棋借棋盘上边和左边两道现成的“墙”，只用 <b>7 颗棋子</b>就围住了黄色标出的 <b>9 个空点</b>。<br><br>这解释的是地盘效率。实战中还要确认对方不能打入做活，不能把“看起来像空”的地方提前当成确定地。'
        },
        {
          type: 'demo',
          frames: [
            {
              board: 'B 1,4 2,4 3,4 4,1 4,2 4,3 4,4',
              highlights: cornerNine,
              text: '<b>角上：</b>借两条棋盘边，围同样 9 个点只要 <b>7 子</b>。'
            },
            {
              reset: true,
              board: 'B 1,3 2,3 3,3 1,7 2,7 3,7 4,3 4,4 4,5 4,6 4,7',
              highlights: sideNine,
              text: '<b>边上：</b>只能借一条棋盘边，需要 <b>11 子</b>。'
            },
            {
              reset: true,
              board: 'B 3,3 3,4 3,5 3,6 3,7 4,3 4,7 5,3 5,7 6,3 6,7 7,3 7,4 7,5 7,6 7,7',
              highlights: centerNine,
              text: '<b>中央：</b>四面都要自己筑墙，需要 <b>16 子</b>。<br>同样围 9 点：7 ＜ 11 ＜ 16，这就是“金角银边草肚皮”背后的直觉。'
            }
          ]
        },
        {
          type: 'quiz',
          setup: '',
          highlights: [
            { i: at(3, 3), style: 'mark', label: '角' },
            { i: at(3, 5), style: 'mark', label: '边' },
            { i: at(5, 5), style: 'mark', label: '中腹' }
          ],
          question: '现在不背口诀，只根据刚才的 7、11、16：布局初期为什么通常先占角？',
          options: [
            '角上的棋子天生不会被吃',
            '角能借两条棋盘边，同样围空时用子更省',
            '角上的每一个空点都算双倍'
          ],
          answer: 1,
          explanation: '角的优势是围地效率，不是“绝对安全”或“双倍计分”。先占角是高效的布局起点，具体走法仍要看全盘。'
        },
        {
          type: 'demo',
          frames: [
            {
              board: 'B 5,4 5,5',
              text: '<b>并：</b>两子紧挨着，连接最牢，但走得慢、覆盖范围小。'
            },
            {
              reset: true,
              board: 'B 5,3 5,5',
              highlights: [{ i: at(5, 4), style: 'mark', label: '断点' }],
              text: '<b>跳：</b>中间隔一个点，棋形更舒展；代价是对方靠近时要留意断点。'
            },
            {
              reset: true,
              board: 'B 4,4 5,6',
              text: '<b>飞：</b>像马步一样斜向展开，兼顾速度与照应。<br>三种棋形没有永远的冠军：战斗紧张时要紧，空间宽松时要舒展。'
            }
          ]
        },
        {
          type: 'visual',
          setup: 'B 3,3 3,6',
          highlights: [
            { i: at(3, 4), style: 'mark', label: '1' },
            { i: at(3, 5), style: 'mark', label: '2' }
          ],
          text: '<b>一颗棋子的常见展开：拆二。</b>C7 与 F7 之间留两个空点。它比“并”展开得快，又没有远到完全失去照应。<br><br>“拆二安全”只是这幅局部图的判断起点；附近有敌子、断点或征子不利时，仍要重新计算。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 4,3',
          highlights: [{ i: at(3, 7), style: 'mark', label: '试一试' }],
          objective: '现在黑棋有上下相连的两颗子，比单子更有支撑。请沿上边下在 <b>G7</b>，走出视频中的“立二拆三”。',
          hint: '从 C7 向右数，D7、E7、F7 是三个空点；落点是 G7。',
          check: ({ lastMove }) => {
            const done = lastMove === at(3, 7);
            return {
              done,
              hint: done ? null : '目标是 G7。点错后可用“重做本步”重新尝试。',
              successMsg: done ? '正确！两颗相连的棋提供了更多支撑，所以这幅局部图里可以把展开距离从拆二放大到拆三。' : null
            };
          }
        },
        {
          type: 'quiz',
          setup: 'B 3,3 4,3 W 3,8 4,8 5,8',
          highlights: [
            { i: at(3, 6), style: 'mark', label: 'A' },
            { i: at(7, 3), style: 'mark', label: 'B' }
          ],
          question: '轮到黑棋继续发展。视频最后比较两个方向时，使用了哪一套更完整的判断？',
          options: [
            '只选离自己最近的一点，越紧越好',
            '只数想象中的空，不看对方棋子',
            '比较两侧的发展空间，同时看哪一手还能限制或影响白棋'
          ],
          answer: 2,
          explanation: '视频用“31 对 26”的想象围空比较潜力，又补充了对对手的影响。数字是启发式估算，不是已经到手的终局分数。'
        },
        {
          type: 'move',
          playerColor: GO.BLACK,
          setup: 'B 3,3 4,3 W 3,8 4,8 5,8',
          highlights: [
            { i: at(3, 6), style: 'mark', label: '扩张＋靠近白棋' },
            { i: at(7, 3), style: 'mark', label: '只扩张' }
          ],
          objective: '迁移题：A、B 都能扩大黑棋。请下出同时沿上边扩张、又靠近右侧白棋的一手 <b>F7</b>。',
          hint: '寻找“一手两用”：既与左上黑棋呼应，又从左侧接近白棋。',
          check: ({ lastMove }) => {
            const done = lastMove === at(3, 6);
            return {
              done,
              hint: done ? null : '这一题要选 F7。它不是全盘唯一好手，而是本题中同时完成两个目标的手。',
              successMsg: done ? '很好！你没有只看自己的空，而是找到了一手两用的方向。真正的布局判断，总是在“我能得到什么”和“对手会受到什么影响”之间比较。' : null
            };
          }
        },
        {
          type: 'quiz',
          setup: 'B 3,3 4,3 3,7 W 2,6 2,7 2,8 4,6',
          question: '最后一道迁移题：哪种情况下最不能机械照搬“立二拆三”？',
          options: [
            '附近已经有白棋，拆三点可能被夹击或切断',
            '棋盘是木头颜色',
            '黑棋刚刚占过角'
          ],
          answer: 0,
          explanation: '口诀负责提供候选点，周围敌我强弱决定它是否成立。看到附近白棋，就必须检查打入、切断、征子和逃跑方向。'
        },
        {
          type: 'text',
          content: '<span class="video-course-kicker">课程完成</span><br><b>你刚才走过了一条完整推理链：</b><br>围棋子 / 围空点 → 角边中腹的效率 → 并、跳、飞 → 拆二、拆三 → 发展方向与一手两用。<br><br><b>它与40课的区别：</b>这门课用一个“11手棋”的故事连续串起多个概念，记忆更顺；40课把规则、死活、手筋和实战拆开反复练，覆盖更完整。现在你可以直接切回“新手教程”，重点对比第 17、18、31、33 课的学习感受。'
        }
      ]
    }
  ];

  global.VIDEO_LESSONS = VIDEO_LESSONS;
})(typeof window !== 'undefined' ? window : globalThis);
