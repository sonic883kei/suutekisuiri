/**
 * u13_inequality.js  —  ⑬ 不等式
 * 5パターン（過去問の型）:
 *   Lv.1 2項目の大小関係            … 団体割引が始まる人数に満たない団体が、割引人数で払う方が安くなる最少人数（2006 海上保安学校 特別募集）
 *   Lv.2 3項目の大小関係（過不足算の不等式）… 「a個ずつだと e個残り、b個ずつだと c個以上残り、d個ずつだと f個以上足りない」→ 子どもの人数（2007 特別区 身体障害者対象）
 *   Lv.3 勝敗ライン                 … N 人で m 人を選ぶ選挙、c 人が立候補 → 当選確実となる最低得票数（2004 東京消防庁Ⅲ類）
 *   Lv.4 過不足算の不等式・B         … 2つの部の配り方の不等式と人数の差 → 2つの部の人数の合計（2013 東京都Ⅲ類）
 *   Lv.5 売買損益の不等式・B         … 売れ行きが悪く残り半数を値下げ → 目標利益を出せる最低の値下げ価格（2012 大阪府行政・警察行政）
 * いずれも「答えが一意の整数になる条件」から逆算して数値を抽選する（不等式の問題は境界の扱いを問題文に明記）。
 * generate(level): level が 1〜5 ならそのパターン、それ以外は5パターンからランダム。
 */
UnitRegistry.register({
    id: 'u13', name: '⑬ 不等式', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4, 5].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 5);
        return [ineqGroupDiscount, ineqCandy, ineqElection, ineqTwoClubs, ineqStall][lv - 1]();
    }
});

const ineqLabels = ['①', '②', '③', '④', '⑤'];
// 正解と誤答候補から5択（昇順）を作る。unit は表示用の単位
function ineqChoices(correct, wrongs, unit) {
    const seen = new Set([correct]), pool = [];
    for (const w of shuffleArray(wrongs)) { if (w > 0 && !seen.has(w)) { seen.add(w); pool.push(w); } if (pool.length === 4) break; }
    return [correct, ...pool].sort((x, y) => x - y).map((v, i) => ({ value: v, label: ineqLabels[i], htmlText: `${ineqLabels[i]} ${v.toLocaleString()} ${unit}`, isCorrect: v === correct }));
}

// ---- Lv.1 2項目の大小関係（団体割引）----
function ineqGroupDiscount() {
    const kinds = ['乗車料金', '入場料', '施設の利用料金'];
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const price = getRandomChoice([100, 150, 200, 250, 300, 400, 500, 800, 1000]), n0 = getRandomChoice([50, 60, 80, 100, 120, 150, 200, 250, 300]), d = getRandomChoice([10, 15, 20, 25, 30]);
        const thr100 = n0 * (100 - d);                       // しきい値 ＝ thr100 ÷ 100 人（これより多い人数なら団体料金の方が安い）
        const n = Math.floor(thr100 / 100) + 1;
        if (n < n0 - 1 && n > n0 * 0.5) q = { price, n0, d, thr100, n };
    }
    if (!q) q = { price: 200, n0: 150, d: 20, thr100: 12000, n: 121 };
    const { price, n0, d, thr100, n } = q, kind = getRandomChoice(kinds), dText = d % 10 === 0 ? `${d / 10} 割引` : `${d}％引き`;
    const unit = price * (100 - d) / 100, group = price * n0 * (100 - d) / 100, thr = thr100 / 100;
    const customChoices = ineqChoices(n, [n - 3, n - 2, n + 1, n + 2, n + 3, n + 4], '名');         // n－1（ちょうど同額・境界）は入れない
    return {
        unit: '⑬ 不等式', title: '2項目の大小関係',
        text: `1 名につき ${price} 円の${kind}が、${n0} 名以上の団体ならば ${dText}となる。`,
        prompt: `${n0} 名に満たない団体が、${n0} 名の団体として料金を払う方が安くなる最少人数は次のどれか。`,
        correctAnswer: n, customChoices,
        steps: [
            `${n0} 名の団体として払うと、1 名あたり ${price} × ${(100 - d) / 100} ＝ ${unit} 円なので、料金は ${unit} × ${n0} ＝ ${group.toLocaleString()} 円`,
            `n 名のまま払うと ${price}n 円。${n0} 名の団体として払う方が安くなるのは ${group.toLocaleString()} ＜ ${price}n のとき`,
            `n ＞ ${group.toLocaleString()} ÷ ${price} ＝ ${Number(thr.toFixed(2))}`,
            Number.isInteger(thr) ? `n ＝ ${thr} 名だと同額で「安くなる」とはいえないので、最少人数は ${n} 名` : `n は整数なので、最少人数は ${n} 名`
        ]
    };
}

