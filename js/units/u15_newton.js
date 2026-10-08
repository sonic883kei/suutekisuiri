/**
 * u15_newton.js  —  ⑮ ニュートン算
 * 3パターン（過去問の型）:
 *   Lv.1 ニュートン算の基本         … 水量・流入量が分かっている容器をポンプ k 台で空にする時間
 *   Lv.2 不明な情報が2つの場合       … 行列（最初の人数・毎分加わる人数が不明）を2通りの売り方で解消 → 最初に並んでいた人数
 *   Lv.3 給排水（不明な情報が3つ）   … 湧き水のある池（最初の水量・湧き水の量・ポンプの能力が不明）を2通りで排水 → 別の台数で排水する時間（2005 特別区Ⅲ類）
 * いずれも「答えが整数（Lv.1・3 は 30秒／10秒単位の時間）になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜3 ならそのパターン、それ以外は3パターンからランダム。
 */
UnitRegistry.register({
    id: 'u15', name: '⑮ ニュートン算', chap: 1,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        return [newtonBasic, newtonQueue, newtonSpring][lv - 1]();
    }
});

const newtonLabels = ['①', '②', '③', '④', '⑤'];
// 秒 → 「X分Y秒」。padAll が true なら秒が 0 でも「8分00秒」と表示、false なら「6分」と表示
const newtonTime = (sec, padAll) => { const m = Math.floor(sec / 60), s = sec % 60; return (s === 0 && !padAll) ? `${m}分` : `${m}分${padAll ? String(s).padStart(2, '0') : s}秒`; };
// 秒を step 刻みで並べた5択（正解の位置はランダム、0秒以下は出さない）
function newtonTimeChoices(correctSec, stepSec, padAll) {
    const pos = getRandomInt(0, Math.min(4, Math.floor((correctSec - 1) / stepSec)));
    return [0, 1, 2, 3, 4].map(i => { const v = correctSec + (i - pos) * stepSec; return { value: v, label: newtonLabels[i], htmlText: `${newtonLabels[i]} ${newtonTime(v, padAll)}`, isCorrect: v === correctSec }; });
}

// ---- Lv.1 ニュートン算の基本 ----
function newtonBasic() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const W = 50 * getRandomInt(4, 30), r = 5 * getRandomInt(2, 14), t1 = getRandomInt(5, 30), k = getRandomChoice([2, 2, 3, 4]);
        if ((W + r * t1) % t1 !== 0) continue;
        const p = (W + r * t1) / t1, net = k * p - r;
        if (net <= 0 || (60 * W) % net !== 0) continue;
        const sec = 60 * W / net;
        if (sec % 30 === 0 && sec >= 90 && sec <= 1800) q = { W, r, t1, k, p, net, sec };
    }
    if (!q) q = { W: 600, r: 20, t1: 15, k: 2, p: 60, net: 100, sec: 360 };
    const { W, r, t1, k, p, net, sec } = q;
    return {
        unit: '⑮ ニュートン算', title: 'ニュートン算の基本',
        text: `${W} ℓ の水が入っている容器を空にするのに、ポンプAを 1 台用いれば ${t1} 分かかる。ただし、この容器には毎分 ${r} ℓ の割合で水が流れ込んでいるものとする。`,
        prompt: `ポンプAを ${k} 台用いれば容器が空になるのにかかる時間は次のうちどれか。`,
        correctAnswer: sec, customChoices: newtonTimeChoices(sec, 30, false),
        steps: [
            `ポンプA 1 台が毎分排水する量を p ℓ とする。${t1} 分間に流れ込む水は ${r} × ${t1} ＝ ${r * t1} ℓ なので、${t1} 分間に排水した量は ${W} ＋ ${r * t1} ＝ ${W + r * t1} ℓ`,
            `p ＝ ${W + r * t1} ÷ ${t1} ＝ ${p}（ℓ/分）`,
            `ポンプ ${k} 台だと毎分 ${p} × ${k} ＝ ${p * k} ℓ 排水し、毎分 ${r} ℓ 流れ込むので、容器の水は毎分 ${p * k} － ${r} ＝ ${net} ℓ ずつ減る`,
            sec % 60 === 0 ? `${W} ÷ ${net} ＝ ${sec / 60} 分` : `${W} ÷ ${net} ＝ ${Number((W / net).toFixed(3))} 分 ＝ ${newtonTime(sec, false)}`
        ]
    };
}

