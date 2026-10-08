/**
 * u06_simultaneous.js  —  ⑥ 連立方程式
 * 6パターン（過去問の型）:
 *   Lv.1 比例配分                 … 出資額が「AはBの k1 倍、BはCの k2 倍」→ 利益 P のうちAの受取額（2009 刑務官）
 *   Lv.2 計算の工夫               … 「2種類の合計」が3組 → 1種類の個数（2014 警視庁警察官Ⅲ類 第3回）
 *   Lv.3 変動前と変動後           … 女子が a％減り男子が b％増え全体で c％増加 → 今年度の女子の人数（2014 警視庁警察官Ⅲ類 第2回）
 *   Lv.4 変動前と変動後（同数増加）… 3区が r1・r2・r3％増加し増加人数が同じ → 現在の人口（2013 特別区Ⅲ類）
 *   Lv.5 3つの文字・B            … 的の点数（3点・5点・10点）と矢の本数、2つのエリアの比 → 2エリアの矢の合計（2014 海上保安学校など）
 *   Lv.6 過不足算・B             … 3つの配り方の過不足から2グループの人数の合計（2012 海上保安学校）
 * いずれも「答えが整数になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜6 ならそのパターン、それ以外は6パターンからランダム。
 */
UnitRegistry.register({
    id: 'u6', name: '⑥ 連立方程式', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4, 5, 6].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 6);
        if (lv === 1) return simProportion();
        if (lv === 2) return simPairSums();
        if (lv === 3) return simBeforeAfter();
        if (lv === 4) return simEqualIncrease();
        if (lv === 5) return simArrows();
        return simDistribute();
    }
});

const simNum = (v) => String(Number(v.toFixed(4)));
const simLabels = ['①', '②', '③', '④', '⑤'];
const simCo = (c) => (c === 1 ? '' : c);   // 係数1は省略（1x → x）
// 「ca ＋ db ＝ r」の形に整える（係数が負のときは － で表す。係数1は省略）
const simLin = (ca, cb, r) => {
    if ((ca < 0 || (ca === 0 && cb < 0)) && typeof r === 'number') { ca = -ca; cb = -cb; r = -r; }   // 先頭の係数が負なら全体の符号を反転
    const t = (c, v) => (Math.abs(c) === 1 ? v : `${Math.abs(c)}${v}`);
    let s = ca === 0 ? '' : (ca < 0 ? '－ ' : '') + t(ca, 'a');
    if (cb !== 0) s += (s === '' ? (cb < 0 ? '－ ' : '') : (cb < 0 ? ' － ' : ' ＋ ')) + t(cb, 'b');
    return `${s} ＝ ${typeof r === 'number' && r < 0 ? '－' + Math.abs(r) : r}`;
};

