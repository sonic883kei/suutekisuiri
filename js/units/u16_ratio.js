/**
 * u16_ratio.js  —  ⑯ 比と割合
 * 5パターン（過去問の型）:
 *   Lv.1 連比                         … AとBの比・BとCの比、Aの金額 → 全体の金額
 *   Lv.2 比と割合で表された情報の整理    … 男女比・職種比・技術職の男女比、総数 → 事務職の女性（男性）の人数（2015 大阪府公立義務教育諸学校事務）
 *   Lv.3 倍数算                       … 2回の調査で比が変わり、人数が増減 → 1回目の人数（2012 東京都Ⅲ類）
 *   Lv.4 項目別整理・B                 … 「旅行」と回答した者・女子の割合（分数）→ 男子の割合（2007 国家Ⅲ種）
 *   Lv.5 比と割合からの推定・B          … 印をつけた魚の再捕獲から全体の数を推定（2011 海上保安学校 特別募集）
 * いずれも「答えが整数（Lv.4 は既約分数、Lv.5 は千の位のおよその数）になる条件」から逆算して数値を抽選する。分数は既約分数（{{分子/分母}} 記法 → 縦書き分数）。
 * generate(level): level が 1〜5 ならそのパターン、それ以外は5パターンからランダム。
 */
UnitRegistry.register({
    id: 'u16', name: '⑯ 比と割合', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4, 5].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 5);
        return [ratioChain, ratioOrganize, ratioMultiple, ratioItems, ratioEstimate][lv - 1]();
    }
});

const ratioLabels = ['①', '②', '③', '④', '⑤'];
const ratioLcm = (a, b) => (a / Fr.gcd(a, b)) * b;
const ratioPair = (maxV) => { for (;;) { const a = getRandomInt(1, maxV), b = getRandomInt(1, maxV); if (a !== b && Fr.gcd(a, b) === 1) return [a, b]; } };   // 互いに素な比

// ---- Lv.1 連比 ----
function ratioChain() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const [p, qq] = ratioPair(9), [r, s] = ratioPair(9);
        if (qq === r) continue;
        const L = ratioLcm(qq, r), A0 = p * L / qq, B0 = L, C0 = s * L / r, g = Fr.gcd(Fr.gcd(A0, B0), C0), A = A0 / g, B = B0 / g, C = C0 / g, T = A + B + C;
        if (T > 40) continue;
        const unit = 20 * getRandomInt(1, 30);
        q = { p, qq, r, s, L, A0, B0, C0, g, A, B, C, T, unit };
    }
    if (!q) q = { p: 3, qq: 2, r: 6, s: 5, L: 6, A0: 9, B0: 6, C0: 5, g: 1, A: 9, B: 6, C: 5, T: 20, unit: 200 };
    const { p, qq, r, s, L, A0, B0, C0, g, A, B, C, T, unit } = q, total = unit * T;
    const ctx = getRandomChoice([['親からもらったお小遣い', '3 人の兄弟A、B、C', 'お小遣い'], ['みんなで稼いだ賞金', '3 人の友人A、B、C', '賞金']]);
    const tps = [];
    for (let d = -8; d <= 8; d++) if (d !== 0 && T + d > 2) tps.push(T + d);
    const wrong = shuffleArray(tps).slice(0, 4).map(v => v * unit), all = [total, ...wrong].sort((x, y) => x - y);
    const customChoices = all.map((v, i) => ({ value: v, label: ratioLabels[i], htmlText: `${ratioLabels[i]} ${v.toLocaleString()} 円`, isCorrect: v === total }));
    return {
        unit: '⑯ 比と割合', title: '連比',
        text: `${ctx[0]}を ${ctx[1]}で分けたところ、AとBの金額の比は ${p}:${qq}、BとCの金額の比は ${r}:${s} となり、Aは ${(unit * A).toLocaleString()} 円受け取った。`,
        prompt: `${ctx[2]}はいくらだったか。`,
        correctAnswer: total, customChoices,
        steps: [
            `Bの金額をそろえる。A : B ＝ ${p} : ${qq}、B : C ＝ ${r} : ${s} の B は ${qq} と ${r} なので、最小公倍数 ${L} にそろえる`,
            `A : B ＝ ${p * L / qq} : ${L}、B : C ＝ ${L} : ${s * L / r}　⇒　A : B : C ＝ ${A0} : ${B0} : ${C0}${g === 1 ? '' : ` ＝ ${A} : ${B} : ${C}（${g} で約分）`}`,
            `比の合計は ${A} ＋ ${B} ＋ ${C} ＝ ${T}。Aの比 ${A} が ${(unit * A).toLocaleString()} 円なので、比の 1 は ${(unit * A).toLocaleString()} ÷ ${A} ＝ ${unit} 円`,
            `全体 ＝ ${unit} × ${T} ＝ ${total.toLocaleString()} 円`
        ]
    };
}

