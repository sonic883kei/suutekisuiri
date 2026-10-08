/**
 * u23_quantity_other.js  —  ㉓ その他の数量
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u23', name: '㉓ その他の数量', chap: 2,
    generate(level) {
        const trees = getRandomInt(6, 12);
        const dist = getRandomInt(4, 10);
        const totalDist = (trees - 1) * dist;
        return {
            unit: '㉓ その他の数量', title: '植木算',
            text: `まっすぐな道路の片側に、${dist}m おきに ${trees} 本の木を端から端まで植えました。`,
            prompt: '最初から最後の木までの全体の長さは何 m ですか？',
            correctAnswer: totalDist, unitSuffix: 'm', step: 2,
            steps: [
                `木の間の数 ＝ 本数 － 1 ＝ ${trees} － 1 ＝ ${trees - 1} 箇所`,
                `全体の長さ ＝ ${dist}m × ${trees - 1} ＝ ${totalDist} m`
            ]
        };
    }
});