// ---- Lv.1 比例配分 ----
function simProportion() {
    const Ks = [4, 5, 6, 8, 12, 14, 15, 16, 18, 20, 25, 30];          // 倍率 0.4〜3.0（0.1単位）
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const K1 = getRandomChoice(Ks), K2 = getRandomChoice(Ks);
        const a0 = K1 * K2, b0 = 10 * K2, c0 = 100;                    // C＝100 とおくと B＝100×K2/10、A＝B×K1/10
        const g = Fr.gcd(Fr.gcd(a0, b0), c0), a = a0 / g, b = b0 / g, c = c0 / g, T = a + b + c;
        if (T > 60) continue;
        const cands = [];
        for (let P = 1200; P <= 6000; P += 100) if (P % T === 0) cands.push(P);
        if (cands.length === 0) continue;
        q = { K1, K2, a0, b0, c0, g, a, b, c, T, P: getRandomChoice(cands) };
    }
    if (!q) q = { K1: 15, K2: 8, a0: 120, b0: 80, c0: 100, g: 20, a: 6, b: 4, c: 5, T: 15, P: 2400 };
    const { K1, K2, a0, b0, g, a, b, c, T, P } = q, ans = P * a / T;
    return {
        unit: '⑥ 連立方程式', title: '比例配分',
        text: `A、B、Cの 3 人は共同で事業を行い ${P.toLocaleString()} 万円の利益を得たので、これを出資額に応じて比例配分することにした。各人の出資額は、AがBの ${simNum(K1 / 10)} 倍、BがCの ${simNum(K2 / 10)} 倍であった。`,
        prompt: 'このとき、Aが受け取る金額はいくらか。',
        correctAnswer: ans, unitSuffix: '万円', step: Math.max(10, Math.round(ans * 0.08 / 10) * 10),
        steps: [
            `Cの出資額を 100 とすると、B ＝ 100 × ${simNum(K2 / 10)} ＝ ${b0}、A ＝ ${b0} × ${simNum(K1 / 10)} ＝ ${a0}`,
            `A : B : C ＝ ${a0} : ${b0} : 100 ＝ ${a} : ${b} : ${c}${g === 1 ? '' : `（${g} で約分）`}`,
            `比の合計は ${a} ＋ ${b} ＋ ${c} ＝ ${T}`,
            `Aの受取額 ＝ ${P.toLocaleString()} × ${Fr.str(Fr.make(a, T))} ＝ ${ans.toLocaleString()} 万円`
        ]
    };
}

// ---- Lv.2 計算の工夫（2種類ずつの合計から1種類の個数を求める）----
function simPairSums() {
    const sets = [['ナス', 'ピーマン', 'トマト'], ['りんご', 'みかん', 'もも'], ['たまねぎ', 'じゃがいも', 'にんじん'], ['キャベツ', 'きゅうり', 'レタス'], ['なし', 'かき', 'くり']];
    let v = null;
    for (let i = 0; i < 1000 && !v; i++) {
        const x = getRandomInt(2, 15), y = getRandomInt(2, 15), z = getRandomInt(2, 15);
        if (new Set([x, y, z]).size === 3) v = [x, y, z];
    }
    const names = shuffleArray(getRandomChoice(sets)), [x, y, z] = v;
    const s1 = x + y, s2 = y + z, s3 = z + x, total = x + y + z, ti = getRandomInt(0, 2);
    const others = [s2, s3, s1][ti];                                   // 対象以外の2種類の合計
    return {
        unit: '⑥ 連立方程式', title: '計算の工夫',
        text: `${names[0]}と${names[1]}が合わせて ${s1} 個、${names[1]}と${names[2]}が合わせて ${s2} 個、${names[2]}と${names[0]}が合わせて ${s3} 個ある。`,
        prompt: `このとき、${names[ti]}の個数として、正しいのはどれか。`,
        correctAnswer: v[ti], unitSuffix: '個', step: 1, consecutive: true,
        steps: [
            `3 つの式を全部足すと、(${names[0]} ＋ ${names[1]} ＋ ${names[2]}) × 2 ＝ ${s1} ＋ ${s2} ＋ ${s3} ＝ ${s1 + s2 + s3}`,
            `3 種類の合計は ${s1 + s2 + s3} ÷ 2 ＝ ${total} 個`,
            `${names[ti]} ＝ 合計 － (他の 2 種類の合計) ＝ ${total} － ${others} ＝ ${v[ti]} 個`
        ]
    };
}

