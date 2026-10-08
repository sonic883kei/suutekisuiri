/**
 * u20_magic_square.js  —  ⑳ 魔方陣
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u20', name: '⑳ 魔方陣', chap: 2,
    generate(level) {
        const base = getRandomChoice([3, 5, 7, 9]);
        const center = base;
        const lineSum = base * 3;
        return {
            unit: '⑳ 魔方陣', title: '魔方陣の性質',
            text: `3×3の魔方陣で、各行・各列・対角線の3つの数の和がすべて ${lineSum} になっています。`,
            prompt: 'この魔方陣の中央（中心）に入る数字はいくつですか？',
            correctAnswer: center, unitSuffix: '', step: 1,
            steps: [
                `3×3魔方陣において、各ラインの和は「中心の数 × 3」になります。`,
                `中心の数 ＝ ラインの和 ${lineSum} ÷ 3 ＝ ${center}`
            ]
        };
    }
});
