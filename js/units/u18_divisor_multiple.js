/**
 * u18_divisor_multiple.js  —  ⑱ 約数・倍数
 * 7パターン（過去問の型）:
 *   Lv.1 最小公倍数                 … a で割っても b で割っても余りが r となる 3 けたの自然数を c で割った余り（2012 特別区Ⅲ類）
 *   Lv.2 最大公約数                 … 3つの数をある 2 桁の自然数で割ったら余りが同じ → その自然数（2015 東京消防庁Ⅲ類）
 *   Lv.3 割る数と余り（1）           … 2 桁の自然数を a で割ると ra 余り、b で割ると rb 余る → 一の位（2014 警視庁警察官Ⅲ類 第2回）
 *   Lv.4 割る数と余り（2）           … 2 桁の自然数を 3 つの数で割った余りから → 別の数で割った余り
 *   Lv.5 素因数分解と約数の個数       … ある数の約数のすべての個数（2007 特別区Ⅲ類）
 *   Lv.6 最小公倍数と最大公約数・B    … 最大公約数・最小公倍数・差から → 2数の和（2014 特別区 障害者対象）
 *   Lv.7 素因数分解・B              … AB × p ＝ q × BA を満たす A、B（各辺の積が最大のもの）の和（2011 海上保安学校など）
 * いずれも「答えが一意に決まる条件」を確かめた数値だけを出題する。
 * generate(level): level が 1〜7 ならそのパターン、それ以外は7パターンからランダム。
 */
UnitRegistry.register({
    id: 'u18', name: '⑱ 約数・倍数', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4, 5, 6, 7].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 7);
        return [divLcmQ, divGcdQ, divRemainder1, divRemainder2, divCount, divGcdLcm, divDigits][lv - 1]();
    }
});

const divLabels = ['①', '②', '③', '④', '⑤'];
const divLcm = (a, b) => (a / Fr.gcd(a, b)) * b;
const divSup = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷' };
// 値 lo〜hi の範囲から、正解を含む連続する5つの値の5択（unit は単位、正解の位置はランダム）
function divWindow(correct, lo, hi, unit) {
    const startMin = Math.max(lo, correct - 4), startMax = Math.min(correct, hi - 4), start = getRandomInt(startMin, Math.max(startMin, startMax));
    return [0, 1, 2, 3, 4].map(i => { const v = start + i; return { value: v, label: divLabels[i], htmlText: `${divLabels[i]} ${v}${unit ? ' ' + unit : ''}`, isCorrect: v === correct }; });
}
// 正解と誤答候補（値）から昇順の5択
function divChoices(correct, wrongs, unit) {
    const seen = new Set([correct]), pool = [];
    for (const w of shuffleArray(wrongs)) { if (w > 0 && !seen.has(w)) { seen.add(w); pool.push(w); } if (pool.length === 4) break; }
    return [correct, ...pool].sort((x, y) => x - y).map((v, i) => ({ value: v, label: divLabels[i], htmlText: `${divLabels[i]} ${v}${unit ? ' ' + unit : ''}`, isCorrect: v === correct }));
}
function divFactor(n) { const out = []; let x = n; for (let p = 2; p * p <= x; p++) { let e = 0; while (x % p === 0) { x /= p; e++; } if (e) out.push([p, e]); } if (x > 1) out.push([x, 1]); return out; }
const divFactorStr = (n) => divFactor(n).map(([p, e]) => `${p}${e > 1 ? (divSup[e] || `^${e}`) : ''}`).join(' × ');

