/**
 * u14_work.js  —  ⑭ 仕事算
 * 5パターン（過去問の型）:
 *   Lv.1 仕事算の基本           … Aだけだと x 日、Bだけだと y 日 → 2人でやるときの日数（2013 特別区 身体障害者対象）
 *   Lv.2 3人以上の仕事算        … A・B・C、AとC、Cだけの所要時間 → BとCの2人の所要時間（2012 東京消防庁Ⅲ類）
 *   Lv.3 仕事の交替             … Aが途中でBと交替して T 日で終了 → Aが仕事をした日数（2016 裁判所一般職 高卒者区分）
 *   Lv.4 のべ算                 … 同じ性能のポンプ N 台で D かかる。途中でポンプを追加して終了時刻が分かる → 追加した時刻（2010 裁判所事務官Ⅲ種）
 *   Lv.5 2通りで表された仕事量   … 「Aだけで a1 分→Bだけで b1 分」と「AとBで a2 分→Bだけで b2 分」で空になる → Aだけで空にする時間（2015 特別区Ⅲ類）
 * いずれも「答えが整数になる条件」から逆算して数値を抽選する。分数は既約分数（{{分子/分母}} 記法 → 縦書き分数）。
 * generate(level): level が 1〜5 ならそのパターン、それ以外は5パターンからランダム。
 */
UnitRegistry.register({
    id: 'u14', name: '⑭ 仕事算', chap: 1,
    generate(level) {
        const lv = [1, 2, 3, 4, 5].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 5);
        return [workBasic, workThree, workSwitch, workPumps, workTwoWays][lv - 1]();
    }
});

const workLabels = ['①', '②', '③', '④', '⑤'];
const workCo = (c) => (c === 1 ? '' : c);                      // 係数1は省略（1a → a）
const workLcm = (a, b) => (a / Fr.gcd(a, b)) * b;
const workDur = (m) => (m % 60 === 0 ? `${m / 60}時間` : (m < 60 ? `${m}分` : `${Math.floor(m / 60)}時間${m % 60}分`));
const workClock = (m) => { const ap = m < 720 ? '午前' : '午後', h = Math.floor(m / 60) % 12, mm = m % 60; return `${ap}${h}時${mm ? mm + '分' : ''}`; };   // 12:40 → 午後0時40分

// ---- Lv.1 仕事算の基本 ----
function workBasic() {
    let q = null;
    for (let i = 0; i < 20000 && !q; i++) {
        const x = getRandomInt(3, 40), y = getRandomInt(3, 40);
        if (x === y || (x * y) % (x + y) !== 0) continue;
        const t = x * y / (x + y);
        if (t >= 2) q = { x, y, t };
    }
    if (!q) q = { x: 10, y: 15, t: 6 };
    const { x, y, t } = q, u = getRandomChoice(['日', '日', '時間']), step = t >= 20 ? 2 : 1;
    const fx = Fr.make(1, x), fy = Fr.make(1, y), fs = Fr.add(fx, fy);
    return {
        unit: '⑭ 仕事算', title: '仕事算の基本',
        text: `ある仕事を全て終えるのにAだけで行うと ${x} ${u}、Bだけで行うと ${y} ${u}を要する。ただし、A、Bそれぞれの 1 ${u === '日' ? '日' : '時間'}当たりの仕事量は一定とする。`,
        prompt: `このとき、A、Bの 2 人でこの仕事を終えるのに要する${u === '日' ? '日数' : '時間'}はどれか。`,
        correctAnswer: t, unitSuffix: u, step, consecutive: true,
        steps: [
            `仕事全体を 1 とすると、Aは 1 ${u === '日' ? '日' : '時間'}で ${Fr.str(fx)}、Bは 1 ${u === '日' ? '日' : '時間'}で ${Fr.str(fy)} の仕事をする`,
            `2 人でやると 1 ${u === '日' ? '日' : '時間'}で ${Fr.str(fx)} ＋ ${Fr.str(fy)} ＝ ${Fr.str(fs)}`,
            `全体 1 を ${Fr.str(fs)} ずつ進めるので、1 ÷ ${Fr.str(fs)} ＝ ${t} ${u}`
        ]
    };
}

