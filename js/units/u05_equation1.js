/**
 * u05_equation1.js  —  ⑤ 一次方程式
 * 4パターン（過去問の型）:
 *   Lv.1 [＝]の関係     … A・Bの貯金（Aは一定額を数か月ごと、Bは初めの貯金と同額を毎月）→ Aの初めの貯金額（2007 刑務官）
 *   Lv.2 相当算         … 仕入れた数の a/b が売れ、翌日に1日目に売れた数の c/d が売れ、R 個残った → 仕入れた数（2007 刑務官）
 *   Lv.3 全体数の分割・A … 「d1人に1人は〜、d2人に1人は〜」の合計が T 人 → 全体の人数（2010 海上保安学校）
 *   Lv.4 相当算・B      … 1日目に全体の p/a より x 多く、2日目に残りの q/b より y 多く読み、未読が全体の u/c → 全ページ数（2009 東京都Ⅲ類）
 * 相当算の分数はすべて既約分数。問題文・解説では {{分子/分母}} と書くと画面で縦書きの分数になる（core.js の Fr / renderRich）。
 * generate(level): level が 1〜4ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u5', name: '⑤ 一次方程式', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        if (lv === 1) return eqSavings();
        if (lv === 2) return eqFractionSold();
        if (lv === 3) return eqSplitTotal();
        return eqBookPages();
    }
});

const eqLcm = (a, b) => (a / Fr.gcd(a, b)) * b;
const eqYen = (v) => {   // 1000→千円 / 2000→2千円 / 10000→1万円 / 12000→1万2千円 / 100000→10万円
    if (v % 1000 !== 0) return `${v}円`;                       // 500円など
    if (v % 10000 === 0) return `${v / 10000}万円`;
    const man = Math.floor(v / 10000), sen = (v % 10000) / 1000;
    return (man ? `${man}万` : '') + (sen === 1 && !man ? '千' : `${sen}千`) + '円';
};

// ---- Lv.1 [＝]の関係（貯金）----
function eqSavings() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const m = getRandomChoice([2, 3, 4]), T = getRandomChoice([10, 12, 15, 18, 20, 24, 30]);
        if (T % m !== 0) continue;
        const per = getRandomChoice([500, 1000, 1000, 2000]), S = 1000 * getRandomInt(5, 20), b = 1000 * getRandomInt(1, 9), a = S - b;
        if (a < 1000) continue;
        const X = per * (T / m), U = S + X + T * b;
        if (U % 10000 !== 0 || U > 500000) continue;
        q = { m, T, per, S, a, b, X, U };
    }
    if (!q) q = { m: 2, T: 20, per: 1000, S: 10000, a: 6000, b: 4000, X: 10000, U: 100000 };
    const { m, T, per, S, a, b, X, U } = q;
    return {
        unit: '⑤ 一次方程式', title: '[＝]の関係',
        text: `A、Bは同じ月から積み立てを始めることにした。積み立て開始前における 2 人の貯金の合計額は${eqYen(S)}であり、Aは${eqYen(per)}を ${m} か月ごとに、Bは自分の初めの貯金と同額を毎月積み立てていくことにした。`,
        prompt: `積み立てを始めてから ${T} か月目にA、Bの貯金の合計額が${eqYen(U)}になるとすると、Aの初めの貯金額はいくらか。`,
        correctAnswer: a / 1000, unitSuffix: '千円', step: 1, consecutive: true,
        steps: [
            `Aの初めの貯金を a 円、Bの初めの貯金を b 円とすると、a ＋ b ＝ ${S}（円）`,
            `Aは ${T} か月間に ${per} 円を ${T / m} 回積み立てるので、増える額は ${per} × ${T / m} ＝ ${X} 円　⇒　Aの貯金は a ＋ ${X}`,
            `Bは毎月 b 円を ${T} 回積み立てるので、増える額は ${T}b 円　⇒　Bの貯金は b ＋ ${T}b ＝ ${T + 1}b`,
            `合計: (a ＋ ${X}) ＋ ${T + 1}b ＝ ${U}。a ＝ ${S} － b を代入すると ${S} － b ＋ ${X} ＋ ${T + 1}b ＝ ${U}`,
            `${T}b ＝ ${U - S - X}　⇒　b ＝ ${b}（円）　⇒　a ＝ ${S} － ${b} ＝ ${a} 円（${a / 1000} 千円）`
        ]
    };
}

// ---- Lv.2 相当算（売れた割合から仕入れた数を求める）----
function eqFractionSold() {
    const items = [['洗剤', '個'], ['石けん', '個'], ['ノート', '冊'], ['缶詰', '個'], ['タオル', '枚'], ['電池', '個']];
    const dens = [3, 4, 5, 6, 7, 8, 9, 10, 12];
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const b = getRandomChoice(dens), a = getRandomInt(1, b - 1), d = getRandomChoice(dens), c = getRandomInt(1, d - 1);
        if (Fr.gcd(a, b) !== 1 || Fr.gcd(c, d) !== 1) continue;                 // 既約分数のみ
        const f1 = Fr.make(a, b), g = Fr.make(c, d), f2 = Fr.mul(g, f1), sold = Fr.add(f1, f2), rem = Fr.sub(Fr.make(1), sold);
        if (rem.n <= 0 || rem.d > 60) continue;                                   // 残りの割合の分母は60以下（解きやすい範囲）
        const cands = [];
        for (let n = 60; n <= 400; n++) {
            if (n % rem.d !== 0 || n % b !== 0) continue;
            const day1 = n * a / b;
            if ((day1 * c) % d !== 0) continue;
            const R = n * rem.n / rem.d;
            if (R >= 5 && R <= 60) cands.push(n);
        }
        if (cands.length === 0) continue;
        q = { a, b, c, d, f1, g, f2, sold, rem, n: getRandomChoice(cands) };
    }
    if (!q) { const f1 = Fr.make(5, 8), g = Fr.make(2, 5), f2 = Fr.mul(g, f1), sold = Fr.add(f1, f2); q = { a: 5, b: 8, c: 2, d: 5, f1, g, f2, sold, rem: Fr.sub(Fr.make(1), sold), n: 136 }; }
    const { a, b, c, d, f1, g, f2, sold, rem, n } = q, R = n * rem.n / rem.d;
    const [item, ctr] = getRandomChoice(items);
    return {
        unit: '⑤ 一次方程式', title: '相当算',
        text: `ある店で${item}を仕入れ、1 日目は仕入れた数の${Fr.str(f1)}が売れた。翌日には 1 日目に売れた数の${Fr.str(g)}が売れたが、まだ ${R} ${ctr}残っていた。`,
        prompt: `仕入れた${item}の数はいくつか。`,
        correctAnswer: n, unitSuffix: ctr, step: Math.max(5, Math.round(n * 0.1 / 5) * 5),
        steps: [
            `仕入れた数を x ${ctr}とすると、1 日目に売れたのは ${Fr.str(f1)}x`,
            `翌日に売れたのは 1 日目に売れた数の${Fr.str(g)}なので、${Fr.str(g)} × ${Fr.str(f1)}x ＝ ${Fr.str(f2)}x`,
            `2 日間で売れた割合: ${Fr.str(f1)} ＋ ${Fr.str(f2)} ＝ ${Fr.str(sold)}`,
            `残りの割合: 1 － ${Fr.str(sold)} ＝ ${Fr.str(rem)}　⇒　${Fr.str(rem)}x ＝ ${R}`,
            `x ＝ ${R} ÷ ${Fr.str(rem)} ＝ ${R} × ${rem.n === 1 ? rem.d : Fr.str(Fr.make(rem.d, rem.n))} ＝ ${n} ${ctr}`
        ]
    };
}

// ---- Lv.3 全体数の分割・A（d人に1人は〜）----
function eqSplitTotal() {
    const regions = ['ヨーロッパ', 'アジア', 'アメリカ', 'アフリカ', 'オセアニア'];
    const kanji = { 3: '三つ', 4: '四つ' };
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const cnt = getRandomChoice([3, 4, 4, 4]), pool = shuffleArray([3, 4, 5, 6, 8, 9, 10, 12]).slice(0, cnt).sort((x, y) => x - y);
        let S = Fr.make(0); pool.forEach(dn => { S = Fr.add(S, Fr.make(1, dn)); });
        if (S.n >= S.d || S.n * 100 < 45 * S.d) continue;                       // 合計は 45％以上 100％未満
        const L = pool.reduce((x, y) => eqLcm(x, y), 1), cands = [];
        if (L > 120) continue;
        for (let N = L; N <= 720; N += L) if (N >= 200) cands.push(N);
        if (cands.length === 0) continue;
        const N = getRandomChoice(cands);
        q = { cnt, pool, S, L, N, T: N * S.n / S.d };
    }
    if (!q) { let S = Fr.make(0); [3, 4, 5, 6].forEach(dn => { S = Fr.add(S, Fr.make(1, dn)); }); q = { cnt: 4, pool: [3, 4, 5, 6], S, L: 60, N: 360, T: 342 }; }
    const { cnt, pool, S, L, N, T } = q;
    const names = shuffleArray(regions).slice(0, cnt);
    const clauses = pool.map((dn, i) => `${dn} 人に 1 人は${names[i]}から`).join('、');
    const common = pool.map(dn => L / dn);
    return {
        unit: '⑤ 一次方程式', title: '全体数の分割・A',
        text: `ある国際スポーツ大会に参加した選手についてみると、${clauses}の参加者であり、これら${kanji[cnt]}の地域からの参加者は合計で ${T} 人であった。`,
        prompt: 'この大会に参加した選手は全体で何人か。',
        correctAnswer: N, unitSuffix: '人', step: 10,
        steps: [
            `全体の人数を x 人とすると、各地域の割合は ${pool.map(dn => Fr.str(Fr.make(1, dn))).join('、')}`,
            `合計の割合: ${pool.map(dn => Fr.str(Fr.make(1, dn))).join(' ＋ ')} ＝ ${common.map(c => `{{${c}/${L}}}`).join(' ＋ ')} ＝ {{${S.n * L / S.d}/${L}}}${S.n * L / S.d === S.n && L === S.d ? '' : ` ＝ ${Fr.str(S)}（約分）`}`,
            `${Fr.str(S)}x ＝ ${T}`,
            `x ＝ ${T} ÷ ${Fr.str(S)} ＝ ${T} × ${Fr.str(Fr.make(S.d, S.n))} ＝ ${N} 人`
        ]
    };
}

// ---- Lv.4 相当算・B（本を読む：「全体の p/a より x 多く」「残りの q/b より y 多く」）----
function eqBookPages() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const a = getRandomChoice([2, 3, 4, 5]), b = getRandomChoice([2, 3, 4, 5]);
        const p1 = getRand() < 0.7 ? 1 : getRandomInt(1, a - 1), p2 = getRand() < 0.7 ? 1 : getRandomInt(1, b - 1);
        if (Fr.gcd(p1, a) !== 1 || Fr.gcd(p2, b) !== 1) continue;
        const x = 5 * getRandomInt(2, 10), y = 5 * getRandomInt(2, 10);
        if ((p2 * x) % b !== 0) continue;                                        // 解説の定数項を整数にするため
        const N = 30 * getRandomInt(5, 30);
        if ((p1 * N) % a !== 0) continue;
        const rem1 = N - p1 * N / a - x;
        if (rem1 <= 0 || (p2 * rem1) % b !== 0) continue;
        const unread = rem1 - (p2 * rem1 / b + y), ratio = Fr.make(unread, N);
        if (unread <= 0 || ratio.d < 3 || ratio.d > 12 || ratio.n > 5) continue;  // 最後の分数は既約で見やすいもの
        q = { a, b, p1, p2, x, y, N, ratio };
    }
    if (!q) q = { a: 3, b: 2, p1: 1, p2: 1, x: 30, y: 25, N: 480, ratio: Fr.make(1, 4) };
    const { a, b, p1, p2, x, y, N, ratio } = q;
    const r1 = Fr.make(a - p1, a), K = Fr.mul(Fr.make(b - p2, b), r1), c0 = (b - p2) * x / b + y, D = Fr.sub(K, ratio);
    return {
        unit: '⑤ 一次方程式', title: '相当算・B',
        text: `ある人が本を読み始め、1 日目は全ページ数の${Fr.str(Fr.make(p1, a))}より ${x} ページ多く読み、2 日目は 1 日目に読んでいないページ数の${Fr.str(Fr.make(p2, b))}より ${y} ページ多く読んだところ、読んでいないページ数は全ページ数のちょうど${Fr.str(ratio)}となった。`,
        prompt: 'この本の全ページ数として、正しいのはどれか。',
        correctAnswer: N, unitSuffix: 'ページ', step: Math.max(10, Math.round(N * 0.06 / 10) * 10),
        steps: [
            `全ページ数を x ページとすると、1 日目に読んだのは ${Fr.str(Fr.make(p1, a))}x ＋ ${x}。1 日目に読んでいないのは x － ${Fr.str(Fr.make(p1, a))}x － ${x} ＝ ${Fr.str(r1)}x － ${x}`,
            `2 日目に読んだのは ${Fr.str(Fr.make(p2, b))}(${Fr.str(r1)}x － ${x}) ＋ ${y}`,
            `2 日目が終わって読んでいないのは (${Fr.str(r1)}x － ${x}) － [${Fr.str(Fr.make(p2, b))}(${Fr.str(r1)}x － ${x}) ＋ ${y}] ＝ ${Fr.str(Fr.make(b - p2, b))}(${Fr.str(r1)}x － ${x}) － ${y} ＝ ${Fr.str(K)}x － ${c0}`,
            `これが全ページ数の${Fr.str(ratio)}なので、${Fr.str(K)}x － ${c0} ＝ ${Fr.str(ratio)}x`,
            `(${Fr.str(K)} － ${Fr.str(ratio)})x ＝ ${c0}　⇒　${Fr.str(D)}x ＝ ${c0}　⇒　x ＝ ${c0} ÷ ${Fr.str(D)} ＝ ${N} ページ`
        ]
    };
}
