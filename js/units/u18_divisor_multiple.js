/**
 * u18_divisor_multiple.js  —  ⑱ 約数・倍数
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u18', name: '⑱ 約数・倍数', chap: 2,
    generate(level) {
        const list = [
            { a: 12, b: 18, lcm: 36 },
            { a: 15, b: 20, lcm: 60 },
            { a: 8, b: 12, lcm: 24 },
            { a: 14, b: 21, lcm: 42 },
            { a: 16, b: 24, lcm: 48 }
        ];
        const item = getRandomChoice(list);
        return {
            unit: '⑱ 約数・倍数', title: '最小公倍数',
            text: `2つの整数 ${item.a} と ${item.b} があります。`,
            prompt: `この2つの数の「最小公倍数」はいくらですか？`,
            correctAnswer: item.lcm, unitSuffix: '', step: 4,
            steps: [
                `${item.a} の倍数: ${item.a}, ${item.a*2}, ${item.a*3}...`,
                `${item.b} の倍数: ${item.b}, ${item.b*2}, ${item.b*3}...`,
                `最も小さい共通の倍数 ＝ ${item.lcm}`
            ]
        };
    }
});
