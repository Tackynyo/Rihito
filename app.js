/**
 * 古文 助動詞マスター アプリケーションロジック (app.js)
 * 
 * 仕様:
 * ① ホーム画面: 接続ごとの一覧（未然形、連用形、終止形、体言・連体形・一部助詞、その他）
 * ② グループ画面: 接続ごとの助動詞リスト（意味・用法は記載しない）
 * ③ 活用表: 8行×2列（右列: ラベル、左列: 回答。1行目「基本形」と8行目「活用の型」は常時表示、2〜7行目はタップで表示。1行目タップで全表示。上部見出しは削除して上詰め表示）
 * ④ 主な意味: 空白の数は意味の数と完全に一致。タップで表示。
 * ⑤ 下にスライド or 下ボタンで、本のページをめくるような3Dアニメーションで遷移。
 */

(function () {
  "use strict";

  // 活用表の行定義（8行）
  const TABLE_ROWS = [
    { key: "kihon", label: "基本形", isAlwaysVisible: true, isTrigger: true },
    { key: "mizen", label: "未然形", isAlwaysVisible: false },
    { key: "renyou", label: "連用形", isAlwaysVisible: false },
    { key: "shuushi", label: "終止形", isAlwaysVisible: false },
    { key: "rentai", label: "連体形", isAlwaysVisible: false },
    { key: "izen", label: "已然形", isAlwaysVisible: false },
    { key: "meirei", label: "命令形", isAlwaysVisible: false },
    { key: "type", label: "活用の型", isAlwaysVisible: true }
  ];

  // DOM要素のキャッシュ
  const dom = {
    homeView: document.getElementById("home-view"),
    groupView: document.getElementById("group-view"),
    studyView: document.getElementById("study-view"),
    
    connectionList: document.getElementById("connection-list"),
    groupList: document.getElementById("group-list"),
    groupCategoryTitle: document.getElementById("group-category-title"),
    
    backToHomeBtn: document.getElementById("back-to-home-btn"),
    backToGroupsBtn: document.getElementById("back-to-groups-btn"),
    
    studyDeckContainer: document.getElementById("study-deck-container"),
    studyStepBadge: document.getElementById("study-step-badge"),
    dockPrevBtn: document.getElementById("dock-prev-btn"),
    dockNextBtn: document.getElementById("dock-next-btn"),
    dockCenterIndicator: document.getElementById("dock-center-indicator")
  };

  // 状態管理
  let currentCategory = null;
  let currentGroup = null;
  let currentStepIndex = 0; // 0, 1, 2, 3 ... (各助動詞ごとに 活用表(偶数) と 主な意味(奇数))
  let totalSteps = 0;
  let isAnimating = false;

  /**
   * 画面の切り替え
   * @param {'home'|'group'|'study'} viewName 
   */
  function switchView(viewName) {
    [dom.homeView, dom.groupView, dom.studyView].forEach((v) => {
      v.classList.remove("active-view");
      v.setAttribute("hidden", "true");
    });

    if (viewName === "home") {
      dom.homeView.classList.add("active-view");
      dom.homeView.removeAttribute("hidden");
    } else if (viewName === "group") {
      dom.groupView.classList.add("active-view");
      dom.groupView.removeAttribute("hidden");
    } else if (viewName === "study") {
      dom.studyView.classList.add("active-view");
      dom.studyView.removeAttribute("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =========================================================================
  // ① ホーム画面: 接続ごとの一覧リスト表示
  // =========================================================================
  function renderConnectionList() {
    dom.connectionList.innerHTML = "";

    connectionCategories.forEach((cat, idx) => {
      const card = document.createElement("div");
      card.className = "category-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${cat.name}`);

      card.innerHTML = `
        <div class="category-left">
          <div class="category-number-badge">${idx + 1}</div>
          <div class="category-name">
            ${cat.name}
            <span class="category-badge-count">${cat.groups.length}項目</span>
          </div>
        </div>
        <div class="category-arrow">&rsaquo;</div>
      `;

      card.addEventListener("click", () => {
        openGroupView(cat);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openGroupView(cat);
        }
      });

      dom.connectionList.appendChild(card);
    });
  }

  // =========================================================================
  // ② グループ画面: その接続の助動詞リスト（意味・用法は記載しない）
  // =========================================================================
  function openGroupView(category) {
    currentCategory = category;
    dom.groupCategoryTitle.textContent = category.name;
    dom.groupList.innerHTML = "";

    category.groups.forEach((group) => {
      const card = document.createElement("div");
      card.className = "group-item-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${group.title}`);

      // 要件②: 「この時、意味・用法は記載しない。」
      // タイトル（例：「る・らる」「す・さす・しむ・ず」等）のみを大きく表示
      card.innerHTML = `
        <div class="group-item-title">${group.title}</div>
        <div class="group-item-arrow">&rsaquo;</div>
      `;

      card.addEventListener("click", () => {
        startStudy(group);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startStudy(group);
        }
      });

      dom.groupList.appendChild(card);
    });

    switchView("group");
  }

  // =========================================================================
  // ③・④・⑤ 学習画面: 8行×2列表・主な意味・本のページめくりアニメーション
  // =========================================================================
  function startStudy(group) {
    currentGroup = group;
    currentStepIndex = 0;
    totalSteps = group.items.length * 2;
    isAnimating = false;
    dom.studyDeckContainer.innerHTML = "";
    renderCurrentStep(null);
    switchView("study");
  }

  /**
   * 現在のステップカードをページめくりアニメーションで切り替える
   * @param {'forward'|'backward'|null} direction 
   */
  function renderCurrentStep(direction = null) {
    // ヘッダーバッジと下部ドックの即時更新
    updateHeaderAndDock();

    const currentCard = dom.studyDeckContainer.querySelector(".study-card");
    const newCard = createStepCard(currentStepIndex);

    // 初回表示またはアニメーションなしの場合
    if (!currentCard || !direction) {
      dom.studyDeckContainer.innerHTML = "";
      dom.studyDeckContainer.appendChild(newCard);
      isAnimating = false;
      return;
    }

    isAnimating = true;

    if (direction === "forward") {
      // =====================================================================
      // 次へ進む: 現在のページが左へめくれ、下から新しいページが現れる
      // =====================================================================
      currentCard.classList.add("page-turning-forward");
      newCard.classList.add("page-revealing-forward");

      // 新しいカードを下に挿入
      dom.studyDeckContainer.insertBefore(newCard, currentCard);

      const finishForward = () => {
        currentCard.removeEventListener("animationend", finishForward);
        if (currentCard.parentNode) {
          currentCard.parentNode.removeChild(currentCard);
        }
        newCard.classList.remove("page-revealing-forward");
        isAnimating = false;
      };

      currentCard.addEventListener("animationend", finishForward);
      setTimeout(finishForward, 480);

    } else if (direction === "backward") {
      // =====================================================================
      // 前へ戻る: 前のページが左からめくられて戻り、現在のページを覆う
      // =====================================================================
      currentCard.classList.add("page-hiding-backward");
      newCard.classList.add("page-revealing-backward");

      // 新しいカードを最前面に追加
      dom.studyDeckContainer.appendChild(newCard);

      const finishBackward = () => {
        newCard.removeEventListener("animationend", finishBackward);
        if (currentCard.parentNode) {
          currentCard.parentNode.removeChild(currentCard);
        }
        newCard.classList.remove("page-revealing-backward");
        isAnimating = false;
      };

      newCard.addEventListener("animationend", finishBackward);
      setTimeout(finishBackward, 480);
    }
  }

  /**
   * 指定ステップのカード要素を生成して返す
   */
  function createStepCard(stepIndex) {
    if (stepIndex >= totalSteps) {
      return createCompletionCard();
    }

    const verbIndex = Math.floor(stepIndex / 2);
    const currentVerb = currentGroup.items[verbIndex];
    const isConjugation = stepIndex % 2 === 0;

    if (isConjugation) {
      // ③ 8行×2列 活用表カード（上詰め・ヘッダー削除）
      return createConjugationCard(currentVerb);
    } else {
      // ④ 主な意味カード（空白数は意味数と完全一致）
      return createMeaningsCard(currentVerb);
    }
  }

  /**
   * ③ 8行×2列 活用表カードの生成
   * 要件修正: 上部の助動詞や「活用表(8行)」表示は削除し、表を上に詰めて表示。
   * 1行目「基本形」と8行目「活用の型」は常時表示。
   * 2〜7行目は最初は空白、タップで表示。
   * 1行目の基本形タップで全マス一括表示。
   */
  function createConjugationCard(verb) {
    const card = document.createElement("div");
    card.className = "study-card table-study-card";

    // 8行×2列 テーブルラッパー（ヘッダーなしで最上部に配置）
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-wrapper";

    const table = document.createElement("table");
    table.className = "table-8x2";
    table.setAttribute("aria-label", `${verb.name}の活用表`);

    const tbody = document.createElement("tbody");
    const hiddenCells = [];

    TABLE_ROWS.forEach((rowDef) => {
      const tr = document.createElement("tr");

      // 左列（回答・値の列）
      const tdLeft = document.createElement("td");
      tdLeft.className = "td-answer-col";

      // 右列（ラベル・見出しの列）
      const thRight = document.createElement("th");
      thRight.className = "th-label-col";
      thRight.scope = "row";
      thRight.textContent = rowDef.label;

      const rawVal = verb.conjugation[rowDef.key] || "〇";

      if (rowDef.key === "kihon") {
        // 1行目: 基本形（常に表示。タップすると全マス一括表示されるトリガー）
        const kihonCell = document.createElement("div");
        kihonCell.className = "kihon-trigger-cell";
        kihonCell.setAttribute("role", "button");
        kihonCell.setAttribute("tabindex", "0");
        kihonCell.setAttribute("title", "ここをタップすると全マスを一括表示します");
        kihonCell.innerHTML = `
          <span class="kihon-char">${rawVal}</span>
          <span class="kihon-tap-hint">全表示 👆</span>
        `;

        const triggerAll = () => {
          hiddenCells.forEach((box, i) => {
            setTimeout(() => {
              box.classList.remove("is-hidden");
              box.classList.add("is-revealed");
            }, i * 30);
          });
          kihonCell.style.transform = "scale(0.94)";
          setTimeout(() => { kihonCell.style.transform = ""; }, 150);
        };

        kihonCell.addEventListener("click", triggerAll);
        kihonCell.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerAll();
          }
        });

        tdLeft.appendChild(kihonCell);

      } else if (rowDef.key === "type") {
        // 8行目: 活用の型（常に表示）
        const typeCell = document.createElement("div");
        typeCell.className = "type-static-cell";
        typeCell.textContent = rawVal;
        tdLeft.appendChild(typeCell);

      } else {
        // 2行目〜7行目（未然形〜命令形）: 初期状態は空白、タップで表示
        const box = document.createElement("div");
        box.className = "cell-box is-hidden";
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
        box.setAttribute("aria-label", `${rowDef.label}を表示`);

        box.innerHTML = `
          <div class="cell-cover-text">
            <span>？</span>
            <span>タップ</span>
          </div>
          <span class="cell-answer-text">${rawVal}</span>
        `;

        const toggleCell = () => {
          if (box.classList.contains("is-hidden")) {
            box.classList.remove("is-hidden");
            box.classList.add("is-revealed");
          } else {
            box.classList.remove("is-revealed");
            box.classList.add("is-hidden");
          }
        };

        box.addEventListener("click", toggleCell);
        box.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCell();
          }
        });

        hiddenCells.push(box);
        tdLeft.appendChild(box);
      }

      tr.appendChild(tdLeft);
      tr.appendChild(thRight);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    card.appendChild(tableWrapper);

    // クイック操作ボタン（すべて表示 / もう一度隠す）
    const quickBar = document.createElement("div");
    quickBar.className = "table-quick-actions";
    quickBar.innerHTML = `
      <button class="quick-btn" id="btn-reveal-table">すべて表示</button>
      <button class="quick-btn" id="btn-reset-table">もう一度隠す</button>
    `;

    quickBar.querySelector("#btn-reveal-table").addEventListener("click", () => {
      hiddenCells.forEach((box) => {
        box.classList.remove("is-hidden");
        box.classList.add("is-revealed");
      });
    });

    quickBar.querySelector("#btn-reset-table").addEventListener("click", () => {
      hiddenCells.forEach((box) => {
        box.classList.remove("is-revealed");
        box.classList.add("is-hidden");
      });
    });

    card.appendChild(quickBar);
    return card;
  }

  /**
   * ④ 主な意味カードの生成
   * 空白の数は「主な意味」の数と完全に一致（例: き=1つ、べし=6つ）
   */
  function createMeaningsCard(verb) {
    const card = document.createElement("div");
    card.className = "study-card meanings-study-card";

    const meaningCount = verb.meanings.length;

    // カードヘッダー（どの助動詞の意味かを表示）
    card.innerHTML = `
      <div class="card-header-bar">
        <div class="card-title-group">
          <span class="card-target-name">${verb.name}</span>
          <span class="card-mode-badge">主な意味（全${meaningCount}つ）</span>
        </div>
        <span class="card-hint-text">各マスをタップして確認</span>
      </div>
    `;

    // 意味スロット一覧コンテナ
    const container = document.createElement("div");
    container.className = "meanings-container";
    const hiddenSlots = [];

    verb.meanings.forEach((meaning, index) => {
      const slot = document.createElement("div");
      slot.className = "meaning-slot-box is-hidden";
      slot.setAttribute("role", "button");
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("aria-label", `意味${index + 1}を表示`);

      slot.innerHTML = `
        <div class="meaning-cover-hint">
          <span class="meaning-number-tag">意味 ${index + 1}</span>
          <span class="meaning-tap-prompt">？ タップして答え合わせ</span>
        </div>
        <div class="meaning-content">
          <span class="meaning-name">${meaning.name}</span>
          ${meaning.note ? `<span class="meaning-detail">（${meaning.note}）</span>` : ""}
        </div>
      `;

      const toggleSlot = () => {
        if (slot.classList.contains("is-hidden")) {
          slot.classList.remove("is-hidden");
          slot.classList.add("is-revealed");
        } else {
          slot.classList.remove("is-revealed");
          slot.classList.add("is-hidden");
        }
      };

      slot.addEventListener("click", toggleSlot);
      slot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleSlot();
        }
      });

      hiddenSlots.push(slot);
      container.appendChild(slot);
    });

    card.appendChild(container);

    // クイック操作ボタン
    const quickBar = document.createElement("div");
    quickBar.className = "table-quick-actions";
    quickBar.innerHTML = `
      <button class="quick-btn" id="btn-reveal-meanings">すべての意味を表示</button>
      <button class="quick-btn" id="btn-reset-meanings">もう一度隠す</button>
    `;

    quickBar.querySelector("#btn-reveal-meanings").addEventListener("click", () => {
      hiddenSlots.forEach((slot) => {
        slot.classList.remove("is-hidden");
        slot.classList.add("is-revealed");
      });
    });

    quickBar.querySelector("#btn-reset-meanings").addEventListener("click", () => {
      hiddenSlots.forEach((slot) => {
        slot.classList.remove("is-revealed");
        slot.classList.add("is-hidden");
      });
    });

    card.appendChild(quickBar);
    return card;
  }

  /**
   * グループ完了画面カードの生成
   */
  function createCompletionCard() {
    const card = document.createElement("div");
    card.className = "study-card complete-card";

    card.innerHTML = `
      <div class="complete-icon">🎉</div>
      <h3 class="complete-title">「${currentGroup.title}」の暗記完了！</h3>
      <p class="complete-desc">活用表と主な意味のチェックが終わりました。<br>繰り返し復習して完璧に定着させましょう。</p>
      <div class="complete-btn-group">
        <button class="nav-btn" style="width: 100%; justify-content: center; padding: 12px;" id="restart-group-btn">
          🔄 もう一度最初から復習する
        </button>
        <button class="nav-btn" style="width: 100%; justify-content: center; padding: 12px; background-color: var(--color-primary); color: #fff;" id="back-to-group-list-btn">
          📋 助動詞リストに戻る
        </button>
      </div>
    `;

    card.querySelector("#restart-group-btn").addEventListener("click", () => {
      currentStepIndex = 0;
      renderCurrentStep("backward");
    });

    card.querySelector("#back-to-group-list-btn").addEventListener("click", () => {
      switchView("group");
    });

    return card;
  }

  /**
   * 上部バッジと下部ドック操作の更新
   */
  function updateHeaderAndDock() {
    // 完了ステップの場合
    if (currentStepIndex >= totalSteps) {
      dom.studyStepBadge.textContent = "学習完了！";
      dom.dockPrevBtn.disabled = false;
      dom.dockNextBtn.style.display = "none";
      dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">全ステップ終了</span>`;
      return;
    }

    const verbIndex = Math.floor(currentStepIndex / 2);
    const currentVerb = currentGroup.items[verbIndex];
    const isConjugation = currentStepIndex % 2 === 0;

    // 上部バッジ更新
    dom.studyStepBadge.textContent = `${currentVerb.name} [${isConjugation ? "活用表" : "主な意味"}] (${currentStepIndex + 1} / ${totalSteps})`;

    // 上ボタン（前へ）
    dom.dockPrevBtn.disabled = currentStepIndex <= 0;

    // 下ボタン（次へ）
    dom.dockNextBtn.style.display = "flex";
    if (isConjugation) {
      dom.dockNextBtn.querySelector(".dock-text").textContent = "主な意味へ";
      dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">ページをめくって意味へ</span>`;
    } else {
      const nextVerbIndex = verbIndex + 1;
      if (nextVerbIndex < currentGroup.items.length) {
        const nextVerb = currentGroup.items[nextVerbIndex];
        dom.dockNextBtn.querySelector(".dock-text").textContent = `「${nextVerb.name}」へ`;
        dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">ページをめくって次の助動詞へ</span>`;
      } else {
        dom.dockNextBtn.querySelector(".dock-text").textContent = "完了へ";
        dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">ページをめくって完了</span>`;
      }
    }
  }

  /**
   * 次のステップへ進む（下へスライド / 下ボタン）: 本のページめくり (Forward)
   */
  function goToNextStep() {
    if (isAnimating) return;
    if (currentStepIndex < totalSteps) {
      currentStepIndex++;
      renderCurrentStep("forward");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * 前のステップへ戻る（上へスライド / 上ボタン）: 本のページめくり (Backward)
   */
  function goToPrevStep() {
    if (isAnimating) return;
    if (currentStepIndex > 0) {
      currentStepIndex--;
      renderCurrentStep("backward");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // =========================================================================
  // タッチスワイプ（指で下にスライド・上にスライド）の検知
  // =========================================================================
  function setupSwipeHandlers() {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    const container = dom.studyDeckContainer;

    container.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 1) {
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const duration = Date.now() - touchStartTime;

        // 縦方向のスワイプ判定
        if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && duration < 600) {
          if (deltaY < -35) {
            // 指を上にスワイプ（画面を下へめくって次へ進む）
            goToNextStep();
          } else if (deltaY > 35) {
            // 指を下にスワイプ（前のページへ戻る）
            goToPrevStep();
          }
        }
      }
    }, { passive: true });
  }

  // =========================================================================
  // イベントリスナー登録
  // =========================================================================
  function setupEventListeners() {
    // 画面遷移ボタン
    dom.backToHomeBtn.addEventListener("click", () => {
      switchView("home");
    });

    dom.backToGroupsBtn.addEventListener("click", () => {
      switchView("group");
    });

    // 下部ドックボタン
    dom.dockNextBtn.addEventListener("click", goToNextStep);
    dom.dockPrevBtn.addEventListener("click", goToPrevStep);

    // スワイプ検知
    setupSwipeHandlers();
  }

  // 初期化
  function init() {
    renderConnectionList();
    setupEventListeners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
