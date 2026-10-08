// 実行: node tests/run.js   （ブラウザ用の通常<script>をそのまま読み込んで検証する）
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
load('js/core.js');
fs.readdirSync(path.join(root, 'js/units')).sort().forEach(f => load('js/units/' + f));
const R = vm.runInThisContext('({UnitRegistry, generateQuestion, generateChoices, initPRNG})');

const N = Number(process.argv[2] || 3000);
let totalBad = 0;
const near = (a, b) => Math.abs(a - b) < 1e-9;

// 濃度(u1)だけは問題文から数値を読み取り、独立した計算で答えを照合する
function checkU1(q) {
    const n = (q.text.match(/\d+(\.\d+)?/g) || []).map(Number);
    let exp;
    if (q.title === '混合の基本') { const [c1, w1, c2, w2] = n; exp = (w1 * c1 + w2 * c2) / (w1 + w2); }
    else if (q.title === '水の追加') { const [c1, w, c2] = n; exp = w * c1 / c2 - w; }
    else if (q.title === '食塩の追加') { const [c1, w, c2] = n; exp = (w * c2 / 100 - w * c1 / 100) / (1 - c2 / 100); }
    else if (q.title === '水の蒸発') { const [c1, w, c2] = n; exp = w - w * c1 / c2; }
    else {
        const [ca, wa, cb, wb] = n; exp = null;
        const f = x => ((wa - x) * ca / 100 + x * cb / 100) / wa - ((wb - x) * cb / 100 + x * ca / 100) / wb;
        for (let x = 1; x <= Math.min(wa, wb); x++) if (Math.abs(f(x)) < 1e-12) { exp = x; break; }
    }
    return exp !== null && near(q.correctAnswer, exp);
}

// 年齢算(u2): 問題文の数値だけから総当たりで解き直し、出題の答えと照合する
function checkU2(q) {
    const n = (q.text + q.prompt).match(/\d+/g).map(Number);
    if (q.title === '3人の年齢算') {
        const [, avg, g, m, f] = n;                       // 先頭の「3人」の3は除く
        const sols = [];
        let past = null;
        for (let y = 1; y <= 100; y++) if (g + y === m * y) past = y;
        if (past === null) return false;
        const d = f - m * past;                           // 父は母より d 歳年上
        for (let x = past + 1; x <= 100; x++) if (x + (x + g) + (x + g + d) === 3 * avg) sols.push(x);
        return sols.length === 1 && q.correctAnswer === sols[0];
    }
    if (q.title === '年齢算の基本') {
        const [a, p, m] = n;
        for (let x = 1; x <= 100; x++) if (p + x === m * (a + x)) return q.correctAnswer === x;
        return false;
    }
    if (q.title === '倍数関係の年齢算') {
        const [k, nn, m] = n;
        for (let c = 1; c <= 100; c++) if (k * c + nn === m * (c + nn)) return q.correctAnswer === k * c;
        return false;
    }
    const [a, b, d, nn, m] = n;            // 連立方程式型: 解の個数も数える(一意であること)
    const sols = [];
    for (let y = nn + 1; y <= 100; y++) for (let x = y; x <= 150; x++)
        if (a * x === b * y + d && x - nn === m * (y - nn)) sols.push(y);
    return sols.length === 1 && q.correctAnswer === sols[0];
}


// 売買損益(u3): 問題文の数値だけから総当たりで解き直して照合する
function checkU3(q) {
    const t = q.text + q.prompt, num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '定価と原価の関係') {
        m = t.match(/定価の\s*(\d+)\s*(％|割)引き.*?原価の\s*(\d+)％の利益/s); if (!m) return false;
        const a = m[2] === '割' ? num(m[1]) * 10 : num(m[1]), b = num(m[3]), sols = [];
        for (let i = 1; i <= 500; i++) if ((100 + i) * (100 - a) === (100 + b) * 100) sols.push(i);
        return sols.length === 1 && q.correctAnswer === sols[0];
    }
    if (q.title === '個数を考慮した売買') {
        m = t.match(/1 個 (\d+) 円で何個か仕入れ、1 個 (\d+) 円で売り出したところ、(\d+) 個売れ残.*?([\d,]+) 円の利益/s); if (!m) return false;
        const [c, s, r, P] = [num(m[1]), num(m[2]), num(m[3]), num(m[4])], sols = [];
        for (let n = r + 1; n <= 2000; n++) if (s * (n - r) - c * n === P) sols.push(n);
        return sols.length === 1 && q.correctAnswer === sols[0];
    }
    if (q.title.startsWith('個数を考慮した売買（売上')) {
        m = t.match(/商品 (\d+) 個を、仕入れ価格の (\d+) 割増しで (\d+) 個、(\d+) 割増しで (\d+) 個売り、(\d+) 個を廃棄.*?利益は ?([\d,]+) 円.*?(\d+) 個すべてを仕入れ価格の (\d+) 割増し/s); if (!m) return false;
        const [n, p1, n1, p2, n2, w, P, n3, p3] = m.slice(1).map(num), sols = [];
        if (n3 !== n || n1 + n2 + w !== n) return false;
        for (let x = 1; x <= 5000; x++) if (x * (n1 * (10 + p1) + n2 * (10 + p2) - 10 * n) === 10 * P) sols.push(x);
        return sols.length === 1 && q.correctAnswer * 10 === sols[0] * n * p3;
    }
    // Lv.4: 商品100個を1個ずつ順に販売する様子を再現して売上を合計する
    m = t.match(/この商品の\s*(\d+)％が売れた時点から定価の\s*(\d+)\s*(％|割)引きで.*?この商品の\s*(\d+)％が売れずに/s); if (!m) return false;
    const a = num(m[1]), d = m[3] === '割' ? num(m[2]) * 10 : num(m[2]), u = num(m[4]);
    let sum = 0;
    for (let i = 1; i <= 100; i++) sum += i <= a ? 100 : (i <= 100 - u ? 100 - d : 0);
    return Number.isInteger(sum / 100) && q.correctAnswer === sum / 100;
}

// 平均(u4): 問題文の数値だけから総当たりで解き直して照合する
function checkU4(q, choices) {
    const t = q.text + q.prompt, num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === 'グループ内の平均・B') {
        m = t.match(/合計は\s*(\d+)\s*点.*?間には\s*(\d+)\s*点の差.*?平均点は\s*(\d+)\s*点.*?Dの得点の\s*(\d+)\s*倍より\s*(\d+)\s*点高く.*?Cの得点より\s*(\d+)\s*点高かった/s); if (!m) return false;
        const [S, g, m3, k, e, tt] = m.slice(1).map(num), sols = [];
        for (let D = 0; D <= 100; D++) for (let C = 0; C <= 100; C++) {
            const A = D + g, B = k * D + e, E = C + tt - D;
            if (E < 0 || A + B + C + D + E !== S || B + C + E !== 3 * m3) continue;
            if (Math.max(B, C, E) >= A || Math.min(B, C, E) <= D) continue;      // Aが最高点・Dが最低点
            sols.push({ A, B, C, D, E });
        }
        if (sols.length !== 1) return false;
        let correct = 0;
        for (const c of choices) {
            const mm = c.htmlText.match(/([A-E])の得点は\s*(\d+)\s*点/); if (!mm) return false;
            const same = sols[0][mm[1]] === num(mm[2]);
            if (same !== c.isCorrect) return false;
            if (c.isCorrect) correct++;
        }
        return correct === 1 && choices.length === 5;
    }
    if (q.title.startsWith('複数グループの平均・A（1人を除いた')) {
        m = t.match(/Aの身長は\s*(\d+)\s*cm.*?全員の身長の平均は\s*(\d+)\s*cm.*?平均は\s*(\d+)\s*cm.*?全員の体重の平均は\s*([\d.]+)\s*kg.*?平均は\s*([\d.]+)\s*kg/s); if (!m) return false;
        const [hA, hm, hp, w, wp] = m.slice(1).map(Number), ns = [];
        for (let n = 2; n <= 200; n++) if (hm * n === hp * (n - 1) + hA) ns.push(n);
        if (ns.length !== 1) return false;
        return Math.abs(w * ns[0] - wp * (ns[0] - 1) - q.correctAnswer) < 1e-9;
    }
    if (q.title.startsWith('複数グループの平均・A（合格者')) {
        m = t.match(/全受験者の平均点は\s*(\d+)\s*点.*?ちょうど\s*(\d+)\s*倍.*?割合が\s*(\d+)％/s); if (!m) return false;
        const [M, k, p] = m.slice(1).map(num); let hit = [];
        for (let x = 1; x <= 300; x++) if (Math.abs((p * x + (100 - p) * x / k) - 100 * M) < 1e-9) hit.push(x);
        return hit.length === 1 && hit[0] === q.correctAnswer;
    }
    m = t.match(/合格率が\s*(\d+)％、受験者全体の平均点が\s*(\d+)\s*点、不合格者の平均点は\s*(\d+)\s*点で、これは合格最低点より\s*(\d+)\s*点低い/s); if (!m) return false;
    const [p, M, F, d] = m.slice(1).map(num), P = (100 * M - (100 - p) * F) / p;
    return Number.isInteger(P) && P - (F + d) === q.correctAnswer;
}

