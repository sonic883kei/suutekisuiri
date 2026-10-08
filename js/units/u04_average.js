/**
 * u04_average.js  —  ④ 平均
 * 4パターン（過去問の型）:
 *   Lv.1 グループ内の平均・B                … 5人の得点（合計・最高と最低の差・3人の平均・倍数関係）→ 正しい記述を選ぶ（2015 国家一般職/税務職員）
 *   Lv.2 複数グループの平均・A（1人を除く）   … 全員の平均と1人を除いた平均から人数を求め、別の量(体重)を求める（2010 海上保安学校など）
 *   Lv.3 複数グループの平均・A（合格者と不合格者）… 合格者の平均が不合格者の k 倍、合格者の割合が p％ → 合格者の平均点（2014 大阪府）
 *   Lv.4 複数グループの平均（人数比）          … 合格率・全体平均・不合格者平均と合格最低点の関係 → 合格者平均と合格最低点の差
 * いずれも「答えが整数(Lv.2は小数1桁)になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜4 ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u4', name: '④ 平均', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        if (lv === 1) return avgWithinGroup();
        if (lv === 2) return avgExcludeOne();
        if (lv === 3) return avgPassFailRatio();
        return avgPassRate();
    }
});

const avgFmt1 = (tenths) => (tenths / 10).toFixed(1);

// ---- Lv.1 グループ内の平均・B（5人の得点。正しい記述を選ぶ）----
function avgWithinGroup() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const D = getRandomInt(30, 50), g = getRandomInt(40, 60), A = D + g;
        if (A > 100) continue;                                    // 得点は100点以下
        const k = getRandomChoice([2, 2, 3]), e = getRandomChoice([3, 4, 5, 6, 8]);
        const B = k * D + e;
        if (B >= A || B <= D) continue;
        const t = getRandomInt(10, 30), C = getRandomInt(D + 10, A - 5), E = C + t - D;   // D＋E ＝ C＋t
        if (E <= D || E >= A || new Set([A, B, C, D, E]).size < 5) continue;
        if ((B + C + E) % 3 !== 0) continue;
        q = { A, B, C, D, E, g, k, e, t, S: A + B + C + D + E, m3: (B + C + E) / 3 };
    }
    if (!q) q = { A: 93, B: 85, C: 71, D: 40, E: 51, g: 53, k: 2, e: 5, t: 20, S: 340, m3: 69 };
    const { A, B, C, D, E, g, k, e, t, S, m3 } = q;
    const val = { A, B, C, D, E }, letters = ['A', 'B', 'C', 'D', 'E'];
    const correctIdx = getRandomInt(0, 4), lab = ['①', '②', '③', '④', '⑤'];
    const choices = letters.map((L, i) => {
        let v = val[L];
        if (i !== correctIdx) { do { v = val[L] + getRandomInt(1, 9) * (getRand() < 0.5 ? 1 : -1); } while (v === val[L] || v <= 0); }
        return { value: i, label: lab[i], htmlText: `${lab[i]} ${L}の得点は ${v} 点である。`, isCorrect: i === correctIdx };
    });
    const X = 3 * m3 - B;                                     // C ＋ E
    return {
        unit: '④ 平均', title: 'グループ内の平均・B',
        text: `試験におけるA〜Eの 5 人の得点の合計は ${S} 点であり、最高点のAと最低点のDとの間には ${g} 点の差があった。また、B、C、Eの 3 人の平均点は ${m3} 点であり、Bの得点はDの得点の ${k} 倍より ${e} 点高く、DとEの得点の合計はCの得点より ${t} 点高かった。`,
        prompt: 'このとき、A〜Eの得点に関する記述として正しいのはどれか。',
        correctAnswer: val[letters[correctIdx]], customChoices: choices,
        steps: [
            `B、C、Eの合計は ${m3} × 3 ＝ ${3 * m3} 点なので、A ＋ D ＝ ${S} － ${3 * m3} ＝ ${S - 3 * m3}`,
            `A － D ＝ ${g} と連立して、A ＝ (${S - 3 * m3} ＋ ${g}) ÷ 2 ＝ ${A} 点、D ＝ (${S - 3 * m3} － ${g}) ÷ 2 ＝ ${D} 点`,
            `B ＝ ${k} × ${D} ＋ ${e} ＝ ${B} 点`,
            `C ＋ E ＝ ${3 * m3} － ${B} ＝ ${X}。また D ＋ E ＝ C ＋ ${t} より E － C ＝ ${t} － ${D} ＝ ${t - D}`,
            t - D >= 0
                ? `C ＝ (${X} － ${t - D}) ÷ 2 ＝ ${C} 点、E ＝ (${X} ＋ ${t - D}) ÷ 2 ＝ ${E} 点（検算: ${A} ＋ ${B} ＋ ${C} ＋ ${D} ＋ ${E} ＝ ${S}）`
                : `C ＝ (${X} ＋ ${D - t}) ÷ 2 ＝ ${C} 点、E ＝ (${X} － ${D - t}) ÷ 2 ＝ ${E} 点（検算: ${A} ＋ ${B} ＋ ${C} ＋ ${D} ＋ ${E} ＝ ${S}）`,
            `したがって正しい記述は「${letters[correctIdx]}の得点は ${val[letters[correctIdx]]} 点である。」`
        ]
    };
}

// ---- Lv.2 複数グループの平均・A（1人を除いた平均から人数を求める）----
function avgExcludeOne() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const n = getRandomInt(5, 12), dm = getRandomChoice([1, 1, 2]);
        const hp = getRandomInt(160, 170), m = hp + dm, hA = hp + n * dm;        // 身長: m×n ＝ hp×(n－1) ＋ hA
        if (hA < 165 || hA > 190) continue;
        const wpT = 5 * getRandomInt(100, 130), wA = getRandomInt(44, 70);       // 体重(0.1kg単位): Aを除く平均 50.0〜65.0kg
        if (10 * wA === wpT) continue;
        const sumT = 10 * wA + wpT * (n - 1);
        if (sumT % n !== 0) continue;
        const wT = sumT / n;
        if (Math.abs(wT - wpT) > 30) continue;
        q = { n, hp, m, hA, wpT, wT, wA };
    }
    if (!q) q = { n: 8, hp: 165, m: 166, hA: 173, wpT: 580, wT: 575, wA: 54 };
    const { n, hp, m, hA, wpT, wT, wA } = q;
    return {
        unit: '④ 平均', title: '複数グループの平均・A（1人を除いた平均）',
        text: `Aの身長は ${hA} cm である。Aが属する班では、メンバー全員の身長の平均は ${m} cm であるが、Aを除いた場合の平均は ${hp} cm である。また、メンバー全員の体重の平均は ${avgFmt1(wT)} kg であるが、Aを除いた場合の平均は ${avgFmt1(wpT)} kg である。`,
        prompt: 'Aの体重は何 kg か。',
        correctAnswer: wA, unitSuffix: 'kg', step: 1, decimals: 1, consecutive: true,
        steps: [
            `班の人数を n 人とすると、身長の合計は 全員で ${m}n、Aを除くと ${hp}(n － 1)。これにAの身長 ${hA} を加えると全員の合計になる`,
            `${m}n ＝ ${hp}(n － 1) ＋ ${hA}　⇒　${m - hp === 1 ? '' : m - hp}n ＝ ${hA - hp}　⇒　n ＝ ${n}（人）`,
            `体重の合計: 全員 ${avgFmt1(wT)} × ${n} ＝ ${Number((wT * n / 10).toFixed(1))} kg、Aを除く ${avgFmt1(wpT)} × ${n - 1} ＝ ${Number((wpT * (n - 1) / 10).toFixed(1))} kg`,
            `Aの体重 ＝ ${Number((wT * n / 10).toFixed(1))} － ${Number((wpT * (n - 1) / 10).toFixed(1))} ＝ ${wA.toFixed(1)} kg`
        ]
    };
}

// ---- Lv.3 複数グループの平均・A（合格者の平均が不合格者の k 倍）----
function avgPassFailRatio() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const k = getRandomChoice([2, 2, 3]), p = 5 * getRandomInt(2, 16), f = getRandomInt(10, 49);              // 合格者の割合 10〜80％
        if ((f * (100 + p * (k - 1))) % 100 !== 0) continue;
        const M = (f * (100 + p * (k - 1))) / 100;
        if (k * f > 100 || M < 30) continue;
        q = { k, p, f, M };
    }
    if (!q) q = { k: 2, p: 25, f: 32, M: 40 };
    const { k, p, f, M } = q;
    return {
        unit: '④ 平均', title: '複数グループの平均・A（合格者と不合格者）',
        text: `ある試験を行ったところ、全受験者の平均点は ${M} 点であり、そのうち合格者の平均点は不合格者の平均点のちょうど ${k} 倍であった。`,
        prompt: `この試験の合格者の全受験者に占める割合が ${p}％ であった場合、合格者の平均点として正しいのはどれか。`,
        correctAnswer: k * f, unitSuffix: '点', step: 4, consecutive: true, maxValue: 100,
        steps: [
            `不合格者の平均点を x 点とすると、合格者の平均点は ${k}x 点`,
            `全受験者を 100 人とすると、合格者 ${p} 人、不合格者 ${100 - p} 人。全員の合計点は ${M} × 100 ＝ ${M * 100} 点`,
            `${k}x × ${p} ＋ x × ${100 - p} ＝ ${M * 100}　⇒　${k * p + 100 - p}x ＝ ${M * 100}　⇒　x ＝ ${f}`,
            `合格者の平均点: ${k} × ${f} ＝ ${k * f} 点`
        ]
    };
}

// ---- Lv.4 複数グループの平均（人数比）----
function avgPassRate() {
    let q = null;
    for (let i = 0; i < 30000 && !q; i++) {
        const p = getRandomChoice([20, 25, 30, 40, 50, 60]), F = getRandomInt(30, 60), d = getRandomInt(5, 15);
        const diff = getRandomInt(5, 14), cut = F + d, P = cut + diff;
        if (P > 100 || (p * P + (100 - p) * F) % 100 !== 0) continue;
        q = { p, F, d, diff, cut, P, M: (p * P + (100 - p) * F) / 100 };
    }
    if (!q) q = { p: 40, F: 41, d: 12, diff: 8, cut: 53, P: 61, M: 49 };
    const { p, F, d, diff, cut, P, M } = q;
    return {
        unit: '④ 平均', title: '複数グループの平均（人数比）',
        text: `ある資格試験において、合格率が ${p}％、受験者全体の平均点が ${M} 点、不合格者の平均点は ${F} 点で、これは合格最低点より ${d} 点低い点数であった。`,
        prompt: 'このとき、合格者の平均点と合格最低点との差の点数として、正しいのはどれか。',
        correctAnswer: diff, unitSuffix: '点', step: 1, consecutive: true,
        steps: [
            `受験者を 100 人とすると、合格者 ${p} 人、不合格者 ${100 - p} 人`,
            `全員の合計点: ${M} × 100 ＝ ${M * 100} 点、不合格者の合計点: ${F} × ${100 - p} ＝ ${F * (100 - p)} 点`,
            `合格者の合計点: ${M * 100} － ${F * (100 - p)} ＝ ${P * p} 点　⇒　合格者の平均点: ${P * p} ÷ ${p} ＝ ${P} 点`,
            `合格最低点は不合格者の平均点 ${F} 点より ${d} 点高いので ${cut} 点`,
            `合格者の平均点と合格最低点との差: ${P} － ${cut} ＝ ${diff} 点`
        ]
    };
}