// ---- Lv.3 変動前と変動後（女子が a％減り、男子が b％増え、全体で c％増加）----
function simBeforeAfter() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const T = getRandomChoice([100, 200, 300, 400, 500]), f = 10 * getRandomInt(2, T / 10 - 2);
        const a = getRandomChoice([2, 4, 5, 8, 10, 12, 15, 20]), b = getRandomChoice([5, 8, 10, 12, 15, 20, 25]);
        const m = T - f;
        if ((f * (100 - a)) % 100 !== 0 || (m * (100 + b)) % 100 !== 0) continue;
        const fNew = f * (100 - a) / 100, mNew = m * (100 + b) / 100;
        if (((fNew + mNew - T) * 100) % T !== 0) continue;
        const c = (fNew + mNew - T) * 100 / T;
        if (c < 1 || c > 15) continue;
        q = { T, f, m, a, b, c, fNew, mNew };
    }
    if (!q) q = { T: 200, f: 40, m: 160, a: 5, b: 10, c: 7, fNew: 38, mNew: 176 };
    const { T, f, m, a, b, c, fNew, mNew } = q, now = T * (100 + c) / 100;
    return {
        unit: '⑥ 連立方程式', title: '変動前と変動後',
        text: `ある専門学校の入学者は、昨年度と比べて、女子が ${a}％減り男子が ${b}％増えた結果、全体として ${c}％の増加となった。昨年度の入学者が男女合わせて ${T} 人だとする。`,
        prompt: '今年度の女子の入学者数として、最も妥当なのはどれか。',
        correctAnswer: fNew, unitSuffix: '人', step: Math.max(2, Math.round(fNew * 0.08)),
        steps: [
            `昨年度の女子を x 人とすると、男子は (${T} － x) 人`,
            `今年度は 女子 ${simNum((100 - a) / 100)}x 人、男子 ${simNum((100 + b) / 100)}(${T} － x) 人、全体 ${T} × ${simNum((100 + c) / 100)} ＝ ${now} 人`,
            `${simNum((100 - a) / 100)}x ＋ ${simNum((100 + b) / 100)}(${T} － x) ＝ ${now}　⇒　${simNum(T * (100 + b) / 100)} － ${simNum((a + b) / 100)}x ＝ ${now}`,
            `${simNum((a + b) / 100)}x ＝ ${simNum(T * (100 + b) / 100 - now)}　⇒　x ＝ ${f}（昨年度の女子 ${f} 人、男子 ${m} 人）`,
            `今年度の女子: ${f} × ${simNum((100 - a) / 100)} ＝ ${fNew} 人`
        ]
    };
}

// ---- Lv.4 変動前と変動後（同数増加）----
function simEqualIncrease() {
    const rates = [4, 5, 8, 10, 12, 16, 20, 24, 25, 32, 40, 50];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const rs = shuffleArray(rates).slice(0, 3), d = 1000 * getRandomInt(4, 200);
        if (rs.some(r => (100 * d) % r !== 0)) continue;
        const before = rs.map(r => 100 * d / r), total = before.reduce((x, y) => x + y, 0);
        if (total < 300000 || total > 3000000) continue;
        q = { rs, d, before, total };
    }
    if (!q) q = { rs: [20, 8, 32], d: 64000, before: [320000, 800000, 200000], total: 1320000 };
    const { rs, d, before, total } = q, L = ['A', 'B', 'C'], ti = getRandomInt(0, 2), yrs = getRandomChoice([10, 15, 20, 25]);
    const now = before.map(x => x + d), ans = now[ti];
    const coef = rs.map(r => 100 / r), coefSum = coef.reduce((x, y) => x + y, 0);
    // 選択肢: 正解と、典型的な誤答（増加前の値・他の区の値）
    const pool = [before[ti], ...before.filter((_, i) => i !== ti), ...now.filter((_, i) => i !== ti), d * 3].filter(v => v !== ans);
    const wrong = shuffleArray([...new Set(pool)]).slice(0, 4).sort((x, y) => x - y);
    const all = [...wrong, ans].sort((x, y) => x - y);
    const customChoices = all.map((v, i) => ({ value: v, label: simLabels[i], htmlText: `${simLabels[i]} ${v.toLocaleString()} 人`, isCorrect: v === ans }));
    return {
        unit: '⑥ 連立方程式', title: '変動前と変動後（同数増加）',
        text: `A区、B区及びC区の 3 つの区がある。この 3 つの区の人口の合計は、${yrs} 年前には ${total.toLocaleString()} 人であった。この ${yrs} 年間に、人口は、A区が ${rs[0]}％、B区が ${rs[1]}％、C区が ${rs[2]}％それぞれ増加し、増加した人数は各区とも同じであった。`,
        prompt: `このとき、現在の${L[ti]}区の人口はどれか。`,
        correctAnswer: ans, customChoices,
        steps: [
            `増加した人数を d 人とすると、${rs.map((r, i) => `${L[i]}区の ${yrs} 年前の人口は d ÷ ${simNum(r / 100)} ＝ ${simNum(coef[i])}d`).join('、')}`,
            `合計: (${coef.map(simNum).join(' ＋ ')})d ＝ ${simNum(coefSum)}d ＝ ${total.toLocaleString()}　⇒　d ＝ ${d.toLocaleString()}`,
            `${L[ti]}区の ${yrs} 年前の人口: ${simNum(coef[ti])} × ${d.toLocaleString()} ＝ ${before[ti].toLocaleString()} 人`,
            `現在の${L[ti]}区の人口: ${before[ti].toLocaleString()} ＋ ${d.toLocaleString()} ＝ ${ans.toLocaleString()} 人`
        ]
    };
}