// ---- Lv.2 比と割合で表された情報の整理 ----
function ratioOrganize() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const [m, f] = ratioPair(9), [c, t] = ratioPair(9), [tm, tf] = ratioPair(9), T = 10 * getRandomInt(20, 100);
        if ((T * m) % (m + f) !== 0 || (T * c) % (c + t) !== 0) continue;
        const male = T * m / (m + f), female = T - male, office = T * c / (c + t), tech = T - office;
        if ((tech * tm) % (tm + tf) !== 0) continue;
        const techM = tech * tm / (tm + tf), techF = tech - techM, officeM = male - techM, officeF = female - techF;
        if (officeM <= 0 || officeF <= 0 || officeM + officeF !== office) continue;
        q = { m, f, c, t, tm, tf, T, male, female, office, tech, techM, techF, officeM, officeF };
    }
    if (!q) q = { m: 3, f: 2, c: 3, t: 7, tm: 5, tf: 2, T: 700, male: 420, female: 280, office: 210, tech: 490, techM: 350, techF: 140, officeM: 70, officeF: 140 };
    const { m, f, c, t, tm, tf, T, male, female, office, tech, techM, techF, officeM, officeF } = q, askF = getRand() < 0.7, ans = askF ? officeF : officeM;
    const fr = (a, b) => Fr.str(Fr.make(a, b));
    return {
        unit: '⑯ 比と割合', title: '比と割合で表された情報の整理',
        text: `ある会社の社員の男性と女性の比は、${m}:${f} である。この会社の社員のうち、事務職と技術職の社員の比は、${c}:${t} であり、このうち技術職の社員の男性と女性の比は、${tm}:${tf} である。社員の総数が ${T} 人である。`,
        prompt: `このとき、事務職の${askF ? '女性' : '男性'}の人数として、正しいのはどれか。`,
        correctAnswer: ans, unitSuffix: '人', step: Math.max(10, Math.round(ans * 0.14 / 10) * 10), consecutive: true,
        steps: [
            `社員全体 ${T} 人のうち、男性は ${T} × ${fr(m, m + f)} ＝ ${male} 人、女性は ${T} － ${male} ＝ ${female} 人`,
            `事務職は ${T} × ${fr(c, c + t)} ＝ ${office} 人、技術職は ${T} － ${office} ＝ ${tech} 人`,
            `技術職の男性は ${tech} × ${fr(tm, tm + tf)} ＝ ${techM} 人、技術職の女性は ${tech} － ${techM} ＝ ${techF} 人`,
            askF ? `事務職の女性 ＝ 女性全体 － 技術職の女性 ＝ ${female} － ${techF} ＝ ${officeF} 人` : `事務職の男性 ＝ 男性全体 － 技術職の男性 ＝ ${male} － ${techM} ＝ ${officeM} 人`
        ]
    };
}

