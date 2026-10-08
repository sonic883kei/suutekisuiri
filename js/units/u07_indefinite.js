/**
 * u07_indefinite.js  —  ⑦ 不定方程式
 * 3パターン（過去問の型）:
 *   Lv.1 値の求め方    … 3種類の硬貨で合計金額 M 円・合計 N 枚 → ある硬貨の枚数（2010 裁判所事務官Ⅲ種）
 *   Lv.2 3文字1式・A   … 3種類の定食の値段と合計金額、いずれも1食以上 → ある定食の人数（2016 裁判所一般職 高卒者区分）
 *   Lv.3 3文字2式・B   … 2つの倍数関係と「1以上100未満の整数」→ 3本の棒の長さの和（2016 海上保安学校 特別募集）
 * いずれも「解が1組に決まる」ことを総当たりで確かめた数値だけを出題する。
 * generate(level): level が 1〜3 ならそのパターン、それ以外は3パターンからランダム。
 */
UnitRegistry.register({
    id: 'u7', name: '⑦ 不定方程式', chap: 1,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        if (lv === 1) return indefCoins();
        if (lv === 2) return indefMeals();
        return indefSticks();
    }
});

// ---- Lv.1 値の求め方（硬貨の枚数）----
function indefCoins() {
    const sets = [[10, 50, 500], [10, 50, 500], [10, 50, 500], [10, 100, 500], [5, 50, 500], [10, 50, 100], [1, 10, 100], [5, 50, 100]];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const [d1, d2, d3] = getRandomChoice(sets);
        const x = getRandomInt(2, 14), y = getRandomInt(1, 10), z = getRandomInt(1, 5), N = x + y + z;
        if (N < 12 || N > 30) continue;
        const M = d1 * x + d2 * y + d3 * z;
        let cnt = 0;                                                          // 条件を満たす (x,y,z) が1組だけか確認
        for (let a = 1; a <= N - 2 && cnt < 2; a++) for (let b = 1; b <= N - a - 1; b++) { const c = N - a - b; if (d1 * a + d2 * b + d3 * c === M) cnt++; }
        if (cnt === 1) q = { d: [d1, d2, d3], c: [x, y, z], N, M };
    }
    if (!q) q = { d: [10, 50, 500], c: [11, 8, 3], N: 22, M: 2010 };
    const { d, c, N, M } = q, ti = getRandomInt(0, 2);
    // 解説: x を消去して  A y ＋ B z ＝ C  を作り、z を 1,2,… と調べる
    const A0 = d[1] - d[0], B0 = d[2] - d[0], C0 = M - d[0] * N, g = Fr.gcd(Fr.gcd(A0, B0), C0), A = A0 / g, B = B0 / g, C = C0 / g;
    const cand = [];
    for (let z = 1; B * z < C; z++) if ((C - B * z) % A === 0) { const y = (C - B * z) / A, x = N - y - z; cand.push({ z, y, x, ok: y >= 1 && x >= 1 }); }
    return {
        unit: '⑦ 不定方程式', title: '値の求め方',
        text: `${d[0]} 円玉、${d[1]} 円玉、${d[2]} 円玉をそれぞれ何枚かずつ用いて ${M} 円にしたい。硬貨の枚数が全部で ${N} 枚あるとする。`,
        prompt: `このとき、${d[ti]} 円玉は何枚あるか。`,
        correctAnswer: c[ti], unitSuffix: '枚', step: 1, consecutive: true,
        steps: [
            `${d[0]} 円玉、${d[1]} 円玉、${d[2]} 円玉の枚数を x、y、z 枚（どれも 1 以上）とすると、x ＋ y ＋ z ＝ ${N} …①、${d[0]}x ＋ ${d[1]}y ＋ ${d[2]}z ＝ ${M} …②`,
            `② － ① × ${d[0]} で x を消すと、${A0}y ＋ ${B0}z ＝ ${C0}　⇒　${g === 1 ? '' : `${g} で割って `}${A}y ＋ ${B}z ＝ ${C}`,
            `z ＝ 1、2、… と調べ、y が整数になるもの: ${cand.map(k => `z ＝ ${k.z} のとき y ＝ ${k.y}（x ＝ ${N} － ${k.y} － ${k.z} ＝ ${k.x}${k.ok ? '、条件に合う' : '、1 未満で不適'}）`).join('／')}`,
            `x ＝ ${c[0]}、y ＝ ${c[1]}、z ＝ ${c[2]}（検算: ${d[0]} × ${c[0]} ＋ ${d[1]} × ${c[1]} ＋ ${d[2]} × ${c[2]} ＝ ${M}）　⇒　${d[ti]} 円玉は ${c[ti]} 枚`
        ]
    };
}

