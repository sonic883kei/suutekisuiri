/**
 * u24_triangle_polygon.js  —  ㉔ 三角形と多角形（図形分野）
 * 図形分野の第1単元。例題の型（11パターン）のうち、まず公式で解ける次の4つを実装:
 *   Lv.1 多角形の内角   … 正n角形の1つの内角／内角の和／外角（内角）から何角形か（2005 東京消防庁Ⅲ類）
 *   Lv.2 多角形の対角線 … 対角線の総本数／本数から何角形か／1頂点から引ける本数から総数／内角の和から総数（2006 刑務官）
 *   Lv.3 同位角と錯角   … 正n角形（n＝5・6・8・9・10・12）と二本の平行線。上の線との角 α から x を求める（2004 東京消防庁Ⅲ類）
 *   Lv.4 三角形の外角   … 五芒星の先端の角の和。先端を1か所または2か所切り取った形もある（2013 東京都Ⅲ類）
 *   Lv.5〜11 は u24_triangle_polygon2.js（有名三角形・三角形の相似①・三平方の定理・チェバ・メネラウス・角度・内角の和①②・三角形の相似②）
 * 図は座標から作り（q.figure の type:'geom'）、tests/run.js が座標から角度などを実測して答えを照合する。
 */
UnitRegistry.register({
    id: 'u24', name: '㉔ 三角形と多角形', chap: 3, section: '図形分野',
    generate(level) {
        const fns = [tpInterior, tpDiagonal, tpParallel, tpStar, tpFamous, tpSimilar1, tpFold, tpMenelaus, tpAngle1, tpElevation, tpSimilar2];   // 後半(5〜11)は u24_triangle_polygon2.js
        const lv = Number.isInteger(parseInt(level)) && parseInt(level) >= 1 && parseInt(level) <= fns.length ? parseInt(level) : getRandomInt(1, fns.length);
        return fns[lv - 1]();
    }
});

const TP_LAB = ['①', '②', '③', '④', '⑤'];
// 正解＋誤答候補から、昇順の5択を作る（値の表示は fmt）
function tpChoices(ans, wrongs, fmt, spread) {
    const set = new Set([ans]);
    shuffleArray(wrongs.filter(v => Number.isInteger(v) && v > 0 && v !== ans)).forEach(v => { if (set.size < 5) set.add(v); });
    for (let g = 0; set.size < 5 && g < 300; g++) { const v = ans + getRandomChoice([-1, 1]) * getRandomInt(1, 8) * spread; if (v > 0) set.add(v); }
    return [...set].sort((a, b) => a - b).map((v, i) => ({ value: v, label: TP_LAB[i], htmlText: `${TP_LAB[i]} ${fmt(v)}`, isCorrect: v === ans }));
}
const TP_N360 = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36];   // 360 の約数（外角・内角が整数度になる正多角形）

// ---- Lv.1 多角形の内角 ----
function tpInterior() {
    const kind = getRandomChoice(['one', 'one', 'one', 'sum', 'ext2n', 'int2n']);
    const base = { unit: '㉔ 三角形と多角形', title: '多角形の内角', unitSuffix: '°', tight: true, consecutive: true, step: 1 };
    if (kind === 'one') {
        const n = getRandomChoice(TP_N360), ans = 180 * (n - 2) / n;
        return { ...base, text: `正${n}角形の1つの内角の角度はいくつか。`, prompt: '1つの内角は何度ですか。', correctAnswer: ans, step: getRandomChoice([2, 4, 4, 6]), maxValue: 179,
            steps: [`n 角形の内角の和は 180° × (n − 2)。正${n}角形では 180° × ${n - 2} ＝ ${180 * (n - 2)}°`, `正多角形の内角は全部等しいので、1つの内角 ＝ ${180 * (n - 2)}° ÷ ${n} ＝ ${ans}°`, `（別解）1つの外角は 360° ÷ ${n} ＝ ${360 / n}° なので、内角 ＝ 180° − ${360 / n}° ＝ ${ans}°`] };
    }
    if (kind === 'sum') {
        const n = getRandomInt(5, 20), ans = 180 * (n - 2);
        return { ...base, text: `${n}角形の内角の和は何度か。`, prompt: '内角の和は何度ですか。', correctAnswer: ans, step: 180,
            steps: [`n 角形は、1つの頂点から対角線を引くと (n − 2) 個の三角形に分けられる`, `三角形の内角の和は 180° なので、${n}角形の内角の和 ＝ 180° × (${n} − 2) ＝ 180° × ${n - 2} ＝ ${ans}°`] };
    }
    const n = getRandomChoice(TP_N360), ext = 360 / n, inn = 180 - ext;
    const baseN = { ...base, unitPrefix: '正', unitSuffix: '角形', tight: true, correctAnswer: n, step: getRandomChoice([1, 1, 2, 3]) };
    if (kind === 'ext2n') {
        return { ...baseN, text: `1つの外角が ${ext}° である正多角形は、正何角形か。`, prompt: '正何角形ですか。',
            steps: [`多角形の外角の和は、何角形でも 360°`, `正多角形では外角がすべて等しいので、頂点の数 n ＝ 360° ÷ ${ext}° ＝ ${n}`, `よって正${n}角形`] };
    }
    return { ...baseN, text: `1つの内角が ${inn}° である正多角形は、正何角形か。`, prompt: '正何角形ですか。',
        steps: [`1つの外角 ＝ 180° − 内角 ＝ 180° − ${inn}° ＝ ${ext}°`, `多角形の外角の和は 360° なので、頂点の数 n ＝ 360° ÷ ${ext}° ＝ ${n}`, `よって正${n}角形`] };
}

