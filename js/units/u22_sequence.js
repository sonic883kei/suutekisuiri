/**
 * u22_sequence.js  —  ㉒ 数列・規則
 * 5パターン（過去問の型）:
 *   Lv.1 等差数列の項   … 数列 a、a+d、… について、第 m 項と第 n 項の和（または第 n 項）（2016 大阪府公立義務教育諸学校事務）
 *   Lv.2 等差数列の和   … N 以下の正の整数のうち、奇数（偶数・k の倍数・k で割って r 余る数）を足し合わせた和（2015 警視庁警察官Ⅲ類）
 *   Lv.3 階差数列       … 階差が等差数列になる数列の（A）と（B）に当たる数の和（2006 警視庁警察官Ⅲ類）
 *   Lv.4 集合           … 1〜N の a の倍数及び b の倍数の和（共通する数は1回だけ数える）（2016 大阪府公立義務教育諸学校事務）
 *   Lv.5 数字配列       … 斜めに 1 から順に入れたマス目の、上から r 行目・左から c 列目の数（2006 海上保安学校）
 * 答えは公式（等差数列の和など）と、別方式の総当たり（tests/run.js）の両方で一致を確認している。
 */
UnitRegistry.register({
    id: 'u22', name: '㉒ 数列・規則', chap: 2,
    generate(level) {
        const lv = [1, 2, 3, 4, 5].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 5);
        return [seqTerm, seqSum, seqDiff, seqSet, seqGrid][lv - 1]();
    }
});

// 選択肢の刻み幅: 正解 ÷ ratio に近いキリのよい数（10, 20, 50, 100 …）
function seqNiceStep(ans, ratio) {
    const nice = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000], t = ans / ratio;
    return nice.reduce((b, x) => Math.abs(Math.log(x / t)) < Math.abs(Math.log(b / t)) ? x : b);
}
const seqLab = ['①', '②', '③', '④', '⑤'];
function seqCustom(ans, wrongs) {   // 正解＋誤答候補から5択（昇順）を作る。足りなければ正解の近くの値で補う
    const set = new Set([ans]);
    shuffleArray(wrongs.filter(v => v > 0 && v !== ans)).forEach(v => { if (set.size < 5) set.add(v); });
    let guard = 0;
    while (set.size < 5 && guard++ < 200) { const v = ans + getRandomInt(1, 9) * getRandomChoice([-1, 1]) * getRandomChoice([1, 3, 7]); if (v > 0) set.add(v); }
    return [...set].sort((x, y) => x - y).map((v, i) => ({ value: v, label: seqLab[i], htmlText: `${seqLab[i]} ${v.toLocaleString()}`, isCorrect: v === ans }));
}

// ---- Lv.1 等差数列の項 ----
function seqTerm() {
    const a = getRandomInt(1, 20), d = getRandomInt(2, 12), shown = [0, 1, 2, 3, 4].map(i => a + i * d);
    const two = getRand() < 0.75;
    let m = getRandomInt(10, 90), n = getRandomInt(10, 90); if (m === n) n = m + 1;
    if (m > n) [m, n] = [n, m];
    const tm = a + (m - 1) * d, tn = a + (n - 1) * d, ans = two ? tm + tn : tn, step = seqNiceStep(ans, 8);
    const steps = [
        `最初の数は ${a}、となり合う数の差は ${shown[1]} − ${shown[0]} ＝ ${d} なので、${d} ずつ増える等差数列（初項 ${a}、公差 ${d}）`,
        `第 n 項 ＝ 初項 ＋ (n − 1) × 公差 ＝ ${a} ＋ (n − 1) × ${d}`,
        `第 ${n} 項 ＝ ${a} ＋ ${n - 1} × ${d} ＝ ${tn}`
    ];
    if (two) steps.splice(2, 0, `第 ${m} 項 ＝ ${a} ＋ ${m - 1} × ${d} ＝ ${tm}`);
    steps.push(two ? `和 ＝ ${tm} ＋ ${tn} ＝ ${ans}` : `答え ＝ ${ans}`);
    return {
        unit: '㉒ 数列・規則', title: '等差数列の項',
        text: `数列 ${shown.join('、')}……について、${two ? `第 ${m} 項の数と第 ${n} 項の数の和` : `第 ${n} 項の数`}として正しいのはどれか。`,
        prompt: two ? `第 ${m} 項と第 ${n} 項の和はいくつですか。` : `第 ${n} 項の数はいくつですか。`,
        correctAnswer: ans, unitSuffix: '', step, consecutive: true, steps
    };
}