// 一次方程式(u5): 問題文の数値だけから総当たりで解き直して照合する（分数は {{n/d}} 記号 → n/d に読み替え）
function checkU5(q) {
    const t = (q.text + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    const yen = str => { if (/^\d+円$/.test(str)) return num(str.replace('円', '')); const m = str.match(/^(?:(\d+)万)?(?:(\d*)千)?円$/); if (!m) return NaN; return (m[1] ? num(m[1]) * 10000 : 0) + (str.includes('千') ? (m[2] === '' ? 1 : num(m[2])) * 1000 : 0); };
    let m;
    if (q.title === '[＝]の関係') {
        m = t.match(/合計額は(.+?)であり、Aは(.+?)を\s*(\d+)\s*か月ごとに.*?始めてから\s*(\d+)\s*か月目に.*?合計額が(.+?)になる/s); if (!m) return false;
        const S = yen(m[1]), per = yen(m[2]), mm = num(m[3]), T = num(m[4]), U = yen(m[5]), sols = [];
        if ([S, per, U].some(Number.isNaN) || T % mm !== 0) return false;
        for (let a = 0; a <= S; a += 1000) { const b = S - a; if (a + per * (T / mm) + (T + 1) * b === U) sols.push(a / 1000); }
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '相当算') {
        m = t.match(/仕入れた数の(\d+)\/(\d+)が売れた。翌日には\s*1 日目に売れた数の(\d+)\/(\d+)が売れたが、まだ\s*(\d+)/s); if (!m) return false;
        const [a, b, c, d, R] = m.slice(1).map(num), sols = [];
        for (let n = 1; n <= 3000; n++) {
            if ((n * a) % b) continue; const day1 = n * a / b; if ((day1 * c) % d) continue;
            if (n - day1 - day1 * c / d === R) sols.push(n);
        }
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '全体数の分割・A') {
        const dens = [...t.matchAll(/(\d+) 人に 1 人は/g)].map(x => num(x[1])); m = t.match(/合計で\s*(\d+)\s*人/); if (!m || dens.length < 3) return false;
        const T = num(m[1]), sols = [];
        for (let N = 1; N <= 5000; N++) if (dens.every(dn => N % dn === 0) && dens.reduce((s, dn) => s + N / dn, 0) === T) sols.push(N);
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    m = t.match(/全ページ数の(\d+)\/(\d+)より\s*(\d+)\s*ページ多く読み、2 日目は.*?ページ数の(\d+)\/(\d+)より\s*(\d+)\s*ページ多く.*?ちょうど(\d+)\/(\d+)となった/s); if (!m) return false;
    const [p1, a, x, p2, b, y, u, c] = m.slice(1).map(num), sols = [];
    for (let N = 1; N <= 5000; N++) {
        if ((p1 * N) % a) continue; const rem1 = N - p1 * N / a - x; if (rem1 <= 0 || (p2 * rem1) % b) continue;
        const unread = rem1 - (p2 * rem1 / b + y); if (unread > 0 && unread * c === u * N) sols.push(N);
    }
    return sols.length === 1 && sols[0] === q.correctAnswer;
}

// 連立方程式(u6): 問題文の数値だけから総当たり・別解法で解き直して照合する
function checkU6(q, choices) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '比例配分') {
        m = t.match(/([\d,]+) 万円の利益.*?AがBの ([\d.]+) 倍、BがCの ([\d.]+) 倍/s); if (!m) return false;
        const P = num(m[1]), k1 = num(m[2]), k2 = num(m[3]);
        return Number.isInteger(q.correctAnswer) && Math.abs(P * k1 * k2 / (k1 * k2 + k2 + 1) - q.correctAnswer) < 1e-6;
    }
    if (q.title === '計算の工夫') {
        m = t.match(/^(\S+?)と(\S+?)が合わせて\s*(\d+)\s*個、(\S+?)と(\S+?)が合わせて\s*(\d+)\s*個、(\S+?)と(\S+?)が合わせて\s*(\d+)\s*個/); const tg = t.match(/、(\S+?)の個数/);
        if (!m || !tg) return false;
        const n1 = m[1], n2 = m[2], n3 = m[5], [s1, s2, s3] = [m[3], m[6], m[9]].map(num), sols = [];
        for (let x = 0; x <= 80; x++) for (let y = 0; y <= 80; y++) for (let z = 0; z <= 80; z++) if (x + y === s1 && y + z === s2 && z + x === s3) sols.push({ [n1]: x, [n2]: y, [n3]: z });
        return sols.length === 1 && sols[0][tg[1]] === q.correctAnswer;
    }
    if (q.title === '変動前と変動後') {
        m = t.match(/女子が\s*(\d+)％減り男子が\s*(\d+)％増えた結果、全体として\s*(\d+)％の増加.*?男女合わせて\s*(\d+)\s*人/s); if (!m) return false;
        const [a, b, c, T] = m.slice(1).map(num), sols = [];
        for (let f = 0; f <= T; f++) if (f * (100 - a) + (T - f) * (100 + b) === T * (100 + c)) sols.push(f);
        return sols.length === 1 && Number.isInteger(sols[0] * (100 - a) / 100) && sols[0] * (100 - a) / 100 === q.correctAnswer;
    }
    if (q.title === '変動前と変動後（同数増加）') {
        m = t.match(/\s*(\d+) 年前には\s*([\d,]+)\s*人.*?A区が\s*(\d+)％、B区が\s*(\d+)％、C区が\s*(\d+)％.*?現在の([ABC])区/s); if (!m) return false;
        const T0 = num(m[2]), rs = [num(m[3]), num(m[4]), num(m[5])], ti = 'ABC'.indexOf(m[6]);
        const d = T0 / rs.reduce((s, r) => s + 100 / r, 0), ans = 100 * d / rs[ti] + d;
        let ok = 0; for (const c of choices) if (c.isCorrect) { ok++; if (!c.htmlText.includes(ans.toLocaleString())) return false; }
        return Math.abs(ans - q.correctAnswer) < 1e-6 && Math.abs(d - Math.round(d)) < 1e-6 && ok === 1 && choices.length === 5;   // 浮動小数点の誤差を許容
    }
    if (q.title === '3つの文字・B') {
        m = t.match(/(\d+) 点、(\d+) 点、(\d+) 点のエリアが.*?矢を\s*(\d+)\s*本射たところ.*?合計は\s*(\d+)\s*点.*?(\d+) 点のエリアに命中した矢の数は、(\d+) 点のエリアに命中した矢の数の(\d+)\/(\d+)であった.*?(\d+) 点のエリアに命中した矢の数と (\d+) 点のエリアに命中した矢の数の合計/s); if (!m) return false;
        const [p1, p2, p3, n, S, pz, px, u, v, qa, qb] = m.slice(1).map(num), sols = [];
        if (pz !== p3 || px !== p1) return false;
        for (let x = 1; x <= n; x++) for (let y = 1; y <= n - x; y++) { const z = n - x - y; if (z >= 1 && p1 * x + p2 * y + p3 * z === S && z * v === x * u) sols.push({ [p1]: x, [p2]: y, [p3]: z }); }
        return sols.length === 1 && sols[0][qa] + sols[0][qb] === q.correctAnswer;
    }
    const conds = [...t.matchAll(/Aグループのメンバーに\s*(\d+)\s*本ずつ、Bグループのメンバーに\s*(\d+)\s*本ずつ配ると、\s*(\d+)\s*本(足りなくなる|余る)/g)].map(x => [num(x[1]), num(x[2]), x[4] === '余る' ? num(x[3]) : -num(x[3])]);
    if (conds.length !== 3) return false;
    const sols = [];
    for (let a = 1; a <= 100; a++) for (let b = 1; b <= 100; b++) {
        const Ns = conds.map(([p, qq, s]) => p * a + qq * b + s);
        if (Ns[0] === Ns[1] && Ns[1] === Ns[2] && Ns[0] > 0) sols.push([a, b]);
    }
    return sols.length === 1 && sols[0][0] + sols[0][1] === q.correctAnswer;
}

