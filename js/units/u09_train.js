/**
 * u09_train.js  —  ⑨ 通過算
 * 3パターン（過去問の型）:
 *   Lv.1 電車同士の通過         … 時速 v1・v2 の列車がすれ違い、先端が出会ってからすれ違い終わるまで t 秒 → 列車の長さ（2011 警視庁警察官Ⅲ類 第3回）
 *   Lv.2 動くもの（電車以外）の通過 … 線路沿いを歩く人が T1 分ごとに追い越され、T2 分ごとに対向電車に出会う → 電車の速さ（2005 東京消防庁Ⅲ類）
 *   Lv.3 複合問題・B            … 2つの列車がトンネルの両側から入り、すれ違いと出口到達までの時間から → トンネルの長さ（2014 国家一般職/税務職員）
 * いずれも「答えが整数になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜3 ならそのパターン、それ以外は3パターンからランダム。
 */
UnitRegistry.register({
    id: 'u9', name: '⑨ 通過算', chap: 1,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        if (lv === 1) return trainPass();
        if (lv === 2) return trainWalker();
        return trainTunnel();
    }
});

const trainMps = (kmh) => Number((kmh / 3.6).toFixed(2));      // 時速 → 秒速

// ---- Lv.1 電車同士の通過（すれ違い）----
function trainPass() {
    const pairs = [['貨物列車', '旅客列車'], ['急行列車', '普通列車'], ['特急列車', '貨物列車'], ['上り列車', '下り列車']];
    const speeds = [18, 27, 36, 45, 54, 63, 72, 81, 90, 108];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const v1 = getRandomChoice(speeds), v2 = getRandomChoice(speeds), L2 = 10 * getRandomInt(6, 25), t = getRandomInt(8, 40);
        const total = (v1 + v2) * 5 * t / 18;                       // 時速→秒速: ×1000÷3600 ＝ ×5÷18
        if (!Number.isInteger(total) || total % 10 !== 0) continue;
        const L1 = total - L2;
        if (L1 >= 60 && L1 <= 700 && L1 !== L2) q = { v1, v2, L1, L2, t, total };
    }
    if (!q) q = { v1: 54, v2: 36, L1: 480, L2: 120, t: 24, total: 600 };
    const { v1, v2, L1, L2, t, total } = q, [n1, n2] = getRandomChoice(pairs);
    return {
        unit: '⑨ 通過算', title: '電車同士の通過',
        text: `時速 ${v1} km で走る${n1}が、時速 ${v2} km で走る長さ ${L2} m の${n2}とすれ違う。その先端に出会ってからすれ違い終わるまでに ${t} 秒かかった。`,
        prompt: `この${n1}の長さとして、正しいものはどれか。`,
        correctAnswer: L1, unitSuffix: 'm', step: Math.max(10, Math.round(L1 * 0.1 / 10) * 10),
        steps: [
            `時速を秒速になおす（÷ 3.6）: ${v1} km/時 ＝ 秒速 ${trainMps(v1)} m、${v2} km/時 ＝ 秒速 ${trainMps(v2)} m`,
            `すれ違うとき、2 つの列車は向かい合って進むので、1 秒間に ${trainMps(v1)} ＋ ${trainMps(v2)} ＝ ${Number((total / t).toFixed(2))} m ずつ近づく`,
            `${t} 秒間に近づく距離 ＝ ${Number((total / t).toFixed(2))} × ${t} ＝ ${total} m。これは 2 つの列車の長さの和にあたる`,
            `${n1}の長さ ＝ ${total} － ${L2} ＝ ${L1} m`
        ]
    };
}

// ---- Lv.2 動くもの（電車以外）の通過（線路沿いを歩く人と電車）----
function trainWalker() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const w = getRandomChoice([40, 50, 60, 70, 80, 90, 100, 120]), T1 = getRandomInt(6, 30), T2 = getRandomInt(3, T1 - 1);
        if ((w * (T1 + T2)) % (T1 - T2) !== 0) continue;
        const v = w * (T1 + T2) / (T1 - T2);
        if (T1 - T2 >= 2 && v % 10 === 0 && v >= 200 && v <= 1000 && (v - w) * T1 <= 12000) q = { w, T1, T2, v };   // 間隔 D は 12km 以内
    }
    if (!q) q = { w: 60, T1: 12, T2: 10, v: 660 };
    const { w, T1, T2, v } = q, D = (v - w) * T1;
    return {
        unit: '⑨ 通過算', title: '動くもの（電車以外）の通過',
        text: `電車の線路沿いを毎分 ${w} m の速さで歩いている人が、${T1} 分ごとに電車に追い越され、${T2} 分ごとに前方から来る電車に出会った。電車の速さは一定で、等しい間隔で運転されているものとする。`,
        prompt: 'このとき、電車の速さはいくつか。',
        correctAnswer: v, unitSuffix: 'm/分', step: Math.max(5, Math.round(v * 0.015 / 5) * 5),
        steps: [
            `電車の速さを v m/分、電車どうしの間隔を D m とする`,
            `追い越されるとき: 前の電車が人に追いつくのに ${T1} 分かかるので、D ＝ (v － ${w}) × ${T1}`,
            `前方から来る電車に出会うとき: 向かい合って近づくので、D ＝ (v ＋ ${w}) × ${T2}`,
            `等しいので ${T1}v － ${T1 * w} ＝ ${T2}v ＋ ${T2 * w}　⇒　${T1 - T2 === 1 ? '' : T1 - T2}v ＝ ${(T1 + T2) * w}　⇒　v ＝ ${v}（間隔 D ＝ ${D} m）`,
            `電車の速さは ${v} m/分`
        ]
    };
}

