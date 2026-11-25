/**
 * geom.js  —  図形分野の共通部品（描画と幾何計算）
 * 読み込み順: core.js → geom.js → js/units/*.js → ui.js
 *
 * 図は q.figure = { type:'geom', items:[...] } で渡す。座標は数学の向き（y が上）で書けばよく、
 * geomSvg が全体を枠に収めて SVG にする（反転・拡大縮小も自動）。
 *   {k:'poly', pts:[[x,y],…], closed:true|false, shade:true, holes:[[…],…]}   折れ線・多角形（shade:true で斜線を引く）
 *   {k:'seg',  a:[x,y], b:[x,y], dash:true, tick:n}   線分（tick:n で中央に等長の印を n 本）
 *   {k:'rt',   v:[x,y], a:[x,y], b:[x,y]}             v にある直角の記号（a・b は両辺の向き）
 *   {k:'lab',  p:[x,y], s:'A', from:[cx,cy] | dir:[dx,dy]}  点の名前（from の反対側、または dir の向きに少しずらして置く）
 *   {k:'ang',  v:[x,y], a:[x,y], b:[x,y], s:'111°', r:16, tag:'x'}   v を頂点とする角 ∠avb の円弧（小さい方の角）。s があれば値を書く
 *   {k:'dot',  p:[x,y]}  {k:'circ', c:[x,y], r:数値}  {k:'txt', p:[x,y], s:'…', dx:0, dy:0}
 * 図が成り立っているかの検査用に、tests/run.js が items の座標から角度や長さを実測する。
 */
const Geom = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, k) => [a[0] * k, a[1] * k],
    len: a => Math.hypot(a[0], a[1]),
    dot: (a, b) => a[0] * b[0] + a[1] * b[1],
    cross: (a, b) => a[0] * b[1] - a[1] * b[0],
    unit(a) { const l = Geom.len(a); return [a[0] / l, a[1] / l]; },
    dir(deg) { const r = deg * Math.PI / 180; return [Math.cos(r), Math.sin(r)]; },
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    // v を頂点とする ∠avb（0〜180°）
    angle(v, a, b) {
        const u = Geom.sub(a, v), w = Geom.sub(b, v);
        return Math.acos(Math.max(-1, Math.min(1, Geom.dot(u, w) / (Geom.len(u) * Geom.len(w))))) * 180 / Math.PI;
    },
    // 線分 ab と cd が（端点以外で）交わるか
    cross2(a, b, c, d) {
        const d1 = Geom.cross(Geom.sub(b, a), Geom.sub(c, a)), d2 = Geom.cross(Geom.sub(b, a), Geom.sub(d, a));
        const d3 = Geom.cross(Geom.sub(d, c), Geom.sub(a, c)), d4 = Geom.cross(Geom.sub(d, c), Geom.sub(b, c));
        return d1 * d2 < -1e-12 && d3 * d4 < -1e-12;
    },
    // 点 p が線分 ab 上にあるか
    onSeg(p, a, b, eps = 1e-7) {
        const ab = Geom.sub(b, a), ap = Geom.sub(p, a), L = Geom.len(ab);
        return Math.abs(Geom.cross(ab, ap)) / L < eps && Geom.dot(ab, ap) > -eps && Geom.dot(ab, ap) < L * L + eps;
    }
};

