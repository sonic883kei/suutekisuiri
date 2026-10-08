/**
 * u02_age.js  —  ② 年齢
 * 4パターン（過去問の型）:
 *   Lv.1 年齢算の基本      … ○年後に親の年齢が子の m 倍になるのは何年後か（例: 年齢問題の基本）
 *   Lv.2 倍数関係の年齢算  … 現在 親＝子の k 倍、n年後に m 倍 → 現在の親の年齢（例: 2015東京消防庁Ⅱ類）
 *   Lv.3 連立方程式型      … 「親の a 倍は子の b 倍より d 歳多い」＋ n 年前に親は子の m 倍 → 現在の子の年齢（例: 2015裁判所一般職）
 * いずれも「答えが正の整数になる条件」から逆算して数値を抽選する。
 * generate(level): level が 1〜4 ならそのパターン、それ以外は4パターンからランダム。
 */
UnitRegistry.register({
    id: 'u2', name: '② 年齢', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 4);
        if (lv === 1) return ageBasic();
        if (lv === 2) return ageMultiple();
        if (lv === 3) return ageSimultaneous();
        return ageThreePeople();
    }
});

const ageCo = (v) => (v === 1 ? '' : v);   // 係数1は省略して表示（1x → x）

// ---- Lv.1 年齢算の基本 ----
function ageBasic() {
    const [kid, par] = getRandomChoice([['A君', '母親'], ['B君', '父親'], ['Cさん', '母親'], ['D君', '父親'], ['Eさん', '父親']]);
    let a, m, x, p;
    for (let i = 0; i < 1000; i++) {
        a = getRandomInt(6, 15); m = getRandomChoice([2, 3, 4]); x = getRandomInt(2, 10);
        p = m * (a + x) - x;                       // x年後に p+x = m(a+x) となるよう逆算
        if (p <= 60 && p > a + 15) break;
    }
    const diff = p - a;
    return {
        unit: '② 年齢', title: '年齢算の基本',
        text: `現在、${kid}の年齢は ${a} 歳で、${par}の年齢は ${p} 歳である。`,
        prompt: `このとき、${par}の年齢が${kid}の年齢の ${m} 倍になるのは、今から何年後か。`,
        correctAnswer: x, unitSuffix: '年後', step: 1, consecutive: true,
        steps: [
            `x 年後とすると、${p} ＋ x ＝ ${m} × (${a} ＋ x)`,
            `${p} ＋ x ＝ ${m * a} ＋ ${m}x　⇒　${p - m * a} ＝ ${ageCo(m - 1)}x　⇒　x ＝ ${x}`,
            `【別解】年齢差は一定で ${diff} 歳。${m} 倍のとき、差は子の年齢の ${m - 1} 倍にあたるので、子の年齢は ${diff} ÷ ${m - 1} ＝ ${diff / (m - 1)} 歳。${diff / (m - 1)} － ${a} ＝ ${x} 年後`
        ]
    };
}

// ---- Lv.2 倍数関係の年齢算（現在の親の年齢を求める）----
function ageMultiple() {
    const par = getRandomChoice(['父親', '母親']);
    let k, m, n, c;
    for (let i = 0; i < 2000; i++) {
        k = getRandomInt(3, 8); m = getRandomInt(2, k - 1); n = getRandomInt(2, 12);
        if (((m - 1) * n) % (k - m) !== 0) continue;
        c = ((m - 1) * n) / (k - m);
        if (c >= 4 && c <= 14 && k * c <= 60) break;
        c = null;
    }
    if (!c) { k = 5; m = 3; n = 5; c = 5; }
    const f = k * c;
    return {
        unit: '② 年齢', title: '倍数関係の年齢算',
        text: `現在の${par}の年齢は、子どもの年齢の ${k} 倍である。今から ${n} 年後に、${par}の年齢が子どもの年齢の ${m} 倍になるとする。`,
        prompt: `現在の${par}の年齢として、最も妥当なのはどれか。`,
        correctAnswer: f, unitSuffix: '歳', step: f % 5 === 0 ? 5 : 1, consecutive: true,
        steps: [
            `現在の子どもの年齢を x 歳とすると、${par}は ${k}x 歳`,
            `${n} 年後: ${k}x ＋ ${n} ＝ ${m} × (x ＋ ${n})`,
            `${k}x ＋ ${n} ＝ ${m}x ＋ ${m * n}　⇒　${ageCo(k - m)}x ＝ ${(m - 1) * n}　⇒　x ＝ ${c}`,
            `現在の${par}の年齢: ${k} × ${c} ＝ ${f} 歳`
        ]
    };
}