// 不定方程式(u7): 問題文の数値だけから総当たりで解き直し、解が1組だけであることも確認する
function checkU7(q) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '値の求め方') {
        m = t.match(/(\d+) 円玉、(\d+) 円玉、(\d+) 円玉をそれぞれ.*?([\d,]+) 円にしたい。硬貨の枚数が全部で\s*(\d+)\s*枚ある.*?(\d+) 円玉は何枚/s); if (!m) return false;
        const [v1, v2, v3, M, n, tv] = m.slice(1).map(num), sols = [];
        for (let x = 1; x <= n; x++) for (let y = 1; y <= n - x; y++) { const z = n - x - y; if (z >= 1 && v1 * x + v2 * y + v3 * z === M) sols.push([x, y, z]); }
        return sols.length === 1 && sols[0][[v1, v2, v3].indexOf(tv)] === q.correctAnswer;
    }
    if (q.title === '3文字1式・A') {
        m = t.match(/値段は、(\d+) 円、(\d+) 円、(\d+) 円である.*?合計金額が\s*([\d,]+)\s*円/s); const tg = t.match(/([ABC])定食を注文した人は何人か/); if (!m || !tg) return false;
        const [p1, p2, p3, M] = m.slice(1).map(num), sols = [];
        for (let a = 1; p1 * a < M; a++) for (let b = 1; p1 * a + p2 * b < M; b++) { const r = M - p1 * a - p2 * b; if (r > 0 && r % p3 === 0) sols.push([a, b, r / p3]); }
        return sols.length === 1 && sols[0]['ABC'.indexOf(tg[1])] === q.correctAnswer;
    }
    m = t.match(/赤色の棒の長さの\s*(\d+)\s*倍は、青色の棒の長さの\s*(\d+)\s*倍と等しい/); if (!m) return false;
    const [p, qq] = [num(m[1]), num(m[2])];
    let a, b, c, d, f = t.match(/青色の棒の長さの(\d+)\/(\d+)倍は、黄色の棒の長さの(\d+)\/(\d+)倍と等しい/);
    if (f) [a, b, c, d] = f.slice(1).map(num);
    else { f = t.match(/青色の棒の長さの\s*(\d+)\s*倍は、黄色の棒の長さの\s*(\d+)\s*倍と等しい/); if (!f) return false; [a, c] = [num(f[1]), num(f[2])]; b = 1; d = 1; }
    const sols = [];
    for (let R = 1; R < 100; R++) for (let B = 1; B < 100; B++) for (let Y = 1; Y < 100; Y++) if (p * R === qq * B && a * d * B === c * b * Y) sols.push(R + B + Y);
    return sols.length === 1 && sols[0] === q.correctAnswer;
}

// 不定方程式(u7): 問題文の数値だけから総当たりで解き直し、解が1組であることも確認する
function checkU7(q) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '値の求め方') {
        m = t.match(/(\d+) 円玉、(\d+) 円玉、(\d+) 円玉.*?用いて\s*(\d+)\s*円にしたい.*?全部で\s*(\d+)\s*枚.*?(\d+) 円玉は何枚/s); if (!m) return false;
        const [d1, d2, d3, M, N, tg] = m.slice(1).map(num), sols = [];
        for (let x = 1; x <= N; x++) for (let y = 1; y <= N - x; y++) { const z = N - x - y; if (z >= 1 && d1 * x + d2 * y + d3 * z === M) sols.push({ [d1]: x, [d2]: y, [d3]: z }); }
        return sols.length === 1 && sols[0][tg] === q.correctAnswer;
    }
    if (q.title === '3文字1式・A') {
        m = t.match(/値段は、(\d+) 円、(\d+) 円、(\d+) 円.*?合計金額が\s*([\d,]+)\s*円.*?([ABC])定食を注文/s); if (!m) return false;
        const [p1, p2, p3, M] = m.slice(1, 5).map(num), ti = 'ABC'.indexOf(m[5]), sols = [];
        for (let a = 1; a * p1 < M; a++) for (let b = 1; a * p1 + b * p2 < M; b++) { const r = M - a * p1 - b * p2; if (r > 0 && r % p3 === 0) sols.push([a, b, r / p3]); }
        return sols.length === 1 && sols[0][ti] === q.correctAnswer;
    }
    m = t.match(/の棒の長さの\s*(\d+)\s*倍は、.+?の棒の長さの\s*(\d+)\s*倍と等しい.*?の棒の長さの1\/(\d+)倍は、.+?の棒の長さの1\/(\d+)倍と等しい/s); if (!m) return false;
    const [a, b, c, d] = m.slice(1).map(num), sols = [];
    for (let R = 1; R < 100; R++) for (let B = 1; B < 100; B++) for (let Y = 1; Y < 100; Y++) if (a * R === b * B && d * B === c * Y) sols.push(R + B + Y);
    return sols.length === 1 && sols[0] === q.correctAnswer;
}

// 旅人算(u8): 問題文の数値だけから、公式を使わない別の方法（時間を刻んだシミュレーション等）で解き直して照合する
function checkU8(q, choices) {
    const t = (q.text + '\n' + q.prompt), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '出会い算（時間を求める）') {
        m = t.match(/([\d.]+) km 離れた.*?分速\s*(\d+)\s*m.*?分速\s*(\d+)\s*m/s); if (!m) return false;
        const D = Math.round(num(m[1]) * 1000), vA = num(m[2]), vB = num(m[3]);
        for (let min = 1; min <= 200; min++) if (vA * min + vB * min === D) return min === q.correctAnswer;
        return false;
    }
    if (q.title === '出会い算（速さを求める）') {
        m = t.match(/([\d,]+) m 離れた場所から.*?(\d+) 分後に.*?分速\s*(\d+)\s*m/s); if (!m) return false;
        const D = num(m[1]), mins = num(m[2]), vA = num(m[3]);
        for (let vB = 1; vB <= 500; vB++) if ((vA + vB) * mins === D) return vB === q.correctAnswer;
        return false;
    }
    if (q.title === '追いかけ算') {
        m = t.match(/歩く速さは分速\s*(\d+)\s*m、.*?速さは分速\s*(\d+)\s*m である。.*?出発してから\s*(\d+)\s*分後/s); if (!m) return false;
        const [s1, s2, T] = m.slice(1).map(num); let ans = null;
        for (let k = 1; k <= 400; k++) { const tt = k / 2; if (s1 * (T + tt) === s2 * tt) { ans = [tt, s2 * tt]; break; } }   // 0.5分刻みで追いつく瞬間を探す
        if (!ans) return false;
        let hit = 0;
        for (const c of choices) { const mm = c.htmlText.match(/([\d.]+) 分 (\d+) m/); if (!mm) return false; const same = Number(mm[1]) === ans[0] && Number(mm[2]) === ans[1]; if (same !== c.isCorrect) return false; if (same) hit++; }
        return hit === 1 && choices.length === 5;
    }
    if (q.title === '周回問題（池の周り）') {
        m = t.match(/(\d+) m ある池.*?同じ方向へ進むと\s*(\d+)\s*分で.*?反対方向へ進むと\s*(\d+)\s*分で/s); if (!m) return false;
        const [L, t1, t2] = m.slice(1).map(num), sols = [];
        for (let a = 1; a <= 400; a++) for (let b = 1; b < a; b++) if ((a - b) * t1 === L && (a + b) * t2 === L) sols.push(b);
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '周回問題（すれ違う回数）') {
        m = t.match(/1 周\s*(\d+)\s*m.*?毎秒\s*(\d+)\s*m.*?毎秒\s*(\d+)\s*m.*?(\d+) 分間/s); if (!m) return false;
        const [L, vA, vB, T] = m.slice(1).map(num); let cnt = 0, prev = 0;
        for (let sec = 1; sec <= T * 60; sec++) {                 // 1秒ごとに、2人が出会った回数（相対距離がLの倍数を跨いだ回数）を数える
            const rel = (vA + vB) * sec, now = Math.floor(rel / L); if (now > prev) { cnt += now - prev; prev = now; }
        }
        return cnt === q.correctAnswer;
    }
    if (q.title === '追いかけ算（引き返して追いかける）') {
        m = t.match(/分速\s*(\d+)\s*m の速さで歩いて.*?(\d+) 分後に.*?分速\s*(\d+)\s*m で走って.*?分速\s*(\d+)\s*m で/s); if (!m) return false;
        const [w, T, r, b] = m.slice(1).map(num);
        // 15秒刻みで時刻を進めて位置を比べる（位置は整数mになる条件で出題される）
        const dt = 0.25; let t0 = 0, xb = 0, xs = 0, phase = 0;
        for (let k = 1; k <= 4 * 300; k++) {
            t0 = k * dt; xs = w * t0;
            if (t0 <= T) xb = w * t0;
            else if (phase === 0) { xb = w * T - r * (t0 - T); if (xb <= 0) { xb = 0; phase = 1; var tHome = T + (w * T) / r; } }
            if (phase === 1 && t0 > tHome) { xb = b * (t0 - tHome); if (xb >= xs) return Math.abs(xb - xs) < 1e-9 && xb === q.correctAnswer; }
            if (phase === 0 && t0 > T && xb <= 0) phase = 1;
        }
        return false;
    }
    m = t.match(/1 辺の長さが\s*(\d+)\s*cm の(.+?)の辺上.*?頂点 A から毎秒\s*(\d+)\s*cm.*?頂点 ([A-H]) から毎秒\s*(\d+)\s*cm/s); if (!m) return false;
    const s = num(m[1]), nTxt = m[2].match(/[A-H]+$/)[0].length, vP = num(m[3]), qi = 'ABCDEFGH'.indexOf(m[4]), vQ = num(m[5]), perim = nTxt * s;
    for (let k = 1; k <= 4 * 200; k++) { const tt = k / 4; if ((qi * s + (vQ - vP) * tt) % perim === 0) { let hit = 0; for (const c of choices) { const same = Math.abs(Number(c.htmlText.replace(/[^\d.]/g, '').replace(/^[^\d]*/, '').slice(0)) - 0) >= 0; if (c.isCorrect) { hit++; if (!c.htmlText.includes(` ${tt} 秒`)) return false; } } return tt === q.correctAnswer && hit === 1 && choices.length === 5; } }
    return false;
}

