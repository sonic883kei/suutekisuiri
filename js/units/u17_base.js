/**
 * u17_base.js  —  ⑰ 記数法
 * 4パターン（過去問の型）:
 *   Lv.1 ？進法から？進法への変換 … b1 進法の数を b2 進法で表す（例: 3進法の202を2進法で）
 *   Lv.2 四則演算               … b1 進法で表された2つの数の積（和・差）を b2 進法で表す（2005 警視庁警察官Ⅲ類 第2回）
 *   Lv.3 暗号                   … ○●の並びで数を表す（●＝1の2進法）。いくつかの例から x を読み取る（2004 東京消防庁Ⅲ類）
 *   Lv.4 変換                   … 10進法の V を n 進法で表すと 1bc になった。同じ n 進法で表された数を10進法に直す（2013 東京消防庁Ⅲ類）
 * 選択肢は、Lv.1・2 は b2 進法の数、Lv.3・4 は10進数。いずれも「答えが一意に決まる条件」を確かめた数値だけを出題する。
 * generate(level): level が 1〜4 ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u17', name: '⑰ 記数法', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        return [baseConvert, baseArithmetic, baseCipher, baseUnknown][lv - 1]();
    }
});

const baseLabels = ['①', '②', '③', '④', '⑤'];
const baseTo = (v, b) => v.toString(b);                       // 10進 → b進（文字列）
const baseFrom = (s, b) => parseInt(s, b);                    // b進（文字列）→ 10進
const baseRandNumeral = (b, len) => { let s = String(getRandomInt(1, b - 1)); for (let i = 1; i < len; i++) s += String(getRandomInt(0, b - 1)); return s; };
// 値の候補（10進）から5択（昇順）を作る。show は値→表示文字列
function baseChoices(correct, wrongs, show) {
    const seen = new Set([correct]), pool = [];
    for (const w of shuffleArray(wrongs)) { if (w > 0 && !seen.has(w)) { seen.add(w); pool.push(w); } if (pool.length === 4) break; }
    return [correct, ...pool].sort((x, y) => x - y).map((v, i) => ({ value: v, label: baseLabels[i], htmlText: `${baseLabels[i]} ${show(v)}`, isCorrect: v === correct }));
}
// 10進 → b進 の割り算の様子（例: 20 ÷ 2 ＝ 10 あまり 0、…）
function baseDivSteps(v, b) { const out = []; let x = v; while (x > 0) { out.push(`${x} ÷ ${b} ＝ ${Math.floor(x / b)} あまり ${x % b}`); x = Math.floor(x / b); } return out.join('、'); }
// b進の数 s の10進への展開（例: 2×3² ＋ 0×3 ＋ 2）
const baseSup = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
function baseExpand(s, b) { const L = s.length; return s.split('').map((d, i) => { const e = L - 1 - i; return e === 0 ? `${d}` : `${d} × ${b}${e === 1 ? '' : baseSup[e]}`; }).join(' ＋ '); }

// ---- Lv.1 ？進法から？進法への変換 ----
function baseConvert() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const b1 = getRandomChoice([3, 3, 4, 5, 6, 7, 8, 9]), b2 = getRandomChoice([2, 2, 2, 3, 4, 5]);
        if (b1 === b2) continue;
        const s = baseRandNumeral(b1, getRandomChoice([3, 3, 4])), v = baseFrom(s, b1);
        if (v >= 12 && v <= 80 && baseTo(v, b2).length <= 8 && s.length >= 3) q = { b1, b2, s, v };
    }
    if (!q) q = { b1: 3, b2: 2, s: '202', v: 20 };
    const { b1, b2, s, v } = q;
    const pos = getRandomInt(0, Math.min(4, v - 1)), customChoices = [0, 1, 2, 3, 4].map(k => { const val = v + (k - pos); return { value: val, label: baseLabels[k], htmlText: `${baseLabels[k]} ${baseTo(val, b2)}`, isCorrect: val === v }; });
    return {
        unit: '⑰ 記数法', title: '？進法から？進法への変換',
        text: `${b1} 進法の ${s} を ${b2} 進法で表す。`,
        prompt: '表した数として正しいのは次のどれか。',
        correctAnswer: v, customChoices,
        steps: [
            `まず 10 進法に直す: ${s}（${b1} 進法）＝ ${baseExpand(s, b1)} ＝ ${v}`,
            `次に ${b2} 進法に直す。${v} を ${b2} で割っていく: ${baseDivSteps(v, b2)}`,
            `あまりを下から順に並べて ${baseTo(v, b2)}（${b2} 進法）`
        ]
    };
}

// ---- Lv.2 四則演算 ----
function baseArithmetic() {
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const b1 = getRandomChoice([3, 3, 4, 5, 6, 7]), b2 = getRandomChoice([2, 2, 3, 4, 5]), op = getRandomChoice(['積', '積', '和', '差']);
        const s1 = baseRandNumeral(b1, getRandomInt(2, 3)), s2 = baseRandNumeral(b1, getRandomInt(2, 3)), v1 = baseFrom(s1, b1), v2 = baseFrom(s2, b1);
        if (s1 === s2 || v1 < 3 || v2 < 3 || (op === '差' && v1 <= v2)) continue;
        const r = op === '積' ? v1 * v2 : (op === '和' ? v1 + v2 : v1 - v2);
        if (r >= 8 && r <= 200 && baseTo(r, b2).length <= 8) q = { b1, b2, op, s1, s2, v1, v2, r };
    }
    if (!q) q = { b1: 3, b2: 2, op: '積', s1: '10', s2: '100', v1: 3, v2: 9, r: 27 };
    const { b1, b2, op, s1, s2, v1, v2, r } = q, sym = { 積: '×', 和: '＋', 差: '－' }[op];
    const others = [v1 * v2, v1 + v2, Math.abs(v1 - v2)].filter(x => x !== r), wrongs = [...others, r - 1, r + 1, r - 2, r + 2, r - 3, r + 3, r + 4, r - 4];
    const customChoices = baseChoices(r, wrongs, x => baseTo(x, b2));
    return {
        unit: '⑰ 記数法', title: '四則演算',
        text: `${b1} 進法で表された 2 つの数、${s1} と ${s2} がある。`,
        prompt: `その${op}${op === '差' ? '（大きい方から小さい方をひいた数）' : ''}を ${b2} 進法で表した数として、正しいものはどれか。`,
        correctAnswer: r, customChoices,
        steps: [
            `それぞれを 10 進法に直す: ${s1}（${b1} 進法）＝ ${baseExpand(s1, b1)} ＝ ${v1}、${s2}（${b1} 進法）＝ ${baseExpand(s2, b1)} ＝ ${v2}`,
            `${op}を計算: ${v1} ${sym} ${v2} ＝ ${r}`,
            `${r} を ${b2} 進法に直す: ${baseDivSteps(r, b2)}　⇒　あまりを下から順に並べて ${baseTo(r, b2)}`
        ]
    };
}

// ---- Lv.3 暗号（○●で数を表す：●＝1の2進法）----
function baseCipher() {
    const pop = (n) => n.toString(2).split('1').length - 1;
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const w = getRandomChoice([5, 5, 6]), max = 2 ** w - 1, B = getRandomInt(8, max), x = getRandomInt(9, max);
        if (pop(B) < 2 || x === B || pop(x) < 2 || x < 10) continue;
        q = { w, B, x };
    }
    if (!q) q = { w: 5, B: 24, x: 20 };
    const { w, B, x } = q, pat = (n) => n.toString(2).padStart(w, '0').replace(/1/g, '●').replace(/0/g, '○');
    return {
        unit: '⑰ 記数法', title: '暗号',
        text: `1、2、3、${B} をそれぞれ次のように表した。\n${pat(1)}　1\n${pat(2)}　2\n${pat(3)}　3\n${pat(B)}　${B}\n${pat(x)}　x`,
        prompt: 'このとき、x はいくつか。',
        correctAnswer: x, unitSuffix: '', step: 1, consecutive: true,
        steps: [
            `1、2、3 の表し方から、●を 1、○を 0 とした 2 進法で表していると分かる（1 ＝ ${'0'.repeat(w - 1)}1、2 ＝ ${'0'.repeat(w - 2)}10、3 ＝ ${'0'.repeat(w - 2)}11）`,
            `${B} ＝ ${B.toString(2)}（2 進法）は ${pat(B)} で、確かに合っている。左から ${Array.from({ length: w }, (_, i) => 2 ** (w - 1 - i)).join('、')} の位を表す`,
            `x の並び ${pat(x)} は ${x.toString(2).padStart(w, '0')}（2 進法）＝ ${x.toString(2).padStart(w, '0').split('').map((d, i) => d === '1' ? 2 ** (w - 1 - i) : null).filter(v => v !== null).join(' ＋ ')} ＝ ${x}`
        ]
    };
}

// ---- Lv.4 変換（未知の n 進法）----
function baseUnknown() {
    const valueIn = (digits, b) => digits.split('').reduce((acc, d) => acc * b + Number(d), 0);
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const n = getRandomInt(4, 9), bb = getRandomInt(1, n - 1), cc = getRandomInt(0, n - 1), digs = `1${bb}${cc}`, V = valueIn(digs, n);
        const asked = String(getRandomInt(1, n - 1)) + String(getRandomInt(0, n - 1)) + String(getRandomInt(0, n - 1));
        if (asked === digs) continue;
        const maxD = Math.max(...digs.split('').map(Number));
        const bases = []; for (let b = maxD + 1; b <= 30; b++) if (valueIn(digs, b) === V) bases.push(b);
        if (bases.length !== 1) continue;
        const ans = valueIn(asked, n);
        if (ans >= 20 && ans <= 300) q = { n, bb, cc, digs, V, asked, ans };
    }
    if (!q) q = { n: 5, bb: 4, cc: 2, digs: '142', V: 47, asked: '243', ans: 73 };
    const { n, bb, cc, digs, V, asked, ans } = q;
    const alt = (b) => (asked.split('').every(d => Number(d) < b) ? valueIn(asked, b) : null);
    const wrongs = [alt(n + 1), alt(n - 1), alt(n + 2), alt(10), ans - 4, ans + 4, ans - 8, ans + 9, ans - 3, ans + 3].filter(x => x !== null && x > 0);
    const customChoices = baseChoices(ans, wrongs, x => String(x));
    return {
        unit: '⑰ 記数法', title: '変換',
        text: `10 進法の ${V} を n 進法で表すと ${digs} になった。`,
        prompt: `それと同じ n 進法で表された ${asked} を 10 進法で表したときの値として、最も妥当なのはどれか。`,
        correctAnswer: ans, customChoices,
        steps: [
            `n 進法の ${digs} は 1 × n² ＋ ${bb} × n ＋ ${cc} なので、n² ＋ ${bb}n ＋ ${cc} ＝ ${V}`,
            `n² ＋ ${bb}n ＝ ${V - cc}　⇒　n × (n ＋ ${bb}) ＝ ${V - cc}。差が ${bb} の 2 つの整数の積が ${V - cc} になるものを探すと ${n} × ${n + bb} ＝ ${V - cc}　⇒　n ＝ ${n}（各位の数字 ${Math.max(...digs.split('').map(Number))} より大きい）`,
            `${n} 進法の ${asked} ＝ ${baseExpand(asked, n)} ＝ ${ans}`
        ]
    };
}
