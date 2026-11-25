/**
 * u27_area_circle.js  —  ㉗ 面積（円・扇形）（図形分野 第4単元）
 *   Lv.1 面積の加減       … 長方形−四分円（直線に接する2円の間）／2つの四分円の重なり／正方形−4つの四分円（2008 東京消防庁Ⅲ類）
 *   Lv.2 内接円           … 中心角60°の扇形（または半円）に内接する円をのぞいた面積（2006 裁判所事務官Ⅲ種）
 *   Lv.3 通過領域（回転） … 三角形を頂点Aのまわりに1回転させたとき辺BCが通る部分の面積（2011 裁判所事務官Ⅲ種）
 *   Lv.4 通過領域（ひも） … 柵（正三角形・正方形・正六角形）の外を、綱でつながれた牛が動ける範囲（2016 警視庁警察官Ⅲ類 第3回）
 *   Lv.5 円と接線         … 直径の延長上の点Cから引いた接線。△ACD などの面積（2009 東京消防庁Ⅲ類）
 *   Lv.6 外接円           … 正多角形とその外接円で囲まれた斜線部分（2010 東京都Ⅲ類）
 * 図は座標から作り（円弧は多角形で近似した座標）、tests/run.js（checkU27）が図から面積を実測して答えを照合する。
 * 共通部品は u24〜u26 の arPick / arPickInt / tpAutoLabels / frN / TP2_LAB など。
 */
UnitRegistry.register({
    id: 'u27', name: '㉗ 面積（円・扇形）', chap: 3, section: '図形分野',
    generate(level) {
        const fns = [apAddSub, apInscribed, apSweepRot, apRope, apTangent, apCircumscribed];
        const lv = Number.isInteger(parseInt(level)) && parseInt(level) >= 1 && parseInt(level) <= fns.length ? parseInt(level) : getRandomInt(1, fns.length);
        return fns[lv - 1]();
    }
});