// ---- Lv.3 倍数算（比が変わる）----
function ratioMultiple() {
    const places = [['都庁の来庁者数の調査', '第一本庁舎', '第二本庁舎', '来庁者数'], ['2 つの展示会の入場者数の調査', '会場A', '会場B', '入場者数']];
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const [a, b] = ratioPair(12), [c, d] = ratioPair(12), x = 25 * getRandomInt(4, 40), d1 = 50 * getRandomInt(-10, 10), d2 = 50 * getRandomInt(-10, 10);
        if (d1 === 0 || d2 === 0 || a * d === b * c || [a, b, c, d].some(v => v < 2)) continue;
        const A1 = a * x, B1 = b * x, A2 = A1 + d1, B2 = B1 + d2;
        if (A2 <= 0 || B2 <= 0 || A2 * d !== c * B2 || A1 < 1000 || A1 > 9000) continue;      // 2回目の比が c:d
        q = { a, b, c, d, x, d1, d2, A1, B1, A2, B2 };
    }
    if (!q) q = { a: 9, b: 2, c: 11, d: 2, x: 375, d1: 200, d2: -100, A1: 3375, B1: 750, A2: 3575, B2: 650 };
    const { a, b, c, d, x, d1, d2, A1, B1, A2, B2 } = q, [what, n1, n2, noun] = getRandomChoice(places);
    const chg = (v, last) => `${Math.abs(v)} 人${v > 0 ? '増加' : '減少'}${last ? 'した' : 'し'}`;
    return {
        unit: '⑯ 比と割合', title: '倍数算',
        text: `${what}を 2 回実施したところ、${n1}と${n2}の${noun}の比は、1 回目が ${a}:${b} となり、2 回目が ${c}:${d} となった。2 回目の調査では、1 回目と比べて${n1}の${noun}は ${chg(d1, false)}、${n2}の${noun}は ${chg(d2, true)}。`,
        prompt: `このとき、1 回目の調査における${n1}の${noun}として、正しいのはどれか。`,
        correctAnswer: A1, unitSuffix: '人', step: 100, consecutive: true,
        steps: [
            `1 回目の${n1}を ${a}x 人、${n2}を ${b}x 人とする（比が ${a}:${b}）`,
            `2 回目は ${n1}が ${a}x ${d1 > 0 ? '＋' : '－'} ${Math.abs(d1)}、${n2}が ${b}x ${d2 > 0 ? '＋' : '－'} ${Math.abs(d2)} で、比が ${c}:${d}`,
            `${d}(${a}x ${d1 > 0 ? '＋' : '－'} ${Math.abs(d1)}) ＝ ${c}(${b}x ${d2 > 0 ? '＋' : '－'} ${Math.abs(d2)})　⇒　${a * d}x ${d1 > 0 ? '＋' : '－'} ${Math.abs(d * d1)} ＝ ${b * c}x ${d2 > 0 ? '＋' : '－'} ${Math.abs(c * d2)}`,
            `${a * d > b * c ? `${a * d - b * c}x ＝ ${c * d2 - d * d1}` : `${b * c - a * d}x ＝ ${d * d1 - c * d2}`}　⇒　x ＝ ${x}`,
            `1 回目の${n1} ＝ ${a} × ${x} ＝ ${A1.toLocaleString()} 人`
        ]
    };
}