// ---- Lv.2 多角形の対角線 ----
function tpDiagonal() {
    const kind = getRandomChoice(['total', 'total', 'fromN', 'fromVertex', 'fromSum']);
    const base = { unit: '㉔ 三角形と多角形', title: '多角形の対角線' };
    const D = n => n * (n - 3) / 2, wr = n => [n * (n - 3), n * (n - 1) / 2, Math.floor(n * n / 2), D(n + 1), D(n - 1), n * (n - 2) / 2, D(n) + n, D(n) + 10, D(n) - 5];
    if (kind === 'fromN') {
        const n = getRandomInt(6, 20), k = D(n);
        return { ...base, text: `対角線の本数が ${k} 本である凸多角形は、何角形か。`, prompt: '何角形ですか。', correctAnswer: n, unitSuffix: '角形', tight: true, consecutive: true, step: 1,
            steps: [`n 角形の対角線の本数は n × (n − 3) ÷ 2。n × (n − 3) ÷ 2 ＝ ${k} より n × (n − 3) ＝ ${2 * k}`, `積が ${2 * k} で、2つの数の差が 3 になるのは ${n} と ${n - 3}（${n} × ${n - 3} ＝ ${2 * k}）`, `よって ${n}角形`] };
    }
    const n = getRandomInt(6, 20), tot = D(n);
    const common = [`各頂点から引ける対角線は、自分と両どなりの頂点を除く (n − 3) 本`, `n 個の頂点から (n − 3) 本ずつ引くと、同じ対角線を2回ずつ数えるので、総数 ＝ n × (n − 3) ÷ 2`];
    let text, steps;
    if (kind === 'total') { text = `正${n}角形の対角線は、全部で何本あるか。`; steps = [...common, `n ＝ ${n} なので ${n} × ${n - 3} ÷ 2 ＝ ${tot} 本`]; }
    else if (kind === 'fromVertex') {
        text = `ある凸多角形の1つの頂点から引ける対角線は ${n - 3} 本ある。この多角形の対角線は全部で何本か。`;
        steps = [`1つの頂点から引ける対角線は (n − 3) 本なので、n − 3 ＝ ${n - 3} より n ＝ ${n}（${n}角形）`, `対角線の総数 ＝ n × (n − 3) ÷ 2 ＝ ${n} × ${n - 3} ÷ 2 ＝ ${tot} 本（2回ずつ数えるので 2 で割る）`];
    } else {
        text = `内角の和が ${180 * (n - 2)}° である凸多角形の対角線は、全部で何本あるか。`;
        steps = [`n 角形の内角の和は 180° × (n − 2)。180° × (n − 2) ＝ ${180 * (n - 2)}° より n − 2 ＝ ${n - 2}、n ＝ ${n}`, `対角線の総数 ＝ n × (n − 3) ÷ 2 ＝ ${n} × ${n - 3} ÷ 2 ＝ ${tot} 本`];
    }
    return { ...base, text, prompt: '対角線は全部で何本ですか。', correctAnswer: tot, unitSuffix: '本', customChoices: tpChoices(tot, wr(n), v => `${v}本`, 5), steps };
}