// ---- Lv.2 等差数列の和 ----
function seqSum() {
    const N = getRandomInt(30, 200), kind = getRandomChoice(['odd', 'even', 'mult', 'mult', 'rem']);
    let k, r, cond;
    if (kind === 'odd') { k = 2; r = 1; cond = '奇数'; }
    else if (kind === 'even') { k = 2; r = 0; cond = '偶数'; }
    else if (kind === 'mult') { k = getRandomInt(3, 9); r = 0; cond = `${k} の倍数`; }
    else { k = getRandomInt(3, 9); r = getRandomInt(1, k - 1); cond = `${k} で割ると ${r} 余る数`; }
    const f = r === 0 ? k : r;
    let l = f; while (l + k <= N) l += k;
    const cnt = (l - f) / k + 1, ans = cnt * (f + l) / 2;
    if (!Number.isInteger(ans)) return seqSum();
    const step = seqNiceStep(ans, 50);
    const steps = [
        `${cond}を小さい順に並べると ${f}、${f + k}、${f + 2 * k}、…、${l}。となり合う数の差は ${k} で、等差数列`,
        `項数 ＝ (末項 − 初項) ÷ 公差 ＋ 1 ＝ (${l} − ${f}) ÷ ${k} ＋ 1 ＝ ${cnt}`,
        `等差数列の和 ＝ (初項 ＋ 末項) × 項数 ÷ 2 ＝ (${f} ＋ ${l}) × ${cnt} ÷ 2 ＝ ${ans}`
    ];
    return {
        unit: '㉒ 数列・規則', title: '等差数列の和',
        text: `${N} 以下の正の整数のうち、${cond}を足し合わせたものとして、正しいのはどれか。`,
        prompt: '足し合わせた値はいくつですか。',
        correctAnswer: ans, unitSuffix: '', step, consecutive: true, steps
    };
}

// ---- Lv.3 階差数列（階差が等差数列） ----
function seqDiff() {
    const a = getRandomInt(1, 20), d1 = getRandomInt(2, 9), e = getRandomInt(1, 5), len = getRandomInt(9, 11), iA = getRandomInt(5, 7);
    const t = [a], df = [];
    for (let i = 1; i < len; i++) { df.push(d1 + (i - 1) * e); t.push(t[i - 1] + df[i - 1]); }
    const iB = len - 1, A = t[iA], B = t[iB], ans = A + B;
    const seq = t.map((v, i) => i === iA ? '（A）' : i === iB ? '（B）' : String(v)).join('、');
    const shownDf = [1, 2, 3, 4].map(i => t[i] - t[i - 1]);
    const steps = [
        `となり合う数の差（階差）を調べる：${shownDf.join('、')}、…`,
        `階差は ${e} ずつ増える等差数列（初項 ${d1}、公差 ${e}）。第 n 番目の階差は ${d1} ＋ (n − 1) × ${e}`,
        `（A）の前の数は ${t[iA - 1]}、そこへの階差は ${df[iA - 1]} なので、（A）＝ ${t[iA - 1]} ＋ ${df[iA - 1]} ＝ ${A}（次の数 ${t[iA + 1]} との階差 ${df[iA]} とも合う）`,
        `（B）の前の数は ${t[iB - 1]}、そこへの階差は ${df[iB - 1]} なので、（B）＝ ${t[iB - 1]} ＋ ${df[iB - 1]} ＝ ${B}`,
        `（A）＋（B）＝ ${A} ＋ ${B} ＝ ${ans}`
    ];
    return {
        unit: '㉒ 数列・規則', title: '階差数列',
        text: `次の数列の（A）と（B）に該当する数を足すといくつになるか。\n${seq}　……`,
        prompt: '（A）と（B）の和はいくつですか。',
        correctAnswer: ans, unitSuffix: '', customChoices: seqCustom(ans, [ans + e, ans - e, ans + d1, ans - d1, ans + 2 * e + 1, ans - 2 * e - 1, ans + 7, ans - 7, ans + 13, ans - 13, ans + 26, ans - 26]), steps
    };
}