// ---- Lv.2 3文字1式・A（3種類の定食）----
function indefMeals() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const p = shuffleArray([...new Set(Array.from({ length: 6 }, () => 20 * getRandomInt(14, 35)))]).slice(0, 3);
        if (p.length < 3) continue;
        const c = [getRandomInt(1, 6), getRandomInt(1, 6), getRandomInt(1, 6)], n = c[0] + c[1] + c[2];
        if (n < 6 || n > 14) continue;
        const M = p[0] * c[0] + p[1] * c[1] + p[2] * c[2], sols = [];
        const maxA = Math.floor(M / p[0]), maxB = Math.floor(M / p[1]);
        for (let a = 1; a <= maxA; a++) for (let b = 1; b <= maxB; b++) {
            const r = M - p[0] * a - p[1] * b;
            if (r >= p[2] && r % p[2] === 0) sols.push([a, b, r / p[2]]);
        }
        if (sols.length === 1) q = { p, c, M };
    }
    if (!q) q = { p: [480, 440, 360], c: [2, 3, 4], M: 3720 };
    const { p, c, M } = q, L = ['A', 'B', 'C'], l = ['a', 'b', 'c'], ti = getRandomInt(0, 2);
    const g = Fr.gcd(Fr.gcd(p[0], p[1]), Fr.gcd(p[2], M)), qs = p.map(v => v / g), Mq = M / g;
    const big = qs.indexOf(Math.max(...qs)), oth = [0, 1, 2].filter(k => k !== big);
    const lines = [];
    for (let v = 1; Mq - qs[big] * v >= qs[oth[0]] + qs[oth[1]]; v++) {   // 最も高い定食の人数 v を 1 から調べる
        const R = Mq - qs[big] * v, found = [];
        for (let a = 1; qs[oth[0]] * a < R; a++) { const rest = R - qs[oth[0]] * a; if (rest >= qs[oth[1]] && rest % qs[oth[1]] === 0) found.push(`${l[oth[0]]} ＝ ${a}・${l[oth[1]]} ＝ ${rest / qs[oth[1]]}`); }
        lines.push(`${l[big]} ＝ ${v}: ${qs[oth[0]]}${l[oth[0]]} ＋ ${qs[oth[1]]}${l[oth[1]]} ＝ ${R} → ${found.length ? found.join('、') : '整数解なし'}`);
    }
    return {
        unit: '⑦ 不定方程式', title: '3文字1式・A',
        text: `ある食堂には、A定食、B定食、C定食の 3 種類の定食があり、それぞれの値段は、${p[0]} 円、${p[1]} 円、${p[2]} 円である。この食堂で、太郎と何人かの友達が 3 種類の定食のいずれかを一人 1 食注文したところ、合計金額が ${M.toLocaleString()} 円であった。3 種類の定食は、いずれも最低 1 食は注文された。`,
        prompt: `このとき、${L[ti]}定食を注文した人は何人か。`,
        correctAnswer: c[ti], unitSuffix: '人', step: 1, consecutive: true,
        steps: [
            `A、B、C定食の人数を a、b、c 人（どれも 1 以上）とすると、${p[0]}a ＋ ${p[1]}b ＋ ${p[2]}c ＝ ${M}${g === 1 ? '' : `　⇒　${g} で割って ${qs[0]}a ＋ ${qs[1]}b ＋ ${qs[2]}c ＝ ${Mq}`}`,
            `値段の最も高い ${L[big]}定食の人数 ${l[big]} を 1 から順に調べる（残りの 2 つも 1 以上）。${lines.join('／')}`,
            `条件に合うのは a ＝ ${c[0]}、b ＝ ${c[1]}、c ＝ ${c[2]} だけ（検算: ${p[0]} × ${c[0]} ＋ ${p[1]} × ${c[1]} ＋ ${p[2]} × ${c[2]} ＝ ${M}）`,
            `${L[ti]}定食を注文した人は ${c[ti]} 人`
        ]
    };
}

