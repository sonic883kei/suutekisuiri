/**
 * u08_traveler.js  —  ⑧ 旅人算
 * 7パターン（過去問の型）:
 *   Lv.1 出会い算（出会う時間）        … 距離と2つの速さ → 出会うまでの時間
 *   Lv.2 出会い算（速さを求める）      … 距離・出会うまでの時間・一方の速さ → もう一方の速さ
 *   Lv.3 追いかけ算（時間と距離）      … 妹の出発から T0 分後に姉が自転車で追う → 追いつく時間と距離の組（2017 裁判所一般職 高卒者区分）
 *   Lv.4 周回問題（池の周り）          … 同方向なら t1 分で追い着き、反対方向なら t2 分で出会う → 速さ
 *   Lv.5 周回問題（すれ違う回数）      … トラックを逆向きに走る2人 → T 分間にすれ違う回数
 *   Lv.6 追いかけ算（忘れ物を取りに戻る）… 兄が家に戻って自転車で妹を追う → 追いつく地点の家からの距離（裁判所一般職 高卒者区分）
 *   Lv.7 周回問題（多角形の辺上の動点）… 正多角形の辺上を反時計回りに動く2点 → QがPに初めて追いつく時間（2014 裁判所一般職 高卒者区分）
 * いずれも「答えが整数（Lv.7は0.5刻み）になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜7 ならそのパターン、それ以外は7パターンからランダム。
 */
UnitRegistry.register({
    id: 'u8', name: '⑧ 旅人算', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4, 5, 6, 7].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 7);
        return [travMeet, travMeetSpeed, travChase, travLoopPond, travLoopMeetCount, travChaseReturn, travPolygon][lv - 1]();
    }
});

const travLabels = ['①', '②', '③', '④', '⑤'];
const travDist = (D) => (D >= 1000 && D % 100 === 0 ? `${Number((D / 1000).toFixed(1))}km` : `${D}m`);
// 正解＋誤答の候補から5択（表示文字列つき）を作る。pairs は {key, text} の配列、correctKey が正解
function travCustomChoices(correct, wrongs, sortFn) {
    const seen = new Set([correct.key]), pool = [];
    for (const w of shuffleArray(wrongs)) { if (!seen.has(w.key)) { seen.add(w.key); pool.push(w); } if (pool.length === 4) break; }
    const all = [correct, ...pool].sort(sortFn);
    return all.map((c, i) => ({ value: c.key, label: travLabels[i], htmlText: `${travLabels[i]} ${c.text}`, isCorrect: c === correct }));
}

// ---- Lv.1 出会い算（出会う時間）----
function travMeet() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const vA = 50 * getRandomInt(4, 20), vB = 50 * getRandomInt(4, 20), t = getRandomInt(2, 10), D = (vA + vB) * t;
        if (D % 100 === 0 && D >= 1000) q = { vA, vB, t, D };
    }
    if (!q) q = { vA: 900, vB: 700, t: 2, D: 3200 };
    const { vA, vB, t, D } = q;
    return {
        unit: '⑧ 旅人算', title: '出会い算（出会う時間）',
        text: `${travDist(D)}離れた 2 つのバス停A、Bがある。AからBに向け分速 ${vA} m で走るバスと、BからAに向け分速 ${vB} m で走るバスが同時に出発する。`,
        prompt: 'このとき、両方のバスが出会うのは何分後か。',
        correctAnswer: t, unitSuffix: '分後', step: 1, consecutive: true,
        steps: [
            `2 台のバスは向かい合って進むので、1 分間に ${vA} ＋ ${vB} ＝ ${vA + vB} m ずつ近づく`,
            `距離は ${travDist(D)} ＝ ${D} m`,
            `出会うまでの時間 ＝ ${D} ÷ ${vA + vB} ＝ ${t} 分後`
        ]
    };
}

