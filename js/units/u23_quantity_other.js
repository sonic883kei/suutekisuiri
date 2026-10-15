/**
 * u23_quantity_other.js  —  ㉓ その他の数量
 * 4パターン（過去問の型）:
 *   Lv.1 最大・最小   … 値段を x 円上げる（下げる）ごとに、1日の売り上げ個数が y 個ずつ減る（増える）→ 1日の売り上げ金額の最大（2005 東京消防庁Ⅲ類）
 *   Lv.2 時差         … 日本からA経由でBへ。現地時刻と日本との時差から、飛行時間の合計（2009 海上保安学校・入国警備官・皇宮護衛官）
 *   Lv.3 表の理解     … 配点 1・2・4（・8）点の小テスト。得点の分布表から「正答できなかった問題の延べ数（正答の延べ数）」（2011 海上保安学校）
 *   Lv.4 計算問題     … 両替（往復で為替レートが違う）。出発時に両替した金額（または、円に戻った金額）（2008 国家Ⅲ種）
 * 答えはいずれも別方式の総当たり（tests/run.js）で確認している。
 */
UnitRegistry.register({
    id: 'u23', name: '㉓ その他の数量', chap: 2,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        return [qtyMax, qtyTime, qtyTable, qtyExchange][lv - 1]();
    }
});

const qtyLab = ['①', '②', '③', '④', '⑤'];
function qtyNiceStep(ans, ratio) {
    const nice = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000], t = ans / ratio;
    return nice.reduce((b, x) => Math.abs(Math.log(x / t)) < Math.abs(Math.log(b / t)) ? x : b);
}
// 正解＋誤答候補から5択（昇順）。fmt で表示用の文字列にする
function qtyChoices(ans, wrongs, fmt, spread) {
    const set = new Set([ans]);
    shuffleArray(wrongs.filter(v => v > 0 && v !== ans)).forEach(v => { if (set.size < 5) set.add(v); });
    for (let g = 0; set.size < 5 && g < 300; g++) { const v = ans + getRandomChoice([-1, 1]) * getRandomInt(1, 8) * spread; if (v > 0) set.add(v); }
    return [...set].sort((x, y) => x - y).map((v, i) => ({ value: v, label: qtyLab[i], htmlText: `${qtyLab[i]} ${fmt(v)}`, isCorrect: v === ans }));
}
const qtyYen = v => `${v.toLocaleString()}円`;

// ---- Lv.1 最大・最小 ----
function qtyMax() {
    const up = getRand() < 0.6, x = getRandomChoice([10, 20, 50]), y = getRandomChoice([2, 3, 5, 10]), P = getRandomInt(3, 8), ks = getRandomInt(1, 4);
    const Nn = up ? P + 2 * ks : P - 2 * ks;
    if (Nn < 2 || Nn > 14 || ks >= (up ? Nn : P)) return qtyMax();
    const p = P * x, n = Nn * y, sgn = up ? 1 : -1;
    const R = k => (p + sgn * x * k) * (n - sgn * y * k), ans = R(ks), step = qtyNiceStep(ans, 60);
    let best = 0; for (let k = 0; k <= 1000; k++) { const pr = p + sgn * x * k, qt = n - sgn * y * k; if (pr > 0 && qt >= 0) best = Math.max(best, pr * qt); }
    if (best !== ans) return qtyMax();      // 公式の最大値と総当たりが食い違う問題は出さない
    const pm = up ? '＋' : '−', mp = up ? '−' : '＋';   // 価格の増減／個数の増減の符号
    const zeros = up ? `売上が 0 になるのは、個数が 0 になる k ＝ ${n} ÷ ${y} ＝ ${Nn} と、価格が 0 になる k ＝ −${P}（${p} ÷ ${x}）` : `売上が 0 になるのは、価格が 0 になる k ＝ ${p} ÷ ${x} ＝ ${P} と、個数が 0 になる k ＝ −${Nn}（${n} ÷ ${y}）`;
    const steps = [
        `${x} 円${up ? '上げる' : '下げる'}回数を k 回とすると、価格は ${p} ${pm} ${x}k（円）、売れる個数は ${n} ${mp} ${y}k（個）。売り上げ ＝ (${p} ${pm} ${x}k) × (${n} ${mp} ${y}k)`,
        `${zeros}。売り上げは k の2次式で、グラフは上に凸なので、最大になるのは2つのゼロ点のちょうど真ん中`,
        up ? `k ＝ (${Nn} − ${P}) ÷ 2 ＝ ${ks}` : `k ＝ (${P} − ${Nn}) ÷ 2 ＝ ${ks}`,
        `k ＝ ${ks} のとき、価格 ${p + sgn * x * ks} 円、個数 ${n - sgn * y * ks} 個で、売り上げ ＝ ${p + sgn * x * ks} × ${n - sgn * y * ks} ＝ ${ans.toLocaleString()} 円`,
        `（確認）k ＝ ${ks - 1} では ${R(ks - 1).toLocaleString()} 円、k ＝ ${ks + 1} では ${R(ks + 1).toLocaleString()} 円で、どちらも ${ans.toLocaleString()} 円より小さい`
    ];
    return {
        unit: '㉓ その他の数量', title: '最大・最小',
        text: `ある品物を 1 個 ${p} 円で売ると、1 日に ${n} 個売れる。この品物 1 個の値段を ${x} 円${up ? '上げる' : '下げる'}ごとに、1 日の売り上げ個数は ${y} 個ずつ${up ? '減る' : '増える'}という。1 日の売り上げ金額は最大いくらか。`,
        prompt: '1 日の売り上げ金額の最大値はいくらですか。',
        correctAnswer: ans, unitSuffix: '円', step, consecutive: true, steps
    };
}

