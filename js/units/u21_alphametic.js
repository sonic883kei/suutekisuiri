/**
 * u21_alphametic.js  —  ㉑ 覆面算・虫食い
 * 3パターン（過去問の型）:
 *   Lv.1 加減の筆算   … a、b、c は 1〜9 の異なる整数。abab ＋ abc ＝ N のとき a＋b＋c（2007 国家Ⅲ種）
 *   Lv.2 掛け算の筆算 … 2AB × 2C ＝ 1CC1 / A06 / 68B1 の型。A、B、C は 1〜9 の異なる数字 → A＋B＋C（2007 警視庁警察官Ⅲ類）
 *   Lv.3 掛け算の筆算・B … 文字の空欄（同じ文字は同じ数字）に 0〜9 のうち2つの数字を除く数字が入る → 指定した文字の数字（2008 東京都Ⅲ類）
 * いずれも「条件を満たす数字の組が1通り（Lv.3は指定文字の値が1通り）」になることを、全組合せの総当たりで確かめた問題だけを出題する。
 * 筆算の図は q.figure（type:'calc'）で渡し、core.js の renderFigure が描画する。バリエーションは少なめ（出題頻度が低い単元のため）。
 */
UnitRegistry.register({
    id: 'u21', name: '㉑ 覆面算・虫食い', chap: 2,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        return [alphAdd, alphMul2, alphMul3][lv - 1]();
    }
});

// ---- 共通: 掛け算の筆算（上段×下段、1行目＝上段×一の位、2行目＝上段×十の位、答え） ----
function alphRows(top, mult) {
    return { top: String(top), mult: String(mult), p1: String(top * (mult % 10)), p2: String(top * Math.floor(mult / 10)), tot: String(top * mult) };
}
// 図用の行（右詰め。2行目は1桁左にずらす）。pat は各段のセル配列（数字または文字）
function alphMulFigure(pat) {
    const W = pat.tot.length, pad = (a, w) => [...Array(w - a.length).fill(''), ...a];
    return {
        type: 'calc', rows: [
            { sym: '', cells: pad(pat.top, W) }, { sym: '×', cells: pad(pat.mult, W), rule: true },
            { sym: '', cells: pad(pat.p1, W) }, { sym: '', cells: [...pad(pat.p2, W - 1), ''], rule: true }, { sym: '', cells: pad(pat.tot, W) }
        ]
    };
}
// 候補の筆算(rows＝alphRows の結果)が、図の模様 pat（数字は一致、文字は同じ文字なら同じ数字、excl の数字は文字に使えない）に合うか
function alphMatch(pat, rows, keys, excl) {
    const map = {};
    for (const k of keys) {
        const cells = pat[k], s = rows[k];
        if (cells.length !== s.length) return false;
        for (let i = 0; i < cells.length; i++) {
            const c = cells[i], d = Number(s[i]);
            if (/^[0-9]$/.test(c)) { if (Number(c) !== d) return false; }
            else { if (excl && excl.includes(d)) return false; if (map[c] === undefined) map[c] = d; else if (map[c] !== d) return false; }
        }
    }
    return map;
}
function alphList(items, fmt) { return items.length <= 8 ? items.map(fmt).join('、') + `（${items.length}通り）` : `${items.slice(0, 6).map(fmt).join('、')} など${items.length}通り`; }

// ---- Lv.1 加減の筆算: abab ＋ abc ＝ N ----
function alphAdd() {
    const a = getRandomInt(1, 9), b = getRandomInt(1, 9), c = getRandomInt(1, 9);
    if (new Set([a, b, c]).size < 3) return alphAdd();
    const x = 1010 * a + 101 * b, y = 100 * a + 10 * b + c, N = x + y;
    const sols = [];
    for (let p = 1; p <= 9; p++) for (let q = 1; q <= 9; q++) for (let r = 1; r <= 9; r++) if (new Set([p, q, r]).size === 3 && 1010 * p + 101 * q + 100 * p + 10 * q + r === N) sols.push([p, q, r]);
    if (sols.length !== 1) return alphAdd();
    const Ns = String(N), W = Ns.length, pad = arr => [...Array(W - arr.length).fill(''), ...arr];
    const quo = Math.floor(N / 111), rem = N % 111;
    return {
        unit: '㉑ 覆面算・虫食い', title: '加減の筆算',
        text: 'a、b、c は、それぞれ 1〜9 のうちの異なる三つの整数である。次の式が成り立つとき、a、b、c の和はいくらか。',
        figure: { type: 'calc', rows: [{ sym: '', cells: pad(['a', 'b', 'a', 'b']) }, { sym: '＋', cells: pad(['a', 'b', 'c']), rule: true }, { sym: '', cells: Ns.split('') }] },
        prompt: 'a ＋ b ＋ c はいくつですか。',
        correctAnswer: a + b + c, unitSuffix: '', step: 1, consecutive: true,
        steps: [
            `位ごとに分けて書くと、abab ＝ 1000a ＋ 100b ＋ 10a ＋ b ＝ 1010a ＋ 101b、abc ＝ 100a ＋ 10b ＋ c`,
            `足すと 1110a ＋ 111b ＋ c ＝ 111 × (10a ＋ b) ＋ c ＝ ${N}`,
            `c は 1〜9 の一けたの数で 111 より小さいので、${N} ÷ 111 ＝ ${quo} 余り ${rem} の「商」が 10a ＋ b、「余り」が c に当たる`,
            `10a ＋ b ＝ ${quo} より a ＝ ${a}、b ＝ ${b}。c ＝ ${rem}`,
            `（確認）a、b、c は ${a}、${b}、${c} で、すべて異なる。${x} ＋ ${y} ＝ ${N} ✓`,
            `a ＋ b ＋ c ＝ ${a} ＋ ${b} ＋ ${c} ＝ ${a + b + c}`
        ]
    };
}