// ---- Lv.1 最小公倍数 ----
function divLcmQ() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const a = getRandomInt(20, 90), b = getRandomInt(20, 90);
        if (a === b || Fr.gcd(a, b) < 2) continue;
        const L = divLcm(a, b), r = getRandomInt(3, Math.min(a, b) - 1);
        if (L < 500 || L + r > 999) continue;                          // 3 けたの解は L ＋ r の 1 つだけ
        const N = L + r, c = getRandomChoice([11, 13, 17, 19, 23]), rem = N % c;
        q = { a, b, L, r, N, c, rem };
    }
    if (!q) q = { a: 56, b: 44, L: 616, r: 12, N: 628, c: 19, rem: 1 };
    const { a, b, L, r, N, c, rem } = q, fa = divFactorStr(a), fb = divFactorStr(b);
    return {
        unit: '⑱ 約数・倍数', title: '最小公倍数',
        text: `${a} で割っても ${b} で割っても余りが ${r} となる 3 けたの自然数がある。`,
        prompt: `この自然数を ${c} で割ったときの余りはどれか。`,
        correctAnswer: rem, allowZero: true, customChoices: divWindow(rem, 0, c - 1, ''),
        steps: [
            `この自然数から余り ${r} をひいた数は、${a} でも ${b} でも割り切れる（${a} と ${b} の公倍数）`,
            `${a} ＝ ${fa}、${b} ＝ ${fb} より、最小公倍数は ${L}。公倍数は ${L} の倍数なので、この自然数は ${L}k ＋ ${r}（k は整数）`,
            `3 けたになるのは k ＝ 1 のときだけ（k ＝ 0 だと ${r}、k ＝ 2 だと ${2 * L + r}）なので、この自然数は ${L} ＋ ${r} ＝ ${N}`,
            `${N} ÷ ${c} ＝ ${Math.floor(N / c)} あまり ${rem}`
        ]
    };
}

// ---- Lv.2 最大公約数 ----
function divGcdQ() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const M = getRandomInt(30, 99), r = getRandomInt(5, M - 1), ks = [getRandomInt(2, 30), getRandomInt(2, 30), getRandomInt(2, 30)].sort((x, y) => x - y);
        if (new Set(ks).size < 3) continue;
        const gk = Fr.gcd(Fr.gcd(ks[0], ks[1]), ks[2]), xs = ks.map(k => k * M + r), G = M * gk;
        let cnt = 0; for (let d = Math.max(10, r + 1); d <= 99; d++) if (xs.every(x => x % d === r)) cnt++;
        if (cnt === 1 && G <= 400 && xs[2] <= 3000) q = { M, r, xs, G, gk, diffs: xs.map(x => x - r) };
    }
    if (!q) q = { M: 63, r: 60, xs: [564, 1194, 1698], G: 126, gk: 2, diffs: [504, 1134, 1638] };
    const { M, r, xs, G, diffs } = q, divs = []; for (let d = 1; d <= G; d++) if (G % d === 0 && d >= 10 && d <= 99) divs.push(d);
    return {
        unit: '⑱ 約数・倍数', title: '最大公約数',
        text: `${xs.join('、')} をある 2 桁の自然数で割ったら、どれも余りが ${r} となった。`,
        prompt: 'ある 2 桁の自然数として、最も妥当なのはどれか。',
        correctAnswer: M, unitSuffix: '', step: 1, consecutive: true,
        steps: [
            `どれも余りが ${r} なので、余りをひいた ${xs.map(x => x - r).join('、')} は、ある 2 桁の自然数で割り切れる`,
            `${diffs.map(d => `${d} ＝ ${divFactorStr(d)}`).join('、')}　⇒　最大公約数は ${G}（${divFactorStr(G)}）。割り切れる数は ${G} の約数`,
            `${G} の約数のうち 2 桁のものは ${divs.join('、')}。余り ${r} より大きくなければならない（割る数 ＞ 余り）ので ${M}`
        ]
    };
}