function geomSvg(fig) {
    const items = fig.items || [], W = fig.w || 300, pad = fig.pad || 38;
    const pts = [];
    items.forEach(it => {
        if (it.pts) pts.push(...it.pts);
        ['a', 'b', 'p', 'v'].forEach(k => { if (it[k] && it.k !== 'ang') pts.push(it[k]); });
        if (it.k === 'circ') pts.push([it.c[0] - it.r, it.c[1] - it.r], [it.c[0] + it.r, it.c[1] + it.r]);
    });
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const sc = (W - 2 * pad) / Math.max(x1 - x0, y1 - y0, 1e-9), H = Math.round((y1 - y0) * sc + 2 * pad);
    const T = p => [(p[0] - x0) * sc + pad + (W - 2 * pad - (x1 - x0) * sc) / 2, H - ((p[1] - y0) * sc + pad)];   // 数学座標 → 画面座標
    const f = v => Math.round(v * 100) / 100;
    const esc = typeof escapeHTML === 'function' ? escapeHTML : (s => s);
    let out = '';
    items.forEach(it => {
        if (it.k === 'poly') {
            const P = it.pts.map(T).map(p => `${f(p[0])},${f(p[1])}`).join(' ');
            const shd = it.shade ? ' style="fill:url(#g-hatch)"' : '';
            if (it.closed && it.holes) {      // 穴のある図形（外側 − 内側）。偶奇規則で内側をぬく
                const ring = r => 'M ' + r.map(T).map(p => `${f(p[0])} ${f(p[1])}`).join(' L ') + ' Z';
                out += `<path d="${[it.pts, ...it.holes].map(ring).join(' ')}" fill-rule="evenodd" class="g-line g-fill"${shd}/>`;
            } else out += it.closed ? `<polygon points="${P}" class="g-line g-fill"${shd}/>` : `<polyline points="${P}" class="g-line"/>`;
        } else if (it.k === 'seg') {
            const a = T(it.a), b = T(it.b);
            out += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" class="g-line${it.dash ? ' g-dash' : ''}"/>`;
            if (it.tick) {          // 等長の印（線分の中央に垂直な短い線を tick 本）
                const u = Geom.unit([b[0] - a[0], b[1] - a[1]]), nv = [-u[1], u[0]], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                for (let k = 0; k < it.tick; k++) {
                    const o = (k - (it.tick - 1) / 2) * 4.5, c = [mid[0] + u[0] * o, mid[1] + u[1] * o];
                    out += `<line x1="${f(c[0] - nv[0] * 5)}" y1="${f(c[1] - nv[1] * 5)}" x2="${f(c[0] + nv[0] * 5)}" y2="${f(c[1] + nv[1] * 5)}" class="g-line g-tick"/>`;
                }
            }
        } else if (it.k === 'dot') {
            const p = T(it.p); out += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="2.5" class="g-dotc"/>`;
        } else if (it.k === 'circ') {
            const c = T(it.c); out += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(it.r * sc)}" class="g-line"/>`;
        } else if (it.k === 'txt') {
            const p = T(it.p); out += `<text x="${f(p[0] + (it.dx || 0))}" y="${f(p[1] + (it.dy || 0) + 4)}" text-anchor="middle" class="g-txt">${esc(it.s)}</text>`;
        } else if (it.k === 'lab') {
            const p = T(it.p), c = it.from ? T(it.from) : p;
            let d = it.dir ? [it.dir[0], -it.dir[1]] : [p[0] - c[0], p[1] - c[1]]; const l = Math.hypot(d[0], d[1]) || 1; d = [d[0] / l, d[1] / l];
            out += `<text x="${f(p[0] + d[0] * 13)}" y="${f(p[1] + d[1] * 13 + 4.5)}" text-anchor="middle" class="g-lab">${esc(it.s)}</text>`;
        } else if (it.k === 'rt') {
            const v = T(it.v), a = T(it.a), b = T(it.b), z = it.r || 9;
            const ua = Geom.unit([a[0] - v[0], a[1] - v[1]]), ub = Geom.unit([b[0] - v[0], b[1] - v[1]]);
            const p1 = [v[0] + ua[0] * z, v[1] + ua[1] * z], p2 = [v[0] + ub[0] * z, v[1] + ub[1] * z], p3 = [p1[0] + ub[0] * z, p1[1] + ub[1] * z];
            out += `<path d="M ${f(p1[0])} ${f(p1[1])} L ${f(p3[0])} ${f(p3[1])} L ${f(p2[0])} ${f(p2[1])}" class="g-arc"/>`;
        } else if (it.k === 'ang') {
            const v = T(it.v), a = T(it.a), b = T(it.b), r = it.r || 15;
            const ua = Geom.unit([a[0] - v[0], a[1] - v[1]]), ub = Geom.unit([b[0] - v[0], b[1] - v[1]]);
            const p1 = [v[0] + ua[0] * r, v[1] + ua[1] * r], p2 = [v[0] + ub[0] * r, v[1] + ub[1] * r];
            const sweep = Geom.cross(ua, ub) > 0 ? 1 : 0;      // 画面座標（y が下）での向き
            out += `<path d="M ${f(p1[0])} ${f(p1[1])} A ${r} ${r} 0 0 ${sweep} ${f(p2[0])} ${f(p2[1])}" class="g-arc"/>`;
            if (it.s) {
                const m = Geom.unit([ua[0] + ub[0], ua[1] + ub[1]]), q = [v[0] + m[0] * (r + 13), v[1] + m[1] * (r + 13)];
                out += `<text x="${f(q[0])}" y="${f(q[1] + 4)}" text-anchor="middle" class="g-ang">${esc(it.s)}</text>`;
            }
        }
    });
    const defs = items.some(i => i.shade) ? '<defs><pattern id="g-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#fbbf24" stroke-width="1.5" opacity="0.85"/></pattern></defs>' : '';
    return `<svg viewBox="0 0 ${W} ${H}" class="fig-geom" role="img" aria-label="問題の図">${defs}${out}</svg>`;
}