// ---- Lv.2 3人以上の仕事算 ----
function workThree() {
    const contexts = [
        ['ある商店街では年に一度ドミノ大会が行われる。商店街と同じ地区に住むA、B、Cは大会当日に向け、ドミノの配列を担当することになった。', '並べる'],
        ['あるイベントの会場設営を、A、B、Cの 3 人で担当することになった。', '設営する'],
        ['ある学校の文化祭で、A、B、Cの 3 人が看板づくりを担当することになった。', '仕上げる']
    ];
    let q = null;
    for (let i = 0; i < 50000 && !q; i++) {
        const ra = getRandomInt(1, 9), rb = getRandomInt(1, 9), rc = getRandomInt(1, 6);
        const sums = [ra + rb + rc, ra + rc, rc, rb + rc], W = sums.slice(0, 3).reduce((x, y) => workLcm(x, y), 1) * getRandomInt(1, 4);
        if (new Set([ra, rb, rc]).size < 3 || W % (rb + rc) !== 0) continue;
        const t1 = W / (ra + rb + rc), t2 = W / (ra + rc), t3 = W / rc, ans = W / (rb + rc);
        if (t3 <= 100 && t1 >= 2 && t2 >= 3 && ans >= 3 && W <= 240) q = { ra, rb, rc, W, t1, t2, t3, ans };
    }
    if (!q) q = { ra: 3, rb: 2, rc: 1, W: 48, t1: 8, t2: 12, t3: 48, ans: 16 };
    const { ra, rb, rc, W, t1, t2, t3, ans } = q, [ctx, verb] = getRandomChoice(contexts);
    return {
        unit: '⑭ 仕事算', title: '3人以上の仕事算',
        text: `${ctx}A、B、Cの 3 人で${verb}と ${t1} 時間、AとCの 2 人で${verb}と ${t2} 時間、Cが 1 人で${verb}と ${t3} 時間かかるという。`,
        prompt: `BとCの 2 人で${verb}ときにかかる時間として、最も妥当なのはどれか。`,
        correctAnswer: ans, unitSuffix: '時間', step: Math.max(1, Math.round(ans * 0.12)),
        steps: [
            `全体の仕事量を ${t1}、${t2}、${t3} の最小公倍数 ${W} とすると、1 時間あたりの仕事量は A、B、C の 3 人で ${W} ÷ ${t1} ＝ ${ra + rb + rc}、AとCで ${W} ÷ ${t2} ＝ ${ra + rc}、Cで ${W} ÷ ${t3} ＝ ${rc}`,
            `A ＝ ${ra + rc} － ${rc} ＝ ${ra}、B ＝ ${ra + rb + rc} － ${ra + rc} ＝ ${rb}`,
            `BとCの 2 人では 1 時間あたり ${rb} ＋ ${rc} ＝ ${rb + rc}`,
            `かかる時間 ＝ ${W} ÷ ${rb + rc} ＝ ${ans} 時間`
        ]
    };
}