// ---- Lv.3 同位角と錯角（正n角形と平行線） ----
// 下の線に頂点 V が接し、V から出る辺の向きを θ（下の線の右向きから測った角）とすると、
// 辺をたどるごとに向きは外角 ext ずつ回るので、j 番目の辺の向きは α ＝ θ ＋ j×ext。x ＝ ext − θ。
function tpParallel() {
    for (let t = 0; t < 5000; t++) {
        const n = getRandomChoice([5, 6, 8, 9, 10, 12]), ext = 360 / n, th = getRandomInt(Math.ceil(ext * 0.2), Math.floor(ext * 0.8)), jmax = Math.floor((179 - th) / ext);
        if (jmax < 1) continue;
        const j = getRandomInt(1, jmax), alpha = th + j * ext, x = ext - th, mirror = getRand() < 0.5;
        const V = [[0, 0]]; for (let k = 0; k < n - 1; k++) V.push(Geom.add(V[k], Geom.dir(th + k * ext)));
        if (V.slice(1).some(p => p[1] < 1e-6)) continue;                       // V が一番下の頂点
        const tt = 0.35 + 0.3 * getRand(), P = Geom.lerp(V[j], V[j + 1], tt), yl = P[1];
        const ymax = Math.max(...V.map(p => p[1]));
        if (yl < ymax * 0.25 || yl > ymax * 0.78) continue;                     // 上の線が多角形の中ほどを通る図だけ使う
        const xs = V.map(p => p[0]), x0 = Math.min(...xs) - 0.5, x1 = Math.max(...xs) + 0.5, M = p => mirror ? [-p[0], p[1]] : p;
        const items = [
            { k: 'poly', pts: V.map(M), closed: true },
            { k: 'seg', a: M([x0, 0]), b: M([x1, 0]) }, { k: 'seg', a: M([x0, yl]), b: M([x1, yl]) },
            { k: 'ang', v: M(V[0]), a: M([x0, 0]), b: M(V[n - 1]), s: 'x', r: 22, tag: 'x' },
            { k: 'ang', v: M(P), a: M([x1, yl]), b: M(V[j + 1]), s: `${alpha}°`, r: 22, tag: 'given' }
        ];
        const R = mirror ? '左' : '右', L = mirror ? '右' : '左';
        const steps = [
            `正${n}角形の外角は 360° ÷ ${n} ＝ ${ext}°（内角は 180° − ${ext}° ＝ ${180 - ext}°）。辺をたどって頂点を1つ回るごとに、辺の向きは外角の ${ext}° ずつ同じ向きに回る`,
            `上の線と下の線は平行なので、同位角は等しい。上の線と辺がつくる ${alpha}° は、下の線の${R}向きから測った辺の向き ${alpha}° と等しい`,
            `下の線にふれる頂点から出る${R}の辺（最初の辺）の向きを θ とすると、${j} 回頂点を回った辺の向きが ${alpha}° なので、${alpha}° ＝ θ ＋ ${ext}° × ${j}。よって θ ＝ ${alpha}° − ${ext * j}° ＝ ${th}°`,
            `もう一方の辺は、頂点の内角 ${180 - ext}° だけ向きが違うので、下の線の${R}向きから ${th}° ＋ ${180 - ext}° ＝ ${th + 180 - ext}° の向き`,
            `x は下の線の${L}向きとの間の角なので、x ＝ 180° − ${th + 180 - ext}° ＝ ${x}°（x ＝ 外角 ${ext}° − θ ${th}° と考えても同じ）`
        ];
        return {
            unit: '㉔ 三角形と多角形', title: '同位角と錯角',
            text: `図のような正${n}角形と二本の平行線があるとき、x の角度はいくつか。`,
            figure: { type: 'geom', items },
            prompt: 'x の角度は何度ですか。',
            correctAnswer: x, unitSuffix: '°', tight: true, consecutive: true, step: 1, steps
        };
    }
    throw new Error('u24 Lv.3 の生成に失敗');
}