// ---- Lv.2 掛け算の筆算（A、B、C は 1〜9 の異なる数字） ----
function alphMul2() {
    for (let t = 0; t < 20000; t++) {
        const A = getRandomInt(1, 9), B = getRandomInt(1, 9), C = getRandomInt(1, 9), x = getRandomInt(1, 9), y = getRandomInt(1, 9);
        if (new Set([A, B, C]).size < 3 || [A, B, C].includes(x) || [A, B, C].includes(y)) continue;
        const rows = alphRows(100 * x + 10 * A + B, 10 * y + C);
        if (rows.p1.length < 3 || rows.p2.length < 3 || rows.p2.length > 3 || rows.tot.length < 4) continue;
        const L = { [A]: 'A', [B]: 'B', [C]: 'C' }, conv = s => s.split('').map(d => L[d] || d);
        const pat = { top: conv(rows.top), mult: conv(rows.mult), p1: conv(rows.p1), p2: conv(rows.p2), tot: conv(rows.tot) };
        const sols = [];
        for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) {
            if (new Set([a, b, c]).size < 3) continue;
            const r = alphRows(100 * x + 10 * a + b, 10 * y + c), m = alphMatch(pat, r, ['top', 'mult', 'p1', 'p2', 'tot'], null);
            if (m && m.A === a && m.B === b && m.C === c) sols.push([a, b, c]);
        }
        if (sols.length !== 1) continue;
        // 解説: 行ごとに条件を足して、(A,B,C) の候補を絞る
        let cand = [];
        for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) if (new Set([a, b, c]).size === 3) cand.push([a, b, c]);
        const ok = (s, keys) => { const r = alphRows(100 * x + 10 * s[0] + s[1], 10 * y + s[2]), m = alphMatch(pat, r, keys, null); return m && m.A === s[0] && m.B === s[1] && m.C === s[2]; };
        const txt = k => pat[k].join('');
        const steps = [`A、B、C は 1〜9 の異なる数字。図の文字の位置には、その文字の数字が入る`];
        const c2 = cand.filter(s => ok(s, ['top', 'mult', 'p2']));
        const pairs = [...new Set(c2.map(s => s[0] + ',' + s[1]))].map(s => s.split(',').map(Number));
        steps.push(`上の段 ${txt('top')} に十の位の ${y} を掛けた行が ${txt('p2')}：(${x}AB) × ${y} ＝ ${txt('p2')} を満たす (A, B) は ${alphList(pairs, s => `(${s[0]}, ${s[1]})`)}`);
        const c1 = c2.filter(s => ok(s, ['top', 'mult', 'p2', 'p1']));
        steps.push(`一の位の C を掛けた行が ${txt('p1')}：(${x}AB) × C ＝ ${txt('p1')} も満たす (A, B, C) は ${alphList(c1, s => `(${s.join(', ')})`)}`);
        steps.push(`答えの段 ${txt('tot')} まで合わせると、(A, B, C) ＝ (${sols[0].join(', ')}) の1通りだけ。実際に ${rows.top} × ${rows.mult} ＝ ${rows.tot}（${rows.top} × ${C} ＝ ${rows.p1}、${rows.top} × ${y} ＝ ${rows.p2}）となり、図と合う`);
        steps.push(`A ＋ B ＋ C ＝ ${A} ＋ ${B} ＋ ${C} ＝ ${A + B + C}`);
        return {
            unit: '㉑ 覆面算・虫食い', title: '掛け算の筆算',
            text: '次の計算式中の A、B、C には 1〜9 のうちのいずれかの数字が入る。A、B、C は異なる数字であるとき、A、B、C に当てはまる数字の和はいくつか。',
            figure: alphMulFigure(pat), prompt: 'A ＋ B ＋ C はいくつですか。',
            correctAnswer: A + B + C, unitSuffix: '', step: 1, consecutive: true, steps
        };
    }
    throw new Error('u21 Lv.2 の生成に失敗');
}

