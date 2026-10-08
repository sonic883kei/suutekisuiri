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
                <button onclick="selectConfigUnit('all')" data-unit="all" class="cfg-unit-btn p-2.5 rounded-xl border text-left transition flex items-center space-x-2 bg-indigo-600 border-indigo-400 text-white font-bold col-span-2 sm:col-span-3">
                    <i class="fa-solid fa-layer-group text-sm"></i>
                    <span class="text-xs">全23単元 混合演習</span>
                </button>
            `;
            ALL_UNITS.forEach(u => {
                const btn = document.createElement('button');
                btn.onclick = () => selectConfigUnit(u.id);
                btn.setAttribute('data-unit', u.id);
                btn.className = 'cfg-unit-btn p-2.5 rounded-xl border border-slate-700 bg-[#1b233a] text-slate-300 text-left transition flex items-center space-x-2 hover:border-slate-600';
                btn.innerHTML = `<span class="text-xs font-bold truncate">${u.name}</span>`;
                grid.appendChild(btn);
            });
        }

        function selectConfigUnit(unitId) {
            configUnit = unitId;
            document.querySelectorAll('.cfg-unit-btn').forEach(btn => {
                if (btn.getAttribute('data-unit') === unitId) {
                    btn.className = 'cfg-unit-btn p-2.5 rounded-xl border text-left transition flex items-center space-x-2 bg-indigo-600 border-indigo-400 text-white font-bold';
                } else {
                    btn.className = 'cfg-unit-btn p-2.5 rounded-xl border border-slate-700 bg-[#1b233a] text-slate-300 text-left transition flex items-center space-x-2 hover:border-slate-600';
                }
            });
        }

        function startPracticeWithConfig() {
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

            let targetUnit = configUnit;
            if (isCBTMode) {
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
                        <p class="text-xs text-emerald-300/80">解答にかかった時間: ${timeSpent}秒</p>
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
                        <p class="text-xs text-rose-300/80">解答にかかった時間: ${timeSpent}秒</p>
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

        function selectAllCbtUnits() {
            cbtSelectedUnits = ALL_UNITS.slice(0, 10).map(u => u.id);
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
                if (info) info.innerText = '全 0 問';
            } else {
                if (info) info.innerText = `全 ${sessionAnswers.length} 問`;
                sessionAnswers.forEach((ans, idx) => {
                    const card = document.createElement('div');
                    card.className = `p-3.5 rounded-2xl border text-xs ${ans.isCorrect ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-rose-950/30 border-rose-800/40'}`;

                    const correctChoice = (ans.question.choices || []).find(c => c.isCorrect);
                    const correctText = correctChoice ? renderFractions(correctChoice.htmlText) : '';

                    card.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-slate-200">問 ${idx + 1} (${ans.question.unit})</span>
                            <span class="font-bold ${ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">${ans.isCorrect ? '正解' : '不正解'} (${ans.timeSpent}秒)</span>
                        </div>
                        <p class="text-slate-300 mb-2 leading-relaxed font-medium">${renderRich(ans.question.prompt)}</p>
                        <p class="text-slate-400 text-[11px]">選択: <span class="text-white font-bold">${ans.selected ? renderFractions(ans.selected.htmlText) : '未選択'}</span> / 正答: <span class="text-emerald-300 font-bold">${correctText}</span></p>
                    `;
                    container.appendChild(card);
                });
            }
            document.getElementById('review-modal').classList.remove('hidden');
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
                alert('データをクリアしました。');
            }
        }


        window.addEventListener('DOMContentLoaded', () => {
            renderUnitSelectionGrid();
            cbtSelectedUnits = ALL_UNITS.slice(0, 10).map(u => u.id);
            loadFixedPools();   // fixed を指定した単元がある場合のみ固定問題JSONを取得
        });
