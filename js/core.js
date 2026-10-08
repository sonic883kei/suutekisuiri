/**
 * core.js
 * 乱数エンジン（SPIアプリの common.js と同じ PRNG）・単元レジストリ・共通選択肢生成・出題関数
 *
 * 読み込み順: core.js → js/units/*.js → ui.js
 * 公開: initPRNG / getRand / getRandomInt / getRandomChoice / shuffleArray /
 *       UnitRegistry / loadFixedPools / generateQuestion / generateChoices
 */

let currentPRNG = Math.random;

function stringToSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    return h >>> 0;
}

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function initPRNG(seedStr) {
    if (seedStr) {
        const numericSeed = stringToSeed(seedStr);
        currentPRNG = mulberry32(numericSeed);
    } else {
        currentPRNG = Math.random;
    }
}

function getRand() {
    return currentPRNG();
}

function getRandomInt(min, max) {
    return Math.floor(getRand() * (max - min + 1)) + min;
}

function getRandomChoice(arr) {
    return arr[Math.floor(getRand() * arr.length)];
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(getRand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ----------------------------------------------------
// 分数の扱い
//   問題文・解説では分数を {{分子/分母}} という記号で書く（例: {{5/8}}）。画面では縦書きの分数に変換される。
//   Fr は約分済みの有理数（既約分数）を扱う小さな道具。Fr.str() は {{n/d}} 形式（整数なら数字だけ）を返す。
// ----------------------------------------------------
const Fr = {
    gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },
    make(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = Fr.gcd(n, d) || 1; return { n: n / g, d: d / g }; },
    add(x, y) { return Fr.make(x.n * y.d + y.n * x.d, x.d * y.d); },
    sub(x, y) { return Fr.make(x.n * y.d - y.n * x.d, x.d * y.d); },
    mul(x, y) { return Fr.make(x.n * y.n, x.d * y.d); },
    div(x, y) { return Fr.make(x.n * y.d, x.d * y.n); },
    str(x) { return x.d === 1 ? String(x.n) : `{{${x.n}/${x.d}}}`; }
};

function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function renderFractions(str) {   // {{n/d}} → 縦書き分数のHTML
    return String(str).replace(/\{\{(\d+)\/(\d+)\}\}/g, '<span class="frac"><span class="frac-n">$1</span><span class="frac-d">$2</span></span>');
}
function renderRich(str) { return renderFractions(escapeHTML(str)); }   // 問題文用（HTMLをエスケープしてから分数変換）

// ----------------------------------------------------
// 単元レジストリ: 各 js/units/*.js が register() で自分を登録する
// ----------------------------------------------------
const UnitRegistry = (() => {
    const units = [];
    return {
        register(def) {
            if (!def.id || !def.name || (typeof def.generate !== 'function' && !def.fixed)) {
                throw new Error('UnitRegistry.register: id / name と generate(または fixed) が必要です: ' + def.id);
            }
            if (units.some(u => u.id === def.id)) throw new Error('単元IDが重複しています: ' + def.id);
            units.push(def);
        },
        // 登録順ではなく単元番号順で返す
        list() { return [...units].sort((a, b) => parseInt(a.id.slice(1)) - parseInt(b.id.slice(1))); },
        get(id) { return units.find(u => u.id === id); }
    };
})();

// 固定問題JSON（fixed を指定した単元のみ）。取得できなければ generate にフォールバック
const FixedPools = {};
async function loadFixedPools() {
    for (const u of UnitRegistry.list()) {
        if (!u.fixed) continue;
        try {
            const res = await fetch(u.fixed);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) FixedPools[u.id] = data;
            }
        } catch (e) { /* 未配置・file:// の場合は静かにスルー */ }
    }
}

function generateQuestion(unitId, level) {
    const u = UnitRegistry.get(unitId);
    if (!u) throw new Error('未登録の単元です: ' + unitId);
    const pool = FixedPools[unitId];
    if (pool && pool.length > 0) return JSON.parse(JSON.stringify(pool[getRandomInt(0, pool.length - 1)]));
    if (typeof u.generate !== 'function') throw new Error('固定問題JSONが読み込めず generate もありません: ' + unitId);
    return u.generate(level);
}

// ----------------------------------------------------
// 選択肢生成ロジック（5択・正解は1つ）
// ----------------------------------------------------
        function generateChoices(q) {
            if (q.customChoices) return q.customChoices;
            if (q.consecutive) {   // 過去問形式: 等間隔(step)の5択。正解の位置はランダム
                const st = q.step || 1, c = q.correctAnswer, suf = q.unitSuffix || '';
                let posMin = 0, posMax = Math.max(0, Math.min(4, Math.ceil(c / st - 1e-9) - 1));   // 値が0以下にならない範囲（小数の刻みにも対応）
                if (q.maxValue !== undefined) posMin = Math.max(0, 4 - Math.floor((q.maxValue - c) / st));   // 上限(例:100点)を超えない範囲
                if (posMin > posMax) posMin = posMax;
                const pos = getRandomInt(posMin, posMax);
                const lab = ['①', '②', '③', '④', '⑤'];
                const show = (v) => (q.decimals ? v.toFixed(q.decimals) : v.toLocaleString());
                return [0, 1, 2, 3, 4].map(i => {
                    const val = c + (i - pos) * st;
                    return { value: val, label: lab[i], htmlText: `${lab[i]} ${q.unitPrefix || ''}${show(val)} ${suf}`.trim(), isCorrect: val === c };
                });
            }

            const correctVal = q.correctAnswer;
            const unitSuffix = q.unitSuffix || '';
            const step = q.step || 1;

            let set = new Set();
            set.add(correctVal);

            let attempts = 0;
            while (set.size < 5 && attempts < 100) {
                attempts++;
                const offset = (getRandomInt(1, 4) * (getRand() < 0.5 ? 1 : -1)) * step;
                const candidate = correctVal + offset;
                if (candidate > 0 && candidate !== correctVal) set.add(candidate);
            }
            while (set.size < 5) {
                set.add(correctVal + (set.size) * step);
            }

            const labels = ['①', '②', '③', '④', '⑤'];
            const arr = Array.from(set).sort((a, b) => a - b);
            return arr.map((val, idx) => ({
                value: val,
                label: labels[idx] || `${idx + 1}`,
                htmlText: `${labels[idx] || ''} ${q.unitPrefix || ''}${val.toLocaleString()} ${unitSuffix}`.trim(),
                isCorrect: val === correctVal
            }));
        }