// ---- Lv.5 3つの文字・B（的当て：点数と本数）----
function simArrows() {
    const sets = [[3, 5, 10], [2, 5, 10], [3, 6, 10], [2, 4, 8], [4, 6, 10], [3, 7, 10], [1, 3, 5]];
    const ratios = [[2, 3], [1, 2], [3, 4], [1, 3], [2, 5], [3, 5], [1, 4]];      // 既約分数（3点エリアに対する10点エリアの割合）
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const [p1, p2, p3] = getRandomChoice(sets), [u, v] = getRandomChoice(ratios), n = getRandomInt(20, 40), t = getRandomInt(2, 8);
        const x = v * t, z = u * t, y = n - (u + v) * t;
        if (y < 2 || p1 * v + p3 * u - p2 * (u + v) === 0) continue;
        q = { p1, p2, p3, u, v, n, x, y, z, S: p1 * x + p2 * y + p3 * z, t };
    }
    if (!q) q = { p1: 3, p2: 5, p3: 10, u: 2, v: 3, n: 30, x: 12, y: 10, z: 8, S: 166, t: 4 };
    const { p1, p2, p3, u, v, n, x, y, z, S, t } = q, pts = [p1, p2, p3], cnt = [x, y, z];
    const pairs = [[0, 1], [0, 2], [1, 2]], [i, j] = getRandomChoice(pairs), ans = cnt[i] + cnt[j];
    const k = p1 * v + p3 * u - p2 * (u + v);
    return {
        unit: '⑥ 連立方程式', title: '3つの文字・B',
        text: `${p1} 点、${p2} 点、${p3} 点のエリアが同心円状に設定された的に向けて矢を射、矢が命中したエリアに設定された点数を獲得するゲームを行った。矢を ${n} 本射たところ、全ての矢が ${p1} 点、${p2} 点、${p3} 点のいずれかのエリアに命中し、獲得した点数の合計は ${S} 点であった。また、${p3} 点のエリアに命中した矢の数は、${p1} 点のエリアに命中した矢の数の${Fr.str(Fr.make(u, v))}であった。`,
        prompt: `このとき、${pts[i]} 点のエリアに命中した矢の数と ${pts[j]} 点のエリアに命中した矢の数の合計はいくらか。`,
        correctAnswer: ans, unitSuffix: '本', step: 2,
        steps: [
            `${p1} 点、${p2} 点、${p3} 点のエリアの矢の数を x、y、z 本とすると、x ＋ y ＋ z ＝ ${n} …①、${simCo(p1)}x ＋ ${simCo(p2)}y ＋ ${simCo(p3)}z ＝ ${S} …②、z ＝ ${Fr.str(Fr.make(u, v))}x …③`,
            `③より x ＝ ${simCo(v)}t、z ＝ ${simCo(u)}t（t は整数）とおくと、①より y ＝ ${n} － ${simCo(u + v)}t`,
            `②に代入: ${p1} × ${simCo(v)}t ＋ ${p2}(${n} － ${simCo(u + v)}t) ＋ ${p3} × ${simCo(u)}t ＝ ${S}　⇒　${k < 0 ? '－ ' : ''}${simCo(Math.abs(k))}t ＋ ${p2 * n} ＝ ${S}　⇒　t ＝ ${t}`,
            `x ＝ ${x}、y ＝ ${y}、z ＝ ${z}（本）　⇒　${pts[i]} 点と ${pts[j]} 点のエリアの合計 ＝ ${cnt[i]} ＋ ${cnt[j]} ＝ ${ans} 本`
        ]
    };
}

