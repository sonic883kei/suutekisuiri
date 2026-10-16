/**
 * ui.js
 * 画面制御・状態管理・CBTモード・モーダル・統計表示ロジック
 *
 * 単元の知識は持たず、UnitRegistry（core.js）から単元一覧を取得する。
 * 単元を追加するときは js/units/ にファイルを足し、index.html に <script> を1行足すだけでよい。
 * 読み込み順: core.js → js/units/*.js → ui.js（最後）
 */

const ALL_UNITS = UnitRegistry.list();

        let configUnit = 'all';

        let currentQuestion = null;
        let isAnswered = false;
        let totalCount = 0;
        let correctCount = 0;
        
        let questionStartTime = 0;

        let isCBTMode = false;
        let isReviewMode = false;          // 間違えた問題復習モード
        let lastReviewKey = null;          // 直前に出した復習パターン（同じパターンが続かないように）
        let reviewWrongOnly = false;       // 回答振り返りの「不正解だけ表示」
        let cbtSelectedUnits = [];
        let cbtTotalQuestions = 10;
        let cbtMaxOverallTime = 720; // 12分
        let cbtQuestionIndex = 0;
        let cbtOverallTimerInterval = null;
        let cbtOverallRemainingTime = 720;
        let cbtUnitQueue = [];

        let globalHistory = [];
        let sessionAnswers = [];

        // 単元ごとのJSON問題ストレージ: { 'u1': [ ... ], 'u2': [ ... ] }

        // --- 画面表示・切替制御 ---
        function hideAllViews() {
            document.getElementById('view-landing').classList.add('hidden');
            document.getElementById('view-select').classList.add('hidden');
            document.getElementById('view-practice').classList.add('hidden');
            document.getElementById('cbt-status-bar').classList.add('hidden');
            document.getElementById('cbt-result-card').classList.add('hidden');
            document.getElementById('nav-change-config-btn').classList.add('hidden');
            ['nav-review-btn', 'nav-stats-btn', 'nav-reset-btn', 'nav-history-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.classList.add('hidden');
            });
        }

        function goToLanding() {
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);
            isCBTMode = false;
            isReviewMode = false;
            updateMistakeBadges();
            hideAllViews();
            document.getElementById('view-landing').classList.remove('hidden');
            ['nav-review-btn', 'nav-stats-btn', 'nav-reset-btn', 'nav-history-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.classList.remove('hidden');
            });
        }

        function goToSelectScreen() {
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);
            isCBTMode = false;
            isReviewMode = false;
            hideAllViews();
            document.getElementById('view-select').classList.remove('hidden');
            ['nav-review-btn', 'nav-stats-btn', 'nav-reset-btn', 'nav-history-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.classList.remove('hidden');
            });
        }

        function renderUnitSelectionGrid() {
            const grid = document.getElementById('unit-selection-grid');
            grid.innerHTML = `
                <button onclick="selectConfigUnit('all')" data-unit="all" class="${cfgUnitBtnClass('all', true)}">
                    <i class="fa-solid fa-layer-group text-sm"></i>
                    <span class="text-xs">全23単元 混合演習</span>
                </button>
            `;
            ALL_UNITS.forEach(u => {
                const btn = document.createElement('button');
                btn.onclick = () => selectConfigUnit(u.id);
                btn.setAttribute('data-unit', u.id);
                btn.className = cfgUnitBtnClass(u.id, false);
                btn.innerHTML = `<span class="text-xs font-bold truncate">${u.name}</span>`;
                grid.appendChild(btn);
            });
        }

        function cfgUnitBtnClass(unitId, selected) {
            const wide = unitId === 'all' ? ' col-span-2 sm:col-span-3' : '';   // 「全単元 混合演習」は常に1行ぶんの幅
            return 'cfg-unit-btn p-2.5 rounded-xl border text-left transition flex items-center space-x-2' + wide +
                (selected ? ' bg-indigo-600 border-indigo-400 text-white font-bold' : ' border-slate-700 bg-[#1b233a] text-slate-300 hover:border-slate-600');
        }

        function selectConfigUnit(unitId) {
            configUnit = unitId;
            document.querySelectorAll('.cfg-unit-btn').forEach(btn => {
                const id = btn.getAttribute('data-unit');
                btn.className = cfgUnitBtnClass(id, id === unitId);
            });
        }

        function startPracticeWithConfig() {
            isReviewMode = false;
            setConfigChangeButton(false);
            hideAllViews();
            document.getElementById('view-practice').classList.remove('hidden');
            document.getElementById('nav-change-config-btn').classList.remove('hidden');

            const uObj = ALL_UNITS.find(u => u.id === configUnit);
            const uName = uObj ? uObj.name : '全23単元 混合';
            document.getElementById('active-config-badge').innerText = uName;

            sessionAnswers = [];
            generateNewQuestion();
        }

        function generateNewQuestion() {
            isAnswered = false;
            document.getElementById('explanation-card').classList.add('hidden');

            let targetUnit = configUnit, reviewTarget = null;
            if (isReviewMode) {
                reviewTarget = pickReviewTarget();
                if (!reviewTarget) {          // 復習リストが空になった
                    alert('復習するパターンがなくなりました。お疲れさまでした！');
                    goToLanding();
                    return;
                }
                targetUnit = reviewTarget.u;
                document.getElementById('active-config-badge').textContent = `間違えた問題復習（残り ${Object.keys(loadMistakes()).length} パターン）`;
            } else if (isCBTMode) {
                if (cbtQuestionIndex >= cbtTotalQuestions) {
                    finishCBTMode();
                    return;
                }
                cbtQuestionIndex++;
                updateCBTUI();
                targetUnit = cbtUnitQueue.pop() || 'u1';
            } else if (configUnit === 'all') {
                targetUnit = ALL_UNITS[getRandomInt(0, ALL_UNITS.length - 1)].id;
            }

            // 固定問題JSON(fixed指定の単元で読み込めた場合)があればそれ、無ければ数値ランダム生成
            currentQuestion = generateQuestion(targetUnit);
            if (reviewTarget) {               // 間違えたのと同じパターン（title が同じ）を、別の数値で出題する
                for (let i = 0; i < 400 && currentQuestion.title !== reviewTarget.title; i++) currentQuestion = generateQuestion(targetUnit);
            }
            currentQuestion.unitId = targetUnit;
            const sourceBadgeText = FixedPools[targetUnit] ? '固定問題JSON' : '数値ランダム生成';

            currentQuestion.choices = generateChoices(currentQuestion);
            renderQuestionCard(sourceBadgeText);

            questionStartTime = Date.now();
        }

        function renderQuestionCard(sourceLabel) {
            document.getElementById('unit-badge').innerText = currentQuestion.unit || '演習';
            document.getElementById('source-badge').innerText = sourceLabel || '数値ランダム';
            document.getElementById('q-pattern-title').innerText = currentQuestion.title || '問題';
            document.getElementById('q-text').innerHTML = renderRich(currentQuestion.text || '');
            const figEl = document.getElementById('q-figure');
            figEl.innerHTML = renderFigure(currentQuestion.figure);
            figEl.classList.toggle('hidden', !currentQuestion.figure);
            document.getElementById('q-prompt').innerHTML = renderRich(currentQuestion.prompt || '');

            const container = document.getElementById('choices-container');
            container.innerHTML = '';

            currentQuestion.choices.forEach((choice) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn p-3.5 rounded-xl border border-slate-700 bg-[#1b233a] hover:bg-[#232c48] text-slate-200 text-xs md:text-sm font-medium transition text-left w-full';
                btn.onclick = () => checkAnswer(choice);
                btn.innerHTML = `<span>${renderFractions(choice.htmlText)}</span>`;
                container.appendChild(btn);
            });
        }

        function checkAnswer(selectedChoice) {
            if (isAnswered) return;
            isAnswered = true;

            const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
            const isCorrect = selectedChoice ? selectedChoice.isCorrect : false;

            totalCount++;
            if (isCorrect) correctCount++;

            saveUnitStat(currentQuestion.unit, isCorrect, timeSpent);
            const mistakeNote = recordMistakeResult(currentQuestion, isCorrect);

            sessionAnswers.push({
                question: currentQuestion,
                selected: selectedChoice,
                isCorrect: isCorrect,
                timeSpent: timeSpent
            });

            if (isCBTMode) {
                generateNewQuestion();
                return;
            }

            const resultBanner = document.getElementById('result-banner');
            if (isCorrect) {
                resultBanner.className = 'rounded-2xl p-4 mb-5 flex items-center space-x-3 bg-emerald-950/80 border border-emerald-700/60 text-emerald-200';
                resultBanner.innerHTML = `
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold shrink-0">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">正解！</h4>
                        <p class="text-xs text-emerald-300/80">解答にかかった時間: ${timeSpent}秒${mistakeNote ? '　' + mistakeNote : ''}</p>
                    </div>
                `;
            } else {
                resultBanner.className = 'rounded-2xl p-4 mb-5 flex items-center space-x-3 bg-rose-950/80 border border-rose-700/60 text-rose-200';
                resultBanner.innerHTML = `
                    <div class="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 text-xl font-bold shrink-0">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">不正解...</h4>
                        <p class="text-xs text-rose-300/80">解答にかかった時間: ${timeSpent}秒${mistakeNote ? '　' + mistakeNote : ''}</p>
                    </div>
                `;
            }

            const expContent = document.getElementById('explanation-content');
            expContent.innerHTML = (currentQuestion.steps || []).map(step => `<p>${renderFractions(step)}</p>`).join('');

            document.getElementById('explanation-card').classList.remove('hidden');
        }

        // ----------------------------------------------------
        // 単元別JSONファイルの紐付け・読み込み・UI処理
        // ----------------------------------------------------
        function openCBTModal() {
            renderCbtUnitCheckboxes();
            document.getElementById('cbt-modal').classList.remove('hidden');
        }

        function closeCBTModal() {
            document.getElementById('cbt-modal').classList.add('hidden');
        }

        function renderCbtUnitCheckboxes() {
            const container = document.getElementById('cbt-unit-checkbox-grid');
            container.innerHTML = '';
            ALL_UNITS.forEach(u => {
                const isChecked = cbtSelectedUnits.includes(u.id);
                const item = document.createElement('label');
                item.className = 'flex items-center space-x-2 p-2 rounded-xl bg-[#1b233a] border border-slate-700 text-xs cursor-pointer hover:border-indigo-500';
                item.innerHTML = `
                    <input type="checkbox" value="${u.id}" ${isChecked ? 'checked' : ''} onchange="toggleCbtUnitSelection('${u.id}')" class="rounded text-indigo-600 focus:ring-0">
                    <span class="text-slate-200 font-medium truncate">${u.name}</span>
                `;
                container.appendChild(item);
            });
            updateCbtUnitCountText();
        }

        function toggleCbtUnitSelection(unitId) {
            if (cbtSelectedUnits.includes(unitId)) {
                cbtSelectedUnits = cbtSelectedUnits.filter(id => id !== unitId);
            } else {
                if (cbtSelectedUnits.length >= 10) {
                    alert('CBT模擬試験で選択できる単元は最大10個までです。');
                    renderCbtUnitCheckboxes();
                    return;
                }
                cbtSelectedUnits.push(unitId);
            }
            updateCbtUnitCountText();
        }

        function selectAllCbtUnits() {   // 10個おまかせ選択（毎回ランダムに10単元）
            cbtSelectedUnits = shuffleArray(ALL_UNITS.map(u => u.id)).slice(0, 10);
            renderCbtUnitCheckboxes();
        }

        function clearCbtUnits() {       // 選択をすべて解除
            cbtSelectedUnits = [];
            renderCbtUnitCheckboxes();
        }

        function updateCbtUnitCountText() {
            document.getElementById('cbt-unit-select-count').innerText = `選択中: ${cbtSelectedUnits.length} / 10 個`;
        }

        function startCBTWithSelectedUnits() {
            if (cbtSelectedUnits.length === 0) {
                alert('単元を1つ以上（最大10個まで）選択してください。');
                return;
            }
            closeCBTModal();

            isCBTMode = true;
            isReviewMode = false;
            cbtQuestionIndex = 0;
            totalCount = 0;
            correctCount = 0;
            sessionAnswers = [];

            // 選択された単元から10問のキューを作成
            cbtUnitQueue = [];
            for (let i = 0; i < 10; i++) {
                const pickedUnit = cbtSelectedUnits[i % cbtSelectedUnits.length];
                cbtUnitQueue.push(pickedUnit);
            }
            cbtUnitQueue.sort(() => Math.random() - 0.5);

            cbtTotalQuestions = 10;
            cbtMaxOverallTime = 720; // 12分制限時間
            cbtOverallRemainingTime = cbtMaxOverallTime;

            hideAllViews();
            document.getElementById('cbt-status-bar').classList.remove('hidden');
            document.getElementById('view-practice').classList.remove('hidden');

            startCBTOverallTimer();
            generateNewQuestion();
        }

        function startCBTOverallTimer() {
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);

            cbtOverallTimerInterval = setInterval(() => {
                cbtOverallRemainingTime--;

                const outerCircle = document.getElementById('cbt-circle-outer');
                if (outerCircle) {
                    const frac = cbtOverallRemainingTime / cbtMaxOverallTime;
                    outerCircle.style.strokeDashoffset = (314.16 * (1 - frac)).toString();
                }

                const min = Math.floor(cbtOverallRemainingTime / 60);
                const sec = cbtOverallRemainingTime % 60;
                const timerText = document.getElementById('cbt-timer-text');
                if (timerText) {
                    timerText.innerText = `${min}:${String(sec).padStart(2, '0')}`;
                }

                if (cbtOverallRemainingTime <= 0) {
                    clearInterval(cbtOverallTimerInterval);
                    finishCBTMode();
                }
            }, 1000);
        }

        function updateCBTUI() {
            document.getElementById('cbt-q-counter').innerText = `${cbtQuestionIndex} / ${cbtTotalQuestions}問`;
            const innerCircle = document.getElementById('cbt-circle-inner');
            if (innerCircle) {
                const frac = cbtQuestionIndex / cbtTotalQuestions;
                innerCircle.style.strokeDashoffset = (226.19 * (1 - frac)).toString();
            }
        }

        function exitCBTMode() {
            if (confirm('CBT模擬試験を中断しますか？')) {
                goToLanding();
            }
        }

        function finishCBTMode() {
            if (cbtOverallTimerInterval) clearInterval(cbtOverallTimerInterval);

            hideAllViews();
            document.getElementById('cbt-result-card').classList.remove('hidden');

            const accPct = Math.round((correctCount / Math.max(1, totalCount)) * 100);
            const totalElapsedSec = Math.max(0, cbtMaxOverallTime - cbtOverallRemainingTime);
            const elapsedMin = Math.floor(totalElapsedSec / 60);
            const elapsedSec = Math.round(totalElapsedSec % 60);

            document.getElementById('cbt-res-score').innerText = `${correctCount} / ${totalCount}`;
            document.getElementById('cbt-res-accuracy').innerText = `${accPct} %`;
            document.getElementById('cbt-res-total-time').innerText = `${elapsedMin}分${String(elapsedSec).padStart(2, '0')}秒`;

            const record = {
                date: new Date().toLocaleDateString('ja-JP'),
                score: `${correctCount}/${totalCount}`,
                accuracy: `${accPct}%`,
                totalTime: `${elapsedMin}分${String(elapsedSec).padStart(2, '0')}秒`
            };
            globalHistory.unshift(record);
            if (globalHistory.length > 10) globalHistory.pop();
            try {
                localStorage.setItem('komuin_cbt_history', JSON.stringify(globalHistory));
            } catch (e) {}
        }

        function copyCBTResult() {
            const accPct = Math.round((correctCount / Math.max(1, totalCount)) * 100);
            const totalElapsedSec = Math.max(0, cbtMaxOverallTime - cbtOverallRemainingTime);
            const copyMin = Math.floor(totalElapsedSec / 60);
            const copySec = Math.round(totalElapsedSec % 60);
            const text = `【高卒公務員試験 数的推理 CBT模擬試験結果】\n正解数: ${correctCount} / ${totalCount}\n正解率: ${accPct}%\n解答時間: ${copyMin}分${String(copySec).padStart(2, '0')}秒`;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('結果をクリップボードにコピーしました！');
                }).catch(() => alert(text));
            } else {
                alert(text);
            }
        }


        // ----------------------------------------------------
        // 間違えた問題の記録と、復習モード
        //   記録の単位は「単元＋パターン(title)」。数値は毎回変わるので、同じ型を別の数値でやり直す。
        //   間違えると記録（新規は n＝2）。復習モードで正解するたびに n が 1 減り、0 になると「卒業」。
        //   復習中にまた間違えると n が増える（最大 4）。
        // ----------------------------------------------------
        const MISTAKE_KEY = 'komuin_mistakes_v1';
        function loadMistakes() {
            try { const d = localStorage.getItem(MISTAKE_KEY); return d ? JSON.parse(d) : {}; } catch (e) { return {}; }
        }
        function saveMistakes(m) {
            try { localStorage.setItem(MISTAKE_KEY, JSON.stringify(m)); } catch (e) {}
        }
        // 解答結果を記録。復習モードのときは、卒業や回数のメッセージを返す
        function recordMistakeResult(q, isCorrect) {
            if (!q || !q.unitId || !q.title) return '';
            const m = loadMistakes(), key = q.unitId + '|' + q.title;
            let note = '';
            if (!isCorrect) {
                const e = m[key] || { u: q.unitId, unit: q.unit, title: q.title, n: 1 };
                e.n = Math.min((m[key] ? e.n : 1) + 1, 4); e.last = Date.now();
                m[key] = e;
                if (isReviewMode) note = `（このパターンは、あと ${e.n} 回正解で卒業）`;
            } else if (isReviewMode && m[key]) {
                m[key].n -= 1;
                if (m[key].n <= 0) { delete m[key]; note = '🎓 このパターンは卒業！復習リストから外れました'; }
                else note = `（このパターンは、あと ${m[key].n} 回正解で卒業）`;
            }
            saveMistakes(m);
            return note;
        }
        // 復習するパターンを n が大きいほど出やすく選ぶ（直前と同じパターンは避ける）
        function pickReviewTarget() {
            const list = Object.entries(loadMistakes()).map(([k, v]) => ({ key: k, ...v }));
            if (list.length === 0) return null;
            const cand = list.length > 1 ? list.filter(e => e.key !== lastReviewKey) : list;
            const total = cand.reduce((a, e) => a + e.n, 0);
            let r = getRand() * total, pick = cand[cand.length - 1];
            for (const e of cand) { r -= e.n; if (r < 0) { pick = e; break; } }
            lastReviewKey = pick.key;
            return pick;
        }
        function updateMistakeBadges() {
            const n = Object.keys(loadMistakes()).length, el = document.getElementById('mistake-count-badge');
            if (el) el.textContent = n > 0 ? `復習待ち ${n} パターン` : 'まだ間違えたパターンはありません';
        }
        function setConfigChangeButton(forReview) {   // 練習画面上部の「変更」ボタン（復習モードでは「メニューへ」）
            const btn = document.getElementById('config-change-btn'), label = document.getElementById('config-change-label');
            if (!btn || !label) return;
            btn.onclick = forReview ? goToLanding : goToSelectScreen;
            label.textContent = forReview ? 'メニューへ' : '変更';
        }
        function startReviewMode() {
            if (Object.keys(loadMistakes()).length === 0) {
                alert('復習する問題はまだありません。通常演習やCBTで間違えたパターンが、ここに溜まります。');
                return;
            }
            isReviewMode = true;
            isCBTMode = false;
            lastReviewKey = null;
            hideAllViews();
            document.getElementById('view-practice').classList.remove('hidden');
            setConfigChangeButton(true);
            sessionAnswers = [];
            generateNewQuestion();
        }

        // --- データ保存・分析ロジック ---
        function loadUnitStats() {
            try {
                const data = localStorage.getItem('komuin_unit_stats_v1');
                return data ? JSON.parse(data) : {};
            } catch (e) {
                return {};
            }
        }

        function saveUnitStat(unitName, isCorrect, timeSpent) {
            const stats = loadUnitStats();
            if (!stats[unitName]) {
                stats[unitName] = { total: 0, correct: 0, totalTime: 0 };
            }
            stats[unitName].total += 1;
            if (isCorrect) stats[unitName].correct += 1;
            stats[unitName].totalTime += timeSpent;

            try {
                localStorage.setItem('komuin_unit_stats_v1', JSON.stringify(stats));
            } catch (e) {}
        }

        function openStatsModal() {
            renderStats();
            document.getElementById('stats-modal').classList.remove('hidden');
        }

        function closeStatsModal() {
            document.getElementById('stats-modal').classList.add('hidden');
        }

        function renderStats() {
            const stats = loadUnitStats();
            let grandTotal = 0;
            let grandCorrect = 0;
            let grandTime = 0;

            const listContainer = document.getElementById('stats-content-list');
            listContainer.innerHTML = '';

            ALL_UNITS.forEach(u => {
                const st = stats[u.name] || { total: 0, correct: 0, totalTime: 0 };
                grandTotal += st.total;
                grandCorrect += st.correct;
                grandTime += st.totalTime;

                const acc = st.total > 0 ? Math.round((st.correct / st.total) * 100) : null;
                const avgT = st.total > 0 ? (st.totalTime / st.total).toFixed(1) : null;

                const card = document.createElement('div');
                card.className = 'bg-[#1b233a] rounded-2xl p-3.5 border border-slate-800 flex justify-between items-center text-xs';
                card.innerHTML = `
                    <div>
                        <span class="font-bold text-white block mb-0.5">${u.name}</span>
                        <span class="text-slate-400">回答数: ${st.total}問 (${st.correct}正解)</span>
                    </div>
                    <div class="text-right">
                        <span class="font-bold text-emerald-400 block">${acc !== null ? acc + '%' : '--'}</span>
                        <span class="text-amber-400 text-[11px]">${avgT !== null ? avgT + '秒' : '--'}</span>
                    </div>
                `;
                listContainer.appendChild(card);
            });

            const overallAcc = grandTotal > 0 ? Math.round((grandCorrect / grandTotal) * 100) : 0;
            const overallAvgT = grandTotal > 0 ? (grandTime / grandTotal).toFixed(1) : '0.0';

            document.getElementById('stats-total-count').innerText = `${grandTotal}問`;
            document.getElementById('stats-overall-accuracy').innerText = `${overallAcc}%`;
            document.getElementById('stats-overall-avg-time').innerText = `${overallAvgT}秒`;
        }

        function openReviewModal() {
            const container = document.getElementById('session-review-list');
            const info = document.getElementById('review-count-info');
            container.innerHTML = '';

            if (sessionAnswers.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-8">回答履歴はまだありません。</p>';
                if (info) info.textContent = '全 0 問';
            } else {
                if (info) info.textContent = `全 ${sessionAnswers.length} 問`;
                sessionAnswers.forEach((ans, idx) => {
                    const q = ans.question, ok = ans.isCorrect;
                    const card = document.createElement('details');      // アコーディオン（開くと問題文・選択肢・解説）
                    card.dataset.ok = ok ? '1' : '0';
                    card.className = `review-card rounded-2xl border text-xs ${ok ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-rose-950/30 border-rose-800/40'}`;

                    const correctChoice = (q.choices || []).find(c => c.isCorrect);
                    const correctText = correctChoice ? renderFractions(correctChoice.htmlText) : '';
                    const choiceRows = (q.choices || []).map(c => {
                        const picked = ans.selected && ans.selected.label === c.label;
                        const cls = c.isCorrect ? 'border-emerald-500/60 bg-emerald-900/30 text-emerald-200' : (picked ? 'border-rose-500/60 bg-rose-900/30 text-rose-200' : 'border-slate-700 text-slate-400');
                        return `<div class="px-2.5 py-1.5 rounded-lg border ${cls}">${renderFractions(c.htmlText)}${c.isCorrect ? ' <span class="font-bold">← 正答</span>' : (picked ? ' <span class="font-bold">← あなたの選択</span>' : '')}</div>`;
                    }).join('');
                    const steps = (q.steps || []).map((st, i) => `<p class="mb-1.5"><span class="text-indigo-300 font-bold mr-1">${i + 1}.</span>${renderFractions(st)}</p>`).join('');

                    card.innerHTML = `
                        <summary class="p-3.5 cursor-pointer select-none list-none">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-slate-200">問 ${idx + 1} (${q.unit}${q.title ? '／' + q.title : ''})</span>
                                <span class="font-bold ${ok ? 'text-emerald-400' : 'text-rose-400'}">${ok ? '正解' : '不正解'} (${ans.timeSpent}秒)</span>
                            </div>
                            <p class="text-slate-300 mb-2 leading-relaxed font-medium">${renderRich(q.prompt)}</p>
                            <div class="flex justify-between items-end">
                                <p class="text-slate-400 text-[11px]">選択: <span class="text-white font-bold">${ans.selected ? renderFractions(ans.selected.htmlText) : '未選択'}</span> / 正答: <span class="text-emerald-300 font-bold">${correctText}</span></p>
                                <span class="review-chevron text-indigo-300 text-[11px] font-bold whitespace-nowrap ml-2"><span class="review-open-label">解説を見る</span><span class="review-close-label">閉じる</span> <i class="fa-solid fa-chevron-down text-[10px]"></i></span>
                            </div>
                        </summary>
                        <div class="px-3.5 pb-3.5 pt-1 border-t border-slate-700/50 space-y-3">
                            <div>
                                <p class="text-[10px] font-bold text-slate-500 mb-1">問題</p>
                                <p class="text-slate-200 leading-relaxed whitespace-pre-line">${renderRich(q.text || '')}</p>
                                ${q.figure ? `<div class="my-2 overflow-x-auto">${renderFigure(q.figure)}</div>` : ''}
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">${choiceRows}</div>
                            <div class="bg-[#1c243c] border-l-4 border-indigo-500 rounded-r-xl p-3 text-slate-200 leading-relaxed">
                                <p class="text-[10px] font-bold text-indigo-300 mb-1.5">解説</p>
                                ${steps}
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
            const tb = document.getElementById('review-toggle-all'); if (tb) tb.textContent = 'すべて開く';
            reviewWrongOnly = false;
            if (sessionAnswers.length > 0) applyReviewFilter();
            document.getElementById('review-modal').classList.remove('hidden');
        }

        function applyReviewFilter() {      // 「不正解だけ表示」の反映
            const cards = [...document.querySelectorAll('#session-review-list details')];
            cards.forEach(c => c.classList.toggle('hidden', reviewWrongOnly && c.dataset.ok === '1'));
            const wrong = cards.filter(c => c.dataset.ok === '0').length;
            const btn = document.getElementById('review-filter-btn');
            if (btn) {
                btn.innerHTML = reviewWrongOnly ? '<i class="fa-solid fa-filter-circle-xmark mr-1"></i>すべて表示に戻す' : `<i class="fa-solid fa-filter mr-1"></i>不正解だけ表示（${wrong}）`;
                btn.className = 'text-[11px] font-bold px-3 py-1.5 rounded-lg border transition ' + (reviewWrongOnly ? 'bg-rose-900/40 border-rose-600 text-rose-200' : 'border-slate-600 text-slate-300 hover:border-rose-500 hover:text-rose-300');
            }
            const info = document.getElementById('review-count-info');
            if (info) info.textContent = reviewWrongOnly ? `不正解 ${wrong} 問 / 全 ${cards.length} 問` : `全 ${cards.length} 問（不正解 ${wrong}）`;
            const empty = document.getElementById('review-empty-note');
            if (empty) empty.classList.toggle('hidden', !(reviewWrongOnly && wrong === 0));
        }

        function toggleReviewWrongOnly() {
            reviewWrongOnly = !reviewWrongOnly;
            applyReviewFilter();
        }

        function toggleAllReviewCards() {   // すべて開く／すべて閉じる
            const cards = [...document.querySelectorAll('#session-review-list details')].filter(c => !c.classList.contains('hidden'));
            const open = cards.some(c => !c.open);
            cards.forEach(c => c.open = open);
            const btn = document.getElementById('review-toggle-all');
            if (btn) btn.textContent = open ? 'すべて閉じる' : 'すべて開く';
        }

        function closeReviewModal() {
            document.getElementById('review-modal').classList.add('hidden');
        }

        function openHistoryModal() {
            try {
                const stored = localStorage.getItem('komuin_cbt_history');
                if (stored) globalHistory = JSON.parse(stored);
            } catch (e) {}

            const container = document.getElementById('global-history-list');
            container.innerHTML = '';

            if (globalHistory.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">CBT模擬試験の履歴はありません。</p>';
            } else {
                globalHistory.forEach((item) => {
                    const row = document.createElement('div');
                    row.className = 'bg-[#1b233a] p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center';
                    row.innerHTML = `
                        <div>
                            <span class="text-slate-400 font-mono text-[10px]">${item.date}</span>
                            <span class="ml-2 font-bold text-indigo-300">10問テスト</span>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-white mr-2">${item.score}</span>
                            <span class="text-emerald-400 font-bold mr-2">${item.accuracy}</span>
                            <span class="text-purple-300 font-bold">${item.totalTime}</span>
                        </div>
                    `;
                    container.appendChild(row);
                });
            }
            document.getElementById('history-modal').classList.remove('hidden');
        }

        function closeHistoryModal() {
            document.getElementById('history-modal').classList.add('hidden');
        }

        function clearGlobalHistory() {
            if (confirm('すべての模擬試験履歴を消去しますか？')) {
                globalHistory = [];
                localStorage.removeItem('komuin_cbt_history');
                openHistoryModal();
            }
        }

        function resetStats() {
            if (confirm('すべての成績・履歴データを初期化しますか？')) {
                totalCount = 0;
                correctCount = 0;
                globalHistory = [];
                localStorage.removeItem('komuin_cbt_history');
                localStorage.removeItem('komuin_unit_stats_v1');
                localStorage.removeItem(MISTAKE_KEY);
                updateMistakeBadges();
                alert('データをクリアしました。');
            }
        }


        window.addEventListener('DOMContentLoaded', () => {
            renderUnitSelectionGrid();
            updateMistakeBadges();
            cbtSelectedUnits = ALL_UNITS.slice(0, 10).map(u => u.id);
            loadFixedPools();   // fixed を指定した単元がある場合のみ固定問題JSONを取得
        });