// ---- Lv.2 時差 ----
const QTY_CITY = [['ロンドン', 9], ['パリ', 8], ['ローマ', 8], ['フランクフルト', 8], ['イスタンブール', 7], ['カイロ', 7], ['モスクワ', 6], ['ドバイ', 5], ['ニューヨーク', 14], ['シンガポール', 1], ['バンコク', 2]];
function qtyClock(m) { const h = Math.floor(m / 60); return `${h < 12 ? '午前' : '午後'} ${h % 12} 時 ${m % 60} 分`; }
function qtyPlain(m) { return `${Math.floor(m / 60)} 時 ${m % 60} 分`; }
function qtyDur(m) { return m % 60 === 0 ? `${m / 60} 時間` : `${Math.floor(m / 60)} 時間 ${m % 60} 分`; }
function qtyTime() {
    for (let t = 0; t < 50000; t++) {
        const [c1, L1] = getRandomChoice(QTY_CITY), [c2, L2] = getRandomChoice(QTY_CITY);
        if (c1 === c2) continue;
        const d0 = getRandomInt(72, 240) * 5, f1 = getRandomInt(96, 192) * 5, g = getRandomInt(12, 48) * 5, f2 = getRandomInt(24, 144) * 5;
        const a1 = d0 + f1 - L1 * 60, d1 = a1 + g, a2 = d1 + f2 + (L1 - L2) * 60;
        if (!(d0 <= a1 && a1 < 1440 && d1 < 1440 && a2 >= d1 && a2 < 1440)) continue;
        const ans = f1 + f2, J = (m, L) => m + L * 60;
        const steps = [
            `現地時刻を、すべて日本の時刻に直して考える（${c1}は日本より ${L1} 時間遅れているので ${L1} 時間足す。${c2}は ${L2} 時間遅れているので ${L2} 時間足す）`,
            `1つ目の便：成田発 ${qtyClock(d0)}（日本時間）。${c1}着 ${qtyClock(a1)}（現地）＝ 日本時間 ${qtyPlain(J(a1, L1))}。飛行時間 ＝ ${qtyPlain(J(a1, L1))} − ${qtyPlain(d0)} ＝ ${qtyDur(f1)}`,
            `2つ目の便：${c1}発 ${qtyClock(d1)}（現地）＝ 日本時間 ${qtyPlain(J(d1, L1))}。${c2}着 ${qtyClock(a2)}（現地）＝ 日本時間 ${qtyPlain(J(a2, L2))}。飛行時間 ＝ ${qtyPlain(J(a2, L2))} − ${qtyPlain(J(d1, L1))} ＝ ${qtyDur(f2)}`,
            `飛行時間の合計 ＝ ${qtyDur(f1)} ＋ ${qtyDur(f2)} ＝ ${qtyDur(ans)}`
        ];
        const pos = getRandomInt(0, 4), choices = [0, 1, 2, 3, 4].map(i => ({ v: ans + (i - pos) * 30 })).filter(o => o.v > 0);
        if (choices.length < 5) continue;
        return {
            unit: '㉓ その他の数量', title: '時差',
            text: `成田から航空機を利用し、${c1}経由で${c2}へ行った。成田発${qtyClock(d0)}の便に乗り、${c1}には同日の${qtyClock(a1)}に到着した。着後、${c1}発${qtyClock(d1)}の便に乗り、${c2}には同日の${qtyClock(a2)}に到着した。飛行時間の合計はいくらか。ただし、時刻はすべて現地時間である。また、日本の時刻を基準にすると、${c1}は ${L1} 時間、${c2}は ${L2} 時間遅れている。`,
            prompt: '飛行時間の合計はいくらですか。',
            correctAnswer: ans, unitSuffix: '', customChoices: choices.map((o, i) => ({ value: o.v, label: qtyLab[i], htmlText: `${qtyLab[i]} ${qtyDur(o.v).replace(/ /g, '')}`, isCorrect: o.v === ans })), steps
        };
    }
    throw new Error('u23 Lv.2 の生成に失敗');
}

