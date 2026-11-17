/**
 * u25_circle.js  —  ㉕ 円（図形分野 第2単元）
 *   Lv.1 円周角・対角の和 … 円に内接する等脚台形と角の二等分線。∠ECF（または ∠ABC）を求める（2005 海上保安学校など）
 *   Lv.2 接弦定理         … 外接円の外の点 P から引いた接線 PA・PB。三角形の2角から ∠APB など（2014 警視庁Ⅲ類）
 *   Lv.3 内接円           … 直角三角形の内接円の半径（2005 海上保安学校など）。三辺が整数の直角三角形
 *   Lv.4 円と接線①       … 2つの円の共通接線の長さ。接する円（選択肢は √）／中心間の距離が与えられる外接線・内接線（2014 大阪府）
 *   Lv.5 円周角           … 円周を n 等分する点と、交わる弦のつくる角／円周角（2016 特別区Ⅲ類）
 *   Lv.6 内心             … 内心 I と ∠BIC ＝ 90° ＋ ∠A ÷ 2（2008 裁判所事務官Ⅲ種）
 *   Lv.7 円と接線②       … 直線に接して並ぶ3つの円と、両端の垂線の距離 X（2006 海上保安学校など）
 * 図は座標から作り、tests/run.js が座標から円・接線・角度・長さを実測して答えを照合する。
 * 共通部品は u24_triangle_polygon.js / u24_triangle_polygon2.js（tpAutoLabels, tpSideTxt, tpChoices, tpMir など）。
 */
UnitRegistry.register({
    id: 'u25', name: '㉕ 円', chap: 3, section: '図形分野',
    generate(level) {
        const fns = [cpTrapezoid, cpTangentChord, cpIncircle, cpTangentLine, cpArcAngle, cpIncenter, cpThreeCircles];
        const lv = Number.isInteger(parseInt(level)) && parseInt(level) >= 1 && parseInt(level) <= fns.length ? parseInt(level) : getRandomInt(1, fns.length);
        return fns[lv - 1]();
    }
});

const CP_UNIT = '㉕ 円';
const CP_O = [0, 0];
const cpDir = deg => Geom.dir(deg);
const cpRadLabs = (pts, c = CP_O) => Object.keys(pts).map(s => ({ k: 'lab', p: pts[s], s, from: c }));   // 円周上の点の名前は円の外向きに置く
function cpSurd(n) { let o = 1, i = n; for (let f = 2; f * f <= i; f++) while (i % (f * f) === 0) { o *= f; i /= f * f; } return [o, i]; }   // √n ＝ o√i
const cpSurdTxt = (a, b) => b === 1 ? String(a) : (a === 1 ? '' : String(a)) + '√' + b;
// 等間隔(st)の5択。値が (lo, hi) から出ない位置のうち、正解の位置をランダムに選ぶ
function cpConsec(ans, st, lo, hi, fmt) {
    const ok = [];
    for (let pos = 0; pos < 5; pos++) { const mn = ans - pos * st, mx = ans + (4 - pos) * st; if (mn > lo + 1e-9 && mx < hi - 1e-9) ok.push(pos); }
    if (!ok.length) return null;
    const pos = getRandomChoice(ok);
    return [0, 1, 2, 3, 4].map(i => { const v = Math.round((ans + (i - pos) * st) * 1000) / 1000; return { value: v, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${fmt(v)}`, isCorrect: i === pos }; });
}
// 正解＋誤答候補から、(lo, hi) に収まる昇順の5択を作る
function cpScatter(ans, wrongs, lo, hi, spread, fmt) {
    const set = new Set([ans]);
    shuffleArray(wrongs.filter(v => Number.isInteger(v) && v > lo && v < hi && v !== ans)).forEach(v => { if (set.size < 5) set.add(v); });
    for (let g = 0; set.size < 5 && g < 500; g++) { const v = ans + getRandomChoice([-1, 1]) * getRandomInt(1, 8) * spread; if (v > lo && v < hi) set.add(v); }
    return [...set].sort((a, b) => a - b).map((v, i) => ({ value: v, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${fmt(v)}`, isCorrect: v === ans }));
}
const cpDeg = v => Math.abs(v - Math.round(v)) < 1e-9 ? `${Math.round(v)}°` : `${v.toFixed(1)}°`;

