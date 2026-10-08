/**
 * u17_base.js  —  ⑰ 記数法
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u17', name: '⑰ 記数法', chap: 2,
    generate(level) {
        const num10 = getRandomInt(9, 63);
        const binStr = num10.toString(2);
        return {
            unit: '⑰ 記数法', title: '2進法から10進法への変換',
            text: `2進法で表記された数値 「 ${binStr} (2) 」 があります。`,
            prompt: 'これを 10進法 で表すといくらになりますか？',
            correctAnswer: num10, unitSuffix: '', step: 1,
            steps: [
                `2進数 ${binStr} の各桁に 2の乗数を掛けて和を求めます。`,
                `10進数換算 ＝ ${num10}`
            ]
        };
    }
});
