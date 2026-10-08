/**
 * u19_integer.js  —  ⑲ 整数
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u19', name: '⑲ 整数', chap: 2,
    generate(level) {
        const n = getRandomInt(10, 30);
        const sum = (n * (n + 1)) / 2;
        return {
            unit: '⑲ 整数', title: '連続整数の総和',
            text: `1 から ${n} までの連続するすべての整数を足し合わせます。`,
            prompt: `1 ＋ 2 ＋ 3 ＋ ... ＋ ${n} の合計はいくつですか？`,
            correctAnswer: sum, unitSuffix: '', step: 5,
            steps: [
                `連続する整数の和の公式 ＝ n × (n ＋ 1) ÷ 2`,
                `計算 ＝ ${n} × (${n} ＋ 1) ÷ 2 ＝ ${sum}`
            ]
        };
    }
});
