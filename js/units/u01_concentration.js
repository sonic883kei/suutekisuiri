/**
 * u01_concentration.js  —  ① 濃度
 * 1単元＝1ファイル。core.js の UnitRegistry に登録するだけで、ui.js / index.html の改修なしに単元が増える。
 *   generate(level) … 毎回数値を抽選して問題オブジェクトを返す（答えが整数になる条件を満たす数値だけを抽選すること）
 *   fixed: 'data/xxx.json' を指定すると、数値を変えにくい固定問題をJSONから出題できる（generate より優先）
 * 乱数は getRandomInt / getRandomChoice（core.js・シード固定対応）を使う。Math.random を直接使わないこと。
 */
UnitRegistry.register({
    id: 'u1', name: '① 濃度', chap: 1,
    generate(level) {
        const U = '① 濃度';
        const fmt = (v) => String(Number(v.toFixed(2)));
        const find = (make, ok, fallback) => {
            for (let i = 0; i < 3000; i++) { const p = make(); if (ok(p)) return p; }
            return fallback;
        };
        const W = [100, 150, 200, 250, 300, 400];
        const pattern = getRandomInt(1, 5);

        if (pattern === 1) { // 2食塩水の混合
            const p = find(() => {
                const c1 = getRandomInt(2, 9);
                return { w1: getRandomChoice(W), w2: getRandomChoice(W), c1: c1, c2: getRandomInt(10, 20) };
            }, q => (q.w1 * q.c1 + q.w2 * q.c2) % (q.w1 + q.w2) === 0,
            { w1: 200, c1: 3, w2: 100, c2: 12 });
            const salt1 = p.w1 * p.c1 / 100, salt2 = p.w2 * p.c2 / 100;
            const totalSalt = salt1 + salt2, totalW = p.w1 + p.w2;
            const ans = Math.round(totalSalt * 100 / totalW);
            return {
                unit: U, title: '混合の基本',
                text: `${p.c1}％の食塩水 ${p.w1}g と ${p.c2}％の食塩水 ${p.w2}g を混ぜました。`,
                prompt: 'できた食塩水の濃度は何％ですか？',
                correctAnswer: ans, unitSuffix: '％', step: 1,
                steps: [
                    `1つ目の食塩水に含まれる食塩: ${p.w1}g × ${p.c1 / 100} ＝ ${fmt(salt1)}g`,
                    `2つ目の食塩水に含まれる食塩: ${p.w2}g × ${p.c2 / 100} ＝ ${fmt(salt2)}g`,
                    `混ぜた後の食塩の合計: ${fmt(salt1)}g ＋ ${fmt(salt2)}g ＝ ${fmt(totalSalt)}g`,
                    `混ぜた後の全体の重さ: ${p.w1}g ＋ ${p.w2}g ＝ ${totalW}g`,
                    `できた食塩水の濃度: (${fmt(totalSalt)}g ÷ ${totalW}g) × 100 ＝ ${ans}％`
                ]
            };
        }

        if (pattern === 2) { // 水の追加
            const p = find(() => ({
                w: getRandomChoice([150, 200, 250, 300, 350, 400, 500]),
                c1: getRandomChoice([10, 12, 15, 18, 20, 25]),
                c2: getRandomChoice([4, 5, 6, 8, 10])
            }), q => q.c1 > q.c2 && (q.w * q.c1) % q.c2 === 0,
            { w: 200, c1: 15, c2: 5 });
            const salt = p.w * p.c1 / 100;
            const targetW = p.w * p.c1 / p.c2;
            const ans = targetW - p.w;
            return {
                unit: U, title: '水の追加',
                text: `${p.c1}％の食塩水 ${p.w}g に水を加えて ${p.c2}％の食塩水にします。`,
                prompt: '加える水の量は何 g ですか？',
                correctAnswer: ans, unitSuffix: 'g', step: 10,
                steps: [
                    `食塩水に含まれる食塩の重さ: ${p.w}g × ${p.c1 / 100} ＝ ${fmt(salt)}g`,
                    `水を加えても食塩の量は変わりません。`,
                    `${p.c2}％の食塩水に必要な全体の重さ: ${fmt(salt)}g ÷ ${p.c2 / 100} ＝ ${targetW}g`,
                    `加える水の量: ${targetW}g － ${p.w}g ＝ ${ans}g`
                ]
            };
        }

        if (pattern === 3) { // 食塩の追加
            const p = find(() => ({
                w: getRandomChoice([200, 250, 300, 400, 500]),
                c1: getRandomChoice([5, 8, 10, 12, 15]),
                c2: getRandomChoice([20, 25, 30, 40])
            }), q => {
                if ((q.w * (100 - q.c1)) % 100 !== 0) return false;
                const water = q.w * (100 - q.c1) / 100;
                return (water * 100) % (100 - q.c2) === 0;
            }, { w: 300, c1: 8, c2: 20 });
            const salt = p.w * p.c1 / 100;
            const water = p.w - salt;
            const totalW = water * 100 / (100 - p.c2);
            const ans = totalW - p.w;
            return {
                unit: U, title: '食塩の追加',
                text: `${p.c1}％の食塩水 ${p.w}g に食塩を加えて ${p.c2}％の食塩水にします。`,
                prompt: '加える食塩の量は何 g ですか？',
                correctAnswer: ans, unitSuffix: 'g', step: 5,
                steps: [
                    `もとの食塩水に含まれる食塩: ${p.w}g × ${p.c1 / 100} ＝ ${fmt(salt)}g`,
                    `水の重さ: ${p.w}g － ${fmt(salt)}g ＝ ${fmt(water)}g（食塩を加えても水の量は変化しません）`,
                    `${p.c2}％の食塩水では水が全体の ${100 - p.c2}％ を占めるので、全体の重さ ＝ ${fmt(water)}g ÷ ${(100 - p.c2) / 100} ＝ ${totalW}g`,
                    `加える食塩の量: ${totalW}g － ${p.w}g ＝ ${ans}g`
                ]
            };
        }

        if (pattern === 4) { // 水の蒸発
            const p = find(() => ({
                w: getRandomChoice([200, 300, 400, 500, 600]),
                c1: getRandomChoice([3, 4, 5, 6, 8]),
                c2: getRandomChoice([6, 8, 10, 12, 15, 16, 20])
            }), q => q.c2 > q.c1 && (q.w * q.c1) % q.c2 === 0,
            { w: 400, c1: 5, c2: 8 });
            const salt = p.w * p.c1 / 100;
            const targetW = p.w * p.c1 / p.c2;
            const ans = p.w - targetW;
            return {
                unit: U, title: '水の蒸発',
                text: `${p.c1}％の食塩水 ${p.w}g を加熱して蒸発させ、${p.c2}％の食塩水にします。`,
                prompt: '蒸発させる水の量は何 g ですか？',
                correctAnswer: ans, unitSuffix: 'g', step: 10,
                steps: [
                    `食塩水に含まれる食塩の重さ: ${p.w}g × ${p.c1 / 100} ＝ ${fmt(salt)}g（蒸発させても食塩の量は不変）`,
                    `${p.c2}％の食塩水にするための全体の重さ: ${fmt(salt)}g ÷ ${p.c2 / 100} ＝ ${targetW}g`,
                    `蒸発させる水の量: ${p.w}g － ${targetW}g ＝ ${ans}g`
                ]
            };
        }

        // pattern 5: 2つの食塩水の交換
        const p = find(() => ({
            wa: getRandomChoice([100, 200, 300, 400, 600]),
            wb: getRandomChoice([100, 200, 300, 400, 600]),
            ca: getRandomChoice([4, 6, 8, 10]),
            cb: getRandomChoice([12, 14, 16, 18, 20])
        }), q => (q.wa * q.wb) % (q.wa + q.wb) === 0,
        { wa: 300, wb: 200, ca: 6, cb: 12 });
        const totalW = p.wa + p.wb;
        const m = (p.wa * p.ca + p.wb * p.cb) / totalW;      // 全体の平均濃度(％)
        const need = p.wa * (m - p.ca) / 100;                 // Aに必要な食塩の増加量
        const x = p.wa * p.wb / totalW;
        return {
            unit: U, title: '2つの食塩水の交換',
            text: `容器Aには ${p.ca}％の食塩水 ${p.wa}g、容器Bには ${p.cb}％の食塩水 ${p.wb}g が入っています。両方から同時に同じ重さ (xg) を取り出して互いに入れ替えてよく混ぜたところ、どちらの容器も同じ濃度になりました。`,
            prompt: '取り出した食塩水の重さ (x) は何 g ですか？',
            correctAnswer: x, unitSuffix: 'g', step: 5,
            steps: [
                `同じ濃度になるということは、全体を混ぜた平均濃度になるということです。`,
                `全食塩量: ${p.wa}g × ${p.ca / 100} ＋ ${p.wb}g × ${p.cb / 100} ＝ ${fmt(p.wa * p.ca / 100 + p.wb * p.cb / 100)}g、全体量: ${totalW}g → 平均濃度 ＝ ${fmt(m)}％`,
                `Aを ${p.ca}％ → ${fmt(m)}％ にするには、食塩を ${p.wa}g × ${fmt((m - p.ca) / 100)} ＝ ${fmt(need)}g 増やす必要があります。`,
                `xg を入れ替えると、Aの食塩は ${p.cb - p.ca}％ ぶん × xg ＝ x × ${(p.cb - p.ca) / 100} g 増えます。`,
                `x ＝ ${fmt(need)} ÷ ${(p.cb - p.ca) / 100} ＝ ${x}g`,
                `【検算の公式】 x ＝ (Aの量 × Bの量) ÷ (Aの量 ＋ Bの量) ＝ (${p.wa} × ${p.wb}) ÷ ${totalW} ＝ ${x}g`
            ]
        };
    }
});
