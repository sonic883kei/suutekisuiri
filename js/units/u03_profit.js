/**
 * u03_profit.js  —  ③ 売買損益
 * 4パターン（過去問の型）:
 *   Lv.1 定価と原価の関係                    … 定価の a％引きで売って原価の b％の利益 → 定価は原価の何％増しか（刑務官）
 *   Lv.2 個数を考慮した売買                  … 1個 c 円で仕入れ s 円で売り、r 個売れ残って利益 P 円 → 仕入れた個数
 *   Lv.3 個数を考慮した売買(売上が数種類)    … 仕入れ価格の p1 割増し・p2 割増しで販売、w 個廃棄で利益 P 円 → 全部を p3 割増しで売った利益（東京消防庁Ⅱ類）
 *   Lv.4 個数を考慮した売買・B(売れ残りがある場合) … a％が売れた時点から定価の d％引きで販売、u％が売れ残り → 売上額は全部を定価で売った額の何％か
 * いずれも「答えが整数になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜4 ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u3', name: '③ 売買損益', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        if (lv === 1) return profitListPrice();
        if (lv === 2) return profitQuantity();
        if (lv === 3) return profitMultiPrice();
        return profitLeftover();
    }
});

const profitYen = (v) => v.toLocaleString();
const profitNiceStep = (ans) => Math.max(100, Math.round(ans * 0.05 / 100) * 100);   // 選択肢の間隔（例: 6,000円 → 300円刻み）

// ---- Lv.1 定価と原価の関係 ----
function profitListPrice() {
    let a, b, up;
    for (let i = 0; i < 5000; i++) {
        a = 5 * getRandomInt(1, 12);                                // 定価の a％引き（5〜60％）
        b = getRandomInt(1, 60);                                    // 原価の b％の利益
        if (((100 + b) * 100) % (100 - a) !== 0) continue;
        up = ((100 + b) * 100) / (100 - a) - 100;                   // 定価は原価の up％増し
        if (up >= 10 && up <= 150) break;
        up = null;
    }
    if (!up) { a = 20; b = 20; up = 50; }
    const uri = (a % 10 === 0 && getRand() < 0.4) ? `${a / 10} 割引き` : `${a}％引き`;
    const urigaku = 100 + b, teika = (urigaku * 100) / (100 - a);
    return {
        unit: '③ 売買損益', title: '定価と原価の関係',
        text: `ある商品をその定価の ${uri}で売ったときに、原価の ${b}％の利益となるように定価を設定したい。`,
        prompt: 'このとき、定価は原価の何％増しとなるか。',
        correctAnswer: up, unitSuffix: '％', step: 1,
        steps: [
            `原価を 100 とすると、原価の ${b}％の利益が出る売値は 100 ＋ ${b} ＝ ${urigaku}`,
            `売値は定価の ${100 - a}％にあたるので、定価 × ${(100 - a) / 100} ＝ ${urigaku}　⇒　定価 ＝ ${urigaku} ÷ ${(100 - a) / 100} ＝ ${teika}`,
            `定価 ${teika} は原価 100 の ${teika / 100} 倍なので、原価の ${up}％増し`
        ]
    };
}

// ---- Lv.2 個数を考慮した売買（売れ残りあり・利益から個数を求める）----
function profitQuantity() {
    let c, s, n, r, P;
    for (let i = 0; i < 20000; i++) {
        c = 2 * getRandomInt(10, 45); s = c + 2 * getRandomInt(5, 20);   // 偶数の価格（例: 42円→70円）
        n = 5 * getRandomInt(20, 40); r = 5 * getRandomInt(1, 4);
        P = (s - c) * n - s * r;
        if (P >= 1000 && P % 100 === 0) break;
        P = null;
    }
    if (!P) { c = 42; s = 70; n = 150; r = 10; P = 3500; }
    return {
        unit: '③ 売買損益', title: '個数を考慮した売買',
        text: `品物を 1 個 ${c} 円で何個か仕入れ、1 個 ${s} 円で売り出したところ、${r} 個売れ残ってしまったが、${profitYen(P)} 円の利益があった。`,
        prompt: '仕入れた品物は何個だったか。',
        correctAnswer: n, unitSuffix: '個', step: 5, consecutive: true,
        steps: [
            `仕入れた個数を x 個とすると、売れた個数は (x － ${r}) 個`,
            `利益 ＝ 売上 － 仕入れ値 より、${s}(x － ${r}) － ${c}x ＝ ${profitYen(P)}`,
            `${s}x － ${s * r} － ${c}x ＝ ${profitYen(P)}　⇒　${s - c}x ＝ ${profitYen(P + s * r)}　⇒　x ＝ ${n} 個`
        ]
    };
}

// ---- Lv.3 個数を考慮した売買（売上が数種類ある場合）----
function profitMultiPrice() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const f = getRandomChoice([1, 1, 2]), n = 100 * f;
        const n1 = 10 * f * getRandomInt(4, 7), n2 = 10 * f * getRandomInt(2, 4), w = n - n1 - n2;
        if (w < 10 * f || w > 20 * f) continue;
        const p1 = getRandomInt(3, 5), p2 = getRandomInt(1, 2), p3 = getRandomInt(1, 4);
        const c = 50 * getRandomInt(2, 12);
        const k = n1 * p1 + n2 * p2 - 10 * w;                     // 利益 ＝ c × k ÷ 10
        if (k <= 0) continue;
        const P = (c * k) / 10, ans = (c * n * p3) / 10;
        if (!Number.isInteger(P) || P % 100 !== 0 || ans % 100 !== 0) continue;
        q = { n, n1, n2, w, p1, p2, p3, c, k, P, ans };
    }
    if (!q) q = { n: 100, n1: 60, n2: 30, w: 10, p1: 3, p2: 1, p3: 2, c: 300, k: 110, P: 3300, ans: 6000 };
    const { n, n1, n2, w, p1, p2, p3, c, k, P, ans } = q;
    const r1 = (10 + p1) / 10, r2 = (10 + p2) / 10;
    const sales = n1 * (10 + p1) + n2 * (10 + p2);               // 売上は x × sales ÷ 10
    return {
        unit: '③ 売買損益', title: '個数を考慮した売買（売上が数種類ある場合）',
        text: `ある商品 ${n} 個を、仕入れ価格の ${p1} 割増しで ${n1} 個、${p2} 割増しで ${n2} 個売り、${w} 個を廃棄したときの利益は ${profitYen(P)} 円であった。`,
        prompt: `このとき、${n} 個すべてを仕入れ価格の ${p3} 割増しで売った場合の利益として、最も妥当なのはどれか。`,
        correctAnswer: ans, unitSuffix: '円', step: profitNiceStep(ans),
        steps: [
            `仕入れ価格を 1 個 x 円とすると、仕入れ総額は ${n}x 円`,
            `売上 ＝ ${r1}x × ${n1} ＋ ${r2}x × ${n2} ＝ ${Number((sales / 10).toFixed(2))}x 円（廃棄した ${w} 個は売上 0）`,
            `利益 ＝ ${Number((sales / 10).toFixed(2))}x － ${n}x ＝ ${Number((k / 10).toFixed(2))}x ＝ ${profitYen(P)}　⇒　x ＝ ${c} 円`,
            `${n} 個すべてを ${p3} 割増しで売ると、利益 ＝ ${p3 / 10}x × ${n} ＝ ${p3 / 10} × ${c} × ${n} ＝ ${profitYen(ans)} 円`
        ]
    };
}

// ---- Lv.4 個数を考慮した売買・B（売れ残りがある場合：売上額が定価販売の何％か）----
function profitLeftover() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const a = 5 * getRandomInt(6, 14);                       // 定価で売れた割合（30〜70％）
        const u = 5 * getRandomInt(2, 6);                        // 売れ残った割合（10〜30％）
        const d = 5 * getRandomInt(2, 8);                        // 途中からの値引き率（10〜40％）
        const m = 100 - a - u;                                   // 値引き後に売れた割合
        if (m < 10 || (m * (100 - d)) % 100 !== 0) continue;
        q = { a, u, d, m, disc: (m * (100 - d)) / 100 };
    }
    if (!q) q = { a: 55, u: 20, d: 20, m: 25, disc: 20 };
    const { a, u, d, m, disc } = q;
    const ans = a + disc;
    const dText = (d % 10 === 0 && getRand() < 0.4) ? `${d / 10} 割引き` : `${d}％引き`;
    return {
        unit: '③ 売買損益', title: '個数を考慮した売買・B（売れ残りがある場合）',
        text: `ある商品を多数仕入れて、はじめは定価で販売していたが、この商品の ${a}％が売れた時点から定価の ${dText}で販売した。現時点では、この商品の ${u}％が売れずに残っている。`,
        prompt: '現時点のこの商品の売上額は、すべての商品を定価で販売したときの額の何％に相当するか。',
        correctAnswer: ans, unitSuffix: '％', step: 1,
        steps: [
            `仕入れた商品を全部で 100 個、定価を 1 個 1 とすると、すべて定価で売ったときの額は 100`,
            `定価で売れたのは ${a} 個 → 売上 ${a}`,
            `売れ残りが ${u} 個なので、値引き後に売れたのは 100 － ${a} － ${u} ＝ ${m} 個`,
            `値引き後の価格は定価の ${100 - d}％ ＝ ${(100 - d) / 100} なので、売上 ${m} × ${(100 - d) / 100} ＝ ${disc}`,
            `現時点の売上額: ${a} ＋ ${disc} ＝ ${ans}　⇒　定価で売ったときの額 100 の ${ans}％`
        ]
    };
}
