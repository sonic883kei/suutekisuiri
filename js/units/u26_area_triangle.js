/**
 * u26_area_triangle.js  —  ㉖ 面積（三角形）（図形分野 第3単元）
 *   Lv.1 面積の加減           … 直角を2つもつ四角形の中の斜線部分＝2つの三角形の和（2016 警視庁Ⅲ類 第2回）
 *   Lv.2 三角形の高さ         … 2辺とはさむ角（30°・45°・60°・120°・135°・150°）から面積 ＝ ½ab·sinθ（2010 刑務官など）
 *   Lv.3 面積比（相似比）     … 角の二等分線と平行線。△ABC：△AED など（2008 東京消防庁Ⅲ類）
 *   Lv.4 面積比（面積公式）   … 正三角形の各辺を m：n に内分する点を結んだ △DEF の面積（2016 裁判所一般職・高卒者区分）
 *   Lv.5 面積比（相似）・B    … 各辺の中点を順に結んだ入れ子の正三角形の斜線部分（2010 刑務官）
 *   Lv.6 面積比（面積公式）・B … 二等辺三角形（または直角三角形）の2辺上の内分点 D・E でつくる三角形の面積（2006 東京消防庁Ⅲ類）
 * 図は座標から作り、tests/run.js（checkU26）が座標から長さ・角・面積を実測して答えを照合する。
 * 共通部品は u24_triangle_polygon*.js / u25_circle.js（tpAutoLabels, tpGcd, frN, frTxt, TP2_LAB, tpMir, cpConsec, cpScatter）。
 */
UnitRegistry.register({
    id: 'u26', name: '㉖ 面積（三角形）', chap: 3, section: '図形分野',
    generate(level) {
        const fns = [arAddSub, arHeight, arRatioSimilar, arRatioFormula, arNested, arRatioFormulaB];
        const lv = Number.isInteger(parseInt(level)) && parseInt(level) >= 1 && parseInt(level) <= fns.length ? parseInt(level) : getRandomInt(1, fns.length);
        return fns[lv - 1]();
    }
});

const AR_UNIT = '㉖ 面積（三角形）';
const arPct = v => `${parseFloat(v.toFixed(2))}%`;
const arCm2 = v => `${parseFloat(v.toFixed(2))}cm²`;
const arRatioTxt = (x, y) => `${x}：${y}`;
// 線分 ab の長さ表示を、基準点 ref の反対側（図形の外側）に置く
function arSideOut(a, b, s, ref, px = 17) {
    const mid = Geom.lerp(a, b, 0.5), d = Geom.unit(Geom.sub(b, a));
    let nv = [-d[1], d[0]]; if (Geom.dot(Geom.sub(mid, ref), nv) < 0) nv = [-nv[0], -nv[1]];
    return { k: 'txt', p: mid, s, dx: nv[0] * px, dy: -nv[1] * px, pr: mid };
}
const arCentroid = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
// 辺 a→b を m:n に分ける点（a からの割合 m/(m+n)）にいくつかの目盛りの点
function arDivDots(a, b, s) { const o = []; for (let i = 1; i < s; i++) o.push({ k: 'dot', p: Geom.lerp(a, b, i / s) }); return o; }

// 正解 ans（{key,…}）を含む5択を、正解の位置が一様になるよう選ぶ。cand は誤答候補（優先順）。key の昇順に並べて返す
function arPick(ans, cand) {
    const seen = new Set([ans.key]), c = cand.filter(x => !seen.has(x.key) && seen.add(x.key));
    const lo = c.filter(x => x.key < ans.key), hi = c.filter(x => x.key > ans.key);
    const feas = [0, 1, 2, 3, 4].filter(p => lo.length >= p && hi.length >= 4 - p); if (!feas.length) return null;
    const p = getRandomChoice(feas);
    return [...lo.slice(0, p), ans, ...hi.slice(0, 4 - p)].sort((a, b) => a.key - b.key);
}
// 整数の5択（誤答候補 wr ＋ 正解の前後を埋める候補）。lo〜hi（開区間）に収める
function arPickInt(ans, wr, lo, hi, spread, fmt) {
    const cand = shuffleArray(wr.filter(v => Number.isInteger(v) && v > lo && v < hi && v !== ans)).map(v => ({ key: v }));
    const fill = []; for (let j = 1; j <= 12; j++) [-1, 1].forEach(sg => { const v = ans + sg * j * spread; if (v > lo && v < hi) fill.push({ key: v }); });
    const arr = arPick({ key: ans }, [...cand, ...shuffleArray(fill)]); if (!arr) return null;
    return arr.map((o, i) => ({ value: o.key, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${fmt(o.key)}`, isCorrect: o.key === ans }));
}
// 比 x：y の5択（x の小さい順）
function arPickRatio(ans, wr) {
    const key = p => p[0] * 1000 + p[1], cand = shuffleArray(wr.map(p => frN(p[0], p[1])).filter(p => p[0] > 0 && p[1] > 0 && p[0] !== p[1] && p[0] <= 400 && p[1] <= 400)).map(p => ({ key: key(p), p }));
    const fill = []; for (let g = 0; g < 60; g++) { const p = frN(ans[0] + getRandomInt(-8, 14), ans[1] + getRandomInt(-8, 14)); if (p[0] > 0 && p[1] > 0 && p[0] !== p[1]) fill.push({ key: key(p), p }); }
    const arr = arPick({ key: key(ans), p: ans }, [...cand, ...fill]); if (!arr) return null;
    return arr.map((o, i) => ({ value: o.p[0] / o.p[1], label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${arRatioTxt(o.p[0], o.p[1])}`, isCorrect: o.key === key(ans) }));
}