// ---- Lv.4 集合（倍数の和） ----
function seqSet() {
    const a = getRandomInt(2, 9);
    let b = getRandomInt(2, 9); while (b === a) b = getRandomInt(2, 9);
    const N = getRandomInt(50, 200), g = (x, y) => y ? g(y, x % y) : x, L = a * b / g(a, b);
    const S = k => { const m = Math.floor(N / k); return k * m * (m + 1) / 2; };
    const ans = S(a) + S(b) - S(L), step = seqNiceStep(ans, 15);
    const ma = Math.floor(N / a), mb = Math.floor(N / b), mL = Math.floor(N / L);
    const steps = [
        `${a} の倍数の和 ＝ ${a} × (1 ＋ 2 ＋ … ＋ ${ma}) ＝ ${a} × ${ma} × ${ma + 1} ÷ 2 ＝ ${S(a)}`,
        `${b} の倍数の和 ＝ ${b} × (1 ＋ 2 ＋ … ＋ ${mb}) ＝ ${b} × ${mb} × ${mb + 1} ÷ 2 ＝ ${S(b)}`,
        mL >= 1 ? `両方の倍数（${a} と ${b} の最小公倍数 ${L} の倍数）は2回数えられているので、その和 ${L} × ${mL} × ${mL + 1} ÷ 2 ＝ ${S(L)} を1回分引く`
            : `${a} と ${b} の最小公倍数 ${L} は ${N} より大きいので、共通する倍数は ${N} 以下にはなく、引く数はない`,
        `答え ＝ ${S(a)} ＋ ${S(b)}${mL >= 1 ? ` − ${S(L)}` : ''} ＝ ${ans}`
    ];
    return {
        unit: '㉒ 数列・規則', title: '集合（倍数の和）',
        text: `1 から ${N} までの自然数のうち、${a} の倍数及び ${b} の倍数の和として、正しいのはどれか。ただし、${a} の倍数及び ${b} の倍数のうち共通する数は、どちらか一方の倍数として計算するものとする。`,
        prompt: '求める和はいくつですか。',
        correctAnswer: ans, unitSuffix: '', step, consecutive: true, steps
    };
}

// ---- Lv.5 数字配列（斜めに 1,2,3… と入れていく） ----
function seqGrid() {
    const r = getRandomInt(6, 60), c = getRandomInt(1, 8), k = r + c - 1, base = k * (k - 1) / 2, ans = base + c;
    const f = (kk, cc) => kk * (kk - 1) / 2 + cc;
    const rows = [0, 1, 2, 3, 4].map(i => [0, 1, 2, 3, 4, 5].map(j => (i + j + 1 <= 5 ? f(i + j + 1, j + 1) : '')));   // r=i+1, c=j+1, k=i+j+1
    const steps = [
        `数は「左下 → 右上」へ斜めに 1 列ずつ入っていく。k 番目の斜めの列には k 個の数が入る（1 個、2 個、3 個、…）`,
        `上から ${r} 行目・左から ${c} 列目のマスは、(${r} ＋ ${c} − 1) ＝ ${k} 番目の斜めの列にある`,
        `${k - 1} 番目の斜めの列までに入っている数の個数は 1 ＋ 2 ＋ … ＋ ${k - 1} ＝ ${k - 1} × ${k} ÷ 2 ＝ ${base}`,
        `${k} 番目の斜めの列は、左下の端（1 列目）が ${base + 1}、そこから右上へ 1 つずつ増える。左から ${c} 列目は ${c} 番目なので、${base} ＋ ${c} ＝ ${ans}`
    ];
    return {
        unit: '㉒ 数列・規則', title: '数字配列',
        text: `図のように、マス目に自然数を 1 から順に入れていくとき、左から ${c} 列目、上から ${r} 行目のマス目に入る数はどれか。`,
        figure: { type: 'grid', rows },
        prompt: `上から ${r} 行目、左から ${c} 列目のマス目の数はいくつですか。`,
        correctAnswer: ans, unitSuffix: '',
        customChoices: seqCustom(ans, [f(k + 1, c), f(k - 1, c), f(k, r), f(k, k - c + 1), f(k + 1, c + 1), f(k, c) + k, f(k, c) - k, ans + 1, ans - 1]), steps
    };
}