// ---- Lv.2 3項目の大小関係（過不足算の不等式）----
function ineqCandy() {
    const items = [['キャンディー', '個'], ['みかん', '個'], ['鉛筆', '本'], ['折り紙', '枚']];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const n = getRandomInt(5, 15), a = getRandomInt(3, 6), e = getRandomInt(6, 30), b = a + getRandomInt(1, 3), d = a + getRandomInt(3, 6), c = getRandomInt(1, e - 1), f = getRandomInt(2, 25);
        const hi = Math.floor((e - c) / (b - a)), lo = Math.ceil((e + f) / (d - a));       // lo ≦ n ≦ hi
        if (lo === n && hi === n) q = { n, a, e, b, c, d, f, lo, hi };
    }
    if (!q) q = { n: 7, a: 4, e: 17, b: 6, c: 2, d: 8, f: 10, lo: 7, hi: 7 };
    const { n, a, e, b, c, d, f } = q, [item, ctr] = getRandomChoice(items);
    return {
        unit: '⑬ 不等式', title: '3項目の大小関係（過不足算の不等式）',
        text: `ある数の${item}を子どもたちに配ろうとしたところ、それぞれの子どもに ${a} ${ctr}ずつ配ると ${e} ${ctr}残り、${b} ${ctr}ずつ配ると ${c} ${ctr}以上残り、${d} ${ctr}ずつ配ると ${f} ${ctr}以上足りないことが分かった。`,
        prompt: 'このとき、子どもの人数はどれか。',
        correctAnswer: n, unitSuffix: '人', step: 1, consecutive: true,
        steps: [
            `子どもの人数を n 人とすると、${item}の数は ${a}n ＋ ${e}（${ctr}）`,
            `${b} ${ctr}ずつ配ると ${c} ${ctr}以上残る: (${a}n ＋ ${e}) － ${b}n ≧ ${c}　⇒　${e} － ${c} ≧ ${b - a === 1 ? '' : b - a}n　⇒　n ≦ ${Number(((e - c) / (b - a)).toFixed(2))}`,
            `${d} ${ctr}ずつ配ると ${f} ${ctr}以上足りない: ${d}n － (${a}n ＋ ${e}) ≧ ${f}　⇒　${d - a === 1 ? '' : d - a}n ≧ ${e + f}　⇒　n ≧ ${Number(((e + f) / (d - a)).toFixed(2))}`,
            `${Number(((e + f) / (d - a)).toFixed(2))} ≦ n ≦ ${Number(((e - c) / (b - a)).toFixed(2))} を満たす整数は n ＝ ${n}　⇒　子どもは ${n} 人`
        ]
    };
}

// ---- Lv.3 勝敗ライン（当選確実となる最低得票数）----
function ineqElection() {
    const N = getRandomInt(30, 80), m = getRandomChoice([1, 2, 2, 3]), c = m + getRandomInt(1, 3), x = Math.floor(N / (m + 1)) + 1;
    const wrongs = [x - 1, x + 1, x + 2, x - 2, x - 3, x + 3, Math.floor(N / c) + 1, Math.floor(N / m) + 1, Math.ceil(N / 2) + 1];
    const customChoices = ineqChoices(x, wrongs, '票');
    return {
        unit: '⑬ 不等式', title: '勝敗ライン',
        text: `${N} 人のクラスで ${m} 人のクラス委員を決める選挙を行ったところ、${c} 人が立候補した。全員が 1 票ずつ投票し、無効票や棄権はなかったものとする。また、得票数が同じ候補者がいる場合は、当選確実とはいえないものとする。`,
        prompt: '最低何票得票すれば当選確実となるか。',
        correctAnswer: x, customChoices,
        steps: [
            `当選確実とはいえないのは、自分と同じかそれ以上の票を取る他の候補者が ${m} 人（当選人数と同じ数）出うる場合`,
            `自分が x 票のとき、そのような ${m} 人がいるには、自分を含めた ${m + 1} 人が x 票以上取る必要があり、${m + 1}x ≦ ${N}（x ≦ ${Number((N / (m + 1)).toFixed(2))}）`,
            `逆に、${m + 1}x ＞ ${N}、つまり x ＞ ${Number((N / (m + 1)).toFixed(2))} なら、そのようなことは起こらず当選確実`,
            `x は整数なので、最低 ${x} 票（検算: ${x - 1} 票だと ${m + 1} 人が ${x - 1} 票ずつ取る ${(x - 1) * (m + 1)} 票 ≦ ${N} 票で、同票が起こりうる）`
        ]
    };
}

