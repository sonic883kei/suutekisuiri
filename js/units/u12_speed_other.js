/**
 * u12_speed_other.js  —  ⑫ その他の速さ
 * 3パターン（過去問の型）:
 *   Lv.1 区間別に異なる速さ   … 往路と復路で時速が違い、往復の時間が T 分 → 片道の距離
 *   Lv.2 忘れ物による往復     … 途中で忘れ物に気づき自宅へ戻って再出発し、予定より Δ 分遅れた → 自宅と目的地の距離（2016 大阪府行政・警察行政）
 *   Lv.3 速さ問題の過不足算   … 時速 vf だと出発の e1 分前に着き、時速 vs だと e2 分遅れる → 時速 vf で行くときの所要時間（2015 特別区Ⅲ類）
 * いずれも「答えが整数（Lv.2 は 0.1km 単位）になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜3 ならそのパターン、それ以外は3パターンからランダム。
 */
UnitRegistry.register({
    id: 'u12', name: '⑫ その他の速さ', chap: 1,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        if (lv === 1) return speedRoundTrip();
        if (lv === 2) return speedForgot();
        return speedLateEarly();
    }
});

const speedLcm = (a, b) => (a / Fr.gcd(a, b)) * b;
const speedHM = (m) => (m < 60 ? `${m}分` : (m % 60 === 0 ? `${m / 60}時間` : `${Math.floor(m / 60)}時間${m % 60}分`));
const speedKmh = (mpm) => (mpm * 0.06).toFixed(1);               // 分速(m) → 時速(km): ×60÷1000
const speedLabels = ['①', '②', '③', '④', '⑤'];

// ---- Lv.1 区間別に異なる速さ（往路と復路で時速が違う）----
function speedRoundTrip() {
    const places = [
        ['ある観光地の駐車場', '展望台', '駐車場', '展望台'],
        ['ある町の自宅', '公園', '自宅', '公園'],
        ['ある町の駅', '美術館', '駅', '美術館']
    ];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const s1 = 5 * getRandomInt(8, 24), s2 = 5 * getRandomInt(8, 24), T = getRandomInt(30, 120);     // 分速 40〜120 m
        if (s1 === s2) continue;
        const num = T * s1 * s2;
        if (num % (s1 + s2) !== 0) continue;
        const d = num / (s1 + s2);
        if (d % 10 === 0 && d >= 500 && d <= 8000) q = { s1, s2, T, d };
    }
    if (!q) q = { s1: 65, s2: 80, T: 58, d: 2080 };
    const { s1, s2, T, d } = q, [full, to, from] = getRandomChoice(places), L = speedLcm(s1, s2), a = L / s1, b = L / s2;
    return {
        unit: '⑫ その他の速さ', title: '区間別に異なる速さ',
        text: `${full}から${to}までを往復するのに、${to}までの往路は時速 ${speedKmh(s1)} km で歩き、${to}から${from}までの復路は時速 ${speedKmh(s2)} km で歩いたところ、往復で ${T} 分の時間を要した。`,
        prompt: `${from}から${to}までの距離として正しいのはどれか。`,
        correctAnswer: d, unitSuffix: 'm', step: Math.max(10, Math.round(d * 0.077 / 10) * 10), consecutive: true,
        steps: [
            `時速を分速（m/分）になおす: 時速 ${speedKmh(s1)} km ＝ ${Math.round(Number(speedKmh(s1)) * 1000)} m ÷ 60 ＝ 分速 ${s1} m、時速 ${speedKmh(s2)} km ＝ 分速 ${s2} m`,
            `片道の距離を d m とすると、往路は d ÷ ${s1} 分、復路は d ÷ ${s2} 分かかるので、d ÷ ${s1} ＋ d ÷ ${s2} ＝ ${T}`,
            `両辺に ${s1} と ${s2} の最小公倍数 ${L} をかけて、${a}d ＋ ${b}d ＝ ${T} × ${L}　⇒　${a + b}d ＝ ${T * L}`,
            `d ＝ ${T * L} ÷ ${a + b} ＝ ${d} m`
        ]
    };
}