// ---- Lv.3 表の理解（配点 1・2・4(・8) 点） ----
function qtyTable() {
    const nq = getRand() < 0.8 ? 3 : 4, pts = [1, 2, 4, 8].slice(0, nq), maxS = (1 << nq) - 1, wrongAsk = getRand() < 0.75;
    const cnt = []; for (let s = maxS; s >= 0; s--) cnt.push(getRandomInt(2, 10));
    const N = cnt.reduce((a, b) => a + b, 0), pc = s => pts.filter((p, i) => s >> i & 1).length;
    const scores = []; for (let s = maxS; s >= 0; s--) scores.push(s);
    const per = scores.map(s => wrongAsk ? nq - pc(s) : pc(s)), ans = per.reduce((a, v, i) => a + v * cnt[i], 0);
    if (ans <= 0) return qtyTable();
    const total = nq * N, other = total - ans;
    const how = scores.map((s, i) => `${s} 点 ＝ ${pts.filter((p, j) => s >> j & 1).join(' ＋ ') || 'なし'}`);
    const steps = [
        `配点は ${pts.join('、')} 点と 2 倍ずつ増えているので、得点が決まれば「どの問題に正答したか」が 1 通りに決まる（足して同じ得点になる組合せが他にない）`,
        `得点ごとの正答の内訳：${how.join('、')}`,
        `${wrongAsk ? '正答できなかった' : '正答した'}問題の数（1人あたり）は、得点が ${scores.join('、')} 点の順に ${per.join('、')} 題`,
        `延べ数 ＝ ${scores.map((s, i) => `${per[i]} × ${cnt[i]}`).join(' ＋ ')} ＝ ${scores.map((s, i) => per[i] * cnt[i]).join(' ＋ ')} ＝ ${ans} 題`,
        `（確認）全体の延べ数は ${nq} 題 × ${N} 人 ＝ ${total} 題。${wrongAsk ? '正答' : '誤答'}の延べ数は ${other} 題で、合わせて ${total} 題になる`
    ];
    const wr = [other, ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans - 3, ans + 5, ans - 5];
    return {
        unit: '㉓ その他の数量', title: '表の理解',
        text: `${N} 人の受験者が英語の小テストを受けた。問題数は ${nq} 題で、配点は${pts.map((p, i) => `問 ${i + 1} が ${p} 点`).join('、')}である。得点の分布は表のような結果であったとき、受験者が「${wrongAsk ? '正答できなかった問題' : '正答できた問題'}」の延べ数は何題であったか。`,
        figure: { type: 'grid', rows: [['得点（点）', ...scores], ['人数（人）', ...cnt]] },
        prompt: `「${wrongAsk ? '正答できなかった問題' : '正答できた問題'}」の延べ数は何題ですか。`,
        correctAnswer: ans, unitSuffix: '題', customChoices: qtyChoices(ans, wr, v => `${v}題`, 2), steps
    };
}

