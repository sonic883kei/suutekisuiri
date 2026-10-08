/**
 * u22_sequence.js  —  ㉒ 数列・規則
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u22', name: '㉒ 数列・規則', chap: 2,
    generate(level) {
        const first = getRandomInt(2, 6);
        const diff = getRandomInt(3, 7);
        const idx = getRandomInt(5, 9);
        const ans = first + (idx - 1) * diff;
        return {
            unit: '㉒ 数列・規則', title: '等差数列の指定項',
            text: `初項が ${first}、公差が ${diff} の等差数列 「 ${first}, ${first+diff}, ${first+2*diff}... 」 があります。`,
            prompt: `この数列の 第 ${idx} 項 の数はいくつですか？`,
            correctAnswer: ans, unitSuffix: '', step: 2,
            steps: [
                `第 n 項の公式 ＝ 初項 ＋ (n － 1) × 公差`,
                `第 ${idx} 項 ＝ ${first} ＋ (${idx} － 1) × ${diff} ＝ ${ans}`
            ]
        };
    }
});
