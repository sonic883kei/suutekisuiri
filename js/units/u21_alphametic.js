/**
 * u21_alphametic.js  —  ㉑ 覆面算・虫食い
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u21', name: '㉑ 覆面算・虫食い', chap: 2,
    generate(level) {
        const val = getRandomInt(4, 9);
        const ans = val * 2;
        return {
            unit: '㉑ 覆面算・虫食い', title: '文字と数字のあてはめ',
            text: `覆面算 「 A ＋ A ＝ ${ans} 」 において、A は同じ1桁の数字を表しています。`,
            prompt: '文字 A にあてはまる数字はいくつですか？',
            correctAnswer: val, unitSuffix: '', step: 1,
            steps: [
                `A ＋ A ＝ 2 × A ＝ ${ans}`,
                `A ＝ ${ans} ÷ 2 ＝ ${val}`
            ]
        };
    }
});
