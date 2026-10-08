/**
 * u11_clock.js  —  ⑪ 時計算
 * 3パターン（過去問の型）:
 *   Lv.1 指定された時刻（所要時間）・A … 長針と短針が重なってから、次に重なるまでの時間（2012 大阪府公立義務教育諸学校事務）
 *   Lv.2 指定された時刻・A           … なす角度が θ° になる時刻のうち、1回目／2回目（2009 海上保安学校・入国警備官・皇宮護衛官）
 *   Lv.3 線対称な針・B               … 長針と短針が文字盤の 12 と 6 を結ぶ線について左右対称になる時刻（2004 特別区Ⅰ類）
 * 答えは帯分数（分母は Lv.1・2 が 11、Lv.3 が 13）。選択肢は帯分数で、問題文・解説の分数は {{分子/分母}} 記法（画面では縦書き分数）。
 * 【見分け方】 Lv.1・2（分母 11）では「整数部分の1の位 ＋ 分子 ＝ 10」になる選択肢が正解。この見分け方は解説に表示する。
 *   理由: 分が 60k÷11 の形になるため。Lv.3 は分母が 13 なので当てはまらない（解説でもそう案内する）。
 * 各問題オブジェクトの mixed = {a, r, den} は、答えの帯分数（整数部分 a、分子 r、分母 den）。
 * generate(level): level が 1〜3 ならそのパターン、それ以外は3パターンからランダム。
 */
UnitRegistry.register({
    id: 'u11', name: '⑪ 時計算', chap: 1,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        if (lv === 1) return clockOverlapDuration();
        if (lv === 2) return clockAngleTime();
        return clockSymmetric();
    }
});

const clockLabels = ['①', '②', '③', '④', '⑤'];
const clockMixed = (a, r, den) => (r === 0 ? `${a}` : `${a}{{${r}/${den}}}`);
const clockRule = (a, r) => (a % 10) + r === 10;              // 整数部分の1の位 ＋ 分子 ＝ 10 か
const clockTip = (a, r) => `【見分け方】長針と短針が重なる、直角になるなど、30°の倍数の角度で並ぶ時刻の「分」は、整数部分のあとに ○/11 がつく帯分数になり、整数部分の 1 の位 ＋ 分子 ＝ 10 になります。今回の答え ${a}${clockMixed(0, r, 11).replace(/^0/, '')}分 は ${a % 10} ＋ ${r} ＝ ${a % 10 + r} で条件を満たします。選択肢が分母 11 の帯分数のときは、この条件を満たすものが正解です（理由: 分が 60k÷11 の形になるため）。`;
const clockSort = (x, y) => x.a - y.a || x.r - y.r;
// 帯分数の選択肢を5つ作る。pool は {a, r} の候補、text は表示文字列を返す関数。correct は必ず含める
function clockPick(correct, pool, text) {
    const key = (c) => `${c.a}|${c.r}`, seen = new Set([key(correct)]), picked = [];
    for (const c of shuffleArray(pool)) { if (!seen.has(key(c))) { seen.add(key(c)); picked.push(c); } if (picked.length === 4) break; }
    return [correct, ...picked].sort(clockSort).map((c, i) => ({ value: key(c), label: clockLabels[i], htmlText: `${clockLabels[i]} ${text(c)}`, isCorrect: c === correct }));
}

// ---- Lv.1 指定された時刻（所要時間）・A ----
function clockOverlapDuration() {
    const n = getRandomChoice([1, 1, 1, 2, 3]), h1 = getRandomInt(1, 10 - n), h2 = h1 + n, ap = getRandomChoice(['午前', '午後']);
    const a = Math.floor(720 * n / 11), r = (720 * n) % 11, correct = { a, r };
    const pool = [];
    for (let da = -1; da <= 1; da++) for (let rr = 1; rr <= 10; rr++) if (a + da > 0 && Math.abs(rr - r) <= 5 && !clockRule(a + da, rr)) pool.push({ a: a + da, r: rr });   // 誤答は「1の位＋分子＝10」を満たさないものだけ
    const customChoices = clockPick(correct, pool, c => `${clockMixed(c.a, c.r, 11)} 分`);
    return {
        unit: '⑪ 時計算', title: '指定された時刻（所要時間）・A',
        text: `時計の長針と短針が、${ap}${h1}時と${ap}${h1 + 1}時の間で重なり合ってから、${ap}${h2}時と${ap}${h2 + 1}時の間で${n === 1 ? '再び' : ''}重なり合う。`,
        prompt: 'この間の時間は何分か。',
        correctAnswer: a + r / 11, mixed: { a, r, den: 11 }, customChoices,
        steps: [
            `長針は 1 分間に 6°、短針は 1 分間に 0.5° 進むので、長針は短針に 1 分間に 6 － 0.5 ＝ 5.5° ずつ追いつく`,
            `重なってから次に重なるまでに、長針は短針より ${n === 1 ? '360°' : `360° × ${n} ＝ ${360 * n}°`} 多く進む`,
            `時間 ＝ ${360 * n} ÷ 5.5 ＝ ${720 * n}/11 分 ＝ ${clockMixed(a, r, 11)} 分（${720 * n} ÷ 11 ＝ ${a} あまり ${r}）`,
            clockTip(a, r)
        ]
    };
}