// ---- Lv.2 出会い算（速さを求める）----
function travMeetSpeed() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const S = 5 * getRandomInt(16, 40), t = getRandomInt(5, 20), D = S * t, known = 5 * getRandomInt(6, S / 5 - 6);
        if (D % 100 === 0 && S - known >= 30) q = { S, t, D, known, ans: S - known };
    }
    if (!q) q = { S: 120, t: 10, D: 1200, known: 65, ans: 55 };
    const { S, t, D, known, ans } = q, [kn, as] = getRandomChoice([['A', 'B'], ['B', 'A']]);
    return {
        unit: '⑧ 旅人算', title: '出会い算（速さを求める）',
        text: `${D} m 離れた場所から、AとBがお互いに向かい合って同時に出発すると、${t} 分後に 2 人は出会った。${kn}の速さが分速 ${known} m だとする。`,
        prompt: `このとき、${as}の速さは分速何 m か。`,
        correctAnswer: ans, unitSuffix: 'm/分', step: 10, consecutive: true,
        steps: [
            `2 人は ${t} 分で合わせて ${D} m 進んだので、1 分間に近づく距離（速さの和）は ${D} ÷ ${t} ＝ ${S} m`,
            `${as}の速さ ＝ ${S} － ${known} ＝ ${ans} m/分`
        ]
    };
}

// ---- Lv.3 追いかけ算（時間と距離の組）----
function travChase() {
    const [younger, elder] = getRandomChoice([['妹', '姉'], ['弟', '兄']]);
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const vs = getRandomChoice([40, 50, 60, 70, 80]), va = getRandomChoice([150, 200, 240, 250, 300, 350, 400]), T0 = getRandomInt(5, 15);
        if (va <= vs * 2 || (vs * T0) % (va - vs) !== 0) continue;
        const t = vs * T0 / (va - vs);
        if (t >= 2 && t <= 10) q = { vs, va, T0, t, d: va * t };
    }
    if (!q) q = { vs: 60, va: 300, T0: 12, t: 3, d: 900 };
    const { vs, va, T0, t, d } = q, fmt = (x, y) => ({ key: `${x}|${y}`, text: `${x} 分　${y} m` });
    const wrongs = [fmt(t, vs * T0), fmt(t, (va - vs) * t), fmt(2 * t, va * 2 * t), fmt(t + 1, va * (t + 1)), fmt(t + 2, va * (t + 2)), fmt(t - 1, va * (t - 1)), fmt(t, va * t + vs * t), fmt(t / 2, va * t / 2)].filter(w => !w.text.startsWith('0 ') && !w.key.includes('-'));
    const customChoices = travCustomChoices(fmt(t, d), wrongs, (a, b) => { const [ta, da] = a.key.split('|').map(Number), [tb, db] = b.key.split('|').map(Number); return ta - tb || da - db; });
    return {
        unit: '⑧ 旅人算', title: '追いかけ算（時間と距離）',
        text: `${younger}の歩く速さは分速 ${vs} m、${elder}が自転車で進む速さは分速 ${va} m である。${younger}が出発してから ${T0} 分後に${elder}が同じ道を自転車で${younger}を追いかける。`,
        prompt: `このとき、${elder}が出発してから${younger}に追いつくまでにかかる時間と、出発地点から${younger}に追いついた地点までの距離の組合せとして適当なものはどれか。`,
        correctAnswer: d, customChoices,
        steps: [
            `${elder}が出発するとき、${younger}は ${vs} × ${T0} ＝ ${vs * T0} m 先にいる`,
            `${elder}は 1 分間に ${va} － ${vs} ＝ ${va - vs} m ずつ${younger}に近づく`,
            `追いつくまでの時間 ＝ ${vs * T0} ÷ ${va - vs} ＝ ${t} 分`,
            `追いついた地点までの距離 ＝ ${va} × ${t} ＝ ${d} m　⇒　${t} 分、${d} m`
        ]
    };
}

// ---- Lv.4 周回問題（池の周り：同方向で追い着く時間と反対方向で出会う時間から速さを求める）----
function travLoopPond() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const L = 100 * getRandomInt(3, 20), b = getRandomInt(15, 90), a = b + getRandomInt(5, 60);
        if (L % (a - b) !== 0 || L % (a + b) !== 0) continue;
        const t1 = L / (a - b), t2 = L / (a + b);
        if (t1 >= 5 && t1 <= 40 && t2 >= 2 && t2 <= 20) q = { L, a, b, t1, t2 };
    }
    if (!q) q = { L: 600, a: 80, b: 40, t1: 15, t2: 5 };
    const { L, a, b, t1, t2 } = q, ask = getRandomChoice(['A', 'B']), ans = ask === 'A' ? a : b;
    return {
        unit: '⑧ 旅人算', title: '周回問題（池の周り）',
        text: `${L} m ある池の周りをA、Bの 2 人が歩く。ある同じ地点から同時に同じ方向へ進むと ${t1} 分でAがBに追い着き、反対方向へ進むと ${t2} 分で出会う。`,
        prompt: `${ask}の歩く速さは何 m/分 か。`,
        correctAnswer: ans, unitSuffix: 'm/分', step: Math.max(2, Math.round(ans * 0.05)),
        steps: [
            `Aの速さを a、Bの速さを b（m/分）とする。同じ方向に進んでAがBに追い着くのは、AがBより池 1 周分多く進んだとき　⇒　a － b ＝ ${L} ÷ ${t1} ＝ ${L / t1}`,
            `反対方向に進んで出会うのは、2 人で池 1 周分進んだとき　⇒　a ＋ b ＝ ${L} ÷ ${t2} ＝ ${L / t2}`,
            `2 式を足して 2a ＝ ${L / t1 + L / t2}　⇒　a ＝ ${a}。引いて 2b ＝ ${L / t2 - L / t1}　⇒　b ＝ ${b}`,
            `${ask}の歩く速さは ${ans} m/分`
        ]
    };
}

