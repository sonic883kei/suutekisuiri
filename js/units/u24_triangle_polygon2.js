/**
 * u24_triangle_polygon2.js  —  ㉔ 三角形と多角形（続き）  Lv.5〜Lv.11
 *   Lv.5  有名三角形        … 2地点からの仰角（30°・45°・60°）から高さを求める。選択肢は √ を含む分数（2010 特別区Ⅲ類）
 *   Lv.6  三角形の相似①    … BC＝CD、CG∥DF、AE:EC、CE＝EF から ED（など）を求める（2009 東京消防庁Ⅱ類）
 *   Lv.7  三平方の定理      … 長方形の紙を折る問題。AP（など）を求める（2007 東京都Ⅲ類）
 *   Lv.8  チェバ・メネラウスの定理 … AF:FC、DC:CB、EB から AE（など）を求める。選択肢は小数（2011 警視庁Ⅲ類）
 *   Lv.9  角度・内角の和①  … D が ∠B・∠C の（等分）線上にある図で ∠BAC（または ∠BDC）を求める（2011 東京都Ⅲ類）
 *   Lv.10 角度・内角の和②  … 仰角と √3＝1.732 から建物の高さを求める（2007 国家再チャレンジ）
 *   Lv.11 三角形の相似②    … BC を m:n に分ける点 E、DE∥AC、DE の中点 F、AF と BC の交点 G から GE（など）を求める。選択肢は分数（2012 海上保安学校など）
 * 図はすべて座標から作る（実際の長さ・角度どおり）。tests/run.js が座標から実測して答えを照合する。
 * 共通部品（tpChoices など）と Lv.1〜4 は u24_triangle_polygon.js。
 */