// ---- Lv.4 計算問題（両替） ----
function qtyExchange() {
    const cur = getRandomChoice([['ユーロ', 'ヨーロッパ', 130, 175], ['ドル', 'アメリカ', 110, 160], ['ポンド', 'イギリス', 150, 230]]);
    const [name, place, lo, hi] = cur, r1 = getRandomInt(lo / 5, hi / 5) * 5, r2 = getRandomInt(lo / 5, hi / 5) * 5, s = getRandomInt(2, 16) * 50, rem = getRandomInt(5, 30) * 10;
    const init = s + rem, X = r1 * init, Y = r2 * rem, ask1 = getRand() < 0.6;
    if (r1 === r2 || X > 300000) return qtyExchange();
    if (ask1) {
        const ans = X, steps = [
            `戻ってきた ${Y.toLocaleString()} 円は、1 ${name} ＝ ${r2} 円で両替したもの。残った${name} ＝ ${Y.toLocaleString()} ÷ ${r2} ＝ ${rem} ${name}`,
            `使った ${s} ${name}と残った ${rem} ${name}を合わせた ${s} ＋ ${rem} ＝ ${init} ${name}が、出発時に両替した${name}`,
            `1 ${name} ＝ ${r1} 円で両替したので、出発時に両替した金額 ＝ ${r1} × ${init} ＝ ${X.toLocaleString()} 円`
        ];
        return {
            unit: '㉓ その他の数量', title: '計算問題（両替）',
            text: `Aは${place}旅行に行った。出発時に日本で円を 1 ${name}当たり ${r1} 円で${name}に両替し、旅行先で ${s} ${name}を使った。残った${name}すべてを再度日本で円に両替したところ、1 ${name}当たり ${r2} 円で両替できたので ${Y.toLocaleString()} 円になった。Aが出発時に${name}に両替した金額は円でいくらか。なお、両替手数料は考えなくてよいものとする。`,
            prompt: '出発時に両替した金額は何円ですか。',
            correctAnswer: ans, unitSuffix: '円', customChoices: qtyChoices(ans, [r1 * rem, r1 * s, r1 * (s - rem > 0 ? s - rem : s + 2 * rem), Y + r1 * s, ans + r1 * 10, ans - r1 * 10, r2 * init, ans + 5000, ans - 5000], qtyYen, 5000), steps
        };
    }
    const ans = Y, steps = [
        `${X.toLocaleString()} 円を 1 ${name} ＝ ${r1} 円で両替したので、${X.toLocaleString()} ÷ ${r1} ＝ ${init} ${name}`,
        `${s} ${name}を使ったので、残りは ${init} − ${s} ＝ ${rem} ${name}`,
        `1 ${name} ＝ ${r2} 円で両替するので、円に戻った金額 ＝ ${r2} × ${rem} ＝ ${Y.toLocaleString()} 円`
    ];
    return {
        unit: '㉓ その他の数量', title: '計算問題（両替）',
        text: `Aは${place}旅行に行った。出発時に日本で ${X.toLocaleString()} 円を 1 ${name}当たり ${r1} 円で${name}に両替し、旅行先で ${s} ${name}を使った。残った${name}すべてを再度日本で円に両替したところ、1 ${name}当たり ${r2} 円で両替できた。円に戻った金額はいくらか。なお、両替手数料は考えなくてよいものとする。`,
        prompt: '円に戻った金額は何円ですか。',
        correctAnswer: ans, unitSuffix: '円', customChoices: qtyChoices(ans, [r2 * init, r2 * s, r1 * rem, ans + r2 * 10, ans - r2 * 10, X - r1 * s, ans + 1000, ans - 1000], qtyYen, 1000), steps
    };
}