// 旅人算(u8): 問題文の数値だけから、別の解き方（位置の方程式・時間を進めるシミュレーション）で解き直して照合する
function checkU8(q, choices) {
    const t = (q.text + '\n' + q.prompt), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '出会い算（出会う時間）') {
        m = t.match(/([\d.]+)(km|m)離れた.*?分速\s*(\d+)\s*m.*?分速\s*(\d+)\s*m/s); if (!m) return false;
        const D = m[2] === 'km' ? Math.round(num(m[1]) * 1000) : num(m[1]), vA = num(m[3]), vB = num(m[4]);
        for (let k = 1; k <= 200; k++) if (vA * k + vB * k === D) return q.correctAnswer === k;     // k 分後に2台の進んだ距離の和が D になる
        return false;
    }
    if (q.title === '出会い算（速さを求める）') {
        m = t.match(/(\d+) m 離れた場所から.*?(\d+) 分後に.*?([AB])の速さが分速\s*(\d+)\s*m.*?([AB])の速さは分速何/s); if (!m) return false;
        const D = num(m[1]), k = num(m[2]), known = num(m[4]);
        for (let v = 1; v <= 500; v++) if ((known + v) * k === D) return q.correctAnswer === v;
        return false;
    }
    if (q.title === '追いかけ算（時間と距離）') {
        m = t.match(/(.)の歩く速さは分速\s*(\d+)\s*m、(.)が自転車で進む速さは分速\s*(\d+)\s*m.*?出発してから\s*(\d+)\s*分後/s); if (!m) return false;
        const vs = num(m[2]), va = num(m[4]), T0 = num(m[5]);
        let hit = null; for (let k = 1; k <= 200; k++) if (vs * (T0 + k) === va * k) { hit = k; break; }      // 姉の出発から k 分後の位置が一致
        if (hit === null) return false;
        let ok = 0;
        for (const c of choices) { const mm = c.htmlText.match(/(\d+(?:\.\d+)?) 分　(\d+) m/); if (!mm) return false; const same = num(mm[1]) === hit && num(mm[2]) === va * hit; if (same !== c.isCorrect) return false; if (c.isCorrect) ok++; }
        return ok === 1 && choices.length === 5 && q.correctAnswer === va * hit;
    }
    if (q.title === '周回問題（池の周り）') {
        m = t.match(/(\d+) m ある池.*?同じ方向へ進むと (\d+) 分でAがBに追い着き、反対方向へ進むと (\d+) 分で出会う.*?([AB])の歩く速さ/s); if (!m) return false;
        const L = num(m[1]), t1 = num(m[2]), t2 = num(m[3]), sols = [];
        for (let a = 1; a <= 400; a++) for (let b = 1; b < a; b++) if (a * t1 - b * t1 === L && (a + b) * t2 === L) sols.push({ A: a, B: b });
        return sols.length === 1 && sols[0][m[4]] === q.correctAnswer;
    }
    if (q.title === '周回問題（すれ違う回数）') {
        m = t.match(/1 周 (\d+) m.*?毎秒 (\d+) m、Bの走る速さが毎秒 (\d+) m.*?(\d+) 分間/s); if (!m) return false;
        const [L, vA, vB, T] = m.slice(1).map(num); let cnt = 0, prev = false;
        if (((vA + vB) * T * 60) % L === 0) return false;     // 終了時刻ちょうどに出会う(境界)問題は出さない
        for (let k = 1; k * L <= (vA + vB) * T * 60; k++) cnt++;
        return cnt === q.correctAnswer;
    }
    if (q.title === '追いかけ算（忘れ物を取りに戻る）') {
        m = t.match(/分速\s*(\d+)\s*m の速さで歩いて.*?(\d+) 分後に.*?分速\s*(\d+)\s*m で走って.*?分速\s*(\d+)\s*m で妹を追いかけた/s); if (!m) return false;
        const [v1, T0, vr, vb] = m.slice(1).map(num), tau0 = T0 + v1 * T0 / vr;         // 兄が自転車で出発する時刻
        const tau = vb * tau0 / (vb - v1);                                                // 妹の位置 v1×τ ＝ 兄の位置 vb×(τ－τ0)
        const dist = v1 * tau;
        return Math.abs(dist - Math.round(dist)) < 1e-9 && Math.round(dist) === q.correctAnswer;
    }
    // 多角形: 0.5秒刻みで2点を動かし、Qが初めてPに重なる時刻を探す
    m = t.match(/1 辺の長さが (\d+) cm の正.*?(ABC[A-F]*)がある.*?動点Pは頂点([A-F])から毎秒 (\d+) cm.*?動点Qは頂点([A-F])から毎秒 (\d+) cm/s); if (!m) return false;
    const s = num(m[1]), n = m[2].length, p0 = m[2].indexOf(m[3]), vP = num(m[4]), q0 = m[2].indexOf(m[5]), vQ = num(m[6]), per = n * s;
    let found = null; for (let k = 1; k <= 400; k++) { const tt = k * 0.5; if ((((p0 * s + vP * tt) - (q0 * s + vQ * tt)) % per + per) % per === 0) { found = tt; break; } }
    if (found === null) return false;
    let ok = 0; for (const c of choices) { const same = Math.abs(parseFloat(c.htmlText.replace(/^.\s*/, '')) - found) < 1e-9; if (same !== c.isCorrect) return false; if (c.isCorrect) ok++; }
    return ok === 1 && choices.length === 5 && q.correctAnswer === found;
}