const AP_UNIT = '㉗ 面積（円・扇形）';
const apArc = (c, r, a0, a1, n = 120) => { const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return o; };
const apRing = (c, r, n = 360) => apArc(c, r, 0, 360, n).slice(0, n);
const apFrPi = (n, d) => { const [a, b] = frN(n, d); return b === 1 ? (a === 1 ? 'π' : `${a}π`) : `{{${a}/${b}}}π`; };
const apPiTxt = c => c === 1 ? 'π' : (Number.isInteger(c) ? `${c}π` : `{{${Math.round(c * 2)}/2}}π`);       // 係数（0.5 刻み）× π
// u + vπ の表記（u と v は異符号）
const apExpr = (u, v) => u > 0 ? `${u} − ${-v === 1 ? '' : -v}π` : `${v === 1 ? '' : v}π − ${-u}`;
const apVal = (u, v) => u + v * Math.PI;
function apPickExpr(u, v, byV) {
    const F = [1 / 8, 1 / 4, 1 / 2, 2 / 3, 3 / 4, 7 / 8, 1, 9 / 8, 5 / 4, 3 / 2, 2, 3, 4];
    const us = F.map(f => u * f).filter(x => Number.isInteger(x) && x !== 0);
    const vs = F.map(f => v * f).filter(x => Number.isInteger(x) && x !== 0);
    const ord = (a, b) => byV ? -b * 1e4 + a : (a > 0 ? a * 1e4 - b : b * 1e4 - a);                    // 例の並び：定数項の小さい順、同じなら π の係数の小さい順
    const cand = []; us.forEach(a => vs.forEach(b => { if ((a !== u || b !== v) && apVal(a, b) > 0.5) cand.push({ key: ord(a, b), u: a, v: b }); }));
    const arr = arPick({ key: ord(u, v), u, v }, shuffleArray(cand)); if (!arr) return null;
    if (new Set(arr.map(o => Math.round(apVal(o.u, o.v) * 1e6))).size !== 5) return null;
    return arr.map((o, i) => ({ value: apVal(o.u, o.v), label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${apExpr(o.u, o.v)}`, isCorrect: o.u === u && o.v === v }));
}

// ---- Lv.1 面積の加減 ----
function apAddSub() {
    for (let t = 0; t < 3000; t++) {
        const kind = getRandomChoice(['gap', 'gap', 'gap', 'lens', 'lens', 'corner', 'corner']);
        let u, v, text, items, steps, name;
        if (kind === 'gap') {
            const r = getRandomChoice([2, 4, 6, 8, 8, 10, 12]); u = 2 * r * r; v = -r * r / 2;
            const O1 = [r, r], O2 = [3 * r, r], hatch = [[r, 0], [3 * r, 0], ...apArc(O2, r, 270, 180, 90), ...apArc(O1, r, 360, 270, 90)];
            items = [{ k: 'poly', pts: hatch, closed: true, shade: true, tag: 'hatch' }, { k: 'circ', c: O1, r, tag: 'c1' }, { k: 'circ', c: O2, r, tag: 'c2' },
                { k: 'seg', a: [-0.3 * r, 0], b: [4.3 * r, 0], tag: 'l' }, { k: 'dot', p: O1 }, { k: 'dot', p: O2 },
                { k: 'lab', p: O1, s: 'O₁', dir: [-0.8, 0.5] }, { k: 'lab', p: O2, s: 'O₂', dir: [0.8, 0.5] }, { k: 'lab', p: [4.3 * r, 0], s: 'ℓ', dir: [0.7, 0.5] }];
            text = `次の図のように、半径 ${r} の2つの円 O₁、O₂ が外接し、直線 ℓ はこの2つの円に接している。このとき、斜線部分の面積として正しいのはどれか。ただし、円周率は π とする。`;
            steps = [`2つの円の中心 O₁、O₂ から直線 ℓ に垂線を引くと、O₁O₂ ＝ ${r} ＋ ${r} ＝ ${2 * r}、高さは半径の ${r} の長方形ができる`,
                `斜線部分 ＝ 長方形 − 2つの四分円（半径 ${r}、中心角 90°）`, `長方形の面積 ＝ ${2 * r} × ${r} ＝ ${u}`,
                `四分円2つ分 ＝ ${r}² × π × {{1/4}} × 2 ＝ ${r * r / 2}π`, `斜線部分の面積 ＝ ${u} − ${r * r / 2}π`];
            name = 'gap';
        } else if (kind === 'lens') {
            const a = getRandomChoice([2, 4, 6, 8, 10, 12, 14]); u = -a * a; v = a * a / 2;
            const A = [0, 0], B = [a, 0], C = [a, a], D = [0, a], arc1 = apArc(A, a, 0, 90, 90), arc2 = apArc(C, a, 180, 270, 90), P = { A, B, C, D };
            items = [{ k: 'poly', pts: [...arc1, ...arc2], closed: true, shade: true, tag: 'hatch' }, { k: 'poly', pts: [A, B, C, D], closed: true, tag: 'sq' },
                { k: 'poly', pts: arc1, closed: false, tag: 'arc', c: A, r: a }, { k: 'poly', pts: arc2, closed: false, tag: 'arc', c: C, r: a }];
            items.push(...tpAutoLabels(items, P));
            text = `1辺の長さが ${a} の正方形 ABCD がある。頂点 A、頂点 C をそれぞれ中心として、半径 ${a} の円弧を図のようにかいた。斜線部分の面積として正しいのはどれか。ただし、円周率は π とする。`;
            steps = [`斜線部分は、2つの四分円（半径 ${a}、中心角 90°）が重なった部分`, `2つの四分円の面積の和 ＝ ${a}² × π × {{1/4}} × 2 ＝ ${a * a / 2}π`,
                `この和は、正方形 ABCD（面積 ${a * a}）全体と、斜線部分を2回数えている（正方形は四分円2つでおおわれ、斜線部分だけが重なる）`,
                `斜線部分 ＝ 四分円2つの和 − 正方形 ＝ ${a * a / 2}π − ${a * a}`];
            name = 'lens';
        } else {
            const a = getRandomChoice([4, 8, 8, 12, 12, 16]), h = a / 2; u = a * a; v = -a * a / 4;
            const arcs = [...apArc([0, 0], h, 0, 90, 60), ...apArc([0, a], h, 270, 360, 60), ...apArc([a, a], h, 180, 270, 60), ...apArc([a, 0], h, 90, 180, 60)];
            const P = { A: [0, 0], B: [a, 0], C: [a, a], D: [0, a] };
            items = [{ k: 'poly', pts: arcs, closed: true, shade: true, tag: 'hatch' }, { k: 'poly', pts: [P.A, P.B, P.C, P.D], closed: true, tag: 'sq' },
                { k: 'poly', pts: apArc(P.A, h, 0, 90, 60), closed: false, tag: 'arc', c: P.A, r: h }, { k: 'poly', pts: apArc(P.D, h, 270, 360, 60), closed: false, tag: 'arc', c: P.D, r: h },
                { k: 'poly', pts: apArc(P.C, h, 180, 270, 60), closed: false, tag: 'arc', c: P.C, r: h }, { k: 'poly', pts: apArc(P.B, h, 90, 180, 60), closed: false, tag: 'arc', c: P.B, r: h }];
            items.push(...tpAutoLabels(items, P));
            text = `1辺の長さが ${a} の正方形の4つの頂点を、それぞれ中心として、半径 ${h} の円弧を図のようにかいた。斜線部分の面積として正しいのはどれか。ただし、円周率は π とする。`;
            steps = [`斜線部分 ＝ 正方形 − 4つの四分円（半径 ${h}、中心角 90°）`, `正方形の面積 ＝ ${a} × ${a} ＝ ${a * a}`,
                `四分円4つ分は、半径 ${h} の円1つ分なので ${h}² × π ＝ ${h * h}π`, `斜線部分の面積 ＝ ${a * a} − ${h * h}π`];
            name = 'corner';
        }
        const ch = apPickExpr(u, v, name === 'corner'); if (!ch) continue;
        return {
            unit: AP_UNIT, title: '面積の加減', text, figure: { type: 'geom', items, pad: 36 },
            prompt: '斜線部分の面積はどれですか。', correctAnswer: apVal(u, v), fraction: true, tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u27 Lv.1 の生成に失敗');
}

// ---- Lv.2 内接円（扇形・半円に内接する円をのぞいた面積） ----
function apInscribed() {
    for (let t = 0; t < 3000; t++) {
        const kind = getRandomChoice(['r60', 'r60', 'R60', 'semir', 'semiR']);
        let r, R, c, text, steps, hatchOuter;
        if (kind === 'r60') { r = getRandomInt(1, 8); R = 3 * r; c = r * r / 2; }
        else if (kind === 'R60') { R = getRandomChoice([3, 6, 9, 12, 15, 18]); r = R / 3; c = R * R / 18; }
        else if (kind === 'semir') { r = getRandomInt(1, 9); R = 2 * r; c = r * r; }
        else { R = getRandomChoice([4, 6, 8, 10, 12, 14]); r = R / 2; c = R * R / 4; }
        if (!Number.isInteger(c * 2)) continue;
        const sem = kind.startsWith('semi'), items = [];
        let Cc, P;
        if (!sem) {
            const O = [0, 0], A = Geom.mul(Geom.dir(-120), R), B = Geom.mul(Geom.dir(-60), R); Cc = [0, -(R - r)];
            hatchOuter = [O, A, ...apArc(O, R, -120, -60, 90).slice(1, -1), B]; P = { O, A, B };
            items.push({ k: 'poly', pts: hatchOuter, holes: [apRing(Cc, r, 240)], closed: true, shade: true, tag: 'hatch' }, { k: 'circ', c: Cc, r, tag: 'C' },
                { k: 'poly', pts: [O, A], closed: false, tag: 'rad' }, { k: 'poly', pts: [O, B], closed: false, tag: 'rad' });
            items.push({ k: 'dot', p: Cc }, { k: 'lab', p: Cc, s: 'C', dir: [0.2, -1] });
            items.push(...tpAutoLabels(items.filter(i => i.k === 'poly'), P));
        } else {
            const A = [-R, 0], B = [R, 0], O = [0, 0]; Cc = [0, -r];
            hatchOuter = [A, B, ...apArc(O, R, 0, -180, 120).slice(1, -1)]; P = { A, B };
            items.push({ k: 'poly', pts: hatchOuter, holes: [apRing(Cc, r, 240)], closed: true, shade: true, tag: 'hatch' }, { k: 'circ', c: Cc, r, tag: 'C' },
                { k: 'dot', p: O }, { k: 'lab', p: O, s: 'O', dir: [0, 1] }, { k: 'dot', p: Cc }, { k: 'lab', p: Cc, s: 'C', dir: [0.6, -0.9] });
            items.push(...tpAutoLabels([{ k: 'poly', pts: hatchOuter, closed: true }], P));
        }
        if (kind === 'r60') {
            text = `弧 AB に対する中心角が 60° である扇形 OAB に、下の図のように半径 ${r}cm の円 C が内接している。この扇形 OAB から円 C をのぞいた斜線部分の面積はいくらか。ただし、円周率は π とする。`;
            steps = [`円 C は扇形の2本の半径と弧の3か所に接する。C から OA に垂線を下ろすと、∠COA ＝ 60° ÷ 2 ＝ 30° の直角三角形ができ、辺の比は 1：2：√3 なので、OC ＝ ${r} × 2 ＝ ${2 * r}cm`,
                `OC は扇形の半径から円の半径をひいたものなので、扇形の半径 OA ＝ OC ＋ ${r} ＝ ${R}cm`, `扇形の面積 ＝ ${R}² × π × {{60/360}} ＝ ${R * R / 6 === Math.round(R * R / 6) ? R * R / 6 : `{{${R * R}/6}}`}π`,
                `円 C の面積 ＝ ${r}² × π ＝ ${r * r}π`, `斜線部分 ＝ ${apPiTxt(R * R / 6)} − ${r * r}π ＝ ${apPiTxt(c)}`];
        } else if (kind === 'R60') {
            text = `半径 ${R}cm、中心角 60° の扇形 OAB に、下の図のように円 C が内接している。この扇形 OAB から円 C をのぞいた斜線部分の面積はいくらか。ただし、円周率は π とする。`;
            steps = [`円 C の半径を r とする。C から OA に垂線を下ろすと、∠COA ＝ 30° の直角三角形で、辺の比は 1：2：√3 なので OC ＝ 2r`, `扇形の半径 ＝ OC ＋ r ＝ 3r ＝ ${R} より r ＝ ${R / 3}cm`,
                `扇形の面積 ＝ ${R}² × π × {{60/360}} ＝ ${apPiTxt(R * R / 6)}`, `円 C の面積 ＝ ${R / 3}² × π ＝ ${(R / 3) ** 2}π`, `斜線部分 ＝ ${apPiTxt(R * R / 6)} − ${(R / 3) ** 2}π ＝ ${apPiTxt(c)}`];
        } else if (kind === 'semir') {
            text = `下の図のように、半円 O の内部に半径 ${r}cm の円 C が、直径 AB と弧 AB の両方に接している。この半円から円 C をのぞいた斜線部分の面積はいくらか。ただし、円周率は π とする。`;
            steps = [`円 C は直径 AB と O で接し、弧とも接しているので、O から円 C の中心までの距離は ${r}cm、そこから弧までがさらに ${r}cm。よって半円の半径は ${r} ＋ ${r} ＝ ${R}cm`,
                `半円の面積 ＝ ${R}² × π ÷ 2 ＝ ${R * R / 2}π`, `円 C の面積 ＝ ${r}² × π ＝ ${r * r}π`, `斜線部分 ＝ ${R * R / 2}π − ${r * r}π ＝ ${apPiTxt(c)}`];
        } else {
            text = `下の図のように、半径 ${R}cm の半円 O の内部に円 C が、直径 AB と弧 AB の両方に接している。この半円から円 C をのぞいた斜線部分の面積はいくらか。ただし、円周率は π とする。`;
            steps = [`円 C は直径 AB と O で接し、弧とも接しているので、円 C の直径は半円の半径に等しい。円 C の半径は ${R} ÷ 2 ＝ ${r}cm`,
                `半円の面積 ＝ ${R}² × π ÷ 2 ＝ ${R * R / 2}π`, `円 C の面積 ＝ ${r}² × π ＝ ${r * r}π`, `斜線部分 ＝ ${R * R / 2}π − ${r * r}π ＝ ${apPiTxt(c)}`];
        }
        const wr = [c * 2, c / 2, c + 1, c - 1, c + 2, c - 2, R * R / 6, R * R / 2, r * r, 2 * r * r, R * R / 4, c * 3 / 2, c * 3];
        const step = c >= 6 ? 1 : 0.5, cand = shuffleArray(wr.filter(x => Number.isInteger(x * 2) && x > 0 && x < 200 && x !== c)).map(x => ({ key: x }));
        const fill = []; for (let j = 1; j <= 10; j++) [-1, 1].forEach(sg => { const x = c + sg * j * step; if (x > 0) fill.push({ key: x }); });
        const arr = arPick({ key: c }, [...cand, ...shuffleArray(fill)]); if (!arr) continue;
        const customChoices = arr.map((o, i) => ({ value: o.key, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${apPiTxt(o.key)}cm²`, isCorrect: o.key === c }));
        return {
            unit: AP_UNIT, title: '内接円', text, figure: { type: 'geom', items, pad: 40 },
            prompt: '斜線部分の面積は何 cm² ですか。', correctAnswer: c, fraction: true, unitSuffix: 'cm²', tight: true, customChoices, steps
        };
    }
    throw new Error('u27 Lv.2 の生成に失敗');
}