// ---- Lv.3 3文字2式・B（棒の長さ：倍数関係と「1以上100未満の整数」）----
function indefSticks() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const r = getRandomInt(2, 99), s = getRandomInt(2, 99), t = getRandomInt(2, 99);
        if (Math.max(r, s, t) < 50 || Fr.gcd(Fr.gcd(r, s), t) !== 1) continue;      // 最大が 50 以上なら 1 倍だけが条件に合う（解が1組）
        const g1 = Fr.gcd(r, s), g2 = Fr.gcd(s, t), a = s / g1, b = r / g1, c = s / g2, d = t / g2;
        if (a < 2 || b < 2 || c < 2 || d < 2 || Math.max(a, b, c, d) > 30) continue;
        q = { r, s, t, a, b, c, d };
    }
    if (!q) q = { r: 35, s: 91, t: 65, a: 13, b: 5, c: 7, d: 5 };
    const { r, s, t, a, b, c, d } = q, names = shuffleArray(['赤色', '青色', '黄色', '緑色', '白色']).slice(0, 3), L = lcmOf(a, c);
    function lcmOf(x, y) { return (x / Fr.gcd(x, y)) * y; }
    return {
        unit: '⑦ 不定方程式', title: '3文字2式・B',
        text: `${names[0]}、${names[1]}、${names[2]}の棒が 1 本ずつ合計 3 本ある。これらの棒の長さについて次のことが分かっている。\n○ ${names[0]}の棒の長さの ${a} 倍は、${names[1]}の棒の長さの ${b} 倍と等しい。\n○ ${names[1]}の棒の長さの${Fr.str(Fr.make(1, c))}倍は、${names[2]}の棒の長さの${Fr.str(Fr.make(1, d))}倍と等しい。\n○ 3 本の棒の長さは、いずれも 1 以上 100 未満の整数値である。`,
        prompt: 'このとき、3 本の棒の長さの和はいくらか。',
        correctAnswer: r + s + t, unitSuffix: '', step: 5, consecutive: true,
        steps: [
            `${names[0]}、${names[1]}、${names[2]}の棒の長さを R、B、Y とすると、${a}R ＝ ${b}B　⇒　R ＝ ${Fr.str(Fr.make(b, a))}B`,
            `${Fr.str(Fr.make(1, c))}B ＝ ${Fr.str(Fr.make(1, d))}Y　⇒　Y ＝ ${Fr.str(Fr.make(d, c))}B`,
            `R、Y が整数になるには、B が ${a} と ${c} の公倍数でなければならない。最小公倍数は ${L} なので B ＝ ${L}m（m は整数）`,
            `すると R ＝ ${r}m、B ＝ ${s}m、Y ＝ ${t}m。どれも 100 未満なので m ＝ 1（m ＝ 2 だと ${Math.max(r, s, t) * 2} になり 100 以上）`,
            `R ＝ ${r}、B ＝ ${s}、Y ＝ ${t}　⇒　3 本の棒の長さの和 ＝ ${r} ＋ ${s} ＋ ${t} ＝ ${r + s + t}`
        ]
    };
}