// ---- Lv.4 三角形の外角（五芒星の先端の角の和。先端を切り取った形もある） ----
function tpStar() {
    for (let t = 0; t < 20000; t++) {
        const P = [0, 1, 2, 3, 4].map(i => { const a = 90 - 72 * i + (getRand() - 0.5) * 18, r = 1 + (getRand() - 0.5) * 0.24; return Geom.mul(Geom.dir(a), r); });   // 時計まわりに5点
        const order = [0, 2, 4, 1, 3], tips = order.map(i => P[i]);                // 星形のたどる順
        const nCut = getRandomChoice([0, 0, 1, 1, 2]), cutIdx = shuffleArray([0, 1, 2, 3, 4]).slice(0, nCut);
        const path = [];
        tips.forEach((tip, i) => {
            if (cutIdx.includes(i)) {
                const prev = tips[(i + 4) % 5], next = tips[(i + 1) % 5];
                path.push({ p: Geom.lerp(prev, tip, 0.74 + 0.14 * getRand()), cut: true }, { p: Geom.lerp(tip, next, 0.12 + 0.14 * getRand()), cut: true });
            } else path.push({ p: tip, cut: false });
        });
        const m = path.length, pts = path.map(o => o.p);
        // 検査: 全頂点で同じ向きに曲がる／全体で2回転(720°)／角が小さすぎない／切り口が他の線と交わらない
        let turn = 0, ok = true, sign = 0; const ang = [];
        for (let i = 0; i < m; i++) {
            const a = pts[(i + m - 1) % m], v = pts[i], b = pts[(i + 1) % m], d1 = Geom.sub(v, a), d2 = Geom.sub(b, v), cr = Geom.cross(d1, d2);
            if (sign === 0) sign = Math.sign(cr); else if (Math.sign(cr) !== sign) ok = false;
            turn += Math.atan2(cr, Geom.dot(d1, d2)) * 180 / Math.PI; ang.push(Geom.angle(v, a, b));
        }
        if (!ok || Math.abs(Math.abs(turn) - 720) > 1e-6 || Math.min(...ang) < 14 || Math.max(...ang) > 172) continue;
        for (let i = 0; i < m && ok; i++) if (path[i].cut && path[(i + 1) % m].cut) {
            // 切り口の辺（切り取った2点を結ぶ辺）が、隣り合わない辺と交わらない
            const c1 = pts[i], c2 = pts[(i + 1) % m]; if (Geom.len(Geom.sub(c1, c2)) < 0.2) { ok = false; break; }
            for (let k = 0; k < m; k++) if (k !== i && k !== (i + 1) % m && (k + 1) % m !== i && Geom.cross2(c1, c2, pts[k], pts[(k + 1) % m])) { ok = false; break; }
        }
        if (!ok) continue;
        // 頂点の名前: 一番上の頂点から時計まわりに A, B, C …
        const cen = pts.reduce((s, p) => Geom.add(s, p), [0, 0]).map(v => v / m), cw = p => ((90 - Math.atan2(p[1] - cen[1], p[0] - cen[0]) * 180 / Math.PI) % 360 + 360) % 360;
        const rank = [...pts.keys()].sort((a, b) => cw(pts[a]) - cw(pts[b])), name = []; rank.forEach((idx, k) => name[idx] = String.fromCharCode(65 + k));
        const items = [{ k: 'poly', pts, closed: true }];
        pts.forEach((p, i) => { items.push({ k: 'ang', v: p, a: pts[(i + m - 1) % m], b: pts[(i + 1) % m], r: 13, tag: 'v' }, { k: 'lab', p, s: name[i], from: cen }); });
        const sum = 180 * m - 720, list = [...name].sort().map(c => `∠${c}`).join('、'), pathNames = name.join('→');
        const steps = [
            `この図形は ${pathNames}→${name[0]} と一筆書きでたどれる、閉じた折れ線（頂点は ${m} 個）`,
            `たどる向きは、各頂点で「180° − その頂点の角」だけ、いつも同じ向きに回る`,
            `1周して元の向きにもどるまでに、向きはちょうど 2 回転（720°）する（星形は中心のまわりを2周する）`,
            `したがって (180° − ∠${name[0]}) ＋ (180° − ∠${name[1]}) ＋ … （${m} 個）＝ 720°。180° × ${m} − (角の和) ＝ 720° より、角の和 ＝ ${180 * m}° − 720° ＝ ${sum}°`
        ];
        if (nCut === 0) steps.push(`（五芒星の5つの先端の角の和は、いつでも 180°）`);
        else steps.push(`（先端を1か所切り取るごとに頂点が1つふえ、角の和は 180° ふえる。五芒星の 180° から ${nCut} か所で ${180 + 180 * nCut}°）`);
        return {
            unit: '㉔ 三角形と多角形', title: '三角形の外角',
            text: `下図のような図形において、${list}の角度の和として、正しいのはどれか。`,
            figure: { type: 'geom', items },
            prompt: `${list}の角度の和はいくつですか。`,
            correctAnswer: sum, unitSuffix: '°', tight: true, consecutive: true, step: 30, steps
        };
    }
    throw new Error('u24 Lv.4 の生成に失敗');
}