// ---- Lv.3 通過領域（回転）：三角形 ABC を点 A のまわりに1回転 ----
const AP_PYT = (() => { const o = []; for (let h = 3; h <= 40; h++) for (let p = 1; p <= 40; p++) { const c = Math.round(Math.hypot(h, p)); if (c * c === h * h + p * p && c <= 30) o.push({ h, p, c }); } return o; })();
function apSweepRot() {
    for (let t = 0; t < 5000; t++) {
        const kind = getRandomChoice(['in', 'in', 'out']);
        const e1 = getRandomChoice(AP_PYT), same = AP_PYT.filter(x => x.h === e1.h);
        const e2 = getRandomChoice(same), h = e1.h;
        let p = e1.p, q = e2.p, a, b, cc, area, Bp, Cp;
        if (kind === 'in') { a = p + q; Bp = [-p, 0]; Cp = [q, 0]; }
        else { if (p >= q) continue; a = q - p; Bp = [p, 0]; Cp = [q, 0]; }
        const AB = Math.hypot(h, p), AC = Math.hypot(h, q); if (Math.abs(AB - Math.round(AB)) > 1e-9 || Math.abs(AC - Math.round(AC)) > 1e-9) continue;
        if (a < 2 || a > 40) continue;
        const mx = Math.max(AB, AC), mn = kind === 'in' ? h : Math.min(AB, AC);
        area = Math.round(mx * mx - mn * mn);
        const wr = [h * h, mx * mx, mn * mn, area + 1, area - 1, area + 2, area - 2, a * a, Math.round(AB * AB - a * a), Math.round(Math.abs(AC * AC - a * a)), mx * mx - 1, 2 * area, Math.round(mx * mx - (mn - 1) ** 2)];
        const ch = arPickInt(area, wr, 0, 3000, 1, x => `${x}π`); if (!ch) continue;
        const mir = getRand() < 0.5, M = tpMir(mir), P = { A: M([0, h]), B: M(Bp), C: M(Cp) };
        const items = [{ k: 'poly', pts: [P.A, P.B, P.C], closed: true }];
        items.push(...tpAutoLabels(items, P));
        const lens = [`AB ＝ ${Math.round(AB)}`, `AC ＝ ${Math.round(AC)}`, `BC ＝ ${a}`];
        const steps = [kind === 'in'
            ? `点 A から辺 BC に垂線 AH を下ろす。AB、AC、BC の長さから、直角三角形に三平方の定理を使って AH ＝ ${h} と求まる（H は線分 BC の上にある：BH ＝ ${p}、HC ＝ ${q}）`
            : `点 A から直線 BC に垂線 AH を下ろす。三平方の定理から AH ＝ ${h}、HB ＝ ${p}、HC ＝ ${q} と求まり、H は線分 BC の外側（B 側の延長上）にある`,
        `辺 BC が点 A のまわりを回ると、A に最も近い点が描く円（内側の円）と、A から最も遠い点が描く円（外側の円）の間の部分（ドーナツ形）を通る`,
        kind === 'in' ? `A に最も近い点は垂線の足 H（距離 ${h}）、最も遠い点は B か C のうち遠い方（距離 ${mx}）` : `垂線の足 H は線分 BC の外にあるので、A に最も近い点は端点 B（距離 ${Math.round(mn)}）、最も遠い点は C（距離 ${mx}）`,
        `面積 ＝ ${mx}² × π − ${Math.round(mn)}² × π ＝ ${mx * mx}π − ${Math.round(mn * mn)}π ＝ ${area}π`];
        return {
            unit: AP_UNIT, title: '通過領域（回転）',
            text: `平面上に ${lens.join('、')} の三角形 ABC がある。この三角形 ABC を点 A を中心にこの平面上で一回転させたときに、辺 BC が通過した部分の面積はいくらか。ただし、円周率は π とする。`,
            figure: { type: 'geom', items, pad: 40 }, prompt: '辺 BC が通過した部分の面積はどれですか。', correctAnswer: area, tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u27 Lv.3 の生成に失敗');
}

// ---- Lv.4 通過領域（ひも）：柵のまわりを動く牛 ----
function apRopeCoef(n, s, d, L) {
    let c = L * L / 2;
    [d, s - d].forEach(x => { let rem = L - x; for (let k = 0; k < n && rem > 1e-9; k++) { c += rem * rem / n; rem -= s; } });
    return c;
}
function apRope() {
    for (let t = 0; t < 8000; t++) {
        const n = getRandomChoice([3, 3, 3, 4, 6]), s = getRandomInt(n === 6 ? 2 : 3, n === 6 ? 5 : 9), d = getRandomInt(1, s - 1), L = getRandomInt(Math.max(d, s - d) + 1, Math.floor(n * s / 2));
        if (L > n * s / 2 || L <= Math.max(d, s - d)) continue;
        const c = apRopeCoef(n, s, d, L); if (!Number.isInteger(c * 2) || c < 4) continue;
        const names = 'ABCDEF'.slice(0, n).split(''), pt = n === 3 ? 'D' : 'P', pname = { 3: '正三角形', 4: '正方形', 6: '正六角形' }[n];
        const pts = []; let cur = [0, 0], dirA = 0; for (let k = 0; k < n; k++) { pts.push(cur); cur = Geom.add(cur, Geom.mul(Geom.dir(dirA), s)); dirA += 360 / n; }
        const mir = getRand() < 0.5, M = tpMir(mir), Q = pts.map(M), P = {}; names.forEach((nm, k) => P[nm] = Q[k]);
        const Dp = M([d, 0]), cow = M([d + 0.2 * s, -0.75 * s]);
        const items = [{ k: 'poly', pts: Q, closed: true, tag: 'fence' }, { k: 'seg', a: Dp, b: cow, tag: 'rope' }, { k: 'dot', p: Dp }, { k: 'txt', p: cow, s: '牛', dx: 0, dy: -2 }];
        const lab = tpAutoLabels(items, Object.assign({}, P, { [pt]: Dp })); items.push(...lab);
        // 解説：左右に分けて、角でまわりこむごとに残りのひもの長さを半径とする扇形を足す
        const arm = (x, from) => { const lines = []; let rem = L - x, v = from; for (let k = 0; k < n && rem > 1e-9; k++) { lines.push([v, rem]); rem -= s; v = names[(names.indexOf(v) + (from === 'A' ? n - 1 : 1)) % n]; } return lines; };
        const left = arm(d, 'A'), right = arm(s - d, 'B');
        const ext = 360 / n, secTxt = ([v, r]) => `頂点 ${v} でのまわりこみ：半径 ${r}m、中心角 ${ext}° の扇形 ＝ ${r}² × π × {{1/${n}}} ＝ ${apFrPi(r * r, n)}`;
        const sumSq = [...left, ...right].reduce((z, [, r]) => z + r * r, 0);
        const steps = [`${pt} は辺 AB 上の点で、柵の外側は直線 AB の片側だけ。綱の長さ ${L}m で動ける範囲は、まず ${pt} を中心とする半径 ${L}m の半円 ＝ ${L}² × π ÷ 2 ＝ ${apFrPi(L * L, 2)}`,
            `${pt} から A までは ${d}m。綱の残りは ${L} − ${d} ＝ ${L - d}m。A をこえてまわりこむと、中心角 ${ext}°（柵の外角）の扇形が増える`,
            ...left.map(secTxt), `${pt} から B までは ${s - d}m。残りは ${L} − ${s - d} ＝ ${L - (s - d)}m。B のほうも同じように考える`, ...right.map(secTxt),
            `${left.length + right.length} 個の扇形の合計 ＝ （${[...left, ...right].map(([, r]) => `${r}²`).join(' ＋ ')}）× π × {{1/${n}}} ＝ ${apFrPi(sumSq, n)}`,
            `範囲の面積 ＝ ${apFrPi(L * L, 2)} ＋ ${apFrPi(sumSq, n)} ＝ ${c}π（m²）`];
        const st = getRandomChoice([0.5, 0.5, 1]), ch = cpConsec(c, st, 0, 9999, v => `${v}πm²`); if (!ch) continue;
        return {
            unit: AP_UNIT, title: '通過領域（ひも）',
            text: `1辺が ${s}m の${pname}の柵 ${names.join('')} があり、A から ${d}m 離れた${pt === 'D' ? '点 D' : '点 P'} に長さ ${L}m の綱で牛がつながれている。この牛は、柵の中へは入れないが、柵の外を動き回ることができる。`,
            figure: { type: 'geom', items, pad: 40 }, prompt: '牛が動くことのできる範囲の面積として、最も妥当なのはどれですか。ただし、円周率は π とします。',
            correctAnswer: c, fraction: true, unitSuffix: 'm²', tight: true, customChoices: ch, steps
        };
    }
    throw new Error('u27 Lv.4 の生成に失敗');
}

// ---- Lv.5 円と接線：直径 AB の延長上に BC ＝ m となる点 C、C から引いた接線の接点 D ----
const apSurdOf = n => { let o = 1, i = n; for (let f = 2; f * f <= i; f++) while (i % (f * f) === 0) { o *= f; i /= f * f; } return [o, i]; };
const apFr3 = (n, i, d) => { const g = tpGcd(n, d); n /= g; d /= g; const sq = i === 1 ? String(n) : `${n === 1 ? '' : n}√${i}`; return d === 1 ? sq : `{{${sq}/${d}}}`; };
function apTangent() {
    for (let t = 0; t < 3000; t++) {
        const r = getRandomInt(1, 4), m = getRandomInt(1, 4), tgt = getRandomChoice(['ACD', 'ACD', 'ACD', 'BCD', 'OCD']);
        const OC = r + m, t2 = m * (2 * r + m), [o, i] = apSurdOf(t2), AC = 2 * r + m;
        let n, d;                                   // 面積 ＝ n√i / d
        if (tgt === 'ACD') { n = AC * r * o; d = 2 * OC; } else if (tgt === 'BCD') { n = m * r * o; d = 2 * OC; } else { n = r * o; d = 2; }
        const g = tpGcd(n, d); n /= g; d /= g;
        const key = (nn, ii, dd) => nn * Math.sqrt(ii) / dd, ansV = key(n, i, d);
        const raw = [[AC * o, i, 2], [r * o, i, 2], [AC * r, 1, 2 * OC], [AC * r * o * 2, i, 2 * OC], [AC * r * o, i, 4 * OC], [AC * o, i, 2 * OC], [OC * o, i, 2], [m * o, i, 2], [AC * r * o, i, OC], [n * 3, i, d * 2], [n * 2, i, d * 3], [n, i * 1, d * 2], [n * 2, i, d], [n * 3, i, d], [n, 1, d]];
        const cand = shuffleArray(raw.map(([a, ii, b]) => { const gg = tpGcd(a, b); return [a / gg, ii, b / gg]; }).filter(([a, ii, b]) => !(a === n && ii === i && b === d))).map(x => ({ key: key(...x), x }));
        const arr = arPick({ key: ansV, x: [n, i, d] }, cand); if (!arr) continue;
        if (new Set(arr.map(o2 => Math.round(o2.key * 1e6))).size !== 5) continue;
        const customChoices = arr.map((o2, k) => ({ value: o2.key, label: TP2_LAB[k], htmlText: `${TP2_LAB[k]} ${apFr3(...o2.x)}`, isCorrect: o2.x[0] === n && o2.x[1] === i && o2.x[2] === d }));
        // 図：接線を水平に、D を円の最下点、C をその左
        const tl = Math.sqrt(t2), D0 = [0, 0], O0 = [0, r], C0 = [-tl, 0], u = Geom.unit(Geom.sub(O0, C0)), A0 = Geom.add(O0, Geom.mul(u, r)), B0 = Geom.sub(O0, Geom.mul(u, r));
        const mir = getRand() < 0.5, M = tpMir(mir), P = { A: M(A0), B: M(B0), C: M(C0), D: M(D0) }, Oc = M(O0);
        const items = [{ k: 'circ', c: Oc, r, tag: 'O' }, { k: 'seg', a: P.C, b: P.A, tag: 'CA' }, { k: 'seg', a: M([-tl, 0]), b: M([r * 1.6, 0]), tag: 'tan' }, { k: 'seg', a: P.A, b: P.D, tag: 'AD' }, { k: 'dot', p: Oc },
            { k: 'lab', p: Oc, s: 'O', dir: [mir ? -0.3 : 0.3, 1] }];
        if (tgt === 'BCD') items.push({ k: 'seg', a: P.B, b: P.D, tag: 'BD' }); if (tgt === 'OCD') items.push({ k: 'seg', a: Oc, b: P.D, tag: 'OD' });
        const pl = tpAutoLabels(items.filter(q => q.k === 'seg'), P); pl.forEach(l => { if (l.s === 'A') l.dir = Geom.unit(Geom.sub(P.A, Oc)); if (l.s === 'B') l.dir = Geom.unit([(mir ? 0.4 : -0.4), 0.9]); if (l.s === 'D') l.dir = [0, -1]; });
        items.push(...pl);
        const surdT = o === 1 ? (i === 1 ? '1' : `√${i}`) : `${o}√${i}`, tTxt = i === 1 ? String(o) : surdT, hh = `${r} × ${tTxt} ÷ ${OC}`;
        const heightN = o * r, heightG = tpGcd(heightN, OC), hTxt = apFr3(heightN / heightG, i, OC / heightG), rr = r;
        const base = tgt === 'ACD' ? AC : tgt === 'BCD' ? m : null;
        const steps = [`OD と接線 CD は垂直なので △OCD は直角三角形。OC ＝ OB ＋ BC ＝ ${r} ＋ ${m} ＝ ${OC}、OD ＝ ${r}（半径）`,
            `三平方の定理より CD ＝ √(${OC}² − ${r}²) ＝ √${t2} ＝ ${tTxt}`,
            tgt === 'OCD' ? `△OCD は直角三角形（OD ⟂ CD）なので、面積 ＝ OD × CD ÷ 2 ＝ ${r} × ${tTxt} ÷ 2 ＝ ${apFr3(n, i, d)}`
                : `D から直線 AC に垂線を下ろしたときの高さ h を求める。△OCD の面積を2通りで表すと、OC × h ÷ 2 ＝ OD × CD ÷ 2 より h ＝ OD × CD ÷ OC ＝ ${r} × ${tTxt} ÷ ${OC} ＝ ${hTxt}`,
            tgt === 'OCD' ? '' : `△${tgt} は底辺 ${tgt === 'ACD' ? `AC ＝ ${r}×2 ＋ ${m} ＝ ${AC}` : `BC ＝ ${m}`}、高さ h なので、面積 ＝ ${base} × ${hTxt} ÷ 2 ＝ ${apFr3(n, i, d)}`].filter(Boolean);
        void hh; void rr;
        return {
            unit: AP_UNIT, title: '円と接線',
            text: `次の図のように、半径 ${r} の円 O の直径 AB の延長上に BC ＝ ${m} となるように点 C をとる。点 C から円 O に引いた接線の接点を点 D とする。`,
            figure: { type: 'geom', items, pad: 40 }, prompt: `△${tgt} の面積として、最も妥当なのはどれですか。`,
            correctAnswer: ansV, fraction: true, tight: true, customChoices, steps
        };
    }
    throw new Error('u27 Lv.5 の生成に失敗');
}

// ---- Lv.6 外接円：正多角形とその外接円で囲まれた斜線部分 ----
const AP_POLY = {
    tri: { n: 3, name: '正三角形', P: [1, 3], Q: [1, 4, 3] },        // (π/3 − √3/4) a²
    sq: { n: 4, name: '正方形', P: [1, 2], Q: [1, 1, 1] },           // (π/2 − 1) a²
    hex: { n: 6, name: '正六角形', P: [1, 1], Q: [3, 2, 3] }         // (π − 3√3/2) a²
};
function apCircumscribed() {
    for (let t = 0; t < 3000; t++) {
        const key = getRandomChoice(['tri', 'tri', 'sq', 'hex']), sp = AP_POLY[key], numeric = getRand() < 0.4;
        const a = numeric ? getRandomChoice(key === 'tri' ? [6, 12] : [2, 4, 6, 8]) : 1, k = sp.Q[2], sc = a * a;
        const P0 = sp.P, Q0 = sp.Q;
        const piTxt = (pn, pd) => pd === 1 ? (pn === 1 ? 'π' : `${pn}π`) : `{{${pn === 1 ? '' : pn}π/${pd}}}`;
        const qTxt = (qn, qd, kk) => { const sq = kk === 1 ? String(qn) : `${qn === 1 ? '' : qn}√${kk}`; return qd === 1 ? sq : `{{${sq}/${qd}}}`; };
        const pds = [...new Set([P0[1], 2, 3, 4, 6, 1])], qds = [...new Set([Q0[1], Q0[1] * 2, Q0[1] * 2 + (Q0[1] === 4 ? 4 : 0), Math.max(1, Q0[1] / 2), Q0[1] + 2, Q0[1] + 4])];
        const mk = (pd, qn0, qd0) => { const gq = tpGcd(qn0, qd0), qn = qn0 / gq, qd = qd0 / gq, xv = P0[0] * sc / pd, yv = qn * sc / qd; return { pd, qn, qd, xv, yv, val: xv * Math.PI - yv * Math.sqrt(k) }; };
        const ans = mk(P0[1], Q0[0], Q0[1]), combos = [];
        pds.forEach(pd => qds.forEach(qd => [Q0[0], Q0[0] * 2, Q0[0] + 1].forEach(qn => { const c2 = mk(pd, qn, qd); if (c2.val > 0 && (numeric ? Number.isInteger(c2.xv) && Number.isInteger(c2.yv) : true)) combos.push(c2); })));
        if (numeric && !(Number.isInteger(ans.xv) && Number.isInteger(ans.yv))) continue;
        const seenK = new Set([`${ans.pd}|${ans.qn}|${ans.qd}`]), uniq = combos.filter(c2 => { const kk = `${c2.pd}|${c2.qn}|${c2.qd}`; if (seenK.has(kk)) return false; seenK.add(kk); return true; });
        const cand = shuffleArray(uniq).map(c2 => ({ key: -(c2.xv * 100 - c2.yv), c2 }));
        const arr = arPick({ key: -(ans.xv * 100 - ans.yv), c2: ans }, cand); if (!arr) continue;
        const fmt = c2 => numeric ? `${c2.xv === 1 ? '' : c2.xv}π − ${k === 1 ? c2.yv : (c2.yv === 1 ? '' : c2.yv) + '√' + k}`
            : `(${piTxt(P0[0], c2.pd)} − ${qTxt(c2.qn, c2.qd, k)}) a²`;
        const customChoices = arr.map((o2, i) => ({ value: o2.c2.val, label: TP2_LAB[i], htmlText: `${TP2_LAB[i]} ${fmt(o2.c2)}`, isCorrect: o2.c2 === ans }));
        if (new Set(customChoices.map(c3 => Math.round(c3.value * 1e6))).size !== 5) continue;
        // 図：外接円の半径 R ＝ 辺 ÷ (2 sin(180°/n))、辺 a は底辺（水平）
        const n = sp.n, R = 1 / (2 * Math.sin(Math.PI / n)), C0 = [0, 0], rot = n === 3 ? 90 : (n === 4 ? -135 : -120);
        const V = []; for (let j = 0; j < n; j++) V.push(Geom.mul(Geom.dir(rot + 360 / n * j), R));
        const items = [{ k: 'poly', pts: apRing(C0, R, 360), holes: [V], closed: true, shade: true, tag: 'hatch' }, { k: 'circ', c: C0, r: R, tag: 'circ' }, { k: 'poly', pts: V, closed: true, tag: 'poly' }];
        const lowest = V.map((p, j) => [p, V[(j + 1) % n]]).filter(([p, q]) => Math.abs(p[1] - q[1]) < 1e-9).sort((p, q) => p[0][1] - q[0][1])[0];
        const lt = arSideOut(lowest[0], lowest[1], numeric ? `${a}cm` : 'a', C0, 15); lt.tag = 'a'; items.push(lt);
        const Rtxt = key === 'tri' ? '{{a/√3}}' : (key === 'sq' ? '{{a/√2}}' : 'a'), polyArea = key === 'tri' ? '{{√3/4}} a²' : (key === 'sq' ? 'a²' : '{{3√3/2}} a²');
        const steps = [`外接円の半径を R とする。${key === 'tri' ? '正三角形の外心は重心と一致し、高さ {{√3/2}}a の {{2/3}} が R なので R ＝ {{a/√3}}' : key === 'sq' ? '正方形の対角線 √2 a が外接円の直径なので、R ＝ {{a/√2}}' : '正六角形は6つの正三角形に分けられるので、R ＝ a'}`,
            `円の面積 ＝ π R² ＝ ${key === 'tri' ? '{{π/3}}' : key === 'sq' ? '{{π/2}}' : 'π'} a²`, `${sp.name}の面積 ＝ ${polyArea}`,
            `斜線部分 ＝ 円 − ${sp.name} ＝ ${fmt(ans)}${numeric ? `（a ＝ ${a} を代入）` : ''}`];
        void Rtxt;
        return {
            unit: AP_UNIT, title: '外接円',
            text: numeric ? `下図のような一辺の長さ ${a}cm の${sp.name}とそれに外接する円で囲まれた斜線部分の面積は何 cm² か。ただし、円周率は π とする。` : `下図のような一辺の長さ a の${sp.name}とそれに外接する円で囲まれた斜線部分の面積として、正しいのはどれか。`,
            figure: { type: 'geom', items, pad: 38 }, prompt: '斜線部分の面積として正しいのはどれですか。', correctAnswer: ans.val, fraction: true, tight: true, customChoices, steps,
            unitSuffix: numeric ? 'cm²' : undefined
        };
    }
    throw new Error('u27 Lv.6 の生成に失敗');
}