// ---- Lv.1 面積の加減（直角が2つ。斜線部分＝上の三角形＋下の三角形） ----
function arAddSub() {
    for (let t = 0; t < 8000; t++) {
        const kind = getRandomChoice(['two', 'two', 'two', 'one']);
        const h2 = getRandomInt(3, 6), m = getRandomInt(3, 8), h1 = getRandomInt(6, 16) / 2, w = getRandomInt(1, 4), x = getRandomInt(10, 20) / 2;
        const a1 = m * h1 / 2, a2 = w * h2 / 2, tot = kind === 'two' ? a1 + a2 : a1;
        if (!Number.isInteger(tot) || tot < 6 || x - w < 1.5) continue;
        const LV = Math.hypot(x, h2), LT2 = LV * LV - h1 * h1; if (LT2 <= (m + 0.9) * (m + 0.9)) continue;
        const LT = Math.sqrt(LT2), al = Math.acos(LT / LV), bs = Math.atan2(-h2, x), dT = [Math.cos(bs + al), Math.sin(bs + al)];
        const mir = getRand() < 0.5, M = tpMir(mir);
        const Q = [0, 0], V = [x, 0], L = [0, h2], T = Geom.add(L, Geom.mul(dT, LT)), Mp = Geom.add(L, Geom.mul(dT, m)), W = [x - w, 0];
        if (T[1] < h2 + 0.9 || T[0] < 0.5 || Math.abs(h1 - h2) < 0.9) continue;       // 長方形に見える形を避ける
        const quad = [Q, V, T, L], sg = quad.map((p, i) => Math.sign(Geom.cross(Geom.sub(quad[(i + 1) % 4], p), Geom.sub(quad[(i + 2) % 4], quad[(i + 1) % 4]))));
        if (!sg.every(v => v === sg[0])) continue;                       // 凸四角形
        const ctr = M(arCentroid(quad)), q = quad.map(M), hatch = (kind === 'two' ? [L, Mp, V, W] : [L, Mp, V]).map(M);
        const items = [{ k: 'poly', pts: hatch, closed: true, shade: true, tag: 'hatch' }, { k: 'poly', pts: q, closed: true, tag: 'outline' },
            { k: 'rt', v: q[0], a: q[1], b: q[3], r: 10 }, { k: 'rt', v: q[2], a: q[3], b: q[1], r: 10 }];
        const lab = (a, b, v, tag) => { const it = arSideOut(a, b, `${tpFmt(v)}cm`, ctr, 21); it.tag = tag; items.push(it); };
        lab(M(L), M(Mp), m, 'LM'); lab(M(V), M(T), h1, 'TV'); lab(M(Q), M(L), h2, 'LQ'); if (kind === 'two') lab(M(W), M(V), w, 'WV');
        const lo = Math.max(1, tot - 4), st = getRandomChoice([1, 1, 1, 2]), ch = cpConsec(tot, st, 0, 999, arCm2); if (!ch) continue;
        void lo;
        const steps = kind === 'two' ? [
            `斜線部分を、上側の三角形（${tpFmt(m)}cm の辺が底辺）と、下側の三角形（${tpFmt(w)}cm の辺が底辺）の2つに分けて、面積を足す`,
            `上側の三角形：右上の直角の記号より、${tpFmt(h1)}cm の辺は底辺（${m}cm の辺）に垂直。高さ ${tpFmt(h1)}cm なので、面積 ＝ ${m} × ${tpFmt(h1)} ÷ 2 ＝ ${tpFmt(a1)}cm²`,
            `下側の三角形：左の辺 ${h2}cm は底辺（下の辺）に垂直なので、これが高さ。面積 ＝ ${w} × ${h2} ÷ 2 ＝ ${tpFmt(a2)}cm²`,
            `斜線部分の面積 ＝ ${tpFmt(a1)} ＋ ${tpFmt(a2)} ＝ ${tot}cm²`
        ] : [
            `斜線部分は、${tpFmt(m)}cm の辺を底辺とする三角形。右上の直角の記号より、${tpFmt(h1)}cm の辺がこの底辺に垂直なので、高さにあたる`,
            `面積 ＝ ${m} × ${tpFmt(h1)} ÷ 2 ＝ ${tot}cm²（${h2}cm の長さは使わない）`
        ];
        return {
            unit: AR_UNIT, title: '面積の加減',
            text: '次の図の斜線部分の面積として、最も妥当なのはどれか。',
            figure: { type: 'geom', items, pad: 44 },
            prompt: '斜線部分の面積は何 cm² ですか。',
            correctAnswer: tot, unitSuffix: 'cm²', tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u26 Lv.1 の生成に失敗');
}

// ---- Lv.2 三角形の高さ（2辺とはさむ角から面積。答えは 整数・√2・√3 の形） ----
const AR_SIN = { 30: [1, 1], 150: [1, 1], 45: [2, 1], 135: [2, 1], 60: [3, 1], 120: [3, 1] };     // sinθ ＝ (1/2)√k のとき k
const arSq = (c, k) => (c === 1 && k !== 1 ? '' : String(c)) + (k === 1 ? '' : '√' + k);
function arHeight() {
    for (let t = 0; t < 5000; t++) {
        const th = getRandomChoice([30, 30, 45, 45, 60, 60, 120, 135, 150]), kk = th === 30 || th === 150 ? 1 : (th === 45 || th === 135 ? 2 : 3);
        const u = getRandomInt(3, 12), v = getRandomInt(3, 12); if (u === v || (u * v) % 4 !== 0 || u * v > 100) continue;
        const N = u * v / 4;                                              // ½·u·v·sinθ ＝ N√kk
        const pool = []; [1, 2, 3].forEach(k => [[1, 2], [1, 1], [2, 1]].forEach(([f, g]) => { const cn = frN(N * f, g); pool.push({ cn, k, key: cn[0] / cn[1] * Math.sqrt(k) }); }));
        const ansO = pool.find(o => o.k === kk && o.cn[0] === N && o.cn[1] === 1);
        const pref = [pool.find(o => o.k === kk && o.cn[0] === 2 * N), pool.find(o => o.k !== kk && o.cn[0] === N && o.cn[1] === 1)];
        const cand = [...pref, ...shuffleArray(pool.filter(o => o !== ansO && !pref.includes(o)))].filter(o => !(o.key > 1e6));
        const sel = arPick(ansO, cand); if (!sel) continue;
        const sq2 = o => o.cn[1] === 1 ? arSq(o.cn[0], o.k) : (o.k === 1 ? `{{${o.cn[0]}/${o.cn[1]}}}` : `{{${o.cn[0] === 1 ? '' : o.cn[0]}√${o.k}/${o.cn[1]}}}`);
        const customChoices = sel.map((o, i) => ({ value: o.key, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${sq2(o)}`, isCorrect: o === ansO }));
        const val = o => o.key;
        // 図：頂点 P に角 θ。P から Q へ辺 u、P から R へ辺 v
        const at = getRandomChoice(['A', 'B', 'B', 'C']), names = ['A', 'B', 'C'], oth = names.filter(n => n !== at), sw = getRand() < 0.5;
        const nq = sw ? oth[1] : oth[0], nr = sw ? oth[0] : oth[1];
        const Pp = [0, 0], Qp = [u, 0], Rp = Geom.mul(Geom.dir(th), v), mir = getRand() < 0.5, M = tpMir(mir);
        const pts = { [at]: M(Pp), [nq]: M(Qp), [nr]: M(Rp) };
        const items = [{ k: 'poly', pts: [pts.A, pts.B, pts.C], closed: true }];
        items.push({ k: 'ang', v: pts[at], a: pts[nq], b: pts[nr], r: 20, s: `${th}°`, tag: 'given' }, ...tpAutoLabels(items, pts));
        const sd = (x, y) => [x, y].sort().join('');
        const sh = shuffleArray([`${sd(at, nq)}＝${u}`, `${sd(at, nr)}＝${v}`]).join('、');
        const baseN = sd(at, nq), oppN = sd(at, nr), acute = th < 90, ph = acute ? th : 180 - th;
        const hTxt = kk === 1 ? frTxt(frN(v, 2)) : (v % 2 === 0 ? `${arSq(v / 2, kk)}` : `{{${v}√${kk}/2}}`);
        const sinS = kk === 1 ? '{{1/2}}' : `{{√${kk}/2}}`;
        const steps = [
            `${baseN} を底辺とし、${nr} から直線 ${baseN} に垂線 ${nr}H を下ろす。この ${nr}H が高さ`,
            acute ? `△${nr}${at}H は ∠${at}＝${th}° の直角三角形なので、${nr}H ＝ ${oppN} × sin${th}° ＝ ${v} × ${sinS} ＝ ${hTxt}`
                : `∠${at}＝${th}° は鈍角なので、垂線の足 H は底辺の延長上。∠${nr}${at}H ＝ 180° − ${th}° ＝ ${ph}° となり、${nr}H ＝ ${oppN} × sin${ph}° ＝ ${v} × ${sinS} ＝ ${hTxt}`,
            `面積 ＝ ${baseN} × ${nr}H ÷ 2 ＝ ${u} × ${hTxt} ÷ 2 ＝ ${arSq(N, kk)}`,
            `（別解）面積 ＝ ½ × ${u} × ${v} × sin${th}° ＝ ½ × ${u * v} × ${sinS} ＝ ${arSq(N, kk)}`
        ];
        return {
            unit: AR_UNIT, title: '三角形の高さ',
            text: `図の三角形について、${sh} が分かっている。また、∠${at}＝${th}° である。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: '△ABC の面積として、最も妥当なのはどれですか。',
            correctAnswer: val(ansO), fraction: true, tight: true, customChoices, steps
        };
    }
    throw new Error('u26 Lv.2 の生成に失敗');
}

// ---- Lv.3 面積比（相似比）：角の二等分線 BD と、D を通り BC に平行な DE ----
function arRatioSimilar() {
    for (let t = 0; t < 5000; t++) {
        const c = getRandomInt(2, 9), a = getRandomInt(2, 9); if (c === a || tpGcd(c, a) !== 1 || c / (c + a) < 0.3 || c / (c + a) > 0.75) continue;
        const kind = getRandomChoice(['whole', 'whole', 'trap']), s = c + a;
        const ans = kind === 'whole' ? frN(s * s, c * c) : frN(c * c, s * s - c * c);
        const wr = kind === 'whole'
            ? [[s * s, a * a], [s, c], [s * s, c * a], [c * c, s * s], [s * s, c * c - a * a > 0 ? c * c - a * a : a * a + c * c], [s * s, a * (a + 2 * c)]]
            : [[c * c, s * s], [c * c, a * a], [c, a], [c * c, c * a], [c * c, s * s - c * c + c * a], [a * (a + 2 * c), c * c]];
        const customChoices = arPickRatio(ans, wr); if (!customChoices) continue;
        const th = getRandomInt(52, 78), B = [0, 0], C = [a, 0], A = Geom.mul(Geom.dir(th), c), mir = getRand() < 0.5, M = tpMir(mir);
        const D = Geom.lerp(A, C, c / s), E = Geom.lerp(A, B, c / s), P = { A: M(A), B: M(B), C: M(C), D: M(D), E: M(E) };
        const items = [{ k: 'poly', pts: [P.A, P.B, P.C], closed: true }, { k: 'seg', a: P.B, b: P.D }, { k: 'seg', a: P.E, b: P.D }];
        items.push(...tpAutoLabels(items, P));
        const sq = `${c}² ： ${s}²`;
        const steps = [
            `角の二等分線の性質より AD：DC ＝ AB：BC ＝ ${c}：${a}。よって AD：AC ＝ ${c}：${s}`,
            `DE∥BC なので △AED ∽ △ABC で、相似比は AD：AC ＝ ${c}：${s}`,
            `面積比は相似比の2乗なので、△AED：△ABC ＝ ${c}²：${s}² ＝ ${c * c}：${s * s}`,
            kind === 'whole' ? `したがって △ABC：△AED ＝ ${s * s}：${c * c}（${arRatioTxt(ans[0], ans[1])}）`
                : `四角形 EBCD ＝ △ABC − △AED ＝ ${s * s} − ${c * c} ＝ ${s * s - c * c} なので、△AED：四角形 EBCD ＝ ${c * c}：${s * s - c * c}（${arRatioTxt(ans[0], ans[1])}）`
        ];
        void sq;
        return {
            unit: AR_UNIT, title: '面積比（相似比）',
            text: `図のような AB＝${c}cm、BC＝${a}cm の三角形 ABC がある。∠ABC の二等分線と辺 AC の交点を D、点 D を通り辺 BC に平行な直線と辺 AB の交点を E とする。`,
            figure: { type: 'geom', items, pad: 40 },
            prompt: kind === 'whole' ? '三角形 ABC の面積と三角形 AED の面積の比として正しいのはどれですか。' : '三角形 AED の面積と四角形 EBCD の面積の比として正しいのはどれですか。',
            correctAnswer: ans[0] / ans[1], fraction: true, tight: true, customChoices, steps
        };
    }
    throw new Error('u26 Lv.3 の生成に失敗');
}

// ---- Lv.4 面積比（面積公式）：正三角形の各辺を m：n に内分する点 D・E・F ----
function arRatioFormula() {
    for (let t = 0; t < 5000; t++) {
        const kind = getRandomChoice(['pct', 'pct', 'area', 'ratio']);
        let s, m;
        if (kind === 'pct') { s = getRandomChoice([4, 4, 5, 5, 10]); } else { s = getRandomInt(3, 8); }
        const cand = []; for (let i = 1; i < s; i++) if (tpGcd(i, s) === 1 && i * 2 !== s) cand.push(i);
        if (!cand.length) continue; m = getRandomChoice(cand); const n = s - m, mn = m * n;
        if (kind === 'pct' && s === 10 && ![3, 7].includes(m)) continue;
        const S2 = s * s, def = S2 - 3 * mn;                              // △DEF ＝ def/S2 × △ABC
        const a0 = frN(S2, def);
        let ch, ans, prompt, text, extra = {};
        const head = `図のように正三角形 ABC において、辺 AB、辺 BC、辺 CA をそれぞれ ${m}：${n} に内分する点を順に点 D、点 E、点 F とする。`;
        if (kind === 'pct') {
            ans = 100 * def / S2; if (Math.abs(ans * 100 - Math.round(ans * 100)) > 1e-9) continue;
            const st = getRandomChoice(s === 4 ? [1.25, 2.5, 3.25, 5, 6.25] : [1, 2, 3, 4, 5]);
            ch = cpConsec(ans, st, 0, 100, arPct); if (!ch) continue;
            text = head + 'このとき、正三角形 DEF の面積は正三角形 ABC の面積に対して何%か。'; prompt = '△DEF の面積は △ABC の何%ですか。'; extra = { decimals: 2 };
        } else if (kind === 'area') {
            const tt = getRandomInt(2, 6), big = S2 * tt; ans = tt * def;
            ch = arPickInt(ans, [tt * (S2 - mn), tt * (S2 - 2 * mn), tt * 3 * mn, tt * (S2 - 3 * mn) + tt, tt * (S2 - 3 * mn) - tt, tt * (S2 - 4 * mn), tt * 2 * mn], 0, big, Math.max(1, tt), arCm2);
            if (!ch) continue;
            text = head + `正三角形 ABC の面積が ${big}cm² のとき、正三角形 DEF の面積はいくつか。`; prompt = '△DEF の面積は何 cm² ですか。'; extra = { unitSuffix: 'cm²' };
        } else {
            ans = a0[0] / a0[1];
            const wr = [[S2, 3 * mn], [S2, S2 - mn], [S2, S2 - 2 * mn], [def, S2], [S2, def + mn], [S2, S2 - 4 * mn > 0 ? S2 - 4 * mn : 1], [S2 - mn, S2]];
            ch = arPickRatio(a0, wr); if (!ch) continue;
            text = head + 'このとき、正三角形 ABC と正三角形 DEF の面積の比を最も簡単な整数の比で表すとどれか。'; prompt = '△ABC：△DEF として正しいのはどれですか。'; extra = { fraction: true };
        }
        if (new Set(ch.map(x => x.value)).size !== 5) continue;
        const mir = getRand() < 0.5, M = tpMir(mir), r3 = Math.sqrt(3);
        const A = M([0, r3]), B = M([-1, 0]), C = M([1, 0]);
        const D = Geom.lerp(A, B, m / s), E = Geom.lerp(B, C, m / s), F = Geom.lerp(C, A, m / s);
        const items = [{ k: 'poly', pts: [A, B, C], closed: true }, { k: 'poly', pts: [D, E, F], closed: true }];
        if (s <= 10) items.push(...arDivDots(A, B, s), ...arDivDots(B, C, s), ...arDivDots(C, A, s));
        items.push(...tpAutoLabels(items, { A, B, C, D, E, F }));
        const fr = x => `{{${x[0]}/${x[1]}}}`, corner = frN(mn, S2);
        const steps = [
            `△ABC の面積を S とおく。△DEF ＝ △ABC − （3つの隅の三角形 △ADF・△BDE・△CEF）と考える`,
            `△ADF：AD：AB ＝ ${m}：${s}、AF：AC ＝ ${n}：${s}（CF：FA ＝ ${m}：${n} より）。∠A が共通なので、面積は S × {{${m}/${s}}} × {{${n}/${s}}} ＝ ${corner[1] === 1 ? corner[0] : fr(corner)} S`,
            `△BDE：BD：BA ＝ ${n}：${s}、BE：BC ＝ ${m}：${s}。△CEF：CE：CB ＝ ${n}：${s}、CF：CA ＝ ${m}：${s}。どちらも面積は ${fr(corner)} S（3つとも同じ）`,
            `△DEF ＝ S − 3 × ${fr(corner)} S ＝ ${fr(frN(def, S2))} S`,
            kind === 'pct' ? `${def} ÷ ${S2} ＝ ${tpFmt(ans / 100)} より、${arPct(ans)}`
                : kind === 'area' ? `S ＝ ${S2 * (ans / def)}cm² なので、△DEF ＝ ${S2 * (ans / def)} × ${fr(frN(def, S2))} ＝ ${ans}cm²`
                    : `△ABC：△DEF ＝ S：${fr(frN(def, S2))} S ＝ ${S2}：${def}（約分して ${arRatioTxt(a0[0], a0[1])}）`
        ];
        return Object.assign({
            unit: AR_UNIT, title: '面積比（面積公式）', text,
            figure: { type: 'geom', items, pad: 40 }, prompt, correctAnswer: kind === 'ratio' ? ans : ans, tight: true, customChoices: ch, steps
        }, extra);
    }
    throw new Error('u26 Lv.4 の生成に失敗');
}

// ---- Lv.5 面積比（相似）・B：各辺の中点を順に結んだ入れ子の正三角形 ----
function arNested() {
    for (let t = 0; t < 3000; t++) {
        const n = getRandomChoice([3, 3, 3, 4, 4, 5]), p = getRandomChoice([0, 1, 1]), white = getRand() < 0.2, D = Math.pow(4, n);
        const hatched = j => j % 2 === p;                                  // j＝0..n-1 は外側から j 段目の隅の3つの三角形、j＝n は中心の三角形
        const num = j => j < n ? 3 * Math.pow(4, n - j - 1) : 1;
        let hs = 0; for (let j = 0; j <= n; j++) if (hatched(j)) hs += num(j);
        const target = white ? D - hs : hs; if (target <= 0 || target >= D) continue;
        const oth = (() => { let o = 0; for (let j = 0; j <= n; j++) if (!hatched(j)) o += num(j); return white ? D - o : o; })();
        const wrongs = [oth, target - 1, target + 1, target - 2, target + 2, target + 3, target - 3].filter(v => v > 0 && v < D && v !== target);
        const fillN = []; for (let g = 1; g <= 7; g++) [-1, 1].forEach(sg => { const v = target + sg * g; if (v > 0 && v < D) fillN.push({ key: v }); });
        const sel = arPick({ key: target }, [...shuffleArray(wrongs).map(v => ({ key: v })), ...shuffleArray(fillN)]); if (!sel) continue;
        const arr = sel.map(o => ({ v: o.key, f: frN(o.key, D) }));
        if (new Set(arr.map(o => o.f.join(':'))).size !== 5) continue;
        const customChoices = arr.map((o, i) => ({ value: o.v / D, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${frTxt(o.f)}`, isCorrect: o.v === target }));
        const r3 = Math.sqrt(3), up = getRand() < 0.5, S = up ? 1 : -1;
        const tri = [[0, S * r3], [-1, 0], [1, 0]], tris = [tri];
        for (let j = 0; j < n; j++) { const v = tris[j]; tris.push([Geom.lerp(v[0], v[1], 0.5), Geom.lerp(v[1], v[2], 0.5), Geom.lerp(v[2], v[0], 0.5)]); }
        const items = [];
        for (let j = 0; j <= n; j++) if (hatched(j)) {
            if (j === n) items.push({ k: 'poly', pts: tris[n], closed: true, shade: true, tag: 'hatch', lv: n });
            else tris[j].forEach((V, i) => items.push({ k: 'poly', pts: [V, Geom.lerp(V, tris[j][(i + 1) % 3], 0.5), Geom.lerp(V, tris[j][(i + 2) % 3], 0.5)], closed: true, shade: true, tag: 'hatch', lv: j }));
        }
        tris.forEach((v, j) => items.push({ k: 'poly', pts: v, closed: true, tag: 'tri', lv: j }));
        const qs = []; for (let j = 0; j <= n; j++) if (hatched(j) !== white) qs.push(j);
        const fq = j => j < n ? `${j + 1}番目の隅の3つの三角形：1つが ${frTxt(frN(1, Math.pow(4, j + 1)))}、3つで ${frTxt(frN(3, Math.pow(4, j + 1)))}` : `中心の三角形：${frTxt(frN(1, Math.pow(4, n)))}`;
        const steps = [
            '各辺の中点を結ぶと、できる小さな三角形は元の三角形と相似で、相似比は 1：2、面積比は 1：4。切り取った隅の三角形4つのうち、1つが中心の三角形、残り3つが隅の三角形になる',
            `一番大きい正三角形の面積を 1 とすると、外側から ${[...Array(n).keys()].map(j => `${j + 1}番目の隅の3つの三角形は ${frTxt(frN(3, Math.pow(4, j + 1)))}`).join('、')}、中心の三角形は ${frTxt(frN(1, D))}（足すと 1 になる）`,
            `${white ? '斜線でない' : '斜線の'}部分は、${qs.map(j => j === n ? '中心の三角形' : `${j + 1}番目の隅の3つの三角形`).join('、')}`,
            `${qs.map(j => (j < n ? `${frTxt(frN(3, Math.pow(4, j + 1)))}` : `${frTxt(frN(1, D))}`)).join(' ＋ ')} ＝ ${frTxt(frN(target, D))}`
        ];
        void fq;
        return {
            unit: AR_UNIT, title: '面積比（相似）・B',
            text: '図は、正三角形の各辺の中点を結んで順次小さな正三角形を描いたものである。一番大きい正三角形の面積を 1 としたとき、' + (white ? '斜線のない部分（一番大きい正三角形の内側）の面積の合計はいくらか。' : '斜線部分の面積の合計はいくらか。'),
            figure: { type: 'geom', items, pad: 30 },
            prompt: white ? '斜線のない部分の面積の合計はいくらですか。' : '斜線部分の面積の合計はいくらですか。',
            correctAnswer: target / D, fraction: true, tight: true, customChoices, steps
        };
    }
    throw new Error('u26 Lv.5 の生成に失敗');
}

// ---- Lv.6 面積比（面積公式）・B：辺 AB 上の D、辺 AC 上の E（A からの内分比）で三角形の面積 ----
const AR_ISO = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25]];        // [BC の半分 b, 高さ h, 辺 e]
function arRatioFormulaB() {
    for (let t = 0; t < 8000; t++) {
        const base = getRandomChoice(['iso', 'iso', 'right']);
        let S, A, B, C, given, txtHead, e = 0;
        if (base === 'iso') {
            const [b0, h0, e0] = getRandomChoice(AR_ISO), k = getRandomInt(1, 6); const b = b0 * k, h = h0 * k; e = e0 * k;
            if (e > 40 || 2 * b > 60 || h < 0.55 * b) continue;
            S = b * h; A = [0, h]; B = [-b, 0]; C = [b, 0];
            txtHead = `AB＝AC＝${e}cm、BC＝${2 * b}cm の二等辺三角形 ABC がある。`; given = { AB: e, AC: e, BC: 2 * b };
        } else {
            const p = getRandomInt(4, 15), q = getRandomInt(4, 15); if (p === q || (p * q) % 2 !== 0 || p * q > 150) continue;
            S = p * q / 2; A = [0, 0]; B = [p, 0]; C = [0, q];
            txtHead = `∠A＝90°、AB＝${p}cm、AC＝${q}cm の直角三角形 ABC がある。`; given = { AB: p, AC: q };
        }
        const s1 = getRandomInt(2, 7), s2 = getRandomInt(2, 7), m1 = getRandomInt(1, s1 - 1), m2 = getRandomInt(1, s2 - 1);
        if (tpGcd(m1, s1) !== 1 || tpGcd(m2, s2) !== 1) continue;
        const n1 = s1 - m1, n2 = s2 - m2, den = s1 * s2;
        const tg = getRandomChoice(['ADE', 'ADE', 'ADE', 'BDE', 'CDE', 'DBCE']);
        const fracNum = { ADE: m1 * m2, BDE: n1 * m2, CDE: m1 * n2, DBCE: den - m1 * m2 }[tg];
        const ans = S * fracNum / den; if (!Number.isInteger(ans) || ans < 4) continue;
        const wr = [S * m1 * m2 / den, S * n1 * m2 / den, S * m1 * n2 / den, S * n1 * n2 / den, S * (den - m1 * m2) / den, S * m1 / s1, S * m2 / s2, S / 2, S, S * n1 / s1, S * n2 / s2].filter(v => Number.isInteger(v) && v !== ans);
        const ch = arPickInt(ans, wr, 0, S + 1, Math.max(1, Math.round(ans / 12)), arCm2); if (!ch) continue;
        const mir = getRand() < 0.5, M = tpMir(mir), P = { A: M(A), B: M(B), C: M(C) };
        P.D = Geom.lerp(P.A, P.B, m1 / s1); P.E = Geom.lerp(P.A, P.C, m2 / s2);
        const items = [{ k: 'poly', pts: [P.A, P.B, P.C], closed: true }, { k: 'seg', a: P.D, b: P.E }];
        if (base === 'right') items.push({ k: 'rt', v: P.A, a: P.B, b: P.C, r: 10 });
        items.push(...arDivDots(P.A, P.B, s1), ...arDivDots(P.A, P.C, s2));
        if (tg === 'BDE') items.push({ k: 'seg', a: P.B, b: P.E, dash: true }); else if (tg === 'CDE') items.push({ k: 'seg', a: P.C, b: P.D, dash: true });
        items.push(...tpAutoLabels(items, P));
        const tgName = tg === 'DBCE' ? '四角形 DBCE' : `△${tg}`, fr = x => `{{${x[0]}/${x[1]}}}`;
        const f1 = frN(m1, s1), f2 = frN(m2, s2), g1 = frN(n1, s1), g2 = frN(n2, s2);
        const steps = [base === 'iso'
            ? `△ABC の面積：A から BC に垂線を下ろすと BC を2等分するので、高さは √(${e}² − ${tpFmt(given.BC / 2)}²) ＝ ${S / (given.BC / 2)}cm。面積 ＝ ${given.BC} × ${S / (given.BC / 2)} ÷ 2 ＝ ${S}cm²`
            : `△ABC の面積 ＝ ${given.AB} × ${given.AC} ÷ 2 ＝ ${S}cm²`,
        `AD：DB ＝ ${m1}：${n1} より AD：AB ＝ ${m1}：${s1}、AE：EC ＝ ${m2}：${n2} より AE：AC ＝ ${m2}：${s2}`,
        tg === 'ADE' ? `∠A が共通な2つの三角形の面積比は、はさむ2辺の比の積。△ADE ＝ △ABC × ${fr(f1)} × ${fr(f2)} ＝ ${S} × ${fr(frN(m1 * m2, den))}`
            : tg === 'BDE' ? `△BDE は、△ABE から △ADE を除いたもの、または △ABE の ${fr(g1)}。△ABE ＝ △ABC × ${fr(f2)}（高さが同じで底辺が AE：AC）、△BDE ＝ △ABE × BD/BA ＝ △ABC × ${fr(f2)} × ${fr(g1)} ＝ ${S} × ${fr(frN(n1 * m2, den))}`
                : tg === 'CDE' ? `△CDE ＝ △ACD × CE/CA。△ACD ＝ △ABC × ${fr(f1)}（高さが同じで底辺が AD：AB）、△CDE ＝ △ACD × ${fr(g2)} ＝ △ABC × ${fr(f1)} × ${fr(g2)} ＝ ${S} × ${fr(frN(m1 * n2, den))}`
                    : `四角形 DBCE ＝ △ABC − △ADE。△ADE ＝ △ABC × ${fr(f1)} × ${fr(f2)} ＝ ${S} × ${fr(frN(m1 * m2, den))} ＝ ${S * m1 * m2 / den}cm²（整数でなくても可）`,
        tg === 'DBCE' ? `${S} − ${S * m1 * m2 / den} ＝ ${ans}cm²` : `＝ ${ans}cm²`];
        return {
            unit: AR_UNIT, title: '面積比（面積公式）・B',
            text: `${txtHead}いま、辺 AB を ${m1}：${n1} に内分する点を D、辺 AC を ${m2}：${n2} に内分する点を E とする。`,
            figure: { type: 'geom', items, pad: 42 },
            prompt: `${tgName} の面積は何 cm² ですか。`,
            correctAnswer: ans, unitSuffix: 'cm²', tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u26 Lv.6 の生成に失敗');
}