// ---- Lv.4 項目別整理・B（分数で表された割合）----
function ratioItems() {
    const f1s = [[3, 7], [2, 5], [3, 8], [4, 9], [2, 7], [5, 9], [3, 5], [5, 8], [4, 7]], f2s = [[4, 5], [3, 4], [2, 3], [3, 5], [5, 6], [7, 8], [3, 7], [5, 7]];
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const N = getRandomInt(24, 90), G = getRandomInt(6, N - 6), [p1, q1] = getRandomChoice(f1s), [p2, q2] = getRandomChoice(f2s);
        if ((G * p2) % q2 !== 0) continue;
        const tg = G * p2 / q2;
        if ((tg * q1) % p1 !== 0) continue;
        const k = tg * q1 / p1;
        if (k >= N || k <= tg + 1) continue;
        const ans = Fr.make(N - G, N);
        if (ans.d === 1 || ans.n === 0) continue;
        q = { N, G, tg, k, p1, q1, p2, q2, ans };
    }
    if (!q) q = { N: 45, G: 15, tg: 12, k: 28, p1: 3, q1: 7, p2: 4, q2: 5, ans: Fr.make(30, 45) };
    const { N, G, tg, k, p1, q1, p2, q2, ans } = q, key = (x) => `${x.n}/${x.d}`;
    const cand = [Fr.make(G, N), Fr.make(k, N), Fr.make(tg, N), Fr.make(N - k, N), Fr.make(tg, k), Fr.make(G, N - G), Fr.make(N - G, G), Fr.make(1, 3), Fr.make(2, 5), Fr.make(3, 5), Fr.make(2, 3), Fr.make(3, 4), Fr.make(4, 7), Fr.make(4, 5), Fr.make(1, 2)].filter(x => x.d > 1 && x.n < x.d && x.n > 0 && key(x) !== key(ans));
    const seen = new Set([key(ans)]), picks = [];
    for (const x of shuffleArray(cand)) { if (!seen.has(key(x))) { seen.add(key(x)); picks.push(x); } if (picks.length === 4) break; }
    const all = [ans, ...picks].sort((x, y) => x.n * y.d - y.n * x.d);
    const customChoices = all.map((x, i) => ({ value: key(x), label: ratioLabels[i], htmlText: `${ratioLabels[i]} ${Fr.str(x)}`, isCorrect: key(x) === key(ans) }));
    return {
        unit: '⑯ 比と割合', title: '項目別整理・B',
        text: `${N} 名の生徒からなるクラスで、夏休みの過ごし方についてアンケートをとったところ、「旅行」と回答した者は ${k} 名で、そのうちの${Fr.str(Fr.make(p1, q1))}が女子であった。また、女子の中で「旅行」と回答した者は、女子全体の${Fr.str(Fr.make(p2, q2))}を占めていた。`,
        prompt: 'このとき、このクラスに占める男子の割合はいくらか。',
        correctAnswer: ans.n / ans.d, fraction: ans, customChoices,
        steps: [
            `「旅行」と回答した女子は ${k} × ${Fr.str(Fr.make(p1, q1))} ＝ ${tg} 名`,
            `これが女子全体の ${Fr.str(Fr.make(p2, q2))} なので、女子全体は ${tg} ÷ ${Fr.str(Fr.make(p2, q2))} ＝ ${G} 名`,
            `男子は ${N} － ${G} ＝ ${N - G} 名`,
            `男子の割合 ＝ ${N - G} ÷ ${N} ＝ ${Fr.str(ans)}（既約分数）`
        ]
    };
}

// ---- Lv.5 比と割合からの推定・B（印をつけた生物の再捕獲）----
function ratioEstimate() {
    const things = [['魚の養殖池', '池', '魚', '尾'], ['ため池', '池', 'コイ', '匹'], ['湖', '湖', 'ワカサギ', '匹']];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const a = 10 * getRandomInt(20, 80), b = 10 * getRandomInt(20, 80), c = getRandomInt(3, 15), est = a * b / c, ans = Math.round(est / 1000) * 1000;
        if (ans >= 4000 && ans <= 60000 && Math.abs(est - ans) <= 400 && c < b && c < a) q = { a, b, c, est, ans };
    }
    if (!q) q = { a: 350, b: 430, c: 6, est: 25083.3, ans: 25000 };
    const { a, b, c, est, ans } = q, [place, pond, fish, ctr] = getRandomChoice(things);
    return {
        unit: '⑯ 比と割合', title: '比と割合からの推定・B',
        text: `ある${place}で、全体の${fish}の数を推定するために、次の方法をとった。\n　${pond}から${fish} ${a} ${ctr}をすくい上げ、1 ${ctr}ずつ印をつけて${pond}に戻した。翌日、再び${fish} ${b} ${ctr}をすくい上げ、印がついている${fish}の数を数えたところ、${c} ${ctr}に印がついていた。\nただし、この 2 日間に${fish}の増減はなく、また、${fish}につけた印は消えなかったものとする。`,
        prompt: `${fish}の数はおよそ何${ctr}と推定されるか。`,
        correctAnswer: ans, unitSuffix: ctr, step: 3000, consecutive: true,
        steps: [
            `印をつけた ${a} ${ctr}が全体の何割にあたるかは、2 回目にすくい上げた ${b} ${ctr}の中の印の割合 ${c} ÷ ${b} とほぼ等しいと考える`,
            `全体の数を N とすると、${a} ÷ N ＝ ${c} ÷ ${b}`,
            `N ＝ ${a} × ${b} ÷ ${c} ＝ ${(a * b).toLocaleString()} ÷ ${c} ＝ 約 ${Math.round(est).toLocaleString()}`,
            `およそ ${ans.toLocaleString()} ${ctr}と推定される`
        ]
    };
}
