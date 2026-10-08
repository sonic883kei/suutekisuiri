/**
 * u14_work.js  —  ⑭ 仕事算
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u14', name: '⑭ 仕事算', chap: 1,
    generate(level) {
        const pairs = [
            { a: 10, b: 15, ans: 6 },
            { a: 12, b: 24, ans: 8 },
            { a: 20, b: 30, ans: 12 },
            { a: 6, b: 12, ans: 4 },
            { a: 15, b: 30, ans: 10 }
        ];
        const p = getRandomChoice(pairs);
        return {
            unit: '⑭ 仕事算', title: '共同作業のかかる日数',
            text: `ある仕事を行うのに、A君1人だと ${p.a} 日、B君1人だと ${p.b} 日かかります。`,
            prompt: '2人が一緒に作業すると何日で仕上げることができますか？',
            correctAnswer: p.ans, unitSuffix: '日', step: 1,
            steps: [
                `全体の仕事量を 1 とすると、1日あたりの仕事量は Aが 1/${p.a}、Bが 1/${p.b}`,
                `2人一緒の1日の仕事量 ＝ 1/${p.a} ＋ 1/${p.b} ＝ 1/${p.ans}`,
                `かかる日数 ＝ 1 ÷ (1/${p.ans}) ＝ ${p.ans} 日`
            ]
        };
    }
});