// ---- Lv.4 過不足算の不等式・B（2つの部）----
function ineqTwoClubs() {
    const sets = [['吹奏楽部', '合唱部', '五線紙'], ['美術部', '書道部', '画用紙'], ['科学部', '写真部', '資料のプリント']];
    const range = (P, a, r, s) => [Math.ceil((P + s) / (a + 1)), Math.floor((P - r) / a)];
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const P = getRandomChoice([150, 200, 240, 250, 300]);
        const a1 = getRandomInt(3, 10), r1 = getRandomInt(3, 25), s1 = getRandomInt(3, 25), a2 = getRandomInt(3, 10), r2 = getRandomInt(3, 25), s2 = getRandomInt(3, 25);
        const [lo1, hi1] = range(P, a1, r1, s1), [lo2, hi2] = range(P, a2, r2, s2);
        if (hi1 - lo1 !== 1 || hi2 - lo2 !== 1 || lo1 < 5 || lo2 < 5) continue;                  // 各部とも候補がちょうど 2 通り
        const dcount = {};
        for (let n = lo1; n <= hi1; n++) for (let m = lo2; m <= hi2; m++) { const dd = Math.abs(n - m); (dcount[dd] = dcount[dd] || []).push([n, m]); }
        const ok = Object.entries(dcount).filter(([k, v]) => v.length === 1 && Number(k) >= 1).map(([k, v]) => ({ d: Number(k), nm: v[0] }));   // 差が一意に決まる組だけ
        if (ok.length === 0) continue;
        const pick = getRandomChoice(ok);
        q = { P, a1, r1, s1, a2, r2, s2, lo1, hi1, lo2, hi2, d: pick.d, n: pick.nm[0], m: pick.nm[1] };
    }
    if (!q) q = { P: 200, a1: 5, r1: 18, s1: 5, a2: 7, r2: 10, s2: 5, lo1: 35, hi1: 36, lo2: 26, hi2: 27, d: 8, n: 35, m: 27 };
    const { P, a1, r1, s1, a2, r2, s2, lo1, hi1, lo2, hi2, d, n, m } = q, [A, B, item] = getRandomChoice(sets);
    const dec = (x) => Number(x.toFixed(2));
    return {
        unit: '⑬ 不等式', title: '過不足算の不等式・B',
        text: `ある高校の${A}と${B}に、それぞれ ${P} 枚の${item}があり、両部がそれぞれの部員に配る枚数を検討したところ、次のア〜ウのことが分かった。\nア　${A}の部員に、${item}を 1 人当たり ${a1} 枚ずつ配ると ${r1} 枚以上余り、1 人当たり ${a1 + 1} 枚ずつ配ると ${s1} 枚以上不足する。\nイ　${B}の部員に、${item}を 1 人当たり ${a2} 枚ずつ配ると ${r2} 枚以上余り、1 人当たり ${a2 + 1} 枚ずつ配ると ${s2} 枚以上不足する。\nウ　${A}の部員の人数と${B}の部員の人数の差は ${d} 人である。`,
        prompt: `以上から判断して、${A}の部員の人数と${B}の部員の人数の合計として、正しいのはどれか。`,
        correctAnswer: n + m, unitSuffix: '人', step: 1, consecutive: true,
        steps: [
            `${A}の人数を n 人とする。ア: ${a1}n ＋ ${r1} ≦ ${P}　⇒　n ≦ ${dec((P - r1) / a1)}、${a1 + 1}n ≧ ${P} ＋ ${s1}　⇒　n ≧ ${dec((P + s1) / (a1 + 1))}　⇒　n ＝ ${lo1}、${hi1}`,
            `${B}の人数を m 人とする。イ: ${a2}m ＋ ${r2} ≦ ${P}　⇒　m ≦ ${dec((P - r2) / a2)}、${a2 + 1}m ≧ ${P} ＋ ${s2}　⇒　m ≧ ${dec((P + s2) / (a2 + 1))}　⇒　m ＝ ${lo2}、${hi2}`,
            `ウ: 人数の差が ${d} 人になる組は (n, m) ＝ (${n}, ${m}) だけ（他の組の差は ${[lo1, hi1].flatMap(x => [lo2, hi2].map(y => [x, y])).filter(([x, y]) => !(x === n && y === m)).map(([x, y]) => `(${x}, ${y}) で ${Math.abs(x - y)}`).join('、')}）`,
            `${A}と${B}の人数の合計 ＝ ${n} ＋ ${m} ＝ ${n + m} 人`
        ]
    };
}