// ---- Lv.1 円周角・対角の和（円に内接する等脚台形 ABCD、∠BAD の二等分線と円の交点 E、DC の延長上の点 F） ----
function cpTrapezoid() {
    for (let t = 0; t < 5000; t++) {
        const beta = 2 * getRandomInt(25, 42), kind = getRandomChoice(['ECF', 'ECF', 'findBeta']);          // ∠ABC ＝ 50°〜84°
        const al = getRandomInt(18, 45), ga = al + 180 - 2 * beta;                                           // A・D は上、B・C は下。弧 ADC の大きさ ＝ 2β
        if (ga < 22 || ga > 78 || al + 3 * ga < 195) continue;
        const ea = -(al + ga) / 2;                                                                           // E は弧 BD（A を含まない方）の中点
        if (Math.abs(ea - (-90 + ga)) < 14 || Math.abs(ea - (-90 - ga)) < 14) continue;                      // E が C・B に近すぎない
        const mir = getRand() < 0.5, M = tpMir(mir);
        const raw = { A: cpDir(90 + al), B: cpDir(-90 - ga), C: cpDir(-90 + ga), D: cpDir(90 - al), E: cpDir(ea) };
        const P = {}; Object.keys(raw).forEach(k => P[k] = M(raw[k]));
        const Fp = Geom.add(P.C, Geom.mul(Geom.sub(P.C, P.D), 0.45)), x = 90 - beta / 2;
        const items = [{ k: 'circ', c: CP_O, r: 1, tag: 'circle' }, { k: 'poly', pts: [P.A, P.B, P.C, P.D], closed: true }, { k: 'seg', a: P.A, b: P.E }, { k: 'seg', a: P.C, b: Fp }];
        items.push(...cpRadLabs(P), { k: 'lab', p: Fp, s: 'F', dir: Geom.unit(Geom.sub(P.C, P.D)) });
        items.push({ k: 'ang', v: P.A, a: P.B, b: P.E, r: 15 }, { k: 'ang', v: P.A, a: P.E, b: P.D, r: 22 },
            { k: 'ang', v: P.C, a: P.E, b: Fp, r: 17, s: kind === 'findBeta' ? `${x}°` : undefined, tag: kind === 'findBeta' ? 'given' : 'x' });
        const ans = kind === 'ECF' ? x : beta, st = getRandomChoice([5, 5, 5, 4, 6, 10]);
        const ch = cpConsec(ans, st, 0, 180, v => `${v}°`); if (!ch) continue;
        const steps = kind === 'ECF' ? [
            `AD∥BC なので、同側内角の和より ∠BAD ＝ 180° − ∠ABC ＝ 180° − ${beta}° ＝ ${180 - beta}°`,
            `AE は ∠BAD の二等分線なので ∠DAE ＝ ${180 - beta}° ÷ 2 ＝ ${x}°`,
            `A・D・C・E は同じ円周上の点で、四角形 ADCE は円に内接する。向かい合う角の和は 180° なので ∠ECD ＋ ∠DAE ＝ 180°`,
            `∠ECF ＝ 180° − ∠ECD ＝ ∠DAE ＝ ${x}°（円に内接する四角形の外角は、向かい合う内角に等しい）`
        ] : [
            `四角形 ADCE は円に内接するので、外角 ∠ECF ＝ 向かい合う内角 ∠DAE ＝ ${x}°`,
            `AE は ∠BAD の二等分線なので ∠BAD ＝ ${x}° × 2 ＝ ${2 * x}°`,
            `AD∥BC なので、同側内角の和より ∠ABC ＝ 180° − ∠BAD ＝ 180° − ${2 * x}° ＝ ${180 - 2 * x}°`
        ];
        return {
            unit: CP_UNIT, title: '円周角・対角の和',
            text: `図のような、円に内接する等脚台形 ABCD があり、AD と BC は平行である。また、∠BAD の二等分線が円と交わる点を E、DC の延長線上の点を F とする。${kind === 'ECF' ? `∠ABC が ${beta}° のとき、∠ECF` : `∠ECF が ${x}° のとき、∠ABC`} の大きさはいくらか。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: `${kind === 'ECF' ? '∠ECF' : '∠ABC'} の大きさは何度ですか。`,
            correctAnswer: ans, unitSuffix: '°', tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u25 Lv.1 の生成に失敗');
}

// ---- Lv.2 接弦定理（外接円の外の点 P から引いた接線 PA・PB） ----
function cpTangentChord() {
    for (let t = 0; t < 5000; t++) {
        const kind = getRandomChoice(['APB', 'APB', 'APB', 'CAB', 'ACB']);
        const xA = getRandomInt(30, 85), yB = getRandomInt(30, 85), thc = 180 - xA - yB;         // ∠CAB, ∠CBA, ∠ACB
        if (thc < 30 || thc > 75) continue;
        const apb = 180 - 2 * thc, mir = getRand() < 0.5, M = tpMir(mir);
        const raw = { P: [-1 / Math.cos(thc * Math.PI / 180), 0], A: cpDir(180 - thc), B: cpDir(180 + thc), C: cpDir(180 - thc - 2 * yB) };
        const Pt = {}; Object.keys(raw).forEach(k => Pt[k] = M(raw[k]));
        const items = [{ k: 'circ', c: CP_O, r: 1, tag: 'circle' }, { k: 'poly', pts: [Pt.A, Pt.B, Pt.C], closed: true }, { k: 'seg', a: Pt.P, b: Pt.A }, { k: 'seg', a: Pt.P, b: Pt.B }];
        items.push({ k: 'lab', p: Pt.A, s: 'A', from: CP_O }, { k: 'lab', p: Pt.B, s: 'B', from: CP_O }, { k: 'lab', p: Pt.C, s: 'C', from: CP_O }, { k: 'lab', p: Pt.P, s: 'P', dir: Geom.unit(Geom.sub(Pt.P, CP_O)) });
        const arc = (v, a, b, val, given, r) => ({ k: 'ang', v, a, b, r, s: given ? `${val}°` : undefined, tag: given ? 'given' : 'x' });
        let ans, asked, st = getRandomChoice([5, 5, 5, 4, 6, 10]);
        if (kind === 'APB') { ans = apb; asked = '∠APB'; items.push(arc(Pt.A, Pt.B, Pt.C, xA, true, 20), arc(Pt.B, Pt.A, Pt.C, yB, true, 20), arc(Pt.P, Pt.A, Pt.B, apb, false, 22)); }
        else if (kind === 'CAB') { ans = xA; asked = '∠CAB'; items.push(arc(Pt.A, Pt.B, Pt.C, xA, false, 20), arc(Pt.B, Pt.A, Pt.C, yB, true, 20), arc(Pt.P, Pt.A, Pt.B, apb, true, 22)); }
        else { ans = thc; asked = '∠ACB'; items.push(arc(Pt.C, Pt.A, Pt.B, thc, false, 20), arc(Pt.P, Pt.A, Pt.B, apb, true, 22)); }
        const ch = cpConsec(ans, st, 0, 180, v => `${v}°`); if (!ch) continue;
        const steps = kind === 'APB' ? [
            `三角形の内角の和より ∠ACB ＝ 180° − ${xA}° − ${yB}° ＝ ${thc}°`,
            `弦 AB に対する円周角が ∠ACB なので、円の中心を O とすると中心角 ∠AOB ＝ 2 × ${thc}° ＝ ${2 * thc}°`,
            `接線は接点を通る半径に垂直なので ∠OAP ＝ ∠OBP ＝ 90°。四角形 OAPB の内角の和は 360° なので ∠APB ＝ 360° − 90° − 90° − ${2 * thc}° ＝ ${apb}°`,
            `（別解）接弦定理より ∠PAB ＝ ∠ACB ＝ ${thc}°。PA ＝ PB（接線の長さ）なので △PAB は二等辺三角形で ∠APB ＝ 180° − ${thc}° × 2 ＝ ${apb}°`
        ] : kind === 'CAB' ? [
            `PA ＝ PB（接線の長さ）なので △PAB は二等辺三角形。∠PAB ＝ (180° − ${apb}°) ÷ 2 ＝ ${thc}°`,
            `接弦定理より ∠ACB ＝ ∠PAB ＝ ${thc}°`,
            `三角形の内角の和より ∠CAB ＝ 180° − ${thc}° − ${yB}° ＝ ${xA}°`
        ] : [
            `PA ＝ PB（接線の長さ）なので △PAB は二等辺三角形。∠PAB ＝ (180° − ${apb}°) ÷ 2 ＝ ${thc}°`,
            `接弦定理（接線と弦のつくる角は、その弧に対する円周角に等しい）より ∠ACB ＝ ∠PAB ＝ ${thc}°`
        ];
        return {
            unit: CP_UNIT, title: '接弦定理',
            text: `図のように、三角形 ABC の外接円の外部の点 P からこの円に接線 PA、PB を引く。このとき、${asked} の大きさとして、正しいのはどれか。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: `${asked} の大きさは何度ですか。`,
            correctAnswer: ans, unitSuffix: '°', tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u25 Lv.2 の生成に失敗');
}

// ---- Lv.3 内接円（直角三角形の内接円の半径） ----
const CP_TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
function cpIncircle() {
    for (let t = 0; t < 3000; t++) {
        const [a0, b0, c0] = getRandomChoice(CP_TRI), k = getRandomInt(1, 12), a = a0 * k, b = b0 * k, c = c0 * k;     // a, b が直角をはさむ辺
        if (c > 60 || c < 10) continue;
        const r = (a + b - c) / 2; if (r < 2) continue;
        const swap = getRand() < 0.5, h = swap ? a : b, v = swap ? b : a, mir = getRand() < 0.5, M = tpMir(mir);
        const R = M([0, 0]), H = M([h, 0]), V = M([0, v]);
        const items = [{ k: 'poly', pts: [R, H, V], closed: true }, { k: 'rt', v: R, a: H, b: V, r: 10 }];
        const shown = getRandomChoice(['all', 'all', 'all', 'legs', 'hl']), sides = [[R, H, h, 'leg'], [R, V, v, 'leg'], [H, V, c, 'hyp']], legI = getRandomInt(0, 1);
        const show = sides.filter((s, i) => shown === 'all' || (shown === 'legs' && i < 2) || (shown === 'hl' && (i === 2 || i === legI)));
        const hidden = sides.filter(s => !show.includes(s));
        show.forEach(s => items.push(tpSideTxt(items, s[0], s[1], `${s[2]}cm`)));
        const offs = shuffleArray([-1.0, -0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2]).filter(o => r + o >= 0.5).slice(0, 4);
        if (offs.length < 4) continue;
        const vals = [{ v: r, ok: true }, ...offs.map(o => ({ v: Math.round((r + o) * 10) / 10 }))].sort((p, q) => p.v - q.v);
        const customChoices = vals.map((e, i) => ({ value: e.v, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${e.v.toFixed(1)}cm`, isCorrect: !!e.ok }));
        const steps = [];
        if (hidden.length) steps.push(hidden[0][3] === 'hyp' ? `斜辺は三平方の定理より √(${a}² ＋ ${b}²) ＝ √${a * a + b * b} ＝ ${c}cm` : `もう1つの辺は三平方の定理より √(${c}² − ${hidden[0] === sides[0] ? v : h}²) ＝ ${hidden[0][2]}cm`);
        steps.push(`直角をはさむ2辺は ${a}cm と ${b}cm、斜辺は ${c}cm。三角形の面積 S ＝ ${a} × ${b} ÷ 2 ＝ ${a * b / 2}cm²`,
            `内接円の半径を r とすると、三角形の面積は S ＝ r × (3辺の和) ÷ 2 ＝ r × (${a} ＋ ${b} ＋ ${c}) ÷ 2 ＝ ${(a + b + c) / 2}r`,
            `${(a + b + c) / 2}r ＝ ${a * b / 2} より r ＝ ${a * b / 2} ÷ ${(a + b + c) / 2} ＝ ${r}cm`,
            `（別解）直角三角形では r ＝ (直角をはさむ2辺の和 − 斜辺) ÷ 2 ＝ (${a} ＋ ${b} − ${c}) ÷ 2 ＝ ${r}cm`);
        return {
            unit: CP_UNIT, title: '内接円',
            text: '図のような直角三角形の内接円の半径はいくらか。',
            figure: { type: 'geom', items, pad: 46 },
            prompt: '内接円の半径は何 cm ですか。',
            correctAnswer: r, decimals: 1, unitSuffix: 'cm', tight: true, customChoices, steps
        };
    }
    throw new Error('u25 Lv.3 の生成に失敗');
}

// ---- Lv.4 円と接線①（共通接線の長さ） ----
let CP_TL_POOL = null;
function cpTangentLine() {
    if (!CP_TL_POOL) {
        CP_TL_POOL = { ext: [], int: [] };
        for (let r2 = 1; r2 <= 12; r2++) for (let r1 = 1; r1 <= 20; r1++) for (let d = 3; d <= 30; d++) {
            const e = d * d - (r1 - r2) * (r1 - r2), i = d * d - (r1 + r2) * (r1 + r2), Le = Math.round(Math.sqrt(e)), Li = Math.round(Math.sqrt(Math.max(i, 0)));
            if (r1 !== r2 && Le * Le === e && d > r1 + r2 + 0.5 && Le >= 3) CP_TL_POOL.ext.push([r1, r2, d, Le]);
            if (i > 0 && Li * Li === i && Li >= 3 && r1 <= r2 + 6) CP_TL_POOL.int.push([r1, r2, d, Li]);
        }
    }
    const kind = getRandomChoice(['touch', 'touch', 'touch', 'ext', 'int']);
    let r1, r2, d, L;
    if (kind === 'touch') {
        do { r1 = getRandomInt(1, 9); r2 = getRandomInt(1, 9); } while (r1 === r2);
        d = r1 + r2; L = 2 * Math.sqrt(r1 * r2);
    } else { [r1, r2, d, L] = getRandomChoice(CP_TL_POOL[kind]); }
    const flip = getRand() < 0.5;                       // 円 P を左に置くか、右に置くか（半径の大小も入れかわる）
    const rP = flip ? r2 : r1, rQ = flip ? r1 : r2;
    const Pc = [0, rP], Qc = [L, kind === 'int' ? -rQ : rQ], A = [0, 0], B = [L, 0];
    const items = [{ k: 'seg', a: [-1.3 * rP - 0.3, 0], b: [L + 1.3 * rQ + 0.3, 0], tag: 'line' },
        { k: 'circ', c: Pc, r: rP, tag: 'P' }, { k: 'circ', c: Qc, r: rQ, tag: 'Q' }, { k: 'dot', p: Pc }, { k: 'dot', p: Qc },
        { k: 'seg', a: Pc, b: A, dash: true }, { k: 'seg', a: Qc, b: B, dash: true }];
    items.push({ k: 'lab', p: Pc, s: 'P', dir: [0, 1] }, { k: 'lab', p: Qc, s: 'Q', dir: [0, kind === 'int' ? -1 : 1] }, { k: 'lab', p: A, s: 'A', dir: [0, -1] }, { k: 'lab', p: B, s: 'B', dir: [0, kind === 'int' ? 1 : -1] });
    {   // 半径の数字は円の中（小さい円では円の外）に置く
        const ext = Math.max(L + 1.3 * rQ + 0.3 + 1.3 * rP + 0.3, 2 * Math.max(rP, rQ)), sc = 208 / ext, dxo = r => -(Math.max(9, r * sc + 9));
        items.push({ k: 'txt', p: Geom.lerp(Pc, A, 0.5), s: String(rP), dx: rP * sc < 16 ? dxo(rP) : -9 }, { k: 'txt', p: Geom.lerp(Qc, B, 0.5), s: String(rQ), dx: rQ * sc < 16 ? -dxo(rQ) : 9 });
    }
    if (kind !== 'touch') items.push({ k: 'seg', a: Pc, b: Qc, dash: true }, { k: 'txt', p: Geom.lerp(Pc, Qc, 0.5), s: `${d}cm`, dy: -13 });
    let text, steps, customChoices, ans, extra = {};
    if (kind === 'touch') {
        const [o, i] = cpSurd(r1 * r2), a = 2 * o, b = i; ans = a * Math.sqrt(b);
        const cand = [];
        for (let aa = Math.max(1, a - 2); aa <= a + 2; aa++) [1, 2, 3, 5, 6, 7, 10].forEach(bb => { const v = aa * Math.sqrt(bb); if (!(aa === a && bb === b) && v > 0.45 * ans && v < 2.2 * ans) cand.push([aa, bb, v]); });
        const chosen = [[a, b, ans]];
        shuffleArray(cand).forEach(c => { if (chosen.length < 5 && chosen.every(x => Math.abs(x[2] - c[2]) / x[2] > 0.02)) chosen.push(c); });
        if (chosen.length < 5) return cpTangentLine();
        chosen.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        customChoices = chosen.map((c, i) => ({ value: c[2], label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${cpSurdTxt(c[0], c[1])}`, isCorrect: c[0] === a && c[1] === b }));
        text = `半径 ${rP} の円 P と半径 ${rQ} の円 Q が接している。この二つの円に図のように共通接線を引き、接点を A、B とするとき、AB 間の距離として正しいのはどれか。`;
        steps = [`P・Q から接点 A・B へ半径を引くと PA ⊥ AB、QB ⊥ AB。P から QB に垂線 PH を下ろすと、四角形 PABH は長方形で AB ＝ PH`,
            `円 P と円 Q は接しているので PQ ＝ ${rP} ＋ ${rQ} ＝ ${d}。また QH ＝ QB − HB ＝ ${Math.max(rP, rQ)} − ${Math.min(rP, rQ)} ＝ ${Math.abs(rP - rQ)}`,
            `直角三角形 PHQ で三平方の定理より PH² ＝ ${d}² − ${Math.abs(rP - rQ)}² ＝ ${d * d - (rP - rQ) * (rP - rQ)}`,
            `AB ＝ PH ＝ √${r1 * r2 * 4} ＝ ${cpSurdTxt(a, b)}（一般に、接する2円の共通外接線は 2√(半径 × 半径)）`];
    } else {
        ans = L; const st = getRandomChoice([1, 1, 2]);
        text = kind === 'ext'
            ? `半径 ${rP}cm の円 P と半径 ${rQ}cm の円 Q があり、中心間の距離は ${d}cm である。この二つの円に図のように共通接線（2つの円が同じ側にある接線）を引き、接点を A、B とするとき、AB 間の距離として正しいのはどれか。`
            : `半径 ${rP}cm の円 P と半径 ${rQ}cm の円 Q があり、中心間の距離は ${d}cm である。この二つの円に図のように共通接線（2つの円の間を通る接線）を引き、接点を A、B とするとき、AB 間の距離として正しいのはどれか。`;
        steps = kind === 'ext'
            ? [`P から QB に垂線 PH を下ろすと、四角形 PABH は長方形で AB ＝ PH、QH ＝ ${Math.max(rP, rQ)} − ${Math.min(rP, rQ)} ＝ ${Math.abs(rP - rQ)}`, `直角三角形 PHQ で PQ ＝ ${d} なので、三平方の定理より AB² ＝ ${d}² − ${Math.abs(rP - rQ)}² ＝ ${d * d - (rP - rQ) * (rP - rQ)}`, `AB ＝ √${L * L} ＝ ${L}cm`]
            : [`P から AB に平行な直線と、Q から引いた QB の延長の交点を H とすると、PH ＝ AB、QH ＝ QB ＋ HB ＝ ${rQ} ＋ ${rP} ＝ ${rP + rQ}`, `直角三角形 PHQ で PQ ＝ ${d} なので、三平方の定理より AB² ＝ ${d}² − ${rP + rQ}² ＝ ${d * d - (rP + rQ) * (rP + rQ)}`, `AB ＝ √${L * L} ＝ ${L}cm`];
        customChoices = null; extra = { consecutive: true, step: st, unitSuffix: 'cm', tight: true };
    }
    const q = { unit: CP_UNIT, title: '円と接線①', text, figure: { type: 'geom', items, pad: 46 }, prompt: 'AB 間の距離はいくつですか。', correctAnswer: ans, steps };
    if (customChoices) { q.customChoices = customChoices; q.fraction = true; } else Object.assign(q, extra);
    return q;
}

// ---- Lv.5 円周角（円周を n 等分する点と、交わる弦／円周角） ----
function cpArcAngle() {
    for (let t = 0; t < 5000; t++) {
        const n = getRandomChoice([8, 8, 8, 5, 6, 9, 10, 12]), iN = n <= 8 ? 'I' : 'P', unit = 180 / n, kind = getRandomChoice(['chords', 'chords', 'chords', 'inscribed']), ccw = getRand() < 0.5;
        const pos = i => cpDir(90 + (ccw ? 1 : -1) * i * 360 / n), name = i => String.fromCharCode(65 + i), last = name(n - 1);
        const pts = {}; for (let i = 0; i < n; i++) pts[name(i)] = pos(i);
        const items = [{ k: 'circ', c: CP_O, r: 1, tag: 'circle' }];
        let ans, text, steps, prompt;
        if (kind === 'chords') {
            const ps = shuffleArray([...Array(n).keys()]).slice(0, 4).sort((a, b) => a - b), d = [0, 1, 2, 3].map(i => (ps[(i + 1) % 4] - ps[i] + n) % n);
            const i0 = getRandomInt(0, 3), u = ps[i0], w = ps[(i0 + 1) % 4], u2 = ps[(i0 + 2) % 4], w2 = ps[(i0 + 3) % 4];       // u・u2 が1本目の弦、w・w2 が2本目の弦
            const s1 = d[i0], s2 = d[(i0 + 2) % 4]; ans = (s1 + s2) * unit;
            if (ans < 20 || ans > 160) continue;
            const I = tpInter(pos(u), pos(u2), pos(w), pos(w2));
            items.push({ k: 'seg', a: pos(u), b: pos(u2) }, { k: 'seg', a: pos(w), b: pos(w2) }, { k: 'lab', p: I, s: iN, dir: Geom.unit(Geom.sub(I, Geom.add(Geom.lerp(pos(u), pos(w), 0.5), [0, 0]))) });
            items.push({ k: 'ang', v: I, a: pos(u), b: pos(w), r: 15, tag: 'x' });
            const ch1 = [name(u), name(u2)].sort().join(''), ch2 = [name(w), name(w2)].sort().join('');
            const first = getRand() < 0.5 ? [ch1, ch2] : [ch2, ch1];
            text = `次の図のように、円周を ${n} 等分する点 A〜${last} がある。弦 ${first[0]} と弦 ${first[1]} の交点を ${iN} とするとき、∠${name(u)}${iN}${name(w)} の大きさはいくつか。`;
            prompt = `∠${name(u)}${iN}${name(w)} の大きさは何度ですか。`;
            steps = [`円周を ${n} 等分しているので、隣り合う点の間の弧 1 つに対する中心角は 360° ÷ ${n} ＝ ${360 / n}°、円周角は ${360 / n}° ÷ 2 ＝ ${cpDeg(unit)}`,
                `△${iN}${name(w)}${name(u2)} の外角として、∠${name(u)}${iN}${name(w)} ＝ ∠${iN}${name(w)}${name(u2)} ＋ ∠${iN}${name(u2)}${name(w)}（三角形の外角は、となり合わない2つの内角の和）`,
                `∠${iN}${name(w)}${name(u2)} ＝ ∠${name(w2)}${name(w)}${name(u2)} は弧 ${name(w2)}${name(u2)}（${s2} 目盛り）の円周角で ${s2} × ${cpDeg(unit)} ＝ ${cpDeg(s2 * unit)}。∠${iN}${name(u2)}${name(w)} ＝ ∠${name(u)}${name(u2)}${name(w)} は弧 ${name(u)}${name(w)}（${s1} 目盛り）の円周角で ${s1} × ${cpDeg(unit)} ＝ ${cpDeg(s1 * unit)}`,
                `∠${name(u)}${iN}${name(w)} ＝ ${cpDeg(s2 * unit)} ＋ ${cpDeg(s1 * unit)} ＝ ${cpDeg(ans)}（交わる2つの弦のつくる角 ＝ はさむ2つの弧の目盛りの和 × ${cpDeg(unit)}）`];
        } else {
            const idx = shuffleArray([...Array(n).keys()]).slice(0, 3), [i, j, k] = idx, s = (k - i + n) % n, between = ((j - i + n) % n) < s, steps3 = between ? n - s : s;    // ∠ijk は弧 ik（j を含まない方）の円周角
            ans = steps3 * unit; if (ans < 20 || ans > 160) continue;
            items.push({ k: 'seg', a: pos(j), b: pos(i) }, { k: 'seg', a: pos(j), b: pos(k) }, { k: 'ang', v: pos(j), a: pos(i), b: pos(k), r: 15, tag: 'x' });
            text = `次の図のように、円周を ${n} 等分する点 A〜${last} がある。∠${name(i)}${name(j)}${name(k)} の大きさはいくつか。`;
            prompt = `∠${name(i)}${name(j)}${name(k)} の大きさは何度ですか。`;
            steps = [`円周を ${n} 等分しているので、隣り合う点の間の弧 1 つに対する中心角は 360° ÷ ${n} ＝ ${360 / n}°、円周角は ${cpDeg(unit)}`,
                `∠${name(i)}${name(j)}${name(k)} は、${name(j)} を含まない方の弧 ${name(i)}${name(k)}（${steps3} 目盛り）の円周角`,
                `${steps3} × ${cpDeg(unit)} ＝ ${cpDeg(ans)}`];
        }
        items.push(...cpRadLabs(pts), ...Object.keys(pts).map(s => ({ k: 'dot', p: pts[s] })));
        const st = n === 8 ? 2.5 : getRandomChoice([2, 3, 4, 5, 6]);
        const ch = cpConsec(ans, st, 0, 180, cpDeg); if (!ch) continue;
        return { unit: CP_UNIT, title: '円周角', text, figure: { type: 'geom', items, pad: 44 }, prompt, correctAnswer: ch.find(c => c.isCorrect).value, decimals: 1, unitSuffix: '°', tight: true, customChoices: ch, steps };
    }
    throw new Error('u25 Lv.5 の生成に失敗');
}

// ---- Lv.6 内心（∠XIY ＝ 90° ＋ ∠Z ÷ 2） ----
function cpIncenter() {
    for (let t = 0; t < 5000; t++) {
        const zi = getRandomInt(0, 2), kind = getRandomChoice(['findZ', 'findZ', 'findI']);          // Z は ∠A・∠B・∠C のどれか
        const Z = 2 * getRandomInt(20, 50), rest = 180 - Z, p1 = getRandomInt(30, rest - 30);
        const ang = [0, 0, 0]; ang[zi] = Z; const others = [0, 1, 2].filter(i => i !== zi); ang[others[0]] = p1; ang[others[1]] = rest - p1;
        if (ang.some(v => v < 30 || v > 105)) continue;
        const [a, b, c] = ang, L = 10, AB = L * Math.sin(c * Math.PI / 180) / Math.sin(a * Math.PI / 180), mir = getRand() < 0.5, M = tpMir(mir);
        const raw = { B: [0, 0], C: [L, 0], A: Geom.mul(Geom.dir(b), AB) };
        const la = Geom.len(Geom.sub(raw.B, raw.C)), lb = Geom.len(Geom.sub(raw.A, raw.C)), lc = Geom.len(Geom.sub(raw.A, raw.B));
        const I = Geom.mul(Geom.add(Geom.add(Geom.mul(raw.A, la), Geom.mul(raw.B, lb)), Geom.mul(raw.C, lc)), 1 / (la + lb + lc));
        const hh = raw.A[1]; if (hh > 1.25 * L || hh < 0.3 * L) continue;
        const P = {}; Object.keys(raw).forEach(k => P[k] = M(raw[k])); const Ip = M(I), V = ['A', 'B', 'C'], zn = V[zi], [xn, yn] = V.filter(v => v !== zn);
        const bic = 90 + Z / 2, given = kind === 'findZ' ? bic : Z, ans = kind === 'findZ' ? Z : bic;
        const items = [{ k: 'poly', pts: [P.A, P.B, P.C], closed: true }, { k: 'seg', a: Ip, b: P[xn] }, { k: 'seg', a: Ip, b: P[yn] }];
        items.push(...tpAutoLabels(items, { ...P, I: Ip }));
        items.push({ k: 'ang', v: Ip, a: P[xn], b: P[yn], r: 17, s: kind === 'findZ' ? `${bic}°` : undefined, tag: kind === 'findZ' ? 'given' : 'x' });
        const wrongs = kind === 'findZ' ? [given / 2, 180 - given, given - 90, 2 * (180 - given), 180 - given / 2, 3 * given - 270].map(Math.round) : [Z / 2, 180 - Z / 2, 90 - Z / 2, 180 - Z, 90 + Z, 2 * Z].map(Math.round);
        const customChoices = cpScatter(ans, wrongs, 10, 175, 6, v => `${v}°`);
        const zl = zn === 'A' ? 'BAC' : zn === 'B' ? 'ABC' : 'ACB';
        const steps = kind === 'findZ' ? [
            `△I${xn}${yn} の内角の和より ∠I${xn}${yn} ＋ ∠I${yn}${xn} ＝ 180° − ${bic}° ＝ ${180 - bic}°`,
            `I は内心なので ${xn}I は ∠${xn} を、${yn}I は ∠${yn} を二等分する。よって ∠${xn} ＋ ∠${yn} ＝ 2 × ${180 - bic}° ＝ ${2 * (180 - bic)}°`,
            `三角形の内角の和より ∠${zl} ＝ 180° − ${2 * (180 - bic)}° ＝ ${Z}°`,
            `（公式）∠${xn}I${yn} ＝ 90° ＋ ∠${zl} ÷ 2。${bic}° ＝ 90° ＋ ∠${zl} ÷ 2 より ∠${zl} ＝ 2 × (${bic}° − 90°) ＝ ${Z}°`
        ] : [
            `三角形の内角の和より ∠${xn} ＋ ∠${yn} ＝ 180° − ${Z}° ＝ ${180 - Z}°`,
            `I は内心なので ${xn}I・${yn}I は ∠${xn}・∠${yn} の二等分線。△I${xn}${yn} の2つの底角の和は ${180 - Z}° ÷ 2 ＝ ${(180 - Z) / 2}°`,
            `∠${xn}I${yn} ＝ 180° − ${(180 - Z) / 2}° ＝ ${bic}°（公式 ∠${xn}I${yn} ＝ 90° ＋ ∠${zl} ÷ 2 ＝ 90° ＋ ${Z / 2}°）`
        ];
        return {
            unit: CP_UNIT, title: '内心',
            text: `下の図において、点 I は △ABC の内心（内接円の中心）である。${kind === 'findZ' ? `∠${xn}I${yn}＝${bic}°` : `∠${zl}＝${Z}°`} のとき、${kind === 'findZ' ? `∠${zl}` : `∠${xn}I${yn}`} は何度か。`,
            figure: { type: 'geom', items, pad: 44 },
            prompt: `${kind === 'findZ' ? `∠${zl}` : `∠${xn}I${yn}`} は何度ですか。`,
            correctAnswer: ans, unitSuffix: '°', tight: true, customChoices, steps
        };
    }
    throw new Error('u25 Lv.6 の生成に失敗');
}

// ---- Lv.7 円と接線②（直線に接して並ぶ3つの円。両端の垂線の距離 X） ----
let CP_3C_POOL = null;
function cpThreeCircles() {
    if (!CP_3C_POOL) {
        CP_3C_POOL = [];
        for (let r1 = 1; r1 <= 4; r1++) for (const k of [2, 3]) {
            const r3 = r1 * k * k; if (r3 > 18) continue;
            for (let r2 = r1 + 1; r2 < r3; r2++) {
                const s1 = cpSurd(r1 * r2), s2 = cpSurd(r2 * r3);
                if (s1[1] !== s2[1] || s1[1] === 1) continue;
                if (2 * Math.sqrt(r1 * r2) + 2 * Math.sqrt(r2 * r3) < r1 + r3 + 0.5) continue;            // A と C が重ならない
                CP_3C_POOL.push([r1, r2, r3, 2 * (s1[0] + s2[0]), s1[1]]);
            }
        }
    }
    const [r1, r2, r3, a, b] = getRandomChoice(CP_3C_POOL), K = r1 + r3, ans = K + a * Math.sqrt(b);
    const xB = r1 + 2 * Math.sqrt(r1 * r2), xC = xB + 2 * Math.sqrt(r2 * r3), X = xC + r3, H = 2 * r3 * 1.12, yd = -0.3 * r3;
    const items = [
        { k: 'seg', a: [-0.12 * X, 0], b: [X + 0.12 * X, 0], tag: 'l' },
        { k: 'seg', a: [0, 0], b: [0, H], tag: 'm' }, { k: 'seg', a: [X, 0], b: [X, H], tag: 'n' },
        { k: 'circ', c: [r1, r1], r: r1, tag: 'A' }, { k: 'circ', c: [xB, r2], r: r2, tag: 'B' }, { k: 'circ', c: [xC, r3], r: r3, tag: 'C' },
        { k: 'rt', v: [0, 0], a: [0, H], b: [1, 0], r: 8 }, { k: 'rt', v: [X, 0], a: [X, H], b: [0, 0], r: 8 },
        { k: 'seg', a: [0, yd], b: [X, yd], tag: 'X' }, { k: 'seg', a: [0, yd - 0.1 * r3], b: [0, yd + 0.1 * r3] }, { k: 'seg', a: [X, yd - 0.1 * r3], b: [X, yd + 0.1 * r3] },
        { k: 'txt', p: [X / 2, yd], s: 'X', dy: 15 }, { k: 'txt', p: [0, H], s: '直線 m', dy: -9 }, { k: 'txt', p: [X, H], s: '直線 n', dy: -9 }, { k: 'txt', p: [X + 0.12 * X, 0], s: '直線 l', dy: -12 },
        { k: 'txt', p: [r1, 2 * r1], s: 'A', dx: 9, dy: -15 }, { k: 'txt', p: [xB, r2], s: 'B' }, { k: 'txt', p: [xC, r3], s: 'C' }
    ];
    const chosen = [[a, b, ans]], cand = [];
    for (let aa = Math.max(1, a - 3); aa <= a + 3; aa++) [2, 3, 5, 6, 7].forEach(bb => { const v = K + aa * Math.sqrt(bb); if (!(aa === a && bb === b) && aa * Math.sqrt(bb) > 0.5 * a * Math.sqrt(b) && aa * Math.sqrt(bb) < 1.7 * a * Math.sqrt(b)) cand.push([aa, bb, v]); });
    shuffleArray(cand).forEach(c => { if (chosen.length < 5 && chosen.every(x => Math.abs(x[2] - c[2]) > 0.08)) chosen.push(c); });
    if (chosen.length < 5) return cpThreeCircles();
    chosen.sort((p, q) => p[0] - q[0] || q[1] - p[1]);
    const customChoices = chosen.map((c, i) => ({ value: c[2], label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${K} + ${cpSurdTxt(c[0], c[1])} cm`, isCorrect: c[0] === a && c[1] === b }));
    const s1 = cpSurd(r1 * r2), s2 = cpSurd(r2 * r3), t1 = 2 * s1[0], t2 = 2 * s2[0];
    const steps = [
        `半径 r と R の円が、同じ直線に接して互いに接しているとき、中心間の水平距離は、直角三角形（斜辺 r ＋ R、他の1辺 R − r）の三平方の定理より √((r ＋ R)² − (R − r)²) ＝ 2√(rR)`,
        `A と B の中心間の水平距離 ＝ 2√(${r1} × ${r2}) ＝ 2√${r1 * r2} ＝ ${cpSurdTxt(t1, s1[1])}`,
        `B と C の中心間の水平距離 ＝ 2√(${r2} × ${r3}) ＝ 2√${r2 * r3} ＝ ${cpSurdTxt(t2, s2[1])}`,
        `X ＝ (A の半径) ＋ (A と B の水平距離) ＋ (B と C の水平距離) ＋ (C の半径) ＝ ${r1} ＋ ${cpSurdTxt(t1, s1[1])} ＋ ${cpSurdTxt(t2, s2[1])} ＋ ${r3} ＝ ${K} ＋ ${cpSurdTxt(a, b)}（cm）`
    ];
    return {
        unit: CP_UNIT, title: '円と接線②',
        text: `図のように、A、B、C の三つの円を直線 l に接し、かつ各円が互いに接するように直線上に並べた。また、直線 m、n はそれぞれ円 A、円 C に接し、直線 l と直交している。このとき直線 m と n の距離 X はいくらになるか。なお、A の半径は ${r1}cm、B の半径は ${r2}cm、C の半径は ${r3}cm である。`,
        figure: { type: 'geom', items, pad: 40 },
        prompt: 'X の長さはいくつですか。',
        correctAnswer: ans, fraction: true, unitSuffix: 'cm', customChoices, steps
    };
}