// ---- Lv.3 仕事の交替 ----
function workSwitch() {
    const jobs = ['ペンキ塗り', '草むしり', '資料の入力', '倉庫の整理'];
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const x = getRandomInt(4, 40), y = getRandomInt(4, 40), T = getRandomInt(5, 30);
        if (x === y) continue;
        for (let kk = 1; kk < T; kk++) if (kk * y + (T - kk) * x === x * y) { q = { x, y, T, k: kk }; break; }
    }
    if (!q) q = { x: 12, y: 8, T: 10, k: 6 };
    const { x, y, T, k } = q, job = getRandomChoice(jobs), askA = getRand() < 0.7, W = workLcm(x, y), ra = W / x, rb = W / y;
    return {
        unit: '⑭ 仕事算', title: '仕事の交替',
        text: `${job}をAが 1 人で行うと ${x} 日かかり、Bが 1 人で行うと ${y} 日かかる。${job}を、初めはAが 1 人で行い、途中でBと交替して行ったところ、${T} 日で終わった。`,
        prompt: `このとき、${askA ? 'A' : 'B'}が${job}を行った日数は何日か。`,
        correctAnswer: askA ? k : T - k, unitSuffix: '日', step: 1, consecutive: true,
        steps: [
            `全体の仕事量を ${x} と ${y} の最小公倍数 ${W} とすると、Aは 1 日に ${W} ÷ ${x} ＝ ${ra}、Bは 1 日に ${W} ÷ ${y} ＝ ${rb} の仕事をする`,
            `Aが a 日、Bが (${T} － a) 日働いたとすると、${workCo(ra)}a ＋ ${rb === 1 ? '' : rb}(${T} － a) ＝ ${W}`,
            ra >= rb
                ? `${rb * T} ＋ ${workCo(ra - rb) === '' ? '' : ra - rb}a ＝ ${W}${ra === rb ? '' : `　⇒　${workCo(ra - rb)}a ＝ ${W - rb * T}`}　⇒　a ＝ ${k}`
                : `${rb * T} － ${workCo(rb - ra)}a ＝ ${W}　⇒　${workCo(rb - ra)}a ＝ ${rb * T - W}　⇒　a ＝ ${k}`,
            `Aは ${k} 日、Bは ${T} － ${k} ＝ ${T - k} 日働いた　⇒　${askA ? 'Aが行った日数は' : 'Bが行った日数は'} ${askA ? k : T - k} 日`
        ]
    };
}

// ---- Lv.4 のべ算（途中でポンプを追加）----
function workPumps() {
    let q = null;
    for (let i = 0; i < 100000 && !q; i++) {
        const N = getRandomChoice([4, 5, 6, 8, 10]), D = 10 * getRandomInt(6, 24), p0 = getRandomChoice([1, 1, 2]), m = getRandomChoice([2, 3, 4]), E = 10 * getRandomInt(18, 48);
        const tn = (p0 + m) * E - N * D;
        if (tn <= 0 || tn % m !== 0) continue;
        const t = tn / m;
        if (t % 5 === 0 && t >= 30 && E - t >= 30) q = { N, D, p0, m, E, t };
    }
    if (!q) q = { N: 6, D: 150, p0: 1, m: 3, E: 390, t: 220 };
    const { N, D, p0, m, E, t } = q, s = getRandomChoice([480, 510, 540, 540, 600, 780]), add = s + t, end = s + E;
    const deltas = shuffleArray([5, 10, 15, 20, 25, 30, 40, 50, 60].flatMap(d => [d, -d])).map(d => add + d).filter(v => v > s && v < end && v !== add);
    const picks = [...new Set(deltas)].slice(0, 4), all = [add, ...picks].sort((a, b) => a - b);
    const customChoices = all.map((v, i) => ({ value: v, label: workLabels[i], htmlText: `${workLabels[i]} ${workClock(v)}`, isCorrect: v === add }));
    return {
        unit: '⑭ 仕事算', title: 'のべ算',
        text: `ある満水のプールの水を同じ性能のポンプ ${N} 台でくみ出すと ${workDur(D)}かかる。このプールの水を${workClock(s)}にポンプ ${p0} 台でくみ出し始め、途中から ${m} 台のポンプを追加してくみ出したところ、${workClock(end)}にくみ出し終わった。`,
        prompt: `${m} 台のポンプを追加したのはいつか。`,
        correctAnswer: add, customChoices,
        steps: [
            `ポンプ 1 台が 1 分間にくみ出す量を 1 とすると、プール全体は ${N} × ${D} ＝ ${N * D}`,
            `${workClock(s)}から${workClock(end)}までは ${E} 分。ポンプを追加するまでの時間を t 分とすると、前半は ${p0} 台で t 分、後半は ${p0 + m} 台で (${E} － t) 分`,
            `${workCo(p0)}t ＋ ${p0 + m}(${E} － t) ＝ ${N * D}　⇒　${(p0 + m) * E} － ${workCo(m)}t ＝ ${N * D}　⇒　${workCo(m)}t ＝ ${(p0 + m) * E - N * D}　⇒　t ＝ ${t}（${workDur(t)}）`,
            `追加した時刻 ＝ ${workClock(s)} ＋ ${workDur(t)} ＝ ${workClock(add)}`
        ]
    };
}