// 通過算(u9): 問題文の数値だけから、別の解き方（総当たり・位置の式）で解き直して照合する
function checkU9(q) {
    const t = (q.text + '\n' + q.prompt), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '電車同士の通過') {
        m = t.match(/時速\s*(\d+)\s*km.*?時速\s*(\d+)\s*km.*?長さ\s*(\d+)\s*m の.*?(\d+)\s*秒かかった/s); if (!m) return false;
        const [v1, v2, L2, sec] = m.slice(1).map(num);
        for (let L1 = 1; L1 <= 2000; L1++) if ((L1 + L2) * 3600 === (v1 + v2) * 1000 * sec) return q.correctAnswer === L1;   // 進んだ距離の和 ＝ 列車の長さの和
        return false;
    }
    if (q.title === '動くもの（電車以外）の通過') {
        m = t.match(/毎分\s*(\d+)\s*m.*?(\d+)\s*分ごとに電車に追い越され、\s*(\d+)\s*分ごとに前方/s); if (!m) return false;
        const [w, T1, T2] = m.slice(1).map(num), sols = [];
        for (let v = w + 1; v <= 5000; v++) if ((v - w) * T1 === (v + w) * T2) sols.push(v);
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    m = t.match(/長さ\s*(\d+)\s*m の列車Aと長さ\s*(\d+)\s*m の列車B.*?最後部がトンネルに入るまでに\s*(\d+)\s*秒.*?すれ違い終わるまでに\s*(\d+)\s*秒.*?列車Aは\s*(\d+)\s*秒後に、列車Bは\s*(\d+)\s*秒後/s); if (!m) return false;
    const [lenA, lenB, tA, tp, a, b] = m.slice(1).map(num), vA = lenA / tA, S = (lenA + lenB) / tp, vB = S - vA, sols = [];
    if (vB <= 0) return false;
    for (let T = 1; T <= 6000; T++) {
        const meet = T / S, endPass = meet + tp;                                       // 前部が出会う時刻 / すれ違い終わる時刻
        const okA = Math.abs(vA * (endPass + a) - T) < 1e-9, okB = Math.abs(vB * (endPass + b) - T) < 1e-9;   // 各列車の最前部が出口に着く時刻
        const rearsIn = vA * endPass >= lenA && vB * endPass >= lenB;
        if (okA && okB && rearsIn) sols.push(T);
    }
    return sols.length === 1 && sols[0] === q.correctAnswer;
}

// 流水算(u10): 問題文の数値だけから、別の解き方（連立の総当たり）で解き直して照合する
function checkU10(q, choices) {
    const t = (q.text + '\n' + q.prompt), num = x => Number(String(x).replace(/,/g, ''));
    const minutes = str => { const m = str.match(/^(?:(\d+)時間)?(?:(\d+)分)?$/); return m ? (m[1] ? num(m[1]) * 60 : 0) + (m[2] ? num(m[2]) : 0) : NaN; };
    let m;
    if (q.title === '流水算の基本') {
        m = t.match(/時速\s*(\d+)\s*km.*?川を\s*(\d+)\s*km 下るのに\s*(\d+)\s*時間.*?川を\s*(\d+)\s*時間こいで/s); if (!m) return false;
        const [s, D, t1, t2] = m.slice(1).map(num), sols = [];
        for (let c = 0; c <= s; c++) if ((s + c) * t1 === D) sols.push(c);                    // 下りの距離 ＝ (静水＋流れ)×時間
        return sols.length === 1 && (s - sols[0]) * t2 === q.correctAnswer;
    }
    if (q.title === '往復の時間差') {
        m = t.match(/行きに\s*(.+?)、戻りに\s*(.+?)かかった.*?時速\s*([\d.]+)\s*km/s); if (!m) return false;
        const td = minutes(m[1]), tu = minutes(m[2]), s10 = Math.round(num(m[3]) * 10), sols = [];
        if (Number.isNaN(td) || Number.isNaN(tu)) return false;
        for (let c10 = 1; c10 < s10; c10++) if ((s10 + c10) * td === (s10 - c10) * tu) sols.push(c10 / 10);   // 往復の距離が等しい
        let ok = 0; for (const c of choices) if (c.isCorrect) { ok++; if (Math.abs(parseFloat(c.htmlText.replace(/^.\s*/, '')) - sols[0]) > 1e-9) return false; }
        return sols.length === 1 && Math.abs(sols[0] - q.correctAnswer) < 1e-9 && ok === 1 && choices.length === 5;
    }
    if (q.title === '具体的な値が少ない流水算') {
        m = t.match(/毎分\s*(\d+)\s*m の川.*?下るのにかかる時間の\s*([\d.]+)\s*倍/s); if (!m) return false;
        const c = num(m[1]), k = num(m[2]), sols = [];
        for (let v = c + 1; v <= 2000; v++) if (Math.abs((v + c) - k * (v - c)) < 1e-9) sols.push(v);   // 下り速さ ＝ k × 上り速さ
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    m = t.match(/(\d+) 分で始点から終点まで達する.*?毎分\s*(\d+)\s*m の速さ.*?始点からちょうど\s*(\d+) 分の (\d+) のところ/s); if (!m) return false;
    const [Tb, w, qq, p] = m.slice(1).map(num), sols = [];
    for (let L = 1; L <= 3000; L++) { const u = L / Tb; if (w - u > 0 && Math.abs((w + u) * (qq - p) - (w - u) * p) < 1e-9) sols.push(L); }   // 速さの比 ＝ 進んだ距離の比
    return sols.length === 1 && sols[0] === q.correctAnswer;
}

// 流水算(u10): 問題文の数値だけから、別の解き方（総当たり）で解き直して照合する
function checkU10(q) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    const mins = s => { const m = s.match(/^(?:(\d+)時間)?(?:(\d+)分)?$/); return m ? (m[1] ? num(m[1]) * 60 : 0) + (m[2] ? num(m[2]) : 0) : NaN; };
    let m;
    if (q.title === '流水算の基本') {
        m = t.match(/時速\s*(\d+)\s*km の.*?川を\s*(\d+)\s*km 下るのに\s*(\d+)\s*時間.*?(\d+)\s*時間こいで/s); if (!m) return false;
        const [v, D, t1, t2] = m.slice(1).map(num), sols = [];
        for (let c = 1; c < v; c++) if ((v + c) * t1 === D) sols.push((v - c) * t2);
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '往復の時間差') {
        m = t.match(/行きに\s*(.+?)、戻りに\s*(.+?)かかった.*?時速\s*([\d.]+)\s*km/s); if (!m) return false;
        const td = mins(m[1]), tu = mins(m[2]), vT = Math.round(num(m[3]) * 10), sols = [];
        for (let cT = 1; cT < vT; cT++) if ((vT + cT) * td === (vT - cT) * tu) sols.push(cT);          // 距離 ＝ 速さ×時間 が往復で等しい
        return sols.length === 1 && Math.abs(sols[0] / 10 - q.correctAnswer) < 1e-9;
    }
    if (q.title === '具体的な値が少ない流水算') {
        m = t.match(/毎分\s*(\d+)\s*m の川.*?時間の\s*([\d.]+)\s*倍/s); if (!m) return false;
        const c = num(m[1]), k = num(m[2]), sols = [];
        for (let v = c + 1; v <= 3000; v++) if (Math.abs((v + c) * 1 - (v - c) * k) < 1e-9) sols.push(v);       // 下りの時間を 1 とすると 距離 ＝(v＋c)×1 ＝(v－c)×k
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    m = t.match(/静止していると\s*(\d+)\s*分で.*?毎分\s*(\d+)\s*m の速さ.*?ちょうど\s*(\d+)\s*分の\s*(\d+)\s*のところ/s); if (!m) return false;
    const [T0, w, qq, p] = m.slice(1).map(num), sols = [];
    for (let L = 1; L <= 1000; L++) if ((w * T0 + L) * qq === 2 * w * T0 * p) sols.push(L);              // 出会う位置 ＝ (w＋u)/(2w) ＝ p/q（u ＝ L/T0）
    return sols.length === 1 && sols[0] === q.correctAnswer;
}

// 時計算(u11): 針の角度を 1/11 分（Lv.3 は 1/143 分）刻みで進めて解き直し、答えの帯分数・選択肢（見分け方）を確認する
function checkU11(q, choices) {
    const t = (q.text + '\n' + q.prompt);
    const parse = c => { const mm = c.htmlText.match(/(\d+)(?:\{\{(\d+)\/(\d+)\}\})?\s*分/); return mm ? { a: Number(mm[1]), r: mm[2] ? Number(mm[2]) : 0, den: mm[3] ? Number(mm[3]) : 0 } : null; };
    let m, exp;
    if (q.title === '指定された時刻（所要時間）・A') {
        m = t.match(/午[前後](\d+)時と午[前後]\d+時の間で(?:再び)?重なり合ってから、午[前後](\d+)時と午[前後]\d+時の間で/); if (!m) return false;
        const [h1, h2] = [Number(m[1]), Number(m[2])], find = h => { for (let T = 660 * h + 1; T < 660 * (h + 1); T++) if ((12 * T - T) % 7920 === 0) return T; return null; };   // T は 12時からの経過を 1/11 分で数えた値
        const T1 = find(h1), T2 = find(h2); if (T1 === null || T2 === null) return false;
        exp = { a: Math.floor((T2 - T1) / 11), r: (T2 - T1) % 11 };
    } else if (q.title === '指定された時刻・A') {
        m = t.match(/なす角度が\s*(\d+)° となる時刻は\s*(\d+)\s*時台には 2 回ある.*?(\d+) 回目/s); if (!m) return false;
        const th = Number(m[1]), h = Number(m[2]), ord = Number(m[3]), hits = [];
        for (let T = 660 * h + 1; T < 660 * (h + 1); T++) { const D = (12 * T - T) % 7920, ang = Math.min(D, 7920 - D); if (ang === 22 * th) hits.push(T); }   // 角度は 1/22 度単位
        if (hits.length !== 2) return false;
        exp = { a: Math.floor((hits[ord - 1] - 660 * h) / 11), r: (hits[ord - 1] - 660 * h) % 11 };
    } else {
        m = t.match(/(\d+) 時から (\d+) 時の間で/); if (!m) return false;
        const h = Number(m[1]), hits = [];
        for (let u = 1; u < 8580; u++) if ((13 * u + 8580 * h) % 102960 === 0) hits.push(u);        // u は 1/143 分単位。2針の角度の和が 360° の倍数
        if (hits.length !== 1) return false;
        exp = { a: Math.floor(hits[0] / 143), r: Math.round((hits[0] % 143) / 11) };
        if ((hits[0] % 143) % 11 !== 0) return false;
    }
    if (!q.mixed || q.mixed.a !== exp.a || q.mixed.r !== exp.r) return false;
    let ok = 0, ruleHits = 0;
    for (const c of choices) {
        const p = parse(c); if (!p) return false;
        const same = p.a === exp.a && p.r === exp.r; if (same !== c.isCorrect) return false;
        if (c.isCorrect) ok++;
        if (p.den === 11 && (p.a % 10) + p.r === 10) ruleHits++;
    }
    if (ok !== 1 || choices.length !== 5) return false;
    if (q.mixed.den === 11) {                                                                      // 分母11の型: 「1の位＋分子＝10」を満たす選択肢が正解だけ
        if (ruleHits !== 1 || (exp.a % 10) + exp.r !== 10) return false;
        if (!q.steps.some(s => s.includes('見分け方') && s.includes('＝ 10'))) return false;       // 解説に見分け方が表示されている
    } else if (!q.steps.some(s => s.includes('13') && s.includes('使えません'))) return false;     // 分母13の型は「使えない」旨を案内
    return true;
}

// その他の速さ(u12): 問題文の数値だけから、別の解き方（総当たり・時間の差）で解き直して照合する
function checkU12(q, choices) {
    const t = (q.text + '\n' + q.prompt), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '区間別に異なる速さ') {
        m = t.match(/往路は時速\s*([\d.]+)\s*km で歩き.*?復路は時速\s*([\d.]+)\s*km で歩いた.*?往復で\s*(\d+)\s*分/s); if (!m) return false;
        const s1 = num(m[1]) * 1000 / 60, s2 = num(m[2]) * 1000 / 60, T = num(m[3]), sols = [];
        for (let d = 10; d <= 20000; d += 10) if (Math.abs(d / s1 + d / s2 - T) < 1e-9) sols.push(d);
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '忘れ物による往復') {
        m = t.match(/分速\s*(\d+)\s*m で友人.*?出発して\s*(\d+)\s*分後.*?分速\s*(\d+)\s*m で自宅に戻り.*?分速\s*(\d+)\s*m でBの家.*?当初の予定より\s*(\d+)\s*分遅れて/s); if (!m) return false;
        const [v1, t0, v2, v3, dl] = m.slice(1).map(num), sols = [];
        for (let D = 100; D <= 40000; D += 100) { const plan = D / v1, actual = t0 + v1 * t0 / v2 + D / v3; if (Math.abs(actual - plan - dl) < 1e-9) sols.push(D); }   // 実際の時間 － 予定の時間 ＝ 遅れ
        return sols.length === 1 && Math.abs(sols[0] / 1000 - q.correctAnswer) < 1e-9;
    }
    m = t.match(/時速\s*(\d+)\s*km で走行すると出発時刻の\s*(\d+)\s*分前に着くが、時速\s*(\d+)\s*km で走行すると出発時刻に\s*(\d+)\s*分遅れ/s); if (!m) return false;
    const [vf, e1, vs, e2] = m.slice(1).map(num), sols = [];
    for (let D = 1; D <= 1000; D++) if (Math.abs(60 * D / vs - e2 - (60 * D / vf + e1)) < 1e-9) sols.push(D);   // 出発までの持ち時間が両ケースで等しい
    if (sols.length !== 1) return false;
    const tf = 60 * sols[0] / vf; let ok = 0;
    for (const c of choices) { const mm = c.htmlText.match(/(?:(\d+)時間)?(?:(\d+)分)?$/); const mins = (mm[1] ? num(mm[1]) * 60 : 0) + (mm[2] ? num(mm[2]) : 0); if ((mins === tf) !== c.isCorrect) return false; if (c.isCorrect) ok++; }
    return ok === 1 && choices.length === 5 && Math.abs(tf - q.correctAnswer) < 1e-9;
}