// ---- Lv.6 過不足算・B（3つの配り方から2グループの人数の合計）----
function simDistribute() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const a = getRandomInt(4, 20), b = getRandomInt(4, 20);
        const pr = [0, 1, 2].map(() => [getRandomInt(1, 4), getRandomInt(1, 4)]);
        const keys = new Set(pr.map(p => p.join(',')));
        if (keys.size < 3) continue;
        const det = pr[0][0] * (pr[2][1] - pr[1][1]) - pr[0][1] * (pr[2][0] - pr[1][0]) - (pr[1][0] * pr[2][1] - pr[1][1] * pr[2][0]);
        if (det === 0) continue;
        const tot = pr.map(([p, qq]) => p * a + qq * b), N = getRandomInt(Math.min(...tot), Math.max(...tot));
        const s = tot.map(x => N - x);                                  // 正: 余る本数 / 負: 足りない本数
        if (s.some(x => x === 0 || Math.abs(x) > 15) || s.every(x => x > 0) || s.every(x => x < 0)) continue;
        q = { a, b, N, pr, s };
    }
    if (!q) q = { a: 6, b: 11, N: 33, pr: [[2, 3], [3, 1], [1, 2]], s: [-12, 4, 5] };
    const { a, b, N, pr, s } = q;
    const sentence = (p, qq, sv) => `○ Aグループのメンバーに ${p} 本ずつ、Bグループのメンバーに ${qq} 本ずつ配ると、${Math.abs(sv)} 本${sv < 0 ? '足りなくなる' : '余る'}。`;
    const eq = (p, qq, sv) => `${simLin(p, qq, '').replace(' ＝ ', '')} ＝ N ${sv < 0 ? '＋' : '－'} ${Math.abs(sv)}`;
    const d13 = [pr[0][0] - pr[2][0], pr[0][1] - pr[2][1], s[2] - s[0]], d23 = [pr[1][0] - pr[2][0], pr[1][1] - pr[2][1], s[2] - s[1]];
    return {
        unit: '⑥ 連立方程式', title: '過不足算・B',
        text: `野菜の苗木をAグループとBグループのメンバーに配ることになった。次のことが分かっている。\n${pr.map((p, k) => sentence(p[0], p[1], s[k])).join('\n')}`,
        prompt: 'このとき、A、B両グループのメンバーは合わせて何人か。',
        correctAnswer: a + b, unitSuffix: '人', step: 2, consecutive: true,
        steps: [
            `Aグループの人数を a 人、Bグループの人数を b 人、苗木を N 本とすると、${pr.map((p, k) => `${simLabels[k]} ${eq(p[0], p[1], s[k])}`).join('、')}`,
            `Nを消去するため、① － ③ と ② － ③ をつくる: ${simLin(d13[0], d13[1], d13[2])}、${simLin(d23[0], d23[1], d23[2])}`,
            `この連立方程式を解くと、a ＝ ${a}、b ＝ ${b}`,
            `A、B両グループのメンバーの合計: ${a} ＋ ${b} ＝ ${a + b} 人（苗木は N ＝ ${N} 本。検算: ① ${pr[0][0]} × ${a} ＋ ${pr[0][1]} × ${b} ＝ ${pr[0][0] * a + pr[0][1] * b}、N ${s[0] < 0 ? '＋' : '－'} ${Math.abs(s[0])} ＝ ${N - s[0]}）`
        ]
    };
}