// ---- Lv.5 売買損益の不等式・B（半数を売った後に値下げ）----
function ineqStall() {
    const foods = [['焼きそば', '皿'], ['たこ焼き', 'パック'], ['カレー', '皿'], ['フランクフルト', '本']];
    const fr = [[2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [3, 8], [5, 6]];
    let q = null;
    for (let i = 0; i < 300000 && !q; i++) {
        const N = 20 * getRandomInt(12, 45), [a, b] = getRandomChoice(fr), P = 50 * getRandomInt(3, 10);
        if ((a * N) % b !== 0) continue;
        const sold = a * N / b, total = sold * P, pi = 1000 * getRandomInt(5, 40), C = total - pi;
        if (C < 30000 || C > 400000 || C % 1000 !== 0) continue;
        const pmin = 10 * getRandomInt(Math.ceil(P * 0.5 / 10), Math.floor(P * 0.9 / 10)), T2 = (N / 2) * (P + pmin) - C;
        if (T2 % 1000 !== 0 || T2 <= pi || T2 >= N * P - C || pmin < 50) continue;
        q = { N, a, b, P, pi, C, pmin, T2 };
    }
    if (!q) q = { N: 540, a: 2, b: 3, P: 300, pi: 13000, C: 95000, pmin: 200, T2: 40000 };
    const { N, a, b, P, pi, C, pmin, T2 } = q, [food, ctr] = getRandomChoice(foods), days = getRandomChoice([2, 3]), half = N / 2;
    return {
        unit: '⑬ 不等式', title: '売買損益の不等式・B',
        text: `ある大学の学生たちは、${days} 日間続く学園祭に${food}店を出店するため、総額 ${C.toLocaleString()} 円で原材料や必要道具一式を仕入れ、1 ${ctr} ${P} 円で${food}を販売した。この販売価格は、販売予定数の ${b} 分の ${a} が売れると、${pi.toLocaleString()} 円の利益が出る計算で決めたものだったが、ちょうど半数が売れた段階で、販売ペースが見込みを下回っていたことから、残りの半数は値下げ販売することにした。`,
        prompt: `残りをすべて売り切った場合に、${T2.toLocaleString()} 円以上の利益が出るようにするには、値下げ後の価格を 1 ${ctr}何円にまですることができるか。`,
        correctAnswer: pmin, unitSuffix: '円', step: 10, consecutive: true,
        steps: [
            `販売予定数を N ${ctr}とすると、${Fr.str(Fr.make(a, b))}N ${ctr}売れたときの売上は ${P} × ${Fr.str(Fr.make(a, b))}N。利益が ${pi.toLocaleString()} 円なので、${P} × ${Fr.str(Fr.make(a, b))}N － ${C.toLocaleString()} ＝ ${pi.toLocaleString()}`,
            `${Fr.str(Fr.make(a * P, b))}N ＝ ${(C + pi).toLocaleString()}　⇒　N ＝ ${N} ${ctr}（半数は ${half} ${ctr}）`,
            `ちょうど半数 ${half} ${ctr}を ${P} 円で売った売上は ${half} × ${P} ＝ ${(half * P).toLocaleString()} 円。残りの ${half} ${ctr}を 1 ${ctr} x 円で売るとして、(${(half * P).toLocaleString()} ＋ ${half}x) － ${C.toLocaleString()} ≧ ${T2.toLocaleString()}`,
            `${half}x ≧ ${(T2 + C - half * P).toLocaleString()}　⇒　x ≧ ${pmin}　⇒　値下げ後の価格は 1 ${ctr} ${pmin} 円まで`
        ]
    };
}