// 不等式(u13): 問題文の数値だけから、総当たり・場合分けで解き直して照合する
function checkU13(q, choices) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    let m;
    if (q.title === '2項目の大小関係') {
        m = t.match(/1 名につき\s*(\d+)\s*円の.*?が、\s*(\d+)\s*名以上の団体ならば\s*(?:(\d+)\s*割引|(\d+)％引き)/s); if (!m) return false;
        const price = num(m[1]), n0 = num(m[2]), d = m[3] ? num(m[3]) * 10 : num(m[4]);
        let ans = null; for (let n = 1; n < n0; n++) if (price * n * 100 > price * n0 * (100 - d)) { ans = n; break; }    // 個別払いより団体料金の方が安い最少人数
        let ok = 0; for (const c of choices) { if ((c.value === ans) !== c.isCorrect) return false; if (c.isCorrect) ok++; }
        return ans === q.correctAnswer && ok === 1 && choices.length === 5;
    }
    if (q.title.startsWith('3項目の大小関係')) {
        m = t.match(/それぞれの子どもに\s*(\d+)\s*\S+ずつ配ると\s*(\d+)\s*\S+残り、\s*(\d+)\s*\S+ずつ配ると\s*(\d+)\s*\S+以上残り、\s*(\d+)\s*\S+ずつ配ると\s*(\d+)\s*\S+以上足りない/s); if (!m) return false;
        const [a, e, b, c, d, f] = m.slice(1).map(num), sols = [];
        for (let n = 1; n <= 500; n++) { const N = a * n + e; if (N - b * n >= c && d * n - N >= f) sols.push(n); }
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '勝敗ライン') {
        m = t.match(/(\d+) 人のクラスで (\d+) 人のクラス委員.*?(\d+) 人が立候補/s); if (!m) return false;
        const [N, mm, c] = m.slice(1).map(num); let ans = null;
        for (let x = 1; x <= N && ans === null; x++) { const maxOthers = Math.min(c - 1, Math.floor((N - x) / x)); if (maxOthers < mm) ans = x; }   // x 票以上を取りうる他の候補者の最大数が当選人数未満
        let ok = 0; for (const ch of choices) { if ((ch.value === ans) !== ch.isCorrect) return false; if (ch.isCorrect) ok++; }
        return ans === q.correctAnswer && ok === 1 && choices.length === 5;
    }
    if (q.title === '過不足算の不等式・B') {
        m = t.match(/それぞれ\s*(\d+)\s*枚の.*?ア　.*?1 人当たり\s*(\d+)\s*枚ずつ配ると\s*(\d+)\s*枚以上余り、1 人当たり\s*(\d+)\s*枚ずつ配ると\s*(\d+)\s*枚以上不足する.*?イ　.*?1 人当たり\s*(\d+)\s*枚ずつ配ると\s*(\d+)\s*枚以上余り、1 人当たり\s*(\d+)\s*枚ずつ配ると\s*(\d+)\s*枚以上不足する.*?差は\s*(\d+)\s*人/s); if (!m) return false;
        const [P, a1, r1, a1b, s1, a2, r2, a2b, s2, d] = m.slice(1).map(num), sols = [];
        if (a1b !== a1 + 1 || a2b !== a2 + 1) return false;
        for (let n = 1; n <= 400; n++) { if (P - a1 * n < r1 || a1b * n - P < s1) continue; for (let k = 1; k <= 400; k++) if (P - a2 * k >= r2 && a2b * k - P >= s2 && Math.abs(n - k) === d) sols.push(n + k); }
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    m = t.match(/総額\s*([\d,]+)\s*円で.*?1 \S+ (\d+) 円で.*?販売予定数の\s*(\d+) 分の\s*(\d+)\s*が売れると、\s*([\d,]+)\s*円の利益.*?([\d,]+) 円以上の利益/s); if (!m) return false;
    const [C, P, b, a, pi, T2] = m.slice(1).map(num), Ns = [];
    for (let N = 2; N <= 5000; N += 2) if ((a * N) % b === 0 && (a * N / b) * P - C === pi) Ns.push(N);
    if (Ns.length !== 1) return false;
    const half = Ns[0] / 2; let pmin = null; for (let p = 1; p <= P && pmin === null; p++) if (half * P + half * p - C >= T2) pmin = p;
    return pmin === q.correctAnswer;
}