// ---- Lv.5 2通りで表された仕事量（ポンプの排水）----
function workTwoWays() {
    const things = ['プール', 'タンク', '水槽'];
    let q = null;
    for (let i = 0; i < 200000 && !q; i++) {
        const x = getRandomInt(1, 9), y = getRandomInt(1, 9), a1 = getRandomInt(4, 16), b1 = getRandomInt(4, 16), a2 = getRandomInt(3, 14);
        if (x === y || Fr.gcd(x, y) !== 1 || a1 <= a2) continue;
        const W = a1 * x + b1 * y, rest = W - a2 * (x + y);
        if (rest <= 0 || rest % y !== 0) continue;
        const b2 = rest / y;
        if (a2 + b2 <= b1 || (a2 + b2 - b1) * y !== (a1 - a2) * x) continue;           // 2式から出る比が x : y と一致するか
        if (W % x !== 0 || W % y !== 0) continue;                                    // A だけ・B だけの時間が整数
        const tA = W / x, tB = W / y;
        if (tA >= 8 && tA <= 60 && tB >= 8 && tB <= 60 && b2 >= 3) q = { x, y, a1, b1, a2, b2, W, tA, tB };
    }
    if (!q) q = { x: 5, y: 4, a1: 12, b1: 10, a2: 8, b2: 7, W: 100, tA: 20, tB: 25 };
    const { x, y, a1, b1, a2, b2, W, tA, tB } = q, thing = getRandomChoice(things), askA = getRand() < 0.7;
    return {
        unit: '⑭ 仕事算', title: '2通りで表された仕事量',
        text: `ある満水の${thing}を空にするために、Aのポンプだけで ${a1} 分間排水し、その後Bのポンプだけで ${b1} 分間排水すると、${thing}の水がなくなる。また、AのポンプとBのポンプで同時に ${a2} 分間排水し、その後Bのポンプだけで ${b2} 分間排水しても${thing}の水がなくなる。`,
        prompt: `今、この満水の${thing}を${askA ? 'A' : 'B'}のポンプだけで排水して空にするとき、要する時間はどれか。`,
        correctAnswer: askA ? tA : tB, unitSuffix: '分', step: Math.max(1, Math.round((askA ? tA : tB) * 0.05)),
        steps: [
            `Aのポンプが 1 分間に排水する量を a、Bのポンプを b、満水の量を W とする`,
            `1 つ目: ${a1}a ＋ ${b1}b ＝ W、2 つ目: ${a2}(a ＋ b) ＋ ${b2}b ＝ ${a2}a ＋ ${a2 + b2}b ＝ W`,
            `W が等しいので ${a1}a ＋ ${b1}b ＝ ${a2}a ＋ ${a2 + b2}b　⇒　${a1 - a2}a ＝ ${a2 + b2 - b1}b　⇒　a : b ＝ ${a2 + b2 - b1} : ${a1 - a2} ＝ ${x} : ${y}`,
            `a ＝ ${x}、b ＝ ${y} とおくと、W ＝ ${a1} × ${x} ＋ ${b1} × ${y} ＝ ${W}`,
            `${askA ? 'Aのポンプだけ' : 'Bのポンプだけ'}で空にする時間 ＝ ${W} ÷ ${askA ? x : y} ＝ ${askA ? tA : tB} 分`
        ]
    };
}