// ---- Lv.3 連立方程式型（現在の子どもの年齢を求める）----
function ageSimultaneous() {
    const par = getRandomChoice(['父親', '母親']);
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const c = getRandomInt(10, 20), f = c + getRandomInt(22, 34), n = getRandomInt(3, c - 2);
        if ((f - n) % (c - n) !== 0) continue;
        const m = (f - n) / (c - n);
        if (m < 3 || m > 8) continue;
        const a = getRandomInt(2, 4);
        for (let b = 2; b <= 14; b++) {
            const d = a * f - b * c;
            if (d >= 1 && d <= 9 && a * m !== b) { q = { c, f, n, m, a, b, d }; break; }
        }
    }
    if (!q) q = { c: 16, f: 44, n: 9, m: 5, a: 3, b: 8, d: 4 };
    const { c, f, n, m, a, b, d } = q;
    return {
        unit: '② 年齢', title: '連立方程式型の年齢算',
        text: `現在、${par}の年齢の ${a} 倍は、子どもの年齢の ${b} 倍より ${d} 歳多い。${n} 年前には、${par}の年齢は子どもの年齢の ${m} 倍であった。`,
        prompt: '現在の子どもの年齢は何歳か。',
        correctAnswer: c, unitSuffix: '歳', step: 1, consecutive: true,
        steps: [
            `現在の${par}を x 歳、子どもを y 歳とすると、${a}x ＝ ${b}y ＋ ${d} …①`,
            `${n} 年前: x － ${n} ＝ ${m}(y － ${n})　⇒　x ＝ ${m}y － ${(m - 1) * n} …②`,
            `②を①に代入: ${a}(${m}y － ${(m - 1) * n}) ＝ ${b}y ＋ ${d}　⇒　${a * m}y － ${a * (m - 1) * n} ＝ ${b}y ＋ ${d}`,
            `${ageCo(a * m - b)}y ＝ ${d + a * (m - 1) * n}　⇒　y ＝ ${c}（${par}は ${f} 歳）`,
            `【検算】${a} × ${f} ＝ ${a * f}、${b} × ${c} ＋ ${d} ＝ ${b * c + d} ／ ${n} 年前: ${f - n} ＝ ${m} × ${c - n} ✓`
        ]
    };
}

// ---- Lv.4 登場人物3人型（A・Aの父・Aの母の平均年齢）----
function ageThreePeople() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const m = getRandomChoice([2, 3, 3, 4]);                 // 過去に「母の年齢がAの m 倍」になった
        const g = getRandomInt(20, 32);                          // 母が g 歳のときにAが生まれた
        if (g % (m - 1) !== 0) continue;
        const past = g / (m - 1);                                // そのときのAの年齢
        if (past < 5) continue;
        const d = getRandomInt(1, 8);                            // 父は母より d 歳年上
        if ((2 * g + d) % 3 !== 0) continue;                     // 平均年齢が整数になる条件
        const x = getRandomInt(past + 2, 45);                    // 現在のAの年齢（過去より後）
        if (x + g > 65) continue;
        q = { m, g, past, d, x, f: m * past + d, avg: x + (2 * g + d) / 3 };
    }
    if (!q) q = { m: 3, g: 24, past: 12, d: 3, x: 27, f: 39, avg: 44 };
    const { m, g, past, d, x, f, avg } = q;
    return {
        unit: '② 年齢', title: '3人の年齢算',
        text: `現在、A、Aの父、Aの母の3人の平均年齢は ${avg} 歳である。母が ${g} 歳のときにAが生まれ、母の年齢がAの年齢の ${m} 倍になったとき、父の年齢は ${f} 歳であった。`,
        prompt: 'このとき、現在のAの年齢は何歳か。',
        correctAnswer: x, unitSuffix: '歳', step: 1, consecutive: true,
        steps: [
            `母が ${g} 歳のときにAが生まれたので、母はAより ${g} 歳年上`,
            `母の年齢がAの ${m} 倍になったときのAを y 歳とすると、${g} ＋ y ＝ ${m}y　⇒　${ageCo(m - 1)}y ＝ ${g}　⇒　y ＝ ${past}（そのとき母は ${m * past} 歳）`,
            `そのとき父は ${f} 歳なので、父は母より ${f} － ${m * past} ＝ ${d} 歳年上（年齢差は一定）`,
            `現在のAを x 歳とすると、母は x ＋ ${g} 歳、父は x ＋ ${g + d} 歳`,
            `3人の年齢の合計: ${avg} × 3 ＝ ${avg * 3} なので、x ＋ (x ＋ ${g}) ＋ (x ＋ ${g + d}) ＝ ${avg * 3}`,
            `3x ＋ ${2 * g + d} ＝ ${avg * 3}　⇒　3x ＝ ${avg * 3 - 2 * g - d}　⇒　x ＝ ${x} 歳（母 ${x + g} 歳、父 ${x + g + d} 歳）`
        ]
    };
}
