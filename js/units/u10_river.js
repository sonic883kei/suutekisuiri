/**
 * u10_river.js  —  ⑩ 流水算
 * 4パターン（過去問の型）:
 *   Lv.1 流水算の基本            … 静水時の速さ・下りの距離と時間 → 上りで進む距離
 *   Lv.2 往復の時間差            … 行きと戻りの時間と静水時の速さ → 川の流れの速さ（2007 海上保安学校 特別募集）
 *   Lv.3 具体的な値が少ない流水算 … 流れの速さ・上りの時間は下りの k 倍 → 静水上の船の速さ（2005 特別区Ⅲ類）
 *   Lv.4 区間分割（動く歩道）・B   … 動く歩道の上を両端から歩き、始点から q 分の p で出会う → 動く歩道の長さ（2013 海上保安学校 特別募集）
 * いずれも「答えが整数（Lv.2は小数1桁）になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜4 ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u10', name: '⑩ 流水算', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        return [riverBasic, riverRoundTrip, riverRatio, riverWalkway][lv - 1]();
    }
});

const riverN = (v) => String(Number(v.toFixed(4)));
const riverCo = (c) => (c === 1 ? '' : c);                       // 係数1は省略（1v → v）
const riverMin = (m) => (m < 60 ? `${m}分` : (m % 60 === 0 ? `${m / 60}時間` : `${Math.floor(m / 60)}時間${m % 60}分`));

// ---- Lv.1 流水算の基本 ----
function riverBasic() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const v = getRandomInt(8, 30), c = getRandomInt(1, Math.min(8, v - 3)), t1 = getRandomInt(2, 6), t2 = getRandomInt(2, 8);
        if (t1 === t2) continue;
        q = { v, c, t1, t2, D: (v + c) * t1, U: (v - c) * t2 };
    }
    if (!q) q = { v: 16, c: 2, t1: 4, t2: 5, D: 72, U: 70 };
    const { v, c, t1, t2, D, U } = q, boat = getRandomChoice(['舟', 'ボート', '船']);
    return {
        unit: '⑩ 流水算', title: '流水算の基本',
        text: `静水時の速さが時速 ${v} km の${boat}が、川を ${D} km 下るのに ${t1} 時間かかった。`,
        prompt: `この川を ${t2} 時間こいで上ると何 km 進むことができるか。`,
        correctAnswer: U, unitSuffix: 'km', step: 5, consecutive: true,
        steps: [
            `下りの速さ ＝ ${D} ÷ ${t1} ＝ 時速 ${v + c} km`,
            `下りの速さ ＝ 静水時の速さ ＋ 川の流れの速さ なので、川の流れの速さ ＝ ${v + c} － ${v} ＝ 時速 ${c} km`,
            `上りの速さ ＝ 静水時の速さ － 川の流れの速さ ＝ ${v} － ${c} ＝ 時速 ${v - c} km`,
            `${t2} 時間で進む距離 ＝ ${v - c} × ${t2} ＝ ${U} km`
        ]
    };
}

// ---- Lv.2 往復の時間差（川の流れの速さを求める）----
function riverRoundTrip() {
    const tds = [20, 24, 25, 30, 36, 40, 45, 48, 50, 60];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const vT = 5 * getRandomInt(8, 24), td = getRandomChoice(tds), tu = td * getRandomChoice([1.5, 2, 2, 3]);   // vT は 0.1 km/時 単位
        if (!Number.isInteger(tu)) continue;
        const num = vT * (tu - td);
        if (num % (tu + td) !== 0) continue;
        const cT = num / (tu + td);
        if (cT >= 10 && cT <= vT - 10) q = { vT, td, tu, cT };
    }
    if (!q) q = { vT: 60, td: 40, tu: 80, cT: 20 };
    const { vT, td, tu, cT } = q, v = vT / 10, c = cT / 10, g = Fr.gcd(td, tu), a = td / g, b = tu / g, boat = getRandomChoice(['カヌー', 'ボート']);
    return {
        unit: '⑩ 流水算', title: '往復の時間差',
        text: `ある人が、川の下流のP地点まで、${boat}を使って往復したところ、行きに ${riverMin(td)}、戻りに ${riverMin(tu)}かかった。この${boat}が進む速さは、静水では時速 ${v.toFixed(1)} km であるとする。`,
        prompt: `このとき、この川の流れの速さとして最も妥当なのはどれか。ただし、${boat}の進む速さ及び川の流れの速さは一定とする。`,
        correctAnswer: c, unitSuffix: 'km/時', step: 0.2, decimals: 1, consecutive: true,
        steps: [
            `川の流れの速さを c km/時とすると、行き（下り）の速さは ${v.toFixed(1)} ＋ c、戻り（上り）の速さは ${v.toFixed(1)} － c`,
            `往復の距離は同じなので、時間の比 ＝ 速さの逆比。行き : 戻り ＝ ${td} : ${tu} ＝ ${a} : ${b} より、速さの比は (${v.toFixed(1)} ＋ c) : (${v.toFixed(1)} － c) ＝ ${b} : ${a}`,
            `${a}(${v.toFixed(1)} ＋ c) ＝ ${b}(${v.toFixed(1)} － c)　⇒　${riverN(a * v)} ＋ ${a}c ＝ ${riverN(b * v)} － ${b}c　⇒　${a + b}c ＝ ${riverN((b - a) * v)}`,
            `c ＝ ${riverN((b - a) * v)} ÷ ${a + b} ＝ ${c.toFixed(1)}　⇒　川の流れの速さは時速 ${c.toFixed(1)} km`
        ]
    };
}

// ---- Lv.3 具体的な値が少ない流水算（上りの時間は下りの k 倍）----
function riverRatio() {
    const ks = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6];
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const c = 5 * getRandomInt(2, 24), k = getRandomChoice(ks), kk = Fr.make(Math.round(k * 2), 2), v = c * (kk.n + kk.d) / (kk.n - kk.d);
        if (Number.isInteger(v) && v % 5 === 0 && v <= 300 && v > c) q = { c, k, v };
    }
    if (!q) q = { c: 30, k: 2.5, v: 70 };
    const { c, k, v } = q;
    return {
        unit: '⑩ 流水算', title: '具体的な値が少ない流水算',
        text: `流れの速さが毎分 ${c} m の川がある。この川の上流のA地点と下流のB地点との間を船が往復したとき、B地点からA地点まで上るのにかかる時間は、A地点からB地点まで下るのにかかる時間の ${k} 倍であった。`,
        prompt: 'この船の流れのない水面上での速さはどれか。',
        correctAnswer: v, unitSuffix: 'm/分', step: 10, consecutive: true,
        steps: [
            `船の静水上の速さを v m/分とすると、下りの速さは v ＋ ${c}、上りの速さは v － ${c}`,
            `A、B間の距離は同じで、下りの時間を t とすると上りの時間は ${k}t なので、(v ＋ ${c}) × t ＝ (v － ${c}) × ${k}t`,
            `t を消して v ＋ ${c} ＝ ${k}(v － ${c})　⇒　v ＋ ${c} ＝ ${k}v － ${riverN(k * c)}`,
            `${riverCo(Number(riverN(k - 1)))}v ＝ ${riverN(c + k * c)}　⇒　v ＝ ${v}`,
            `船の静水上の速さは毎分 ${v} m`
        ]
    };
}

// ---- Lv.4 区間分割（動く歩道）・B ----
function riverWalkway() {
    const fracs = [[3, 4], [2, 3], [3, 5], [4, 5], [5, 6], [5, 8], [7, 8], [4, 7], [5, 7], [7, 10]];     // 始点からの出会う位置 p/q（既約・1/2 より大きい）
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const [p, qq] = getRandomChoice(fracs), w = getRandomChoice([60, 80, 90, 100, 120, 150, 180]), T0 = getRandomInt(1, 5);
        if ((w * (2 * p - qq)) % qq !== 0) continue;
        const u = w * (2 * p - qq) / qq, L = u * T0;
        if (u > 0 && u < w && L % 10 === 0 && L >= 40 && L <= 400) q = { p, qq, w, T0, u, L };
    }
    if (!q) q = { p: 3, qq: 4, w: 100, T0: 2, u: 50, L: 100 };
    const { p, qq, w, T0, u, L } = q;
    return {
        unit: '⑩ 流水算', title: '区間分割（動く歩道）・B',
        text: `ある空港の「動く歩道」は、乗ったまま静止していると ${T0} 分で始点から終点まで達する。この動く歩道の上を、一方の者は始点から終点に向けて、他方の者は終点から始点に向けて同時に毎分 ${w} m の速さで歩き始めたとすると、2 人は始点からちょうど ${qq} 分の ${p} のところで出会うこととなる。`,
        prompt: 'この動く歩道の長さはいくらか。',
        correctAnswer: L, unitSuffix: 'm', step: Math.max(10, Math.round(L * 0.2 / 10) * 10), consecutive: true,
        steps: [
            `動く歩道の速さを u m/分とすると、長さは ${T0}u m。始点から終点へ歩く人の速さは ${w} ＋ u（歩道と同じ向き）、終点から始点へ歩く人の速さは ${w} － u（歩道と逆向き）`,
            `2 人は同時に出発して出会うので、進んだ距離の比 ＝ 速さの比。出会った地点は始点から ${Fr.str(Fr.make(p, qq))}のところなので、進んだ距離の比は ${Fr.str(Fr.make(p, qq))} : ${Fr.str(Fr.make(qq - p, qq))} ＝ ${p} : ${qq - p}`,
            `(${w} ＋ u) : (${w} － u) ＝ ${p} : ${qq - p}　⇒　${riverCo(qq - p)}(${w} ＋ u) ＝ ${p}(${w} － u)　⇒　${riverCo(qq - p)}u ＋ ${p}u ＝ ${p * w} － ${(qq - p) * w}`,
            `${qq}u ＝ ${p * w - (qq - p) * w}　⇒　u ＝ ${u}（歩道の速さは毎分 ${u} m）`,
            `動く歩道の長さ ＝ ${u} × ${T0} ＝ ${L} m`
        ]
    };
}
