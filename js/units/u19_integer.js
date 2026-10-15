/**
 * u19_integer.js  —  ⑲ 整数
 * 4パターン（過去問の型）:
 *   Lv.1 計算式を満たす整数   … A、B、C は異なる一桁の正の整数。A＋B－k ＝ (B－m)×A ＝ A＋A ＝ C のような連続した等式 → A＋B＋C（2013 刑務官）
 *   Lv.2 連続する整数         … 連続する三つの自然数の「積÷和」が V → 最も大きい（小さい）数（2016 大阪府公立義務教育諸学校事務）
 *   Lv.3 各桁の操作           … 一の位（十の位）が決まっている2桁の自然数 A、B の十の位と一の位を入れ替えると差が分かる → A＋B（2013 特別区 身体障害者対象）
 *   Lv.4 カード問題           … 1〜9 のカードを3人で3枚ずつ分け、「g」はXが持ち、2人の積が等しい → 確実にいえるのはどれか（2012 刑務官）
 * いずれも「答えが一意に決まる（Lv.4 は確実にいえる記述がちょうど1つ）」ことを総当たりで確かめた数値だけを出題する。
 * generate(level): level が 1〜4 ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u19', name: '⑲ 整数', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        return [intChain, intConsecutive, intDigits, intCards][lv - 1]();
    }
});

const intLabels = ['①', '②', '③', '④', '⑤'];

// ---- Lv.1 計算式を満たす整数 ----
function intChain() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const t = getRandomChoice([2, 2, 2, 3]), A = getRandomInt(1, Math.floor(9 / t)), B = getRandomInt(t + 1, 9), C = t * A;
        const m = B - t, k = B - (t - 1) * A;
        if (m < 1 || k < 1 || new Set([A, B, C]).size < 3) continue;
        const third = t === 2 ? getRandomChoice(['A + A', 'A × 2']) : getRandomChoice(['A + A + A', 'A × 3']);
        const exprs = shuffleArray([{ text: `A + B － ${k}`, fn: (a, b) => a + b - k }, { text: `(B － ${m}) × A`, fn: (a, b) => (b - m) * a }, { text: third, fn: (a) => t * a }]);
        const line = `${exprs.map(e => e.text).join(' ＝ ')} ＝ C`, sols = [];
        for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) {            // 総当たりで解が 1 組だけか確認
            if (new Set([a, b, c]).size < 3) continue;
            const vals = exprs.map(e => e.fn(a, b)); if (vals.every(v => v === c)) sols.push([a, b, c]);
        }
        if (sols.length === 1) q = { A, B, C, t, m, k, line, third };
    }
    if (!q) q = { A: 4, B: 6, C: 8, t: 2, m: 4, k: 2, line: 'A + B － 2 ＝ (B － 4) × A ＝ A + A ＝ C', third: 'A + A' };
    const { A, B, C, t, m, k, line, third } = q, sum = A + B + C;
    return {
        unit: '⑲ 整数', title: '計算式を満たす整数',
        text: `A、B、Cはそれぞれ異なる一桁の正の整数である。次の式が成り立つ。\n${line}`,
        prompt: 'このとき、A、B、Cの和はいくらか。',
        correctAnswer: sum, unitSuffix: '', step: 1, consecutive: true,
        steps: [
            `「${third}」と C が等しいので、C ＝ ${t}A`,
            `(B － ${m}) × A ＝ ${t}A で A は正なので、両辺を A で割って B － ${m} ＝ ${t}　⇒　B ＝ ${B}`,
            `A ＋ B － ${k} ＝ ${t}A に B ＝ ${B} を代入: A ＋ ${B} － ${k} ＝ ${t}A　⇒　${B - k} ＝ ${t - 1 === 1 ? '' : t - 1}A　⇒　A ＝ ${A}`,
            `C ＝ ${t} × ${A} ＝ ${C}。A、B、C ＝ ${A}、${B}、${C}（どれも異なる一桁の正の整数）　⇒　和は ${sum}`
        ]
    };
}

// ---- Lv.2 連続する整数 ----
function intConsecutive() {
    const ns = []; for (let n = 5; n <= 40; n++) if (n % 3 !== 0) ns.push(n);
    const n = getRandomChoice(ns), V = (n * n - 1) / 3, largest = getRand() < 0.7, ans = largest ? n + 1 : n - 1;
    return {
        unit: '⑲ 整数', title: '連続する整数',
        text: `連続する三つの自然数について、三つの自然数の積を三つの自然数の和で割った値が ${V} となる。`,
        prompt: `このとき、この三つの自然数のうち、最も${largest ? '大きい' : '小さい'}数として正しいのはどれか。`,
        correctAnswer: ans, unitSuffix: '', step: 1, consecutive: true,
        steps: [
            `真ん中の数を n とすると、連続する三つの自然数は n － 1、n、n ＋ 1`,
            `和は (n － 1) ＋ n ＋ (n ＋ 1) ＝ 3n、積は (n － 1) × n × (n ＋ 1) ＝ n(n² － 1)`,
            `積 ÷ 和 ＝ n(n² － 1) ÷ 3n ＝ (n² － 1) ÷ 3 ＝ ${V}　⇒　n² － 1 ＝ ${3 * V}　⇒　n² ＝ ${3 * V + 1}　⇒　n ＝ ${n}`,
            `三つの自然数は ${n - 1}、${n}、${n + 1}。最も${largest ? '大きい' : '小さい'}数は ${ans}`
        ]
    };
}

// ---- Lv.3 各桁の操作 ----
function intDigits() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const posA = getRandomChoice(['一の位', '十の位']), posB = getRandomChoice(['一の位', '十の位']), vA = getRandomInt(1, 9), vB = getRandomInt(1, 9), uA = getRandomInt(1, 9), uB = getRandomInt(1, 9);
        const build = (pos, v, u) => (pos === '一の位' ? { t: u, o: v } : { t: v, o: u });       // 求める桁が u
        const a = build(posA, vA, uA), b = build(posB, vB, uB);
        if (a.t === a.o || b.t === b.o) continue;
        const A = 10 * a.t + a.o, B = 10 * b.t + b.o, A2 = 10 * a.o + a.t, B2 = 10 * b.o + b.t;
        q = { posA, posB, vA, vB, A, B, A2, B2 };
    }
    if (!q) q = { posA: '一の位', posB: '十の位', vA: 3, vB: 4, A: 63, B: 48, A2: 36, B2: 84 };
    const { posA, posB, vA, vB, A, B, A2, B2 } = q, sum = A + B;
    const dA = A2 - A, dB = B2 - B, say = (d) => `${Math.abs(d)} ${d < 0 ? '小さく' : '大きく'}`, sgn = (d) => (d < 0 ? `－${Math.abs(d)}` : `${d}`);
    const pool = [A2 + B, A2 + B2, A + B2, A, B, A2, B2, sum - 9, sum + 9], seen = new Set([sum]), wrongs = [];
    for (const w of shuffleArray(pool)) { if (w > 0 && !seen.has(w)) { seen.add(w); wrongs.push(w); } if (wrongs.length === 4) break; }
    const all = [sum, ...wrongs].sort((x, y) => x - y), customChoices = all.map((v, i) => ({ value: v, label: intLabels[i], htmlText: `${intLabels[i]} ${v}`, isCorrect: v === sum }));
    const digitsOf = (pos, v, name) => `${pos}が ${v} である 2 桁の自然数${name}`;
    const eq = (name, pos, v, orig, swp, d) => pos === '一の位'
        ? `${name} ＝ 10x ＋ ${v}（x は十の位）。入れ替えると 10 × ${v} ＋ x ＝ ${10 * v} ＋ x。差は (${10 * v} ＋ x) － (10x ＋ ${v}) ＝ ${9 * v} － 9x ＝ ${sgn(d)}　⇒　x ＝ ${(orig - orig % 10) / 10}　⇒　${name} ＝ ${orig}`
        : `${name} ＝ ${10 * v} ＋ y（y は一の位）。入れ替えると 10y ＋ ${v}。差は (10y ＋ ${v}) － (${10 * v} ＋ y) ＝ 9y － ${9 * v} ＝ ${sgn(d)}　⇒　y ＝ ${orig % 10}　⇒　${name} ＝ ${orig}`;
    return {
        unit: '⑲ 整数', title: '各桁の操作',
        text: `${digitsOf(posA, vA, 'A')}と、${digitsOf(posB, vB, 'B')}がある。今、自然数Aの十の位と一の位を入れ替えた自然数は、もとの自然数Aより ${say(dA)}なり、自然数Bの十の位と一の位を入れ替えた自然数は、もとの自然数Bより ${say(dB)}なる。`,
        prompt: 'このとき、自然数Aと自然数Bの和はどれか。',
        correctAnswer: sum, customChoices,
        steps: [
            eq('A', posA, vA, A, A2, dA),
            eq('B', posB, vB, B, B2, dB),
            `A ＋ B ＝ ${A} ＋ ${B} ＝ ${sum}`
        ]
    };
}

// ---- Lv.4 カード問題 ----
function intCards() {
    const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9], P = { A: 0, B: 1, C: 2 };
    const combos = [];
    for (const g of [1, 1, 1, 2, 3, 4, 6, 8, 9]) for (const holder of 'ABC') for (const pair of [['A', 'B'], ['A', 'C'], ['B', 'C']]) combos.push({ g, holder, pair });
    let q = null;
    for (let i = 0; i < 200 && !q; i++) {
        const { g, holder, pair } = getRandomChoice(combos), valid = [];
        const rest0 = cards;
        for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) for (let c = b + 1; c < 9; c++) {
            const hand = { A: [rest0[a], rest0[b], rest0[c]] }; const remain = rest0.filter((_, idx) => idx !== a && idx !== b && idx !== c);
            for (let d = 0; d < 6; d++) for (let e = d + 1; e < 6; e++) for (let f = e + 1; f < 6; f++) {
                hand.B = [remain[d], remain[e], remain[f]]; hand.C = remain.filter((_, idx) => idx !== d && idx !== e && idx !== f);
                if (!hand[holder].includes(g)) continue;
                const pr = (arr) => arr[0] * arr[1] * arr[2];
                if (pr(hand[pair[0]]) === pr(hand[pair[1]])) valid.push({ A: hand.A.slice(), B: hand.B.slice(), C: hand.C.slice() });
            }
        }
        if (valid.length < 2 || valid.length > 6) continue;
        const certain = [], uncertain = [];
        for (const c of cards) { if (c === g) continue; for (const X of 'ABC') (valid.every(h => h[X].includes(c)) ? certain : uncertain).push({ c, X }); }
        if (certain.length === 0) continue;
        const correct = getRandomChoice(certain), cardsPool = shuffleArray(cards.filter(c => c !== g && c !== correct.c)), opts = [correct];
        for (const c of cardsPool) { const cand = shuffleArray(uncertain.filter(u => u.c === c)); if (cand.length) opts.push(cand[0]); if (opts.length === 5) break; }
        if (opts.length < 5) continue;
        q = { g, holder, pair, valid, correct, opts: opts.sort((x, y) => x.c - y.c) };
    }
    if (!q) {
        const valid = [{ A: [1, 8, 9], B: [3, 4, 6], C: [2, 5, 7] }, { A: [1, 4, 9], B: [2, 3, 6], C: [5, 7, 8] }];
        q = { g: 1, holder: 'A', pair: ['A', 'B'], valid, correct: { c: 3, X: 'B' }, opts: [{ c: 3, X: 'B' }, { c: 4, X: 'C' }, { c: 5, X: 'A' }, { c: 6, X: 'A' }, { c: 7, X: 'B' }] };
    }
    const { g, holder, pair, valid, correct, opts } = q, third = 'ABC'.split('').find(x => !pair.includes(x));
    const customChoices = opts.map((o, i) => ({ value: `${o.c}${o.X}`, label: intLabels[i], htmlText: `${intLabels[i]} 「${o.c}」のカードは${o.X}が持っている。`, isCorrect: o === correct }));
    return {
        unit: '⑲ 整数', title: 'カード問題',
        text: `1 から 9 までのうちの互いに異なる数字を一つずつ記入した 9 枚のカードがある。このカードをA、B、Cの 3 人で 3 枚ずつ分けたところ、「${g}」のカードは${holder}が持ち、また、${pair[0]}が持つカードの三つの数の積と、${pair[1]}が持つカードの三つの数の積は等しかった。`,
        prompt: 'このとき、確実にいえるのはどれか。',
        correctAnswer: correct.c, customChoices,
        steps: [
            `1〜9 の積は 2⁷ × 3⁴ × 5 × 7。5 と 7 は素数で、カードは 1 枚ずつしかない`,
            `${pair[0]} と ${pair[1]} の積が等しいので、5 や 7 をどちらか一方だけが持つことはできない。したがって 5 と 7 は残りの ${third} が持つ（${third} の 3 枚は 5、7、もう 1 枚）`,
            `条件を満たす分け方をすべて調べると、${valid.length} 通り: ${valid.map(h => `A＝{${h.A.join('、')}}、B＝{${h.B.join('、')}}、C＝{${h.C.join('、')}}`).join('／')}`,
            `どの分け方でも「${correct.c}」のカードは ${correct.X} が持っているので、確実にいえるのは「「${correct.c}」のカードは${correct.X}が持っている。」（他の選択肢は、持ち主が分け方によって変わるか、常に違う）`
        ]
    };
}
