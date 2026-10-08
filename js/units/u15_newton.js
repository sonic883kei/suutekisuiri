/**
 * u15_newton.js  —  ⑮ ニュートン算
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u15', name: '⑮ ニュートン算', chap: 1,
    generate(level) {
        const inRate = getRandomInt(3, 8);
        const outRate = inRate + getRandomInt(5, 12);
        const minutes = getRandomInt(3, 10);
        const initWater = (outRate - inRate) * minutes;
        return {
            unit: '⑮ ニュートン算', title: '水そうの汲み出し',
            text: `水そうに最初 ${initWater}L の水が入っており、毎分 ${inRate}L の割合で水が注がれています。ポンプを使うと毎分 ${outRate}L 汲み出すことができます。`,
            prompt: 'この水そうを空にするのに何分かかりますか？',
            correctAnswer: minutes, unitSuffix: '分', step: 1,
            steps: [
                `1分あたり実際に減る水の量 ＝ 汲み出し(${outRate}L) － 流入(${inRate}L) ＝ ${outRate - inRate}L/分`,
                `空になるまでの時間 ＝ 初期水量 ${initWater}L ÷ ${outRate - inRate}L/分 ＝ ${minutes} 分`
            ]
        };
    }
});