// ---- Lv.3 掛け算の筆算・B（文字＝0〜9のうち2つの数字を除く数字。同じ文字は同じ数字） ----
function alphMul3() {
    for (let t = 0; t < 20000; t++) {
        const p = getRandomInt(1, 9), q = getRandomInt(1, 9), a = getRandomInt(1, 9), b = getRandomInt(0, 9);
        if (p === q || [p, q].includes(a) || [p, q].includes(b)) continue;
        const rows = alphRows(100 * a + 10 * p + b, 10 * q + b);
        if (rows.p1.length !== 4 || rows.p2.length !== 4 || rows.tot.length !== 5) continue;
        const letters = [], conv = s => s.split('').map(d => {
            if (Number(d) === p || Number(d) === q) return d;
            if (!letters.includes(d)) letters.push(d);
            return String.fromCharCode(65 + letters.indexOf(d));
        });
        const pat = {}; for (const k of ['top', 'mult', 'p1', 'p2', 'tot']) pat[k] = conv(rows[k]);   // 上から順に A, B, C… を割り当てる
        const letterVal = {}; letters.forEach((d, i) => letterVal[String.fromCharCode(65 + i)] = Number(d));
        const sols = [];
        for (let aa = 1; aa <= 9; aa++) for (let bb = 0; bb <= 9; bb++) {
            const m = alphMatch(pat, alphRows(100 * aa + 10 * p + bb, 10 * q + bb), ['top', 'mult', 'p1', 'p2', 'tot'], [p, q]); if (m) sols.push(m);
        }
        const inTot = [...new Set(pat.tot.filter(c => /[A-Z]/.test(c)))], pool = inTot.length ? inTot : Object.keys(letterVal), ask = getRandomChoice(pool);
        if (!sols.length || !sols.every(m => m[ask] === letterVal[ask]) || sols.length > 2) continue;
        const keysAll = ['top', 'mult', 'p1', 'p2', 'tot'];
        let cand = []; for (let aa = 1; aa <= 9; aa++) for (let bb = 0; bb <= 9; bb++) if (![p, q].includes(aa) && ![p, q].includes(bb)) cand.push([aa, bb]);
        const ok = (s, keys) => !!alphMatch(pat, alphRows(100 * s[0] + 10 * p + s[1], 10 * q + s[1]), keys, [p, q]);
        const txt = k => pat[k].join(''), LA = pat.top[0], LB = pat.top[2], nameP = `(${LA}, ${LB})`;
        const steps = [`文字には 0〜9 から ${p} と ${q} を除いた数字が入り、同じ文字は同じ数字。上の段は ${txt('top')}、下の段は ${txt('mult')}（一の位は上の段の一の位と同じ ${LB}）`];
        let hint = '';
        if (pat.p1[3] === LB) hint = `。一の位に注目すると、${LB} × ${LB} の一の位が ${LB} になる数字は ${[0, 1, 5, 6].filter(d => ![p, q].includes(d)).join('、')}（${LB} ＝ ${[0, 1, 5, 6].filter(d => ![p, q].includes(d)).join('、')} のどれか）`;
        const s1 = cand.filter(s => ok(s, ['top', 'mult', 'p1']));
        steps.push(`上の段 × ${LB} ＝ ${txt('p1')}（${txt('top')} × ${LB}）${hint}。この行まで合う ${nameP} は ${alphList(s1, s => `(${s[0]}, ${s[1]})`)}`);
        const s2 = s1.filter(s => ok(s, ['top', 'mult', 'p1', 'p2']));
        steps.push(`上の段 × ${q} ＝ ${txt('p2')}（${txt('top')} × ${q}）も合わせると ${nameP} は ${alphList(s2, s => `(${s[0]}, ${s[1]})`)}`);
        const s3 = s2.filter(s => ok(s, keysAll));
        steps.push(`答えの段 ${txt('tot')} まで合わせると ${nameP} は ${alphList(s3, s => `(${s[0]}, ${s[1]})`)}`);
        const s0 = s3[0], topN = 100 * s0[0] + 10 * p + s0[1], mulN = 10 * q + s0[1];
        steps.push(`${LA} ＝ ${s0[0]}、${LB} ＝ ${s0[1]} のとき ${topN} × ${mulN} ＝ ${topN * mulN}。図の ${ask} に当たる数字は ${letterVal[ask]}${s3.length > 1 ? '（残る候補のどちらでも同じ）' : ''}`);
        return {
            unit: '㉑ 覆面算・虫食い', title: '掛け算の筆算・B',
            text: `次の計算式において、アルファベットの空欄にそれぞれ、0〜9 の数字のうち、${p} と ${q} を除くいずれか1つの数字が入るとき、${ask} に入る数字として正しいのはどれか。ただし、アルファベットが同一の空欄には、同一の数字が入る。`,
            figure: alphMulFigure(pat), prompt: `${ask} に入る数字はどれですか。`,
            correctAnswer: letterVal[ask], unitSuffix: '', step: 1, consecutive: true, allowZero: letterVal[ask] === 0, steps
        };
    }
    throw new Error('u21 Lv.3 の生成に失敗');
}