// ---- Lv.2 不明な情報が2つの場合（行列）----
function newtonQueue() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const r = 5 * getRandomInt(1, 10), N = 10 * getRandomInt(5, 60), t1 = getRandomInt(10, 60), t2 = getRandomInt(5, t1 - 1);
        if ((N + r * t1) % t1 !== 0 || (N + r * t2) % t2 !== 0) continue;
        const s1 = (N + r * t1) / t1, s2 = (N + r * t2) / t2;
        if (s2 > s1 && s1 > r && s2 <= 120 && s1 % 5 === 0 && s2 % 5 === 0) q = { r, N, t1, t2, s1, s2 };   // 売る速さは 5 の倍数
    }
    if (!q) q = { r: 20, N: 200, t1: 20, t2: 10, s1: 30, s2: 40 };
    const { r, N, t1, t2, s1, s2 } = q, open = getRandomChoice([9, 10, 11]);
    return {
        unit: '⑮ ニュートン算', title: '不明な情報が2つの場合',
        text: `ある新商品の発売日、店舗Aには開店前からすでに行列ができていた。${open}：00 に開店して発売開始したが、さらに毎分一定の割合で客がその列に加わっている。発売窓口で毎分 ${s1} 人ずつ売っていくと ${t1} 分で行列がなくなり、毎分 ${s2} 人ずつ売っていくと ${t2} 分で行列がなくなる。`,
        prompt: `このとき、${open}：00 の時点で店舗Aに並んでいた人数は次のうちどれか。`,
        correctAnswer: N, unitSuffix: '人', step: 10, consecutive: true,
        steps: [
            `最初に並んでいた人数を N 人、毎分列に加わる人数を r 人とする。（最初の人数）＋（加わる人数）＝（売った人数）で式を立てる`,
            `毎分 ${s1} 人で ${t1} 分: N ＋ ${t1}r ＝ ${s1} × ${t1} ＝ ${s1 * t1} …①、毎分 ${s2} 人で ${t2} 分: N ＋ ${t2}r ＝ ${s2} × ${t2} ＝ ${s2 * t2} …②`,
            `① － ②: ${t1 - t2}r ＝ ${s1 * t1 - s2 * t2}　⇒　r ＝ ${r}（毎分 ${r} 人ずつ加わる）`,
            `②に代入して N ＝ ${s2 * t2} － ${t2} × ${r} ＝ ${N} 人`
        ]
    };
}

// ---- Lv.3 給排水（不明な情報が3つ：最初の水量・湧き水の量・ポンプの能力）----
function newtonSpring() {
    const contexts = [['湧き水が出ている池', '池', '湧き水の量は一定とし'], ['雨水が流れ込み続けている貯水槽', '貯水槽', '流れ込む雨水の量は一定とし']];
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const r = getRandomInt(1, 8), W = getRandomInt(10, 150), n1 = getRandomInt(r + 1, 20), n2 = getRandomInt(r + 1, 24), n3 = getRandomInt(r + 1, 22);
        if (n1 >= n2 || n3 === n1 || n3 === n2 || n3 < n1 || n3 > n2) continue;
        if (W % (n1 - r) !== 0 || W % (n2 - r) !== 0 || (6 * W) % (n3 - r) !== 0) continue;
        const t1 = W / (n1 - r), t2 = W / (n2 - r), sec = 10 * (6 * W / (n3 - r));
        if (t1 > t2 && t1 <= 40 && t2 >= 2 && sec >= 120 && sec <= 1800 && sec % 60 !== 0) q = { r, W, n1, n2, n3, t1, t2, sec };
    }
    if (!q) q = { r: 3, W: 45, n1: 6, n2: 12, n3: 9, t1: 15, t2: 5, sec: 450 };
    const { r, W, n1, n2, n3, t1, t2, sec } = q, [what, noun, note] = getRandomChoice(contexts);
    return {
        unit: '⑮ ニュートン算', title: '給排水（不明な情報が3つ）',
        text: `${what}があり、この${noun}は満水の状態からポンプ ${n1} 台で排水すると ${t1} 分で水が無くなり、ポンプ ${n2} 台で排水すると ${t2} 分で水が無くなる。ただし、${note}、すべてのポンプの能力は同じものとする。`,
        prompt: `この${noun}が満水の状態からポンプ ${n3} 台で排水したとき、水が無くなるまでの時間はどれか。`,
        correctAnswer: sec, customChoices: newtonTimeChoices(sec, 10, true),
        steps: [
            `ポンプ 1 台が 1 分間に排水する量を 1 とし、満水の量を W、毎分増える水の量を r とする（W と r は ポンプ 1 台分の排水量を単位にして表す）`,
            `ポンプ ${n1} 台で ${t1} 分: W ＋ ${t1}r ＝ ${n1} × ${t1} ＝ ${n1 * t1} …①、ポンプ ${n2} 台で ${t2} 分: W ＋ ${t2}r ＝ ${n2} × ${t2} ＝ ${n2 * t2} …②`,
            `① － ②: ${t1 - t2}r ＝ ${n1 * t1 - n2 * t2}　⇒　r ＝ ${r}。①に代入して W ＝ ${n1 * t1} － ${t1} × ${r} ＝ ${W}`,
            `ポンプ ${n3} 台だと、毎分 ${n3} ずつ排水して毎分 ${r} ずつ増えるので、水は毎分 ${n3} － ${r} ＝ ${n3 - r} ずつ減る`,
            `時間 ＝ ${W} ÷ ${n3 - r} ＝ ${Number((W / (n3 - r)).toFixed(3))} 分 ＝ ${newtonTime(sec, true)}`
        ]
    };
}