// ---- Lv.5 周回問題（トラックを逆向きに走る2人がすれ違う回数）----
function travLoopMeetCount() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const L = getRandomChoice([300, 400, 500, 600]), vA = getRandomInt(2, 9), vB = getRandomInt(2, 9), T = getRandomChoice([3, 4, 5, 6, 8, 10]);
        if (vA === vB) continue;
        const dist = (vA + vB) * T * 60;
        if (dist % L === 0) continue;                                      // ちょうど整数周だと境界の扱いが曖昧なので避ける
        const cnt = Math.floor(dist / L);
        if (cnt >= 4 && cnt <= 25) q = { L, vA, vB, T, dist, cnt };
    }
    if (!q) q = { L: 400, vA: 4, vB: 6, T: 5, dist: 3000, cnt: 7 };
    const { L, vA, vB, T, dist, cnt } = q;
    return {
        unit: '⑧ 旅人算', title: '周回問題（すれ違う回数）',
        text: `A、Bの 2 人が、1 周 ${L} m のトラックを同一のスタート地点から互いが逆向きに、同時に走り出した。今、Aの走る速さが毎秒 ${vA} m、Bの走る速さが毎秒 ${vB} m である。`,
        prompt: `このとき、この 2 人が ${T} 分間にすれ違う回数は何回か。`,
        correctAnswer: cnt, unitSuffix: '回', step: 1, consecutive: true,
        steps: [
            `逆向きに走る 2 人は、1 秒間に ${vA} ＋ ${vB} ＝ ${vA + vB} m ずつ近づく`,
            `すれ違うのは、2 人が走った距離の合計が 1 周分（${L} m）、2 周分、… になったとき`,
            `${T} 分 ＝ ${T * 60} 秒間に 2 人が走る距離の合計は ${vA + vB} × ${T * 60} ＝ ${dist} m`,
            `${dist} ÷ ${L} ＝ ${Number((dist / L).toFixed(3))} なので、すれ違う回数は整数部分の ${cnt} 回`
        ]
    };
}

// ---- Lv.6 追いかけ算（忘れ物を取りに戻る）----
function travChaseReturn() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const v1 = getRandomChoice([50, 60, 70, 80]), T0 = getRandomInt(6, 15), vr = getRandomChoice([100, 120, 150, 200]), vb = getRandomChoice([200, 220, 240, 250, 300]);
        if ((v1 * T0) % vr !== 0) continue;
        const back = v1 * T0 / vr, gap = v1 * (T0 + back);
        if (gap % (vb - v1) !== 0) continue;
        const t2 = gap / (vb - v1), d = vb * t2;
        if (t2 >= 2 && d <= 3000) q = { v1, T0, vr, vb, back, gap, t2, d };
    }
    if (!q) q = { v1: 60, T0: 10, vr: 100, vb: 220, back: 6, gap: 960, t2: 6, d: 1320 };
    const { v1, T0, vr, vb, back, gap, t2, d } = q;
    return {
        unit: '⑧ 旅人算', title: '追いかけ算（忘れ物を取りに戻る）',
        text: `兄と妹が同時に家を出発し、分速 ${v1} m の速さで歩いて遊園地に向かった。ところが ${T0} 分後にお弁当を忘れたことに気づいたため、兄だけが分速 ${vr} m で走って家まで取りに戻り、すぐに自転車に乗って分速 ${vb} m で妹を追いかけた。妹は兄と別れた後も分速 ${v1} m のままで歩き続けたとする。ただし、兄が妹に追いつくまでに妹は遊園地に到着していないものとする。`,
        prompt: '兄が妹に追いつくのは家から何 m 離れた場所か。',
        correctAnswer: d, unitSuffix: 'm', step: Math.max(10, Math.round(d * 0.09 / 10) * 10), consecutive: true,
        steps: [
            `気づいた地点は家から ${v1} × ${T0} ＝ ${v1 * T0} m。家まで戻るのに ${v1 * T0} ÷ ${vr} ＝ ${back} 分かかる`,
            `兄が家を自転車で出発するのは、最初の出発から ${T0} ＋ ${back} ＝ ${T0 + back} 分後。このとき妹は家から ${v1} × ${T0 + back} ＝ ${gap} m 先にいる`,
            `兄は 1 分間に ${vb} － ${v1} ＝ ${vb - v1} m ずつ妹に近づくので、追いつくまでの時間は ${gap} ÷ ${vb - v1} ＝ ${t2} 分`,
            `家から追いついた地点までの距離 ＝ ${vb} × ${t2} ＝ ${d} m`
        ]
    };
}

