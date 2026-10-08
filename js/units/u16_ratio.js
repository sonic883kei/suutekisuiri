/**
 * u16_ratio.js  —  ⑯ 比と割合
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u16', name: '⑯ 比と割合', chap: 2,
    generate(level) {
        const rA = getRandomInt(2, 5);
        const rB = getRandomInt(3, 7);
        const mult = getRandomInt(4, 12);
        const total = (rA + rB) * mult;
        const valB = rB * mult;
        return {
            unit: '⑯ 比と割合', title: '比例配分',
            text: `合計 ${total} 個の品物を、AとBの2人に ${rA} ： ${rB} の比率で分けます。`,
            prompt: 'Bが受け取る個数は何個ですか？',
            correctAnswer: valB, unitSuffix: '個', step: 1,
            steps: [
                `比の合計 ＝ ${rA} ＋ ${rB} ＝ ${rA + rB}`,
                `Bの分け前 ＝ 全体 ${total} × (${rB} / ${rA + rB}) ＝ ${valB} 個`
            ]
        };
    }
});