// ---- Lv.3 複合問題・B（トンネルの両側から入った2つの列車）----
function trainTunnel() {
    let q = null;
    for (let i = 0; i < 200000 && !q; i++) {
        const vA = getRandomInt(10, 30), vB = getRandomInt(8, 30), tp = getRandomInt(5, 12), tA = getRandomInt(5, 15), a = getRandomInt(5, 40);
        if (vA === vB) continue;
        const S = vA + vB, lenA = vA * tA, lenB = S * tp - lenA;
        if (lenA % 10 !== 0 || lenB % 10 !== 0 || lenA < 60 || lenA > 400 || lenB < 60 || lenB > 300) continue;
        const Tn = vA * (tp + a) * S;                                    // T × vB ＝ vA(tp＋a) × S
        if (Tn % vB !== 0) continue;
        const T = Tn / vB;
        if (T % 10 !== 0 || T < 400 || T > 3000) continue;
        const bn = T * S - vB * (T + S * tp);                            // b ＝ T/vB － T/S － tp
        if (bn <= 0 || bn % (vB * S) !== 0) continue;
        const b = bn / (vB * S);
        if (b > 120) continue;
        if (vA * (T + S * tp) < lenA * S || vB * (T + S * tp) < lenB * S) continue;   // すれ違い終わりもトンネル内（両列車の最後部が入っている）
        q = { vA, vB, S, tp, tA, a, b, lenA, lenB, T };
    }
    if (!q) q = { vA: 24, vB: 16, S: 40, tp: 9, tA: 10, a: 15, b: 45, lenA: 240, lenB: 120, T: 1440 };
    const { vA, vB, S, tp, tA, a, b, lenA, lenB, T } = q, ratio = Fr.make(vB, S), t0 = T / S;
    return {
        unit: '⑨ 通過算', title: '複合問題・B',
        text: `長さ ${lenA} m の列車Aと長さ ${lenB} m の列車Bがトンネルの両側から同時に入った。列車Aの最前部がトンネルに入ってから最後部がトンネルに入るまでに ${tA} 秒かかった。両列車がトンネル内ですれ違い始めてからすれ違い終わるまでに ${tp} 秒かかり、その後、列車Aは ${a} 秒後に、列車Bは ${b} 秒後に、それぞれ最前部がトンネルの出口に到達した。ただし、両列車の速さはそれぞれ一定であるものとする。`,
        prompt: 'このとき、トンネルの長さは何 m か。',
        correctAnswer: T, unitSuffix: 'm', step: Math.max(10, Math.round(T * 0.055 / 10) * 10), consecutive: true,
        steps: [
            `列車Aの最前部が入ってから最後部が入るまでに、列車Aは自分の長さ ${lenA} m だけ進むので、Aの速さ ＝ ${lenA} ÷ ${tA} ＝ 秒速 ${vA} m`,
            `すれ違い始めからすれ違い終わるまでに、2 つの列車は合わせて ${lenA} ＋ ${lenB} ＝ ${lenA + lenB} m 進むので、速さの和 ＝ ${lenA + lenB} ÷ ${tp} ＝ 秒速 ${S} m　⇒　Bの速さ ＝ ${S} － ${vA} ＝ 秒速 ${vB} m`,
            `トンネルの長さを T m とすると、2 つの列車の最前部が出会う（すれ違い始める）のは、入ってから T ÷ ${S} 秒後`,
            `Aの最前部は、入ってから「T ÷ ${S} ＋ ${tp} ＋ ${a}」秒後に出口に着くので、T ＝ ${vA} × (T ÷ ${S} ＋ ${tp + a})。これを整理すると T × ${Fr.str(ratio)} ＝ ${vA} × ${tp + a} ＝ ${vA * (tp + a)}`,
            `T ＝ ${vA * (tp + a)} ÷ ${Fr.str(ratio)} ＝ ${T} m（検算: Bの最前部は ${t0} ＋ ${tp} ＋ ${b} ＝ ${t0 + tp + b} 秒で ${vB} × ${t0 + tp + b} ＝ ${vB * (t0 + tp + b)} m 進み、トンネルの長さに等しい）`
        ]
    };
}