// ---- Lv.7 周回問題（正多角形の辺上を反時計回りに動く2点：QがPに初めて追いつくまでの時間）----
function travPolygon() {
    const shapes = { 3: '正三角形ABC', 4: '正方形ABCD', 5: '正五角形ABCDE', 6: '正六角形ABCDEF' }, names = 'ABCDEF';
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const n = getRandomChoice([3, 4, 5, 5, 5, 6]), s = getRandomChoice([2, 3, 4, 5, 5, 6, 8, 10]), vP = getRandomChoice([1, 1, 2]), vQ = vP + getRandomChoice([1, 2, 2, 3]);
        const p0 = getRandomInt(0, n - 1), q0 = getRandomInt(0, n - 1);
        if (p0 === q0) continue;
        const sides = (p0 - q0 + n) % n, g = sides * s, t2 = 2 * g / (vQ - vP);        // t は 0.5 刻み
        if (!Number.isInteger(t2) || g / (vQ - vP) > 30) continue;
        q = { n, s, vP, vQ, p0, q0, sides, g, t: t2 / 2 };
    }
    if (!q) q = { n: 5, s: 5, vP: 1, vQ: 3, p0: 0, q0: 2, sides: 3, g: 15, t: 7.5 };
    const { n, s, vP, vQ, p0, q0, sides, g, t } = q, route = Array.from({ length: sides + 1 }, (_, k) => names[(q0 + k) % n]).join('→');
    const fmtT = (x) => ({ key: String(x), text: `${Number(x.toFixed(2))} 秒` });
    const wrongs = [t / 3, t * 2 / 3, t * 4 / 3, t * 2, t / 2, t * 3 / 2, t + 2.5, t - 2.5, t * 3, t + 0.5, t - 0.5, t + 1, t - 1, t + 2, t - 2, t + 5].filter(x => x > 0 && Math.abs(x * 2 - Math.round(x * 2)) < 1e-9).map(fmtT);
    const customChoices = travCustomChoices(fmtT(t), wrongs, (a, b) => Number(a.key) - Number(b.key));
    return {
        unit: '⑧ 旅人算', title: '周回問題（多角形の辺上の動点）',
        text: `1 辺の長さが ${s} cm の${shapes[n]}がある（頂点は ${names.slice(0, n).split('').join('、')} の順に反時計回りに並んでいる）。この辺上を反時計回りに移動する 2 つの動点P、Qがある。動点Pは頂点${names[p0]}から毎秒 ${vP} cm の速さで移動し、動点Qは頂点${names[q0]}から毎秒 ${vQ} cm の速さで移動する。`,
        prompt: '2 点P、Qが同時に移動を始めてから動点Qが動点Pに初めて追いつくまでにかかる時間は何秒か。',
        correctAnswer: t, customChoices, allowHalf: true,      // 答えは 0.5 秒刻み
        steps: [
            `反時計回りに進むとき、Qの頂点${names[q0]}からPの頂点${names[p0]}までは ${route}（${sides} 辺分）で ${s} × ${sides} ＝ ${g} cm`,
            `QがPに追いつくには、QがPより ${g} cm 多く進めばよい（周の長さは ${n * s} cm）`,
            `Qは毎秒 ${vQ} － ${vP} ＝ ${vQ - vP} cm ずつPに近づくので、時間は ${g} ÷ ${vQ - vP} ＝ ${t} 秒`
        ]
    };
}