// ---- Lv.3 割る数と余り（1）----
function divRemainder1() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const a = getRandomInt(3, 13), b = getRandomInt(3, 13);
        if (a === b || Fr.gcd(a, b) !== 1) continue;
        const N = getRandomInt(10, 99), ra = N % a, rb = N % b;
        if (ra < 1 || rb < 1) continue;
        let cnt = 0; for (let x = 10; x <= 99; x++) if (x % a === ra && x % b === rb) cnt++;
        if (cnt === 1) q = { a, b, N, ra, rb };
    }
    if (!q) q = { a: 7, b: 9, N: 61, ra: 5, rb: 7 };
    const { a, b, N, ra, rb } = q, d = N % 10, L = a * b;
    // 「割る数 － 余り」が同じなら 解説は「公倍数 － その差」で解く
    const same = a - ra === b - rb, k = a - ra;
    return {
        unit: '⑱ 約数・倍数', title: '割る数と余り（1）',
        text: `2 桁の自然数があり、これを ${a} で割ると ${ra} が余り、${b} で割ると ${rb} が余る。`,
        prompt: 'この自然数の一の位として、正しいのはどれか。',
        correctAnswer: d, allowZero: true, customChoices: divWindow(d, 0, 9, ''),
        steps: same ? [
            `${a} で割ると ${ra} 余る ＝ あと ${a - ra} 足せば ${a} で割り切れる、${b} で割ると ${rb} 余る ＝ あと ${b - rb} 足せば ${b} で割り切れる`,
            `どちらも ${k} 足せば割り切れるので、この自然数に ${k} を足した数は ${a} と ${b} の公倍数。最小公倍数は ${L}`,
            `この自然数 ＝ ${L}m － ${k}。2 桁になるのは ${L} － ${k} ＝ ${N}（次は ${2 * L - k}）`,
            `一の位は ${d}`
        ] : [
            `この自然数を N とする。N ＝ ${a}x ＋ ${ra} ＝ ${b}y ＋ ${rb} と表せる`,
            `${a} で割ると ${ra} 余る 2 桁の数を小さい順に書き出し、${b} で割った余りを（　）に示す: ${(() => { const out = []; for (let x = ra; x <= N; x += a) if (x >= 10) out.push(`${x}（${x % b}）`); return out.join('、'); })()}`,
            `${b} で割った余りが ${rb} になるのは ${N}（${a} と ${b} は互いに素なので、条件を満たす数は ${L} ごとに現れ、2 桁では ${N} だけ）`,
            `${N} ÷ ${a} ＝ ${Math.floor(N / a)} あまり ${ra}、${N} ÷ ${b} ＝ ${Math.floor(N / b)} あまり ${rb}　⇒　一の位は ${d}`
        ]
    };
}

// ---- Lv.4 割る数と余り（2）----
function divRemainder2() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const ms = shuffleArray([3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort((x, y) => x - y), L = divLcm(divLcm(ms[0], ms[1]), ms[2]);
        if (L > 200) continue;
        const ds = []; for (let d = 4; d <= 12; d++) if (L % d === 0 && !ms.includes(d)) ds.push(d);
        if (ds.length === 0) continue;
        const d = getRandomChoice(ds), N = getRandomInt(10, 99), rs = ms.map(m => N % m);
        if (rs.some(r => r < 1)) continue;
        if (ms[0] - rs[0] === ms[1] - rs[1] && ms[1] - rs[1] === ms[2] - rs[2]) continue;     // 「割る数－余り」が一定なら別の型なので除く
        q = { ms, rs, L, d, N, rem: N % d };
    }
    if (!q) q = { ms: [3, 4, 5], rs: [1, 2, 4], L: 60, d: 6, N: 34, rem: 4 };
    const { ms, rs, L, d, N, rem } = q, sols = []; for (let x = 10; x <= 99; x++) if (ms.every((m, i) => x % m === rs[i])) sols.push(x);
    return {
        unit: '⑱ 約数・倍数', title: '割る数と余り（2）',
        text: `2 桁の自然数があり、これを ${ms[0]} で割ると ${rs[0]} 余り、${ms[1]} で割ると ${rs[1]} 余り、${ms[2]} で割ると ${rs[2]} 余る。`,
        prompt: `この自然数を ${d} で割ったときの余りはいくつか。`,
        correctAnswer: rem, allowZero: true, customChoices: divWindow(rem, 0, d - 1, ''),
        steps: [
            `${ms[0]}、${ms[1]}、${ms[2]} の最小公倍数は ${L}。条件を満たす自然数は ${L} ごとに現れる`,
            `2 桁の範囲で ${ms[0]} で割ると ${rs[0]} 余る数を順に調べ、残りの条件も満たすものを探すと ${sols.join('、')}`,
            `${d} は ${L} の約数なので、${L} ごとに現れる数を ${d} で割った余りはすべて同じ。${sols[0]} ÷ ${d} ＝ ${Math.floor(sols[0] / d)} あまり ${sols[0] % d}`,
            `余りは ${rem}`
        ]
    };
}