// 仕事算(u14): 問題文の数値だけから、別の解き方（総当たり・分数）で解き直して照合する
function checkU14(q, choices) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    const dur = s => { const m = s.match(/^(?:(\d+)時間)?(?:(\d+)分)?$/); return m ? (m[1] ? num(m[1]) * 60 : 0) + (m[2] ? num(m[2]) : 0) : NaN; };
    const clock = s => { const m = s.match(/^(午[前後])(\d+)時(?:(\d+)分)?$/); return m ? (m[1] === '午後' ? 720 : 0) + num(m[2]) * 60 + (m[3] ? num(m[3]) : 0) : NaN; };
    let m;
    if (q.title === '仕事算の基本') {
        m = t.match(/Aだけで行うと\s*(\d+)\s*\S+、Bだけで行うと\s*(\d+)\s*\S+を要する/); if (!m) return false;
        const [x, y] = m.slice(1).map(num), sols = [];
        for (let d = 1; d <= 2000; d++) if (d * (x + y) === x * y) sols.push(d);                 // d/x ＋ d/y ＝ 1
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '3人以上の仕事算') {
        m = t.match(/3 人で.+?と\s*(\d+) 時間、AとCの 2 人で.+?と\s*(\d+) 時間、Cが 1 人で.+?と\s*(\d+) 時間/); if (!m) return false;
        const [t1, t2, t3] = m.slice(1).map(num), bc = 1 / t1 - 1 / t2 + 1 / t3;                 // B ＝ 1/t1 － 1/t2、C ＝ 1/t3
        return bc > 0 && Math.abs(1 / bc - q.correctAnswer) < 1e-9 && Number.isInteger(q.correctAnswer);
    }
    if (q.title === '仕事の交替') {
        m = t.match(/Aが 1 人で行うと\s*(\d+)\s*日かかり、Bが 1 人で行うと\s*(\d+)\s*日.*?(\d+)\s*日で終わった.*?([AB])が/s); if (!m) return false;
        const [x, y, T] = [num(m[1]), num(m[2]), num(m[3])], sols = [];
        for (let k = 1; k < T; k++) if (k * y + (T - k) * x === x * y) sols.push(k);                // k/x ＋ (T－k)/y ＝ 1
        return sols.length === 1 && (m[4] === 'A' ? sols[0] : T - sols[0]) === q.correctAnswer;
    }
    if (q.title === 'のべ算') {
        m = t.match(/ポンプ\s*(\d+)\s*台でくみ出すと\s*(.+?)かかる.*?プールの水を(午[前後]\d+時(?:\d+分)?)にポンプ\s*(\d+)\s*台で.*?途中から\s*(\d+)\s*台のポンプを追加.*?(午[前後]\d+時(?:\d+分)?)にくみ出し終わった/s); if (!m) return false;
        const N = num(m[1]), D = dur(m[2]), s0 = clock(m[3]), p0 = num(m[4]), mm = num(m[5]), e0 = clock(m[6]), E = e0 - s0, sols = [];
        for (let x = 1; x < E; x++) if (p0 * x + (p0 + mm) * (E - x) === N * D) sols.push(s0 + x);   // 追加するまでの x 分間は p0 台、残りは p0＋m 台
        if (sols.length !== 1) return false;
        let ok = 0; for (const c of choices) { const v = clock(c.htmlText.replace(/^.\s*/, '')); if (Number.isNaN(v) || (v === sols[0]) !== c.isCorrect) return false; if (c.isCorrect) ok++; }
        return ok === 1 && choices.length === 5 && sols[0] === q.correctAnswer;
    }
    m = t.match(/Aのポンプだけで\s*(\d+)\s*分間排水し、その後Bのポンプだけで\s*(\d+)\s*分間.*?同時に\s*(\d+)\s*分間排水し、その後Bのポンプだけで\s*(\d+)\s*分間.*?([AB])のポンプだけで排水して/s); if (!m) return false;
    const [a1, b1, a2, b2] = m.slice(1, 5).map(num), pn = (a2 + b2 - b1), qn = (a1 - a2);       // a : b ＝ (a2＋b2－b1) : (a1－a2)
    if (pn <= 0 || qn <= 0) return false;
    const g = Fr.gcd(pn, qn), x = pn / g, y = qn / g, W = a1 * x + b1 * y;
    if (W !== a2 * (x + y) + b2 * y) return false;
    const ans = m[5] === 'A' ? W / x : W / y;
    return Number.isInteger(ans) && ans === q.correctAnswer;
}