// ---- Lv.2 指定された時刻・A（なす角度が θ° になる時刻）----
function clockAngleTime() {
    let q = null;
    for (let i = 0; i < 5000 && !q; i++) {
        const h = getRandomInt(1, 11), th = getRandomChoice([30, 60, 90, 90, 90, 120, 150]);
        if (h === 3 || h === 9) continue;
        const xs = new Set();
        for (const sg of [1, -1]) for (let j = -1; j <= 2; j++) { const X = 30 * h + sg * th + 360 * j; if (X > 0 && X < 330) xs.add(X); }   // 5.5m ＝ X（0 < m < 60）
        const sol = [...xs].sort((x, y) => x - y);
        if (sol.length !== 2 || sol.some(X => (2 * X) % 11 === 0)) continue;
        const ord = getRandomChoice([1, 2]), X = sol[ord - 1], a = Math.floor(2 * X / 11), r = (2 * X) % 11;
        q = { h, th, ord, sol, X, a, r };
    }
    if (!q) q = { h: 4, th: 90, ord: 2, sol: [30, 210], X: 210, a: 38, r: 2 };
    const { h, th, ord, sol, X, a, r } = q, correct = { a, r }, ms = sol.map(x => ({ a: Math.floor(2 * x / 11), r: (2 * x) % 11 }));
    const start = getRandomInt(Math.max(1, r - 4), Math.min(r, 6)), pool = [];
    for (let k = 0; k < 5; k++) pool.push({ a, r: start + k });                       // 例題と同じ: 整数部分は同じで分子だけが違う5択
    const customChoices = clockPick(correct, pool, c => `${h}時${clockMixed(c.a, c.r, 11)}分`);
    return {
        unit: '⑪ 時計算', title: '指定された時刻・A',
        text: `時計の長針と短針がなす角度が ${th}° となる時刻は ${h} 時台には 2 回ある。`,
        prompt: `${ord} 回目に ${th}° となるのはいつか。`,
        correctAnswer: a + r / 11, mixed: { a, r, den: 11 }, customChoices,
        steps: [
            `${h} 時 m 分のとき、短針は 12 時の位置から 30 × ${h} ＋ 0.5m ＝ ${30 * h} ＋ 0.5m（度）、長針は 6m（度）進んでいる`,
            `長針と短針の差は 6m － (${30 * h} ＋ 0.5m) ＝ 5.5m － ${30 * h}（度）。なす角度が ${th}° になるのは、この差が ${th}° または －${th}°（360° を足し引きしたものも含む）のとき`,
            `5.5m ＝ ${sol[0]} より m ＝ ${sol[0]} ÷ 5.5 ＝ ${2 * sol[0]}/11 ＝ ${clockMixed(ms[0].a, ms[0].r, 11)}、5.5m ＝ ${sol[1]} より m ＝ ${2 * sol[1]}/11 ＝ ${clockMixed(ms[1].a, ms[1].r, 11)}（0 ＜ m ＜ 60 の範囲で 2 回）`,
            `${ord} 回目は ${h} 時 ${clockMixed(a, r, 11)} 分`,
            clockTip(a, r)
        ]
    };
}

// ---- Lv.3 線対称な針・B（12 と 6 を結ぶ線について左右対称）----
function clockSymmetric() {
    const h = getRandomInt(1, 11), N = 720 - 60 * h, a = Math.floor(N / 13), r = N % 13, correct = { a, r };
    const base = r % 3, pool = [];
    for (let rr = base; rr <= 12; rr += 3) if (rr !== r) pool.push({ a, r: rr });             // 例題と同じ: 整数部分は同じで分子が 3 刻み
    pool.push({ a: a + 1, r }, { a: a - 1, r });
    const same = pool.filter(c => c.a === a), other = pool.filter(c => c.a !== a);
    const ordered = [...shuffleArray(same), ...shuffleArray(other)].slice(0, 4);
    const customChoices = [correct, ...ordered].sort(clockSort).map((c, i) => ({ value: `${c.a}|${c.r}`, label: clockLabels[i], htmlText: `${clockLabels[i]} ${h}時${clockMixed(c.a, c.r, 13)}分`, isCorrect: c === correct }));
    return {
        unit: '⑪ 時計算', title: '線対称な針・B',
        text: h === 6
            ? '6 時から 7 時の間で、時計の長針と短針の位置が文字盤の 6 の目盛りを挟んで左右対称になる。'
            : `${h} 時から ${h + 1} 時の間で、時計の長針と短針の位置が、文字盤の 12 と 6 を結ぶ線について左右対称になる。`,
        prompt: 'このような時刻はどれか。',
        correctAnswer: N / 13, mixed: { a, r, den: 13 }, customChoices,
        steps: [
            `${h} 時 m 分のとき、短針は 12 時の位置から ${30 * h} ＋ 0.5m（度）、長針は 6m（度）進んでいる（どちらも時計回り）`,
            `12 と 6 を結ぶ線について左右対称なとき、2 本の針の角度の和は 360°`,
            `6m ＋ (${30 * h} ＋ 0.5m) ＝ 360　⇒　6.5m ＝ ${360 - 30 * h}　⇒　m ＝ ${360 - 30 * h} ÷ 6.5 ＝ ${N}/13 ＝ ${clockMixed(a, r, 13)}（${N} ÷ 13 ＝ ${a} あまり ${r}）`,
            `${h} 時 ${clockMixed(a, r, 13)} 分`,
            `【注意】この型は分母が 13 になるので、「1 の位 ＋ 分子 ＝ 10」の見分け方は使えません（今回は ${a % 10} ＋ ${r} ＝ ${a % 10 + r}）。この見分け方は、分母が 11 になる「重なる・直角・一直線」の問題で使います`
        ]
    };
}