// ---- Lv.5 素因数分解と約数の個数 ----
function divCount() {
    const primes = [2, 3, 5, 7, 11, 13];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const k = getRandomChoice([2, 3, 3, 3]), ps = shuffleArray(primes).slice(0, k).sort((x, y) => x - y), es = ps.map(() => getRandomInt(1, 4));
        const N = ps.reduce((acc, p, j) => acc * p ** es[j], 1), cnt = es.reduce((acc, e) => acc * (e + 1), 1);
        if (N >= 200 && N <= 30000 && cnt >= 12 && cnt <= 60) q = { N, ps, es, cnt };
    }
    if (!q) q = { N: 4725, ps: [3, 5, 7], es: [3, 2, 1], cnt: 24 };
    const { N, ps, es, cnt } = q, wrongs = [];
    for (let j = 0; j < es.length; j++) for (const dlt of [-1, 1]) { const e2 = es.slice(); e2[j] += dlt; if (e2[j] >= 1) wrongs.push(e2.reduce((acc, e) => acc * (e + 1), 1)); }
    wrongs.push(es.reduce((acc, e) => acc * e, 1) * 2, cnt + 6, cnt - 6, cnt + 12, cnt - 12);
    let x = N; const chain = [];
    for (let j = 0; j < ps.length; j++) for (let t = 0; t < es[j]; t++) { chain.push(`${x} ÷ ${ps[j]} ＝ ${x / ps[j]}`); x /= ps[j]; }
    return {
        unit: '⑱ 約数・倍数', title: '素因数分解と約数の個数',
        text: `${N} の約数について考える。`,
        prompt: '約数のすべての個数はどれか。',
        correctAnswer: cnt, customChoices: divChoices(cnt, wrongs, '個'),
        steps: [
            `${N} を小さい素数から順に割っていく（素因数分解）: ${chain.join('、')}`,
            `${N} ＝ ${divFactorStr(N)}`,
            `約数の個数は、各素数の指数に 1 を足してかけ合わせる: ${es.map(e => `(${e} ＋ 1)`).join(' × ')} ＝ ${cnt} 個`
        ]
    };
}

// ---- Lv.6 最小公倍数と最大公約数・B ----
function divGcdLcm() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const g = getRandomInt(2, 12), b = getRandomInt(2, 12), a = b + getRandomInt(1, 6);
        if (Fr.gcd(a, b) !== 1 || a * b > 130) continue;
        q = { g, a, b, L: g * a * b, diff: g * (a - b), A: g * a, B: g * b, sum: g * (a + b) };
    }
    if (!q) q = { g: 3, a: 7, b: 5, L: 105, diff: 6, A: 21, B: 15, sum: 36 };
    const { g, a, b, L, diff, A, B, sum } = q, ab = a * b, wrongs = [A, B, g * (ab + 1), ab, 2 * sum, sum + g, sum - g, sum + 2 * g];
    for (let d = 1; d * d <= ab; d++) if (ab % d === 0 && !(d === b && ab / d === a)) wrongs.push(g * (d + ab / d));
    return {
        unit: '⑱ 約数・倍数', title: '最小公倍数と最大公約数・B',
        text: `ある自然数A、Bは最大公約数が ${g} で、最小公倍数が ${L} で、AはBより ${diff} 大きい。`,
        prompt: 'AとBの和はどれか。',
        correctAnswer: sum, customChoices: divChoices(sum, wrongs, ''),
        steps: [
            `最大公約数が ${g} なので、A ＝ ${g}a、B ＝ ${g}b（a、b は互いに素な自然数）と表せる`,
            `最小公倍数 ＝ ${g} × a × b ＝ ${L}　⇒　ab ＝ ${L / g}`,
            `A － B ＝ ${g}(a － b) ＝ ${diff}　⇒　a － b ＝ ${diff / g}。積が ${ab}、差が ${a - b} になる互いに素な数は a ＝ ${a}、b ＝ ${b}`,
            `A ＝ ${g} × ${a} ＝ ${A}、B ＝ ${g} × ${b} ＝ ${B}　⇒　A ＋ B ＝ ${sum}`
        ]
    };
}