// ニュートン算(u15): 問題文の数値だけから、別の解き方（総当たり・秒ごとのシミュレーション）で解き直して照合する
function checkU15(q, choices) {
    const t = (q.text + '\n' + q.prompt), num = x => Number(String(x).replace(/,/g, ''));
    const secOf = s => { const m = s.match(/^(\d+)分(?:(\d+)秒)?$/); return m ? num(m[1]) * 60 + (m[2] ? num(m[2]) : 0) : NaN; };
    const timeChoicesOk = (ans) => { let ok = 0; for (const c of choices) { const v = secOf(c.htmlText.replace(/^.\s*/, '')); if (Number.isNaN(v) || (v === ans) !== c.isCorrect) return false; if (c.isCorrect) ok++; } return ok === 1 && choices.length === 5; };
    let m;
    if (q.title === 'ニュートン算の基本') {
        m = t.match(/(\d+) ℓ の水が入っている容器.*?ポンプAを 1 台用いれば\s*(\d+)\s*分.*?毎分\s*(\d+)\s*ℓ の割合.*?ポンプAを\s*(\d+)\s*台用いれば/s); if (!m) return false;
        const [W, t1, r, k] = m.slice(1).map(num); let p = null;
        for (let pp = 1; pp <= 5000; pp++) if (W + r * t1 === pp * t1) { p = pp; break; }          // 1台のポンプの毎分排水量
        if (p === null) return false;
        let sec = null; for (let s = 1; s <= 20000; s++) if ((k * p - r) * s >= 60 * W) { sec = s; break; }     // 水がなくなる最初の秒
        return sec === q.correctAnswer && timeChoicesOk(sec);
    }
    if (q.title === '不明な情報が2つの場合') {
        m = t.match(/毎分\s*(\d+)\s*人ずつ売っていくと\s*(\d+)\s*分で行列がなくなり、毎分\s*(\d+)\s*人ずつ売っていくと\s*(\d+)\s*分で/s); if (!m) return false;
        const [s1, t1, s2, t2] = m.slice(1).map(num), sols = [];
        for (let N = 0; N <= 5000; N++) for (let r = 0; r <= 300; r++) if (N + r * t1 === s1 * t1 && N + r * t2 === s2 * t2) sols.push(N);
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    m = t.match(/ポンプ\s*(\d+)\s*台で排水すると\s*(\d+)\s*分で水が無くなり、ポンプ\s*(\d+)\s*台で排水すると\s*(\d+)\s*分で.*?ポンプ\s*(\d+)\s*台で排水したとき/s); if (!m) return false;
    const [n1, t1, n2, t2, n3] = m.slice(1).map(num), sols = [];
    for (let W = 1; W <= 2000; W++) for (let r = 0; r <= 60; r++) if (W + r * t1 === n1 * t1 && W + r * t2 === n2 * t2) sols.push([W, r]);   // p＝1（ポンプ1台の排水量を単位）
    if (sols.length !== 1) return false;
    const [W, r] = sols[0]; let sec = null; for (let s = 1; s <= 20000; s++) if ((n3 - r) * s >= 60 * W) { sec = s; break; }
    return sec === q.correctAnswer && timeChoicesOk(sec);
}

// 比と割合(u16): 問題文の数値だけから、別の解き方（総当たり・分数）で解き直して照合する
function checkU16(q, choices) {
    const t = (q.text + '\n' + q.prompt).replace(/\{\{(\d+)\/(\d+)\}\}/g, '$1/$2'), num = x => Number(String(x).replace(/,/g, ''));
    const one = () => { let ok = 0; for (const c of choices) if (c.isCorrect) ok++; return ok === 1 && choices.length === 5; };
    let m;
    if (q.title === '連比') {
        m = t.match(/AとBの金額の比は (\d+):(\d+)、BとCの金額の比は (\d+):(\d+) となり、Aは ([\d,]+) 円/); if (!m) return false;
        const [p, qq, r, s, a] = m.slice(1).map(num), A = p * r, B = qq * r, C = s * qq;                // B を qq×r にそろえる（A:B＝pr:qr、B:C＝qr:sq）
        const total = a * (A + B + C) / A;
        return Number.isInteger(total) && total === q.correctAnswer && one() && choices.some(c => c.isCorrect && c.value === total);
    }
    if (q.title === '比と割合で表された情報の整理') {
        m = t.match(/男性と女性の比は、(\d+):(\d+) である.*?事務職と技術職の社員の比は、(\d+):(\d+) であり.*?男性と女性の比は、(\d+):(\d+) である。社員の総数が (\d+) 人.*?事務職の(女性|男性)/s); if (!m) return false;
        const [mm, f, c, tt, tm, tf, T] = m.slice(1, 8).map(num), who = m[8];
        let found = null;                                                                           // 全体の男性数 male を総当たり: 各人数がすべて整数になる組み合わせ
        for (let male = 1; male < T; male++) { if (male * f !== (T - male) * mm) continue; found = male; }
        if (found === null) return false;
        const female = T - found, tech = T * tt / (c + tt), office = T - tech, techM = tech * tm / (tm + tf), techF = tech - techM;
        const ans = who === '女性' ? female - techF : found - techM;
        return [tech, office, techM, techF].every(Number.isInteger) && ans === q.correctAnswer;
    }
    if (q.title === '倍数算') {
        m = t.match(/1 回目が (\d+):(\d+) となり、2 回目が (\d+):(\d+) となった.*?の.*?は (\d+) 人(増加|減少)し、.*?は (\d+) 人(増加|減少)した/s); if (!m) return false;
        const [a, b, c, d] = m.slice(1, 5).map(num), d1 = (m[6] === '増加' ? 1 : -1) * num(m[5]), d2 = (m[8] === '増加' ? 1 : -1) * num(m[7]), sols = [];
        for (let A1 = 1; A1 <= 20000; A1++) { if ((A1 * b) % a !== 0) continue; const B1 = A1 * b / a; if ((A1 + d1) * d === c * (B1 + d2) && A1 + d1 > 0 && B1 + d2 > 0) sols.push(A1); }
        return sols.length === 1 && sols[0] === q.correctAnswer;
    }
    if (q.title === '項目別整理・B') {
        m = t.match(/(\d+) 名の生徒.*?回答した者は (\d+) 名で、そのうちの(\d+)\/(\d+)が女子であった.*?女子全体の(\d+)\/(\d+)を占めて/s); if (!m) return false;
        const [N, k, p1, q1, p2, q2] = m.slice(1).map(num), sols = [];
        for (let G = 1; G < N; G++) { const tg = G * p2 / q2; if (Number.isInteger(tg) && tg * q1 === k * p1) sols.push(G); }    // 旅行の女子 ＝ k×p1/q1 ＝ 女子全体×p2/q2
        if (sols.length !== 1) return false;
        const g = Fr.gcd(N - sols[0], N), exp = [(N - sols[0]) / g, N / g]; let ok = 0;
        for (const c of choices) { const mm = c.htmlText.match(/\{\{(\d+)\/(\d+)\}\}/); if (!mm) return false; const same = Number(mm[1]) === exp[0] && Number(mm[2]) === exp[1]; if (same !== c.isCorrect) return false; if (Fr.gcd(Number(mm[1]), Number(mm[2])) !== 1) return false; if (c.isCorrect) ok++; }
        return ok === 1 && choices.length === 5 && q.fraction.n === exp[0] && q.fraction.d === exp[1];
    }
    m = t.match(/\S+ (\d+) \S+をすくい上げ、1 \S+ずつ印.*?再び\S+ (\d+) \S+をすくい上げ.*?、(\d+) \S+に印がついていた/s); if (!m) return false;
    const [a, b, c] = m.slice(1).map(num), est = a * b / c, vals = choices.map(x => x.value);
    const nearest = vals.reduce((best, v) => (Math.abs(v - est) < Math.abs(best - est) ? v : best), vals[0]);       // 推定値にいちばん近い選択肢
    return nearest === q.correctAnswer && one();
}

console.log(`単元数: ${R.UnitRegistry.list().length} / 各単元 ${N} 回生成\n`);
for (const u of R.UnitRegistry.list()) {
    const issues = {};
    const note = (k, ex) => { issues[k] = issues[k] || { n: 0, ex }; issues[k].n++; };
    const seen = new Set();
    for (let i = 0; i < N; i++) {
        let q;
        try { q = R.generateQuestion(u.id); } catch (e) { note('例外:' + e.message, ''); continue; }
        if (typeof q.text !== 'string' || !q.text || typeof q.prompt !== 'string') note('text/prompt欠落', q.title);
        if (!Array.isArray(q.steps) || q.steps.length === 0) note('steps欠落', q.title);
        if (!Number.isFinite(q.correctAnswer)) note('答えが数値でない', `${q.title}: ${q.correctAnswer}`);
        else {
            if (!q.decimals && !q.mixed && !q.fraction && !Number.isInteger(q.correctAnswer * (q.allowHalf ? 2 : 1))) note('答えが整数でない（0.5刻みの問題は allowHalf を指定）', `${q.title}: ${q.text} → ${q.correctAnswer}`);
            if (q.correctAnswer <= 0) note('答えが0以下', `${q.title}: ${q.text} → ${q.correctAnswer}`);
        }
        if (/NaN|undefined|Infinity/.test(JSON.stringify(q))) note('NaN/undefined混入', `${q.title}: ${q.text}`);
        const ch = R.generateChoices(q);
        if (ch.length !== 5 || ch.filter(c => c.isCorrect).length !== 1) note('選択肢が5個/正解1つでない', q.title);
        seen.add(q.text + q.prompt);
        if (u.id === 'u10' && !checkU10(q, ch)) note('u10: 別解法と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u16' && !checkU16(q, ch)) note('u16: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u15' && !checkU15(q, ch)) note('u15: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u14' && !checkU14(q, ch)) note('u14: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u13' && !checkU13(q, ch)) note('u13: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u12' && !checkU12(q, ch)) note('u12: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u11' && !checkU11(q, ch)) note('u11: 独立計算・選択肢・見分け方の不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u10' && !checkU10(q)) note('u10: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u9' && !checkU9(q)) note('u9: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u8' && !checkU8(q, ch)) note('u8: 別解法と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u8' && !checkU8(q, ch)) note('u8: 独立計算と不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u7' && !checkU7(q)) note('u7: 総当たりと不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u7' && !checkU7(q)) note('u7: 総当たりと不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u6' && !checkU6(q, ch)) note('u6: 総当たりと不一致', q.title + ' ' + q.text.replace(/\n/g, ' / '));
        if (u.id === 'u5' && !checkU5(q)) note('u5: 総当たりと不一致', q.title + ' ' + q.text);
        for (const mm of (q.text + q.prompt).matchAll(/\{\{(\d+)\/(\d+)\}\}/g)) { const g = (a, b) => b ? g(b, a % b) : a; if (g(+mm[1], +mm[2]) !== 1) note('問題文の分数が既約でない', mm[0]); }
        if (u.id === 'u4' && !checkU4(q, ch)) note('u4: 総当たりと不一致', q.title + ' ' + q.text);
        if (u.id === 'u3' && !checkU3(q)) note('u3: 総当たりと不一致', q.title + ' ' + q.text);
        if (u.id === 'u2' && !checkU2(q)) note('u2: 総当たりと不一致', q.text);
        if (u.id === 'u1' && !checkU1(q)) note('u1: 独立計算と不一致', q.text);
    }
    const keys = Object.keys(issues);
    totalBad += keys.length;
    console.log(`${keys.length ? 'NG' : 'OK'}  ${u.id.padEnd(3)} ${u.name}  (異なる問題文 ${seen.size}${seen.size < 100 ? ' ⚠少ない' : ''})`);
    keys.forEach(k => console.log(`      - ${k}  ×${issues[k].n}   例: ${String(issues[k].ex).slice(0, 90)}`));
}
console.log(`\n問題のある単元(種類のべ): ${totalBad}`);
process.exit(totalBad ? 1 : 0);