// ---- Lv.2 忘れ物による往復 ----
function speedForgot() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const v1 = getRandomChoice([50, 60, 70, 80]), v2 = v1 + 10 * getRandomInt(1, 4), v3 = v1 + 10 * getRandomInt(1, 3);
        const t0 = 5 * getRandomInt(2, 8), dl = getRandomInt(5, 20);
        if ((v1 * t0) % v2 !== 0) continue;
        const back = v1 * t0 / v2, extra = t0 + back - dl;
        if (extra <= 0) continue;
        const Dn = extra * v1 * v3;
        if (Dn % (v3 - v1) !== 0) continue;
        const D = Dn / (v3 - v1);
        if (D % 100 === 0 && D >= 2000 && D <= 15000) q = { v1, v2, v3, t0, dl, back, extra, D };
    }
    if (!q) q = { v1: 60, v2: 90, v3: 80, t0: 30, dl: 10, back: 20, extra: 40, D: 9600 };
    const { v1, v2, v3, t0, dl, back, extra, D } = q, item = getRandomChoice(['財布', '定期券', '携帯電話']), L = speedLcm(v1, v3), a = L / v1, b = L / v3;
    return {
        unit: '⑫ その他の速さ', title: '忘れ物による往復',
        text: `Aは自宅を出発し、徒歩で途中寄り道することなく、分速 ${v1} m で友人Bの家に向かった。しかし、Aは、出発して ${t0} 分後に${item}を忘れたことに気づいたので、その地点から速さを分速 ${v2} m で自宅に戻り、その後、自宅で休憩することなくすぐに分速 ${v3} m でBの家に向かった。このため、当初の予定より ${dl} 分遅れて到着した。`,
        prompt: 'Aの自宅とBの家の間の距離として、正しいのはどれか。',
        correctAnswer: D / 1000, unitSuffix: 'km', step: 0.2, decimals: 1, consecutive: true,
        steps: [
            `気づいた地点は自宅から ${v1} × ${t0} ＝ ${v1 * t0} m。自宅に戻るのに ${v1 * t0} ÷ ${v2} ＝ ${back} 分かかる`,
            `自宅とBの家の距離を D m とする。当初の予定の時間は D ÷ ${v1} 分。実際は ${t0} ＋ ${back} ＋ D ÷ ${v3} 分かかった`,
            `実際の時間は予定より ${dl} 分長いので、${t0} ＋ ${back} ＋ D ÷ ${v3} ＝ D ÷ ${v1} ＋ ${dl}　⇒　D ÷ ${v1} － D ÷ ${v3} ＝ ${t0 + back - dl}`,
            `両辺に ${v1} と ${v3} の最小公倍数 ${L} をかけて、${a}D － ${b}D ＝ ${extra} × ${L}　⇒　${a - b === 1 ? '' : a - b}D ＝ ${extra * L}`,
            `D ＝ ${D} m ＝ ${D / 1000} km`
        ]
    };
}

// ---- Lv.3 速さ問題の過不足算 ----
function speedLateEarly() {
    const pairs = [[60, 36], [60, 40], [60, 45], [50, 30], [50, 40], [72, 48], [72, 54], [48, 36], [45, 30], [90, 60], [80, 60], [64, 48], [54, 36]];
    const goals = [['飛行機', '空港'], ['新幹線', '駅'], ['高速バス', 'バスターミナル']];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const [vf, vs] = getRandomChoice(pairs), e1 = 2 * getRandomInt(5, 25), e2 = 2 * getRandomInt(3, 20), X = e1 + e2;
        if ((X * vs) % (vf - vs) !== 0) continue;
        const tf = X * vs / (vf - vs);                          // 時速 vf のときの所要時間（分）
        if (tf % 6 === 0 && tf >= 36 && tf <= 180 && (tf * vf) % 60 === 0) q = { vf, vs, e1, e2, X, tf };
    }
    if (!q) q = { vf: 60, vs: 36, e1: 32, e2: 20, X: 52, tf: 78 };
    const { vf, vs, e1, e2, X, tf } = q, [what, place] = getRandomChoice(goals), g = Fr.gcd(vf, vs), p = vs / g, r = vf / g, u = X / (r - p), D = tf * vf / 60;
    const pos = getRandomInt(0, Math.min(4, Math.floor((tf - 1) / 6))), customChoices = [0, 1, 2, 3, 4].map(i => {
        const v = tf + (i - pos) * 6;
        return { value: v, label: speedLabels[i], htmlText: `${speedLabels[i]} ${speedHM(v)}`, isCorrect: v === tf };
    });
    return {
        unit: '⑫ その他の速さ', title: '速さ問題の過不足算',
        text: `ある${what}に乗るために家から${place}まで自動車で行くとき、時速 ${vf} km で走行すると出発時刻の ${e1} 分前に着くが、時速 ${vs} km で走行すると出発時刻に ${e2} 分遅れてしまう。`,
        prompt: `今、時速 ${vf} km で家から${place}まで自動車で行くとき、要する時間はどれか。`,
        correctAnswer: tf, customChoices,
        steps: [
            `時速 ${vf} km で行くと出発時刻の ${e1} 分前、時速 ${vs} km で行くと ${e2} 分後に着くので、2 つの所要時間の差は ${e1} ＋ ${e2} ＝ ${X} 分`,
            `同じ距離を進む時間の比は、速さの逆比。時速 ${vf} km : 時速 ${vs} km ＝ ${r} : ${p} なので、所要時間の比は（時速 ${vf} km）: （時速 ${vs} km）＝ ${p} : ${r}`,
            `比の差 ${r} － ${p} ＝ ${r - p} が ${X} 分にあたるので、比の 1 は ${X} ÷ ${r - p} ＝ ${u} 分`,
            `時速 ${vf} km で行くときの所要時間 ＝ ${p} × ${u} ＝ ${tf} 分 ＝ ${speedHM(tf)}（距離は ${D} km。検算: 時速 ${vs} km なら ${r} × ${u} ＝ ${r * u} 分）`
        ]
    };
}