// ---- Lv.7 素因数分解・B（AB × p ＝ q × BA）----
function divDigits() {
    // 「AB × p ＝ q × BA」が 1〜9 の数字で 2 組以上の解を持つのは、p : q ＝ 7 : 4 または 4 : 7 のとき（B ＝ 2A または A ＝ 2B）。共通の約数 c を変えて出題する
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const [p1, q1] = getRandomChoice([[7, 4], [7, 4], [4, 7]]), c = getRandomInt(2, 140), p = c * p1, qq = c * q1, sols = [];
        if (p > 999 || qq > 999) continue;
        for (let A = 1; A <= 9; A++) for (let B = 1; B <= 9; B++) if ((10 * A + B) * p === qq * (10 * B + A)) sols.push([A, B]);
        if (sols.length >= 2) { const best = sols.reduce((m, s) => ((10 * s[0] + s[1]) > (10 * m[0] + m[1]) ? s : m), sols[0]); q = { c, p1, q1, p, qq, sols, best, sum: best[0] + best[1] }; }
    }
    if (!q) q = { c: 33, p1: 7, q1: 4, p: 231, qq: 132, sols: [[1, 2], [2, 4], [3, 6], [4, 8]], best: [4, 8], sum: 12 };
    const { c, p1, q1, p, qq, sols, best, sum } = q, A0 = sols[0][0], B0 = sols[0][1], g = Fr.gcd(A0, B0);
    return {
        unit: '⑱ 約数・倍数', title: '素因数分解・B',
        text: `次のような計算式がある。\nAB × ${p} ＝ ${qq} × BA\nただし、式の中の A、B は 1〜9 の数字を表し、AB、BA は二桁の数を表す。`,
        prompt: `この式を満たす A、B のうち、各辺の積の値（AB × ${p} 又は ${qq} × BA）が最大になるときの A と B の和はいくらか。`,
        correctAnswer: sum, unitSuffix: '', step: 1, consecutive: true,
        steps: [
            `AB ＝ 10A ＋ B、BA ＝ 10B ＋ A なので、(10A ＋ B) × ${p} ＝ ${qq} × (10B ＋ A)`,
            `${p} ＝ ${c} × ${p1}、${qq} ＝ ${c} × ${q1}（共通の約数 ${c}）。両辺を ${c} で割ると ${p1}(10A ＋ B) ＝ ${q1}(10B ＋ A)`,
            `${10 * p1}A ＋ ${p1}B ＝ ${10 * q1}B ＋ ${q1}A　⇒　${10 * p1 - q1}A ＝ ${10 * q1 - p1}B　⇒　A : B ＝ ${(10 * q1 - p1) / Fr.gcd(10 * p1 - q1, 10 * q1 - p1)} : ${(10 * p1 - q1) / Fr.gcd(10 * p1 - q1, 10 * q1 - p1)}`,
            `1〜9 の数字で条件を満たす (A, B) は ${sols.map(s => `(${s[0]}, ${s[1]})`).join('、')}`,
            `積が最大になるのは AB が最大のとき。(A, B) ＝ (${best[0]}, ${best[1]}) で、A ＋ B ＝ ${sum}`
        ]
    };
}
