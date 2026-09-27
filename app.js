/**
 * 古文 助動詞マスター アプリケーションロジック (app.js)
 * 
 * 仕様:
 * ① ホーム画面: 接続ごとの一覧（未然形、連用形、終止形、体言・連体形・一部助詞、その他）
 * ② グループ画面: 接続ごとの助動詞リスト（意味・用法は記載しない）
 * ③ 活用表: 8行×2列（右列: ラベル、左列: 回答。1行目「基本形」と8行目「活用の型」は常時表示、2〜7行目はタップで表示。1行目タップで全表示。上部見出しは削除して上詰め表示）
 * ④ 主な意味: 空白の数は意味の数と完全に一致。タップで表示。
 * ⑤ 活用表を最初に連続で表示 → その後に「主な意味」を表示。
 *    意味が完全に一致する助動詞（例:「る」と「らる」、「す」と「さす」と「しむ」）は同一画面にまとめて表示。
 * ⑥ 左にスライド（スワイプ） or 次へボタンで、本のページをめくるような3Dアニメーションで遷移。
 * ⑦ 画面上部のヘッダー（ネイビー部分含む）をタップするといつでもホーム画面に戻る。
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
    appHeaderNav: document.getElementById("app-header-nav"),
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
  let groupSteps = []; // グループ内の全ステップ（活用表群 → 主な意味群）
  let currentStepIndex = 0;
  let totalSteps = 0;
  let isAnimating = false;

  /**
   * グループ内の学習ステップを構築する
   * ルール:
   * 1. まず全ての助動詞の活用表を連続で追加
   * 2. 次に「主な意味」を追加（意味が全く同じ連続する助動詞はまとめて1画面にする）
   */
  function buildGroupSteps(group) {
    const steps = [];

    // 1. 全ての助動詞の「活用表」ステップを連続で登録
    group.items.forEach((item) => {
      steps.push({
        type: "conjugation",
        title: item.name,
        verb: item
      });
    });

    // 2. 「主な意味」ステップを登録（意味が完全に同じものは統合）
    const meaningGroups = [];
    group.items.forEach((item) => {
      // 意味の名称リストを比較キーとする
      const meaningKey = item.meanings.map(m => m.name).join("||");
      const lastGroup = meaningGroups[meaningGroups.length - 1];

      if (lastGroup && lastGroup.key === meaningKey) {
        lastGroup.verbs.push(item);
      } else {
        meaningGroups.push({
          key: meaningKey,
          verbs: [item],
          meanings: item.meanings
        });
      }
    });

    meaningGroups.forEach((mg) => {
      const combinedTitle = mg.verbs.map(v => v.name).join("・");
      steps.push({
        type: "meaning",
        title: combinedTitle,
        verbs: mg.verbs,
        meanings: mg.meanings
      });
    });

    return steps;
  }

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
  // ③・④・⑤ 学習画面: 活用表全件 → 主な意味（共通統合）の順で表示
  // =========================================================================
  function startStudy(group) {
    currentGroup = group;
    groupSteps = buildGroupSteps(group);
    currentStepIndex = 0;
    totalSteps = groupSteps.length;
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
      // 次へ進む: 現在のページが左へめくれ、下から新しいページが現れる
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
      // 前へ戻る: 前のページが左からめくられて戻り、現在のページを覆う
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

    const step = groupSteps[stepIndex];

    if (step.type === "conjugation") {
      // ③ 8行×2列 活用表カード（上詰め・ヘッダー削除）
      return createConjugationCard(step.verb);
    } else {
      // ④ 主な意味カード（同じ意味の助動詞はまとめて表示）
      return createMeaningsCard(step);
    }
  }

  /**
   * ③ 8行×2列 活用表カードの生成
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
   * 助動詞がまとめられている場合は「る・らる」のように連名で表示
   * 空白の数は「主な意味」の数と完全に一致
   */
  function createMeaningsCard(step) {
    const card = document.createElement("div");
    card.className = "study-card meanings-study-card";

    const meaningCount = step.meanings.length;

    // カードヘッダー（対象助動詞の名称を表示: 例「る・らる」「す・さす・しむ」）
    card.innerHTML = `
      <div class="card-header-bar">
        <div class="card-title-group">
          <span class="card-target-name">${step.title}</span>
          <span class="card-mode-badge">主な意味（全${meaningCount}つ）</span>
        </div>
        <span class="card-hint-text">各マスをタップして確認</span>
      </div>
    `;

    // 意味スロット一覧コンテナ
    const container = document.createElement("div");
    container.className = "meanings-container";
    const hiddenSlots = [];

    step.meanings.forEach((meaning, index) => {
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
   * 上部バッジと下部ドック操作の更新（右ボタン: 次へ、左ボタン: 前へ）
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

    const currentStep = groupSteps[currentStepIndex];
    const typeLabel = currentStep.type === "conjugation" ? "活用表" : "主な意味";

    // 上部バッジ更新（例: 「る [活用表] (1 / 3)」や「る・らる [主な意味] (3 / 3)」）
    dom.studyStepBadge.textContent = `${currentStep.title} [${typeLabel}] (${currentStepIndex + 1} / ${totalSteps})`;

    // 左ボタン（前へ）
    dom.dockPrevBtn.disabled = currentStepIndex <= 0;

    // 右ボタン（次へ）
    dom.dockNextBtn.style.display = "flex";
    if (currentStepIndex < totalSteps - 1) {
      const nextStep = groupSteps[currentStepIndex + 1];
      const nextLabel = nextStep.type === "conjugation" 
        ? `「${nextStep.title}」表へ` 
        : `「${nextStep.title}」意味へ`;
      dom.dockNextBtn.querySelector(".dock-text").textContent = nextLabel;
      dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">左にスライドで次へ</span>`;
    } else {
      dom.dockNextBtn.querySelector(".dock-text").textContent = "完了へ";
      dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">左にスライドで完了</span>`;
    }
  }

  /**
   * 次のステップへ進む: 本のページめくり (Forward)
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
   * 前のステップへ戻る: 本のページめくり (Backward)
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
  // タッチスワイプ（指を左方向にスライドで次へ・右方向にスライドで前へ）の検知
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
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const duration = Date.now() - touchStartTime;

        // 横方向のスワイプ判定（上下の微小なスクロールと区別するため abs(deltaX) > abs(deltaY) * 1.2）
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && duration < 600) {
          if (deltaX < -35) {
            // 指を左方向にスライド（次のページへ進む）
            goToNextStep();
          } else if (deltaX > 35) {
            // 指を右方向にスライド（前のページへ戻る）
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
    // 画面上部ヘッダー（ネイビー部分含む）タップでホーム画面に戻る
    if (dom.appHeaderNav) {
      dom.appHeaderNav.addEventListener("click", () => {
        switchView("home");
      });
      dom.appHeaderNav.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          switchView("home");
        }
      });
    }

    // 画面遷移ボタン
    dom.backToHomeBtn.addEventListener("click", () => {
      switchView("home");
    });

    dom.backToGroupsBtn.addEventListener("click", () => {
      switchView("group");
    });

    // 下部ドックボタン（右ボタン: 次へ、左ボタン: 前へ）
    dom.dockNextBtn.addEventListener("click", goToNextStep);
    dom.dockPrevBtn.addEventListener("click", goToPrevStep);

    // キーボード操作対応（PC / Mac / iPad外付けキーボードで右キー・左キー対応）
    window.addEventListener("keydown", (e) => {
      if (!dom.studyView.classList.contains("active-view")) return;
      if (e.key === "ArrowRight") {
        goToNextStep();
      } else if (e.key === "ArrowLeft") {
        goToPrevStep();
      }
    });

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