const TP2_UNIT = '㉔ 三角形と多角形';
const TP2_LAB = ['①', '②', '③', '④', '⑤'];
const tpGcd = (a, b) => b ? tpGcd(b, a % b) : Math.abs(a);
const tpFmt = v => String(Math.round(v * 100) / 100);                          // 解説用（4.5 や 7）
const frN = (n, d) => { const g = tpGcd(n, d) || 1; return [n / g, d / g]; };   // 既約分数 [分子, 分母]
const frAdd = (x, y) => frN(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const frSub = (x, y) => frN(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const frMul = (x, y) => frN(x[0] * y[0], x[1] * y[1]);
const frTxt = x => x[1] === 1 ? String(x[0]) : `{{${x[0]}/${x[1]}}}`;
const frVal = x => x[0] / x[1];

// 線分と交点の計算
function tpInter(p1, p2, p3, p4) {              // 直線 p1p2 と直線 p3p4 の交点
    const d1 = Geom.sub(p2, p1), d2 = Geom.sub(p4, p3), t = Geom.cross(Geom.sub(p3, p1), d2) / Geom.cross(d1, d2);
    return Geom.add(p1, Geom.mul(d1, t));
}
function tpDistSeg(p, a, b) { const ab = Geom.sub(b, a), t = Math.max(0, Math.min(1, Geom.dot(Geom.sub(p, a), ab) / Geom.dot(ab, ab))); return Geom.len(Geom.sub(p, Geom.add(a, Geom.mul(ab, t)))); }
function tpSegsOf(items) {
    const segs = [];
    items.forEach(it => {
        if (it.k === 'seg') segs.push([it.a, it.b]);
        else if (it.k === 'poly') { const P = it.pts; for (let i = 0; i < P.length - (it.closed ? 0 : 1); i++) segs.push([P[i], P[(i + 1) % P.length]]); }
    });
    return segs;
}
// 点の名前を、その点につながる線が一番あいている向きに置く（線の途中にある点は、両側の向きを数える）
function tpAutoLabels(items, pts) {
    const segs = tpSegsOf(items), same = (x, y) => Math.hypot(x[0] - y[0], x[1] - y[1]) < 1e-9;
    return Object.keys(pts).map(name => {
        const p = pts[name], angs = [];
        segs.forEach(([a, b]) => {
            if (same(a, p)) angs.push(Math.atan2(b[1] - p[1], b[0] - p[0]));
            else if (same(b, p)) angs.push(Math.atan2(a[1] - p[1], a[0] - p[0]));
            else if (Geom.onSeg(p, a, b, 1e-7)) angs.push(Math.atan2(a[1] - p[1], a[0] - p[0]), Math.atan2(b[1] - p[1], b[0] - p[0]));
        });
        let dir = [0, 1];
        if (angs.length) {
            angs.sort((x, y) => x - y);
            let best = -1, mid = 0;
            for (let i = 0; i < angs.length; i++) { const a0 = angs[i], a1 = i + 1 < angs.length ? angs[i + 1] : angs[0] + 2 * Math.PI; if (a1 - a0 > best) { best = a1 - a0; mid = a0 + best / 2; } }
            dir = [Math.cos(mid), Math.sin(mid)];
        }
        return { k: 'lab', p, s: name, dir };
    });
}
// 長さの文字を、線分 ab のそばで他の線・他の文字から遠い側に置く（avoid: すでに置いた文字の位置 item.pr）
function tpSideTxt(items, a, b, s, px = 16, avoid = []) {
    const segs = tpSegsOf(items).filter(sg => !((sg[0] === a && sg[1] === b) || (sg[0] === b && sg[1] === a)));
    const pts = segs.flat(), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), ext = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const mid = Geom.lerp(a, b, 0.5), d = Geom.unit(Geom.sub(b, a)), nv = [-d[1], d[0]];
    const score = sg => { const q = Geom.add(mid, Geom.mul(nv, sg * 0.1 * ext)); return Math.min(...segs.map(([c, e]) => tpDistSeg(q, c, e)), ...avoid.map(o => Geom.len(Geom.sub(q, o)))); };
    const sg = score(1) >= score(-1) ? 1 : -1;
    return { k: 'txt', p: mid, s, dx: sg * nv[0] * px, dy: -sg * nv[1] * px, pr: Geom.add(mid, Geom.mul(nv, sg * 0.1 * ext)) };
}
// 並べて①〜⑤を付ける（items: {v, s, ok}）
function tpLabelChoices(items, desc) {
    const arr = [...items].sort((a, b) => desc ? b.v - a.v : a.v - b.v);
    return arr.map((it, i) => ({ value: it.v, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${it.s}`, isCorrect: !!it.ok }));
}
// 重心から見て点 name の置き場所などの計算で使う: 点の鏡映（図を左右反転）
const tpMir = (flag) => (p => flag ? [-p[0], p[1]] : p);

// ---- Lv.5 有名三角形（2地点からの仰角） ----
function tpFamous() {
    const [a, b] = getRandomChoice([[30, 45], [30, 60], [45, 60]]);
    const d = getRandomChoice([6, 8, 10, 12, 15, 18, 20, 24, 30, 40, 50]);
    const obj = getRandomChoice(['木', '電柱', '塔', '煙突', '旗ざお']);
    const S3 = Math.sqrt(3), cot = { 30: S3, 45: 1, 60: 1 / S3 };
    const ex = (n, den, v) => ({ n, den, v });
    const pair = (p, q) => p === 30 && q === 45 ? ex(`${d}`, '√3 − 1', d / (cot[p] - cot[q])) : p === 30 && q === 60 ? ex(`${d}√3`, '2', d / (cot[p] - cot[q])) : ex(`${d}√3`, '√3 − 1', d / (cot[p] - cot[q]));
    const plus = (p, q) => p === 30 && q === 45 ? ex(`${d}`, '√3 + 1', d / (cot[p] + cot[q])) : p === 30 && q === 60 ? ex(`${d}√3`, '4', d / (cot[p] + cot[q])) : ex(`${d}√3`, '√3 + 1', d / (cot[p] + cot[q]));
    const good = pair(a, b);
    const pool = [pair(30, 45), pair(30, 60), pair(45, 60), plus(30, 45), plus(30, 60), plus(45, 60),
        ex(`${d}`, '√3', d / S3), ex(`${d}`, '', d), ex(`${d}√3`, '', d * S3),
        ex(`${d}`, '√2', d / Math.SQRT2), ex(`${d}`, '√2 − 1', d / (Math.SQRT2 - 1)), ex(`${d}√2`, '', d * Math.SQRT2)];
    const chosen = [good];
    shuffleArray(pool).forEach(e => { if (chosen.length < 5 && chosen.every(c => Math.abs(c.v - e.v) / c.v > 0.015)) chosen.push(e); });
    const show = e => `${e.den ? `{{${e.n}/${e.den}}}` : e.n} m`;
    const dist = { 30: '√3 h', 45: 'h', 60: 'h ÷ √3' };
    const solve = a === 30 && b === 45
        ? [`√3 h − h ＝ ${d}、(√3 − 1) h ＝ ${d}`, `h ＝ {{${d}/√3 − 1}} m`]
        : a === 30 ? [`√3 h − h ÷ √3 ＝ h × (3 − 1) ÷ √3 ＝ {{2/√3}} h ＝ ${d}`, `h ＝ ${d} × {{√3/2}} ＝ {{${d}√3/2}} m`]
            : [`h − h ÷ √3 ＝ h × (√3 − 1) ÷ √3 ＝ ${d}`, `h ＝ ${d} × {{√3/√3 − 1}} ＝ {{${d}√3/√3 − 1}} m`];
    return {
        unit: TP2_UNIT, title: '有名三角形',
        text: `ある地点と${obj}の先端を結んだとき、その線と地面との間にできる角は ${a}° であり、この地点から水平に${obj}に向かって ${d}m 進んだ地点では、${b}° であった。この${obj}の高さはどれか。`,
        prompt: `${obj}の高さはいくつですか。`,
        correctAnswer: good.v, fraction: true, unitSuffix: 'm',
        customChoices: tpLabelChoices(chosen.map(e => ({ v: e.v, s: show(e), ok: e === good })), false),
        steps: [
            `${obj}の高さを h m とする。三角定規の辺の比は、30°・60°・90° が 1 : 2 : √3、45°・45°・90° が 1 : 1 : √2`,
            `${obj}の根もとから地点までの水平距離は、仰角 30° なら h の √3 倍（高さ : 水平距離 ＝ 1 : √3）、45° なら h と同じ、60° なら h ÷ √3（高さ : 水平距離 ＝ √3 : 1）`,
            `遠い地点（${a}°）は ${dist[a]}、近い地点（${b}°）は ${dist[b]} の距離にあり、その差が進んだ ${d}m なので ${dist[a]} − ${dist[b]} ＝ ${d}`,
            ...solve,
            `（${a}° と ${b}° の組み合わせを取りちがえたり、距離の差でなく和にしたりした式が、他の選択肢になっている）`
        ]
    };
}

// ---- Lv.6 三角形の相似①（BC＝CD、CG∥DF、AE:EC、CE＝EF） ----
function tpSimilar1() {
    for (let t = 0; t < 3000; t++) {
        const m = getRandomInt(2, 6), n = getRandomInt(1, 5); if (tpGcd(m, n) !== 1) continue;
        const c = getRandomInt(2, 15), tgt = getRandomChoice(['ED', 'ED', 'ED', 'DF', 'CG']);
        const GC = c * (m + n) / m, DF = 2 * GC, ED = DF - c, ans = tgt === 'ED' ? ED : tgt === 'DF' ? DF : GC;
        if (!Number.isInteger(ans) || ans < 2 || ans > 60) continue;
        // E を原点に、EC・EF を長さ c の2辺（なす角 φ）としてすべての点を決める
        const phi = 60 + 60 * getRand(), tt = (m + 2 * n) / m, u = Geom.dir(0), v = Geom.dir(phi);
        const raw = { E: [0, 0], C: Geom.mul(u, c), F: Geom.mul(v, c), A: Geom.mul(u, -(m / n) * c), D: Geom.mul(v, -tt * c), B: Geom.add(Geom.mul(u, 2 * c), Geom.mul(v, tt * c)) };
        const w = Geom.sub(raw.D, raw.B), th = -Math.atan2(w[1], w[0]), cs = Math.cos(th), sn = Math.sin(th);
        const rot = p => [p[0] * cs - p[1] * sn, p[0] * sn + p[1] * cs];                // BD が水平（B が左）になるよう回す
        let P = {}; Object.keys(raw).forEach(k => P[k] = rot(raw[k]));
        if (P.A[1] < P.B[1]) Object.keys(P).forEach(k => P[k] = [P[k][0], -P[k][1]]);   // A が上
        const base = Geom.len(Geom.sub(P.D, P.B)), hgt = P.A[1] - P.B[1];
        if (hgt < 0.4 * base || hgt > 1.4 * base) continue;
        P.G = Geom.lerp(P.B, P.F, 0.5);
        const keys = Object.keys(P); let crowd = false;
        for (let i = 0; i < keys.length && !crowd; i++) for (let j = i + 1; j < keys.length; j++) if (Geom.len(Geom.sub(P[keys[i]], P[keys[j]])) < 0.07 * base) { crowd = true; break; }
        if (crowd) continue;
        const items = [
            { k: 'seg', a: P.A, b: P.B }, { k: 'seg', a: P.A, b: P.C },
            { k: 'seg', a: P.B, b: P.C, tick: 2 }, { k: 'seg', a: P.C, b: P.D, tick: 2 },
            { k: 'seg', a: P.F, b: P.D }, { k: 'seg', a: P.G, b: P.C }
        ];
        const t1 = tpSideTxt(items, P.C, P.E, `${c}cm`); items.push(t1, tpSideTxt(items, P.E, P.F, `${c}cm`, 16, [t1.pr]));
        items.push(...tpAutoLabels(items, P));
        const steps = [
            `BC ＝ CD より C は BD の中点。CG∥DF なので、△BDF で G は BF の中点になり、CG ＝ DF ÷ 2`,
            `FE∥GC より △AEF ∽ △ACG。AE:EC ＝ ${m}:${n} なので AE:AC ＝ ${m}:${m + n}、したがって EF:CG ＝ ${m}:${m + n}`,
            `EF ＝ ${c}cm なので CG ＝ ${c} × ${m + n} ÷ ${m} ＝ ${tpFmt(GC)}cm`
        ];
        if (tgt === 'CG') steps.push(`求める CG は ${tpFmt(GC)}cm`);
        else if (tgt === 'DF') steps.push(`DF ＝ CG × 2 ＝ ${tpFmt(GC)} × 2 ＝ ${tpFmt(DF)}cm`);
        else steps.push(`DF ＝ CG × 2 ＝ ${tpFmt(DF)}cm。ED ＝ DF − EF ＝ ${tpFmt(DF)} − ${c} ＝ ${tpFmt(ED)}cm`);
        return {
            unit: TP2_UNIT, title: '三角形の相似①',
            text: `次の図において、BC＝CD、CG∥DF、AE：EC＝${m}：${n}、CE＝EF＝${c}cm であるとき、${tgt}の長さとして、正しいのはどれか。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: `${tgt}の長さはいくつですか。`,
            correctAnswer: ans, unitSuffix: 'cm', tight: true, consecutive: true, step: 1, steps
        };
    }
    throw new Error('u24 Lv.6 の生成に失敗');
}

// ---- Lv.7 三平方の定理（長方形の紙を折る） ----
let TP_FOLD_POOL = null;
function tpFold() {
    if (!TP_FOLD_POOL) {
        TP_FOLD_POOL = [];
        for (let H = 20; H <= 80; H++) for (let a = 4; a < H - 3; a++) { const num = H * H - a * a; if (num % (2 * H)) continue; const AP = num / (2 * H); if (AP >= 3 && AP <= H - 3) TP_FOLD_POOL.push([H, a, AP]); }
    }
    for (let t = 0; t < 5000; t++) {
        const [H, a, AP] = getRandomChoice(TP_FOLD_POOL), xq = (a * a + H * H) / (2 * a);
        const lo = Math.max(H + 10, Math.ceil(xq) + 4), hi = Math.min(Math.floor(2.4 * H), 130, Math.floor(a / 0.3)); if (lo > hi) continue;   // AE が短すぎない（文字が重ならない）
        let W = getRandomInt(lo, hi); if (getRand() < 0.7) { const w5 = Math.round(W / 5) * 5; if (w5 >= lo && w5 <= hi) W = w5; }
        const asked = getRandomChoice(['AP', 'AP', 'AP', 'PB']), ans = asked === 'AP' ? AP : H - AP, PB = H - AP;
        const A = [0, H], B = [0, 0], C = [W, 0], D = [W, H], E = [a, H], Pp = [0, H - AP], Q = [xq, 0];
        const items = [{ k: 'poly', pts: [A, B, C, D], closed: true }, { k: 'seg', a: Pp, b: E, dash: true }, { k: 'seg', a: E, b: Q, dash: true }, { k: 'seg', a: Pp, b: Q, dash: true }];
        items.push(...tpAutoLabels(items, { A, B, C, D, P: Pp, E, Q }));
        items.push({ k: 'txt', p: Geom.lerp(A, D, 0.5), s: `${W}cm`, dy: -34 }, { k: 'txt', p: Geom.lerp(A, E, 0.5), s: `${a}cm`, dy: -17 }, { k: 'txt', p: Geom.lerp(D, C, 0.5), s: `${H}cm`, dx: 36 });
        const steps = [
            `紙を折ると B が E に重なるので、折り目 PQ は BE の垂直二等分線。したがって PB ＝ PE`,
            `AP ＝ x cm とおくと、PB ＝ PE ＝ (${H} − x)cm`,
            `△APE は ∠A ＝ 90° の直角三角形で、AE ＝ ${a}cm。三平方の定理より x² ＋ ${a}² ＝ (${H} − x)²`,
            `右辺を展開すると x² ＋ ${a * a} ＝ ${H * H} − ${2 * H}x ＋ x²。x² が消えて ${2 * H}x ＝ ${H * H} − ${a * a} ＝ ${H * H - a * a}`,
            `x ＝ ${H * H - a * a} ÷ ${2 * H} ＝ ${AP}　よって AP ＝ ${AP}cm`
        ];
        if (asked === 'PB') steps.push(`PB ＝ AB − AP ＝ ${H} − ${AP} ＝ ${PB}cm（確認: PE ＝ ${PB}、AP² ＋ AE² ＝ ${AP * AP} ＋ ${a * a} ＝ ${PB * PB} ＝ PE²）`);
        return {
            unit: TP2_UNIT, title: '三平方の定理',
            text: `下図のように、長辺の長さが ${W}cm、短辺の長さが ${H}cm の長方形の紙の各頂点をそれぞれ A、B、C 及び D とし、頂点 B を AE ＝ ${a}cm である辺 AD 上の点 E に一致させて紙を折って広げ、残った折り目を PQ とするとき、${asked} の長さとして、正しいのはどれか。`,
            figure: { type: 'geom', items, pad: 58 },
            prompt: `${asked} の長さはいくつですか。`,
            correctAnswer: ans, unitSuffix: 'cm', tight: true, consecutive: true, step: 1, steps
        };
    }
    throw new Error('u24 Lv.7 の生成に失敗');
}

// ---- Lv.8 チェバ・メネラウスの定理 ----
function tpMenelaus() {
    for (let t = 0; t < 20000; t++) {
        const p = getRandomInt(1, 7), q = getRandomInt(1, 7), r = getRandomInt(1, 4), s = getRandomInt(1, 4);
        if (tpGcd(p, q) !== 1 || tpGcd(r, s) !== 1) continue;                  // 比は既約
        const rho = frN(r * p, (r + s) * q);                                   // AE/EB
        const askAE = getRand() < 0.75, given = askAE ? getRandomChoice([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30]) : getRandomChoice([1, 2, 3, 4, 5, 6, 8, 10]);
        const ok2 = x => x > 0.05 && Math.abs(x * 100 - Math.round(x * 100)) < 1e-9 && x < 100;
        const calc = X => askAE ? given * X : given / X;
        const ans = calc(frVal(rho)); if (!ok2(ans) || rho[0] === rho[1]) continue;
        const cands = [];
        for (const a1 of [r / (r + s), (r + s) / r, r / s, s / r]) for (const a2 of [p / q, q / p]) {
            const x = calc(a1 * a2); if (ok2(x) && Math.abs(x - ans) > 1e-9 && cands.every(y => Math.abs(y - x) > 1e-9)) cands.push(x);
        }
        if (cands.length < 4) continue;
        const wrong = shuffleArray(cands).slice(0, 4);
        // 図: B(0,0) C(s,0) D(r+s,0)。A は上のほう。F は AC 上、E は DF の延長と AB の交点
        const mir = getRand() < 0.5, M = tpMir(mir), Ax = s * (0.55 + 0.5 * getRand()), Ay = (r + s) * (0.9 + 0.5 * getRand());
        const A = [Ax, Ay], B = [0, 0], C = [s, 0], D = [r + s, 0], F = Geom.lerp(A, C, p / (p + q)), E = tpInter(D, F, A, B);
        const pts = { A, B, C, D, E, F }, ks = Object.keys(pts), base = r + s; let crowd = false;
        for (let i = 0; i < ks.length && !crowd; i++) for (let j = i + 1; j < ks.length; j++) if (Geom.len(Geom.sub(pts[ks[i]], pts[ks[j]])) < 0.11 * base) { crowd = true; break; }
        if (crowd || E[0] < 0 || !Geom.onSeg(E, A, B)) continue;
        const MP = {}; ks.forEach(k => MP[k] = M(pts[k]));
        const items = [{ k: 'seg', a: MP.A, b: MP.B }, { k: 'seg', a: MP.B, b: MP.D }, { k: 'seg', a: MP.A, b: MP.C }, { k: 'seg', a: MP.E, b: MP.D }];
        items.push(...tpAutoLabels(items, MP));
        const fm = x => Math.abs(x * 10 - Math.round(x * 10)) < 1e-9 ? x.toFixed(1) : x.toFixed(2);
        const choices = tpLabelChoices([{ v: ans, s: `${fm(ans)}cm`, ok: true }, ...wrong.map(x => ({ v: x, s: `${fm(x)}cm` }))], false);
        const ratioTxt = frTxt(rho);
        const steps = [
            `△ABC と、辺 AB 上の点 E・辺 AC 上の点 F・BC の延長上の点 D を通る直線にメネラウスの定理を使う`,
            `{{AE/EB}} × {{BD/DC}} × {{CF/FA}} ＝ 1（三角形を1周するように、分母・分子の頂点をつなぐ）`,
            `DC:CB ＝ ${r}:${s} より BD:DC ＝ ${r + s}:${r}、つまり {{BD/DC}} ＝ {{${r + s}/${r}}}。AF:FC ＝ ${p}:${q} より {{CF/FA}} ＝ {{${q}/${p}}}`,
            `{{AE/EB}} ＝ 1 ÷ ({{${r + s}/${r}}} × {{${q}/${p}}}) ＝ {{${r * p}/${(r + s) * q}}}${rho[1] !== (r + s) * q ? ` ＝ ${ratioTxt}` : ''}`,
            askAE ? `EB ＝ ${given}cm なので AE ＝ ${given} × ${ratioTxt} ＝ ${tpFmt(ans)}cm` : `AE ＝ ${given}cm なので EB ＝ ${given} ÷ ${ratioTxt} ＝ ${tpFmt(ans)}cm`
        ];
        return {
            unit: TP2_UNIT, title: 'チェバ・メネラウスの定理',
            text: `次の図において、AF：FC＝${p}：${q}、DC：CB＝${r}：${s}、${askAE ? `EB＝${given}cm とするとき、AE` : `AE＝${given}cm とするとき、EB`} の長さとして、正しいのはどれか。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: `${askAE ? 'AE' : 'EB'} の長さはいくつですか。`,
            correctAnswer: ans, decimals: 2, unitSuffix: 'cm', tight: true, customChoices: choices, steps
        };
    }
    throw new Error('u24 Lv.8 の生成に失敗');
}

// ---- Lv.9 角度・内角の和①（D が ∠B・∠C を等分する線上にある） ----
function tpAngle1() {
    for (let t = 0; t < 3000; t++) {
        const k = getRandomChoice([1, 1, 1, 2, 3]), mode = getRandomChoice(['A', 'A', 'D']);
        const S = getRandomInt(20, Math.floor(152 / (k + 1))), theta = 180 - S, A = 180 - (k + 1) * S;      // S ＝ ∠DBC ＋ ∠DCB
        if (A < 28 || A > 120) continue;
        const y = S * (0.38 + 0.24 * getRand()), z = S - y, L = 10;
        const beta = (k + 1) * y, gamma = (k + 1) * z, AB = L * Math.sin(gamma * Math.PI / 180) / Math.sin(A * Math.PI / 180), DB = L * Math.sin(z * Math.PI / 180) / Math.sin(theta * Math.PI / 180);
        const Bp = [0, 0], Cp = [L, 0], Ap = Geom.mul(Geom.dir(beta), AB), Dp = Geom.mul(Geom.dir(y), DB);
        if (Ap[1] > 1.2 * L || Ap[1] < 0.35 * L) continue;
        { const xsA = [0, L, Ap[0], Dp[0]], ext = Math.max(Math.max(...xsA) - Math.min(...xsA), Ap[1]), sc = 220 / ext; if (Dp[1] * sc < 44) continue; }   // ∠BDC の数値が底辺の線にかからない
        const mir = getRand() < 0.5, M = tpMir(mir), P = { A: M(Ap), B: M(Bp), C: M(Cp), D: M(Dp) };
        const items = [{ k: 'poly', pts: [P.A, P.B, P.C], closed: true }, { k: 'seg', a: P.B, b: P.D }, { k: 'seg', a: P.D, b: P.C }];
        items.push(...tpAutoLabels(items, P));
        items.push({ k: 'ang', v: P.D, a: P.B, b: P.C, r: 17, s: mode === 'A' ? `${theta}°` : undefined, tag: mode === 'A' ? 'given' : 'x' },
            { k: 'ang', v: P.A, a: P.B, b: P.C, r: 22, s: mode === 'D' ? `${A}°` : undefined, tag: mode === 'D' ? 'given' : 'x' });
        const cond = k === 1 ? '∠ABD＝∠CBD、かつ、∠ACD＝∠BCD' : `∠ABD＝${k}∠CBD、かつ、∠ACD＝${k}∠BCD`;
        const ans = mode === 'A' ? A : theta, st = getRandomChoice([2, 3, 3, 4, 5, 6]);
        const text = mode === 'A'
            ? `下図のように、三角形 ABC と、辺 BC が共通で ∠BDC＝${theta}° の三角形 DBC があり、${cond}であるとき、∠BAC の角度として、正しいのはどれか。`
            : `下図のように、三角形 ABC と、辺 BC が共通の三角形 DBC があり、∠BAC＝${A}°、${cond}であるとき、∠BDC の角度として、正しいのはどれか。`;
        const steps = mode === 'A' ? [
            `∠DBC ＝ ●、∠DCB ＝ ○ とおく。△DBC の内角の和より ● ＋ ○ ＝ 180° − ${theta}° ＝ ${S}°`,
            `∠ABD ＝ ${k === 1 ? '∠CBD' : `${k}×●`} なので ∠ABC ＝ ● ＋ ${k === 1 ? '●' : `${k}●`} ＝ ${k + 1}●。同じように ∠ACB ＝ ${k + 1}○`,
            `∠ABC ＋ ∠ACB ＝ ${k + 1}×(● ＋ ○) ＝ ${k + 1} × ${S}° ＝ ${(k + 1) * S}°`,
            `△ABC の内角の和より ∠BAC ＝ 180° − ${(k + 1) * S}° ＝ ${A}°`
        ] : [
            `△ABC の内角の和より ∠ABC ＋ ∠ACB ＝ 180° − ${A}° ＝ ${(k + 1) * S}°`,
            `∠DBC ＝ ●、∠DCB ＝ ○ とおくと、∠ABC ＝ ${k + 1}●、∠ACB ＝ ${k + 1}○。${k + 1}(● ＋ ○) ＝ ${(k + 1) * S}° より ● ＋ ○ ＝ ${S}°`,
            `△DBC の内角の和より ∠BDC ＝ 180° − ${S}° ＝ ${theta}°`
        ];
        if (k === 1) steps.push(`（D は ∠B と ∠C の二等分線の交点なので、∠BDC ＝ 90° ＋ ∠A ÷ 2 ＝ 90° ＋ ${A}° ÷ 2 ＝ ${theta}° と覚えておくと速い）`);
        return {
            unit: TP2_UNIT, title: '角度・内角の和①', text,
            figure: { type: 'geom', items, pad: 40 },
            prompt: `${mode === 'A' ? '∠BAC' : '∠BDC'} の角度は何度ですか。`,
            correctAnswer: ans, unitSuffix: '°', tight: true, consecutive: true, step: st, maxValue: 179, steps
        };
    }
    throw new Error('u24 Lv.9 の生成に失敗');
}

// ---- Lv.10 角度・内角の和②（仰角と √3＝1.732） ----
function tpElevation() {
    for (let t = 0; t < 5000; t++) {
        const kind = getRandomChoice(['tan', 'tan', 'sin']), th = getRandomChoice([30, 60]), h0 = getRandomChoice([1.2, 1.4, 1.5, 1.6, 1.7, 1.8]);
        const d = getRandomChoice([10, 12, 15, 18, 20, 24, 30]), Ld = getRandomChoice([8, 10, 12, 16, 20, 24, 30, 40]);
        const s3 = 1.732, x = kind === 'tan' ? (th === 30 ? d * s3 / 3 : d * s3) : (th === 30 ? Ld / 2 : Ld * s3 / 2), v = h0 + x;
        const xt = kind === 'tan' ? d * Math.tan(th * Math.PI / 180) : Ld * Math.sin(th * Math.PI / 180);
        const r10 = v * 10; if (Math.abs(r10 - Math.floor(r10) - 0.5) < 0.12) continue;                 // 四捨五入の境目に近い値は使わない
        const ans = Math.round(v * 10) / 10; if (Math.round((h0 + xt) * 10) / 10 !== ans) continue;       // 本当の √3 でも同じ答えになること
        const dh = kind === 'tan' ? d : Ld * Math.cos(th * Math.PI / 180), Ht = h0 + dh * Math.tan(th * Math.PI / 180), bw = Math.max(2, dh * 0.3);
        const Eye = [0, h0], Top = [dh, Ht];
        const items = [
            { k: 'seg', a: [-0.15 * dh, 0], b: [dh + bw + 0.15 * dh, 0] },
            { k: 'poly', pts: [[dh, 0], [dh, Ht], [dh + bw, Ht], [dh + bw, 0]], closed: true },
            { k: 'seg', a: [0, 0], b: [0, h0 - 0.6] }, { k: 'circ', c: [0, h0 - 0.3], r: 0.3 },
            { k: 'seg', a: Eye, b: [dh, h0], dash: true }, { k: 'seg', a: Eye, b: Top },
            { k: 'rt', v: [dh, h0], a: Eye, b: Top, r: 9 },
            { k: 'ang', v: Eye, a: [dh, h0], b: Top, s: `${th}°`, r: th === 30 ? 40 : 28, tag: 'given' },
            { k: 'txt', p: [0, h0 / 2], s: `${h0}m`, dx: -28 }
        ];
        if (kind === 'tan') items.push({ k: 'txt', p: [dh / 2, 0], s: `${d}m`, dy: 17 });
        else items.push({ k: 'txt', p: Geom.lerp(Eye, Top, 0.5), s: `${Ld}m`, dx: -Math.sin(th * Math.PI / 180) * 18, dy: -Math.cos(th * Math.PI / 180) * 18 });
        const xx = tpFmt(x);
        const steps = [
            `目の高さ ${h0}m から建物の上端までの高さを x m とすると、建物の高さ ＝ x ＋ ${h0}（m）`,
            kind === 'tan'
                ? `底辺（水平距離）${d}m・仰角 ${th}° の直角三角形。30°・60°・90° の辺の比は 1 : 2 : √3 なので、${th === 30 ? `高さ : 底辺 ＝ 1 : √3 より x ＝ ${d} ÷ √3 ＝ ${d}√3 ÷ 3 ＝ ${d} × 1.732 ÷ 3 ＝ ${xx}` : `高さ : 底辺 ＝ √3 : 1 より x ＝ ${d} × √3 ＝ ${d} × 1.732 ＝ ${xx}`}`
                : `斜辺 ${Ld}m・仰角 ${th}° の直角三角形。30°・60°・90° の辺の比は 1 : 2 : √3 なので、${th === 30 ? `高さ : 斜辺 ＝ 1 : 2 より x ＝ ${Ld} ÷ 2 ＝ ${xx}` : `高さ : 斜辺 ＝ √3 : 2 より x ＝ ${Ld} × √3 ÷ 2 ＝ ${Ld} × 1.732 ÷ 2 ＝ ${xx}`}`,
            `建物の高さ ＝ ${xx} ＋ ${h0} ＝ ${tpFmt(v)}（m）。およそ ${ans}m`
        ];
        const text = kind === 'tan'
            ? `図のように、ある建物から ${d}m 離れた地点で、高さ ${h0}m の位置から建物の上端の仰角を測ったところ ${th}° であった。このとき、この建物の高さはおよそいくらか。ただし、√3 ＝ 1.732 とする。`
            : `図のように、ある地点で、高さ ${h0}m の位置から建物の上端を見上げたところ、仰角は ${th}° で、その位置から上端までの距離は ${Ld}m であった。このとき、この建物の高さはおよそいくらか。ただし、√3 ＝ 1.732 とする。`;
        return {
            unit: TP2_UNIT, title: '角度・内角の和②', text,
            figure: { type: 'geom', items, pad: 48 },
            prompt: '建物の高さはおよそ何 m ですか。',
            correctAnswer: ans, decimals: 1, unitSuffix: 'm', tight: true, consecutive: true, step: getRandomChoice([0.3, 0.3, 0.2, 0.4]), steps
        };
    }
    throw new Error('u24 Lv.10 の生成に失敗');
}

// ---- Lv.11 三角形の相似②（BE:EC、DE∥AC、DE の F、AF と BC の交点 G） ----
function tpSimilar2() {
    for (let t = 0; t < 8000; t++) {
        const m = getRandomInt(1, 5), n = getRandomInt(1, 5), L = getRandomChoice([4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20]);
        if (tpGcd(m, n) !== 1) continue;                                        // 比は既約
        const mid = getRand() < 0.7, [u, v] = mid ? [1, 1] : getRandomChoice([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]]);
        const rho = frN(v * m, (u + v) * (m + n));                               // FE : AC
        const BE = frN(L * m, m + n), EC = frN(L * n, m + n), kap = frN(rho[0], rho[1] - rho[0]);   // GE : EC ＝ ρ : (1 − ρ)
        const GE = frMul(kap, EC), BG = frSub(BE, GE), GC = frAdd(GE, EC);
        if (BG[0] <= 0 || frVal(BG) < 0.1 * L || frVal(GE) < 0.1 * L) continue;
        const tgt = getRandomChoice(['GE', 'GE', 'GE', 'BG', 'GC']), val = { GE, BG, GC }[tgt];
        if (val[1] === 1 || val[1] > 40 || val[0] > 80) continue;
        const toT = ge => tgt === 'GE' ? ge : tgt === 'BG' ? frSub(BE, ge) : frAdd(ge, EC);
        const rs = frN(v * n, (u + v) * (m + n)), tf = frN(v, u + v);
        const wrongGE = [frMul(rho, EC), frMul(frN(rho[0], rho[1] + rho[0]), EC), frMul(frN(tf[0], tf[1] - tf[0]), EC), frMul(frN(rs[0], rs[1] - rs[0]), EC), frMul([1, 2], EC), frMul(kap, BE), frMul(rho, BE)];
        const cands = [...wrongGE.map(toT), ...[GE, BG, GC].filter(x => x !== val)];
        const uniq = [];
        cands.forEach(x => { if (frVal(x) > 0.05 && x[1] > 1 && x[1] <= 40 && x[0] <= 80 && !(x[0] === val[0] && x[1] === val[1]) && uniq.every(y => !(y[0] === x[0] && y[1] === x[1]))) uniq.push(x); });
        if (uniq.length < 4) continue;
        const wrong = shuffleArray(uniq).slice(0, 4);
        // 図
        const Ax = L * (0.25 + 0.55 * getRand()), Ay = L * (0.55 + 0.35 * getRand()), mir = getRand() < 0.5, M = tpMir(mir);
        const Ap = [Ax, Ay], Bp = [0, 0], Cp = [L, 0], Ep = [frVal(BE), 0], Dp = Geom.lerp(Bp, Ap, m / (m + n)), Fp = Geom.lerp(Dp, Ep, u / (u + v)), Gp = tpInter(Ap, Fp, Bp, Cp);
        const raw = { A: Ap, B: Bp, C: Cp, D: Dp, E: Ep, F: Fp, G: Gp }, ks = Object.keys(raw); let crowd = false;
        for (let i = 0; i < ks.length && !crowd; i++) for (let j = i + 1; j < ks.length; j++) if (Geom.len(Geom.sub(raw[ks[i]], raw[ks[j]])) < 0.09 * L) { crowd = true; break; }
        if (crowd) continue;
        const P = {}; ks.forEach(k => P[k] = M(raw[k]));
        const items = [{ k: 'poly', pts: [P.A, P.B, P.C], closed: true }, { k: 'seg', a: P.D, b: P.F, tick: mid ? 1 : 0 }, { k: 'seg', a: P.F, b: P.E, tick: mid ? 1 : 0 }, { k: 'seg', a: P.A, b: P.G }];
        items.push(...tpAutoLabels(items, P));
        const sv = x => `${frTxt(x)}cm`;
        const steps = [
            `BE：EC ＝ ${m}：${n}、BC ＝ ${L}cm より BE ＝ ${sv(BE)}、EC ＝ ${sv(EC)}`,
            `DE∥AC より △BDE ∽ △BAC。DE：AC ＝ BE：BC ＝ ${m}：${m + n}`,
            mid ? `F は DE の中点なので FE ＝ DE ÷ 2。FE：AC ＝ ${m}：${2 * (m + n)}${rho[1] !== 2 * (m + n) ? `（＝ ${rho[0]}：${rho[1]}）` : ''}`
                : `DF：FE ＝ ${u}：${v} より FE：DE ＝ ${v}：${u + v}。FE：AC ＝ ${v * m}：${(u + v) * (m + n)}${rho[1] !== (u + v) * (m + n) ? `（＝ ${rho[0]}：${rho[1]}）` : ''}`,
            `FE∥AC より △GFE ∽ △GAC。GE：GC ＝ FE：AC ＝ ${rho[0]}：${rho[1]}。GC ＝ GE ＋ EC なので GE：EC ＝ ${rho[0]}：${rho[1] - rho[0]}`,
            `GE ＝ EC × {{${rho[0]}/${rho[1] - rho[0]}}} ＝ ${sv(EC)} × {{${rho[0]}/${rho[1] - rho[0]}}} ＝ ${sv(GE)}`
        ];
        if (tgt === 'BG') steps.push(`BG ＝ BE − GE ＝ ${sv(BE)} − ${sv(GE)} ＝ ${sv(BG)}`);
        if (tgt === 'GC') steps.push(`GC ＝ GE ＋ EC ＝ ${sv(GE)} ＋ ${sv(EC)} ＝ ${sv(GC)}`);
        return {
            unit: TP2_UNIT, title: '三角形の相似②',
            text: `三角形 ABC の辺 BC を BE：EC＝${m}：${n} に分ける点を E とし、この点 E から辺 AC と平行な線が辺 AB と交わる点を D とする。また、線分 DE ${mid ? 'の中点' : `を DF：FE＝${u}：${v} に分ける点`}を F とし、点 A と点 F を通る線が辺 BC と交わる点を G とする。辺 BC の長さを ${L}cm とした場合、線分 ${tgt} の長さとして正しいのはどれか。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: `線分 ${tgt} の長さはいくつですか。`,
            correctAnswer: frVal(val), fraction: true, unitSuffix: 'cm',
            customChoices: tpLabelChoices([{ v: frVal(val), s: sv(val), ok: true }, ...wrong.map(x => ({ v: frVal(x), s: sv(x) }))], true), steps
        };
    }
    throw new Error('u24 Lv.11 の生成に失敗');
}
