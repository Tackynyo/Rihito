/**
 * 古文 助動詞マスター アプリケーションロジック (app.js)
 * 
 * 仕様:
 * ① ホーム画面: 検索窓（助動詞と主な意味でヒット、接続を右側に表示） ＋ 接続一覧
 * ② 暗記お助けTips: 6番目の項目として追加。語呂合わせ一覧と各文字タップでのポップアップ
 * ③ 活用表: 8行×2列（1行目「基本形」タップで全表示。「すべて表示」ボタンを「もう一度隠す」に変更し、右側には語呂画面への遷移ボタン/空白を配置）
 * ④ 完了画面: 「〜の学習完了！」「繰り返し復習することが重要です！」の表記
 * ⑤ 活用表を最初に連続で表示 → 主な意味（共通統合）の順で表示
 * ⑥ 左スワイプ or 次へボタンで、本のページをめくるような3Dアニメーションで遷移
 * ⑦ ヘッダータップでいつでもホーム画面に戻る
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
    tipsListView: document.getElementById("tips-list-view"),
    tipDetailView: document.getElementById("tip-detail-view"),

    // 検索
    searchInput: document.getElementById("search-input"),
    clearSearchBtn: document.getElementById("clear-search-btn"),
    searchResultsContainer: document.getElementById("search-results-container"),
    searchResultsList: document.getElementById("search-results-list"),
    searchCountBadge: document.getElementById("search-count-badge"),
    
    // 接続一覧
    connectionList: document.getElementById("connection-list"),
    
    // グループ画面
    groupList: document.getElementById("group-list"),
    groupCategoryTitle: document.getElementById("group-category-title"),
    backToHomeBtn: document.getElementById("back-to-home-btn"),
    
    // 学習画面
    backToGroupsBtn: document.getElementById("back-to-groups-btn"),
    backBtnLabel: document.getElementById("back-btn-label"),
    studyDeckContainer: document.getElementById("study-deck-container"),
    studyStepBadge: document.getElementById("study-step-badge"),
    dockPrevBtn: document.getElementById("dock-prev-btn"),
    dockNextBtn: document.getElementById("dock-next-btn"),
    dockCenterIndicator: document.getElementById("dock-center-indicator"),

    // Tips一覧＆詳細
    backFromTipsBtn: document.getElementById("back-from-tips-btn"),
    tipsItemsList: document.getElementById("tips-items-list"),
    backFromTipDetailBtn: document.getElementById("back-from-tip-detail-btn"),
    tipBackBtnLabel: document.getElementById("tip-back-btn-label"),
    tipDetailTitle: document.getElementById("tip-detail-title"),
    tipDetailDesc: document.getElementById("tip-detail-desc"),
    tipPhraseDisplay: document.getElementById("tip-phrase-display"),
    tipCharsGrid: document.getElementById("tip-chars-grid"),
    btnGoToConjugation: document.getElementById("btn-go-to-conjugation"),

    // ポップアップモーダル
    charPopupModal: document.getElementById("char-popup-modal"),
    popupCloseBtn: document.getElementById("popup-close-btn"),
    popupOkBtn: document.getElementById("popup-ok-btn"),
    popupChar: document.getElementById("popup-char"),
    popupMeaning: document.getElementById("popup-meaning"),
    popupNote: document.getElementById("popup-note")
  };

  // 状態管理
  let currentCategory = null;
  let currentGroup = null;
  let groupSteps = []; // グループ内の全ステップ（活用表群 → 主な意味群）
  let currentStepIndex = 0;
  let totalSteps = 0;
  let isAnimating = false;
  let studyReturnView = 'group'; // 'group' | 'home' | 'tip'
  let currentTip = null;
  let tipReturnToConjugation = false;

  /**
   * 画面の切り替え
   * @param {'home'|'group'|'study'|'tipsList'|'tipDetail'} viewName 
   */
  function switchView(viewName) {
    const allViews = [
      dom.homeView,
      dom.groupView,
      dom.studyView,
      dom.tipsListView,
      dom.tipDetailView
    ];

    allViews.forEach((v) => {
      if (v) {
        v.classList.remove("active-view");
        v.setAttribute("hidden", "true");
      }
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
    } else if (viewName === "tipsList") {
      dom.tipsListView.classList.add("active-view");
      dom.tipsListView.removeAttribute("hidden");
    } else if (viewName === "tipDetail") {
      dom.tipDetailView.classList.add("active-view");
      dom.tipDetailView.removeAttribute("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * 助動詞名から語呂データを検索する
   */
  function findTipForVerb(verbName) {
    if (!verbName || typeof tipsData === "undefined") return null;
    return tipsData.find((t) => t.verbNames.includes(verbName)) || null;
  }

  /**
   * カテゴリとグループを検索する
   */
  function findCategoryAndGroup(categoryId, groupId) {
    for (const cat of connectionCategories) {
      if (categoryId && cat.id !== categoryId) continue;
      const group = cat.groups.find(g => g.id === groupId);
      if (group) return { category: cat, group };
    }
    return null;
  }

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

  // =========================================================================
  // ① ホーム画面: 検索機能 ＋ 接続一覧リスト ＋ 暗記お助けTips
  // =========================================================================
  function renderConnectionList() {
    dom.connectionList.innerHTML = "";

    // 1〜5: 接続一覧
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

    // 6: 暗記お助けTips
    const tipsCard = document.createElement("div");
    tipsCard.className = "category-card tips-category-card";
    tipsCard.setAttribute("role", "button");
    tipsCard.setAttribute("tabindex", "0");
    tipsCard.setAttribute("aria-label", "暗記お助けTips");

    tipsCard.innerHTML = `
      <div class="category-left">
        <div class="category-number-badge">6</div>
        <div class="category-name">
          💡 暗記お助けTips
          <span class="category-badge-count">${typeof tipsData !== "undefined" ? tipsData.length : 5}語</span>
        </div>
      </div>
      <div class="category-arrow">&rsaquo;</div>
    `;

    tipsCard.addEventListener("click", () => {
      openTipsListView();
    });

    tipsCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openTipsListView();
      }
    });

    dom.connectionList.appendChild(tipsCard);
  }

  /**
   * ① 検索処理（助動詞と主な意味でヒット、接続名を常に右側に表示）
   * 検索機能使用中は検索結果のみを表示し、接続一覧は完全に非表示
   */
  function handleSearch() {
    const rawQuery = dom.searchInput.value.trim();
    dom.clearSearchBtn.hidden = rawQuery.length === 0;

    if (!rawQuery) {
      dom.searchResultsContainer.setAttribute("hidden", "true");
      dom.searchResultsContainer.style.display = "none";
      dom.connectionList.removeAttribute("hidden");
      dom.connectionList.style.display = "";
      return;
    }

    const query = rawQuery.toLowerCase();
    const results = [];

    connectionCategories.forEach((cat) => {
      cat.groups.forEach((group) => {
        group.items.forEach((item) => {
          const nameMatch = item.name.toLowerCase().includes(query);
          const meaningMatch = item.meanings.some((m) => 
            m.name.toLowerCase().includes(query) || (m.note && m.note.toLowerCase().includes(query))
          );
          const typeMatch = item.type ? item.type.toLowerCase().includes(query) : false;

          if (nameMatch || meaningMatch || typeMatch) {
            results.push({
              item,
              group,
              category: cat
            });
          }
        });
      });
    });

    // 検索結果表示切り替え（検索中：接続一覧を非表示、検索結果を表示）
    dom.connectionList.setAttribute("hidden", "true");
    dom.connectionList.style.display = "none";
    dom.searchResultsContainer.removeAttribute("hidden");
    dom.searchResultsContainer.style.display = "flex";
    dom.searchCountBadge.textContent = `${results.length}件ヒット`;
    dom.searchResultsList.innerHTML = "";

    if (results.length === 0) {
      dom.searchResultsList.innerHTML = `
        <div class="search-no-results">
          該当する助動詞が見つかりません。<br>キーワードを変えてお試しください。
        </div>
      `;
      return;
    }

    results.forEach(({ item, group, category }) => {
      const card = document.createElement("div");
      card.className = "search-result-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${item.name} (${category.name})`);

      const meaningsSummary = item.meanings.map(m => m.name).join("・");

      // 要件①: 常に助動詞表示の右に「〜接続」を表示
      card.innerHTML = `
        <div class="search-result-left">
          <div class="search-result-top">
            <span class="search-verb-name">${item.name}</span>
            <span class="search-conn-name">(${category.name})</span>
          </div>
          <div class="search-result-meanings">主な意味: ${meaningsSummary}</div>
        </div>
        <div class="group-item-arrow">&rsaquo;</div>
      `;

      card.addEventListener("click", () => {
        openStudyFromSearch(category, group, item.id);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openStudyFromSearch(category, group, item.id);
        }
      });

      dom.searchResultsList.appendChild(card);
    });
  }

  /**
   * 検索結果から直接学習画面を起動
   */
  function openStudyFromSearch(cat, group, targetVerbId) {
    currentCategory = cat;
    currentGroup = group;
    groupSteps = buildGroupSteps(group);
    
    // 対象助動詞の活用表ステップを特定
    let startStep = 0;
    const foundIdx = groupSteps.findIndex(s => s.type === "conjugation" && s.verb && s.verb.id === targetVerbId);
    if (foundIdx !== -1) {
      startStep = foundIdx;
    }
    
    startStudy(group, startStep, "home");
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
      card.innerHTML = `
        <div class="group-item-title">${group.title}</div>
        <div class="group-item-arrow">&rsaquo;</div>
      `;

      card.addEventListener("click", () => {
        startStudy(group, 0, "group");
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startStudy(group, 0, "group");
        }
      });

      dom.groupList.appendChild(card);
    });

    switchView("group");
  }

  // =========================================================================
  // ② 暗記お助けTips画面
  // =========================================================================
  function openTipsListView() {
    dom.tipsItemsList.innerHTML = "";

    if (typeof tipsData === "undefined" || !tipsData.length) {
      dom.tipsItemsList.innerHTML = `<p class="intro-text">現在登録されているTipsはありません。</p>`;
      switchView("tipsList");
      return;
    }

    tipsData.forEach((tip) => {
      const card = document.createElement("div");
      card.className = "tip-item-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${tip.title}`);

      // 要件③: 「む・むず 未然形接続」のみ表示（合言葉は表示しない）
      card.innerHTML = `
        <div class="tip-item-left">
          <div class="tip-item-title">${tip.title}</div>
        </div>
        <div class="group-item-arrow">&rsaquo;</div>
      `;

      card.addEventListener("click", () => {
        openTipDetailView(tip, false);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTipDetailView(tip, false);
        }
      });

      dom.tipsItemsList.appendChild(card);
    });

    switchView("tipsList");
  }

  /**
   * 語呂詳細画面を開く
   */
  function openTipDetailView(tip, fromConjugation = false) {
    currentTip = tip;
    tipReturnToConjugation = fromConjugation;

    if (dom.tipBackBtnLabel) {
      dom.tipBackBtnLabel.textContent = fromConjugation ? "活用表に戻る" : "Tips一覧";
    }

    dom.tipDetailTitle.textContent = tip.title;
    if (dom.tipDetailDesc) {
      dom.tipDetailDesc.textContent = "文字をタップすると主な意味が表示されます";
    }
    if (dom.tipPhraseDisplay) {
      dom.tipPhraseDisplay.textContent = tip.phrase;
    }

    // 各文字ボタンを生成（タップでポップアップ）
    dom.tipCharsGrid.innerHTML = "";
    tip.chars.forEach((charItem) => {
      const btn = document.createElement("button");
      btn.className = "tip-char-btn";
      btn.setAttribute("type", "button");
      btn.setAttribute("aria-label", `${charItem.char}の意味を見る`);

      const charLen = charItem.char.length;
      const sizeAttr = charLen > 2 ? ' style="font-size: 1.05rem;"' : (charLen === 2 ? ' style="font-size: 1.2rem;"' : '');
      btn.innerHTML = `<span class="tip-char-btn-text"${sizeAttr}>${charItem.char}</span>`;

      btn.addEventListener("click", () => {
        openCharPopup(charItem);
      });

      dom.tipCharsGrid.appendChild(btn);
    });

    switchView("tipDetail");
  }

  /**
   * 文字タップ時のポップアップ表示
   * 要件⑤: 「まじ」の「打消ス」などの複数文字も縦並びにならず綺麗に横並びで表示
   */
  function openCharPopup(charItem) {
    dom.popupChar.textContent = charItem.char;

    const charLen = charItem.char.length;
    if (charLen > 2) {
      dom.popupChar.style.fontSize = "1.2rem";
      dom.popupChar.style.padding = "6px 16px";
    } else if (charLen === 2) {
      dom.popupChar.style.fontSize = "1.35rem";
      dom.popupChar.style.padding = "6px 14px";
    } else {
      dom.popupChar.style.fontSize = "1.6rem";
      dom.popupChar.style.padding = "6px 14px";
    }

    dom.popupMeaning.textContent = charItem.meaning;
    dom.popupNote.textContent = charItem.note || "";
    dom.charPopupModal.removeAttribute("hidden");
    dom.charPopupModal.setAttribute("aria-hidden", "false");
  }

  function closeCharPopup() {
    dom.charPopupModal.setAttribute("hidden", "true");
    dom.charPopupModal.setAttribute("aria-hidden", "true");
  }

  // =========================================================================
  // ③・④・⑤ 学習画面: 活用表全件 → 主な意味（共通統合）の順で表示
  // =========================================================================
  function startStudy(group, initialStepIndex = 0, returnView = 'group') {
    currentGroup = group;
    studyReturnView = returnView;
    if (dom.backBtnLabel) {
      dom.backBtnLabel.textContent = returnView === 'home' ? 'ホーム' : (returnView === 'tip' ? '語呂へ' : 'リスト');
    }
    groupSteps = buildGroupSteps(group);
    currentStepIndex = initialStepIndex;
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
      // 次へ進む（左スワイプ/次へボタン）
      currentCard.classList.add("page-turning-forward");
      newCard.classList.add("page-revealing-forward");

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
      // 前へ戻る（右スワイプ/前へボタン）
      currentCard.classList.add("page-hiding-backward");
      newCard.classList.add("page-revealing-backward");

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
      // ③ 8行×2列 活用表カード
      return createConjugationCard(step.verb);
    } else {
      // ④ 主な意味カード
      return createMeaningsCard(step);
    }
  }

  /**
   * ③ 8行×2列 活用表カードの生成
   * 要件③: 「すべて表示」ボタンを廃止し、左側に「もう一度隠す」ボタンを配置。
   * 右側には語呂データがある場合は「語呂（暗記Tips）へ」ボタン、ない場合は空白を配置。
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

    // 要件③: 「すべて表示」ボタンを廃止し、左に「もう一度隠す」、右に「語呂の画面へ」or空白
    const tip = findTipForVerb(verb.name);

    const quickBar = document.createElement("div");
    quickBar.className = "table-quick-actions";

    // 左側ボタン: もう一度隠す
    const resetBtn = document.createElement("button");
    resetBtn.className = "quick-btn";
    resetBtn.id = "btn-reset-table";
    resetBtn.textContent = "🔄 もう一度隠す";
    resetBtn.addEventListener("click", () => {
      hiddenCells.forEach((box) => {
        box.classList.remove("is-revealed");
        box.classList.add("is-hidden");
      });
    });
    quickBar.appendChild(resetBtn);

    // 右側ボタン: 語呂の画面がある場合は「語呂」のみを表示、ない場合は空白
    if (tip) {
      const tipBtn = document.createElement("button");
      tipBtn.className = "quick-btn quick-btn-tip";
      tipBtn.id = "btn-goto-tip";
      tipBtn.textContent = "語呂";
      tipBtn.setAttribute("aria-label", `${verb.name}の語呂合わせ画面へ`);
      tipBtn.addEventListener("click", () => {
        openTipDetailView(tip, true);
      });
      quickBar.appendChild(tipBtn);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "quick-btn-placeholder";
      quickBar.appendChild(placeholder);
    }

    card.appendChild(quickBar);
    return card;
  }

  /**
   * ④ 主な意味カードの生成
   */
  function createMeaningsCard(step) {
    const card = document.createElement("div");
    card.className = "study-card meanings-study-card";

    const meaningCount = step.meanings.length;

    // カードヘッダー（注記テキストは一切非表示）
    card.innerHTML = `
      <div class="card-header-bar">
        <div class="card-title-group">
          <span class="card-target-name">${step.title}</span>
          <span class="card-mode-badge">主な意味（全${meaningCount}つ）</span>
        </div>
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
   * ④ グループ完了画面カードの生成
   * 要件④: 「〜の学習完了！」「繰り返し復習することが重要です！」の表記
   */
  function createCompletionCard() {
    const card = document.createElement("div");
    card.className = "study-card complete-card";

    card.innerHTML = `
      <div class="complete-icon">🎉</div>
      <h3 class="complete-title">「${currentGroup.title}」の学習完了！</h3>
      <p class="complete-desc">活用表と主な意味のチェックが終わりました。<br>繰り返し復習することが重要です！</p>
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
      if (studyReturnView === 'home') {
        switchView("home");
      } else {
        switchView("group");
      }
    });

    return card;
  }

  /**
   * 上部バッジと下部ドック操作の更新
   */
  function updateHeaderAndDock() {
    if (currentStepIndex >= totalSteps) {
      dom.studyStepBadge.textContent = "学習完了！";
      dom.dockPrevBtn.disabled = false;
      dom.dockNextBtn.style.display = "none";
      dom.dockCenterIndicator.innerHTML = `<span class="indicator-label">全ステップ終了</span>`;
      return;
    }

    const currentStep = groupSteps[currentStepIndex];
    const typeLabel = currentStep.type === "conjugation" ? "活用表" : "主な意味";

    // 上部バッジ更新
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

        // 横方向のスワイプ判定
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
    // 画面上部ヘッダータップでホーム画面に戻る
    if (dom.appHeaderNav) {
      dom.appHeaderNav.addEventListener("click", () => {
        // 検索をリセット
        dom.searchInput.value = "";
        handleSearch();
        switchView("home");
      });
      dom.appHeaderNav.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dom.searchInput.value = "";
          handleSearch();
          switchView("home");
        }
      });
    }

    // 検索入力イベント
    dom.searchInput.addEventListener("input", handleSearch);
    dom.clearSearchBtn.addEventListener("click", () => {
      dom.searchInput.value = "";
      handleSearch();
      dom.searchInput.focus();
    });

    // 画面遷移ボタン
    dom.backToHomeBtn.addEventListener("click", () => {
      switchView("home");
    });

    dom.backToGroupsBtn.addEventListener("click", () => {
      if (studyReturnView === 'home') {
        switchView("home");
      } else if (studyReturnView === 'tip') {
        switchView("tipDetail");
      } else {
        switchView("group");
      }
    });

    // Tips画面のナビゲーション
    dom.backFromTipsBtn.addEventListener("click", () => {
      switchView("home");
    });

    dom.backFromTipDetailBtn.addEventListener("click", () => {
      if (tipReturnToConjugation) {
        switchView("study");
      } else {
        switchView("tipsList");
      }
    });

    // Tips詳細から「活用表を表示」ボタン
    dom.btnGoToConjugation.addEventListener("click", () => {
      if (!currentTip) return;
      const found = findCategoryAndGroup(currentTip.categoryId, currentTip.groupId);
      if (found) {
        currentCategory = found.category;
        openStudyFromSearch(found.category, found.group, currentTip.verbId);
      }
    });

    // ポップアップモーダルを閉じる
    dom.popupCloseBtn.addEventListener("click", closeCharPopup);
    dom.popupOkBtn.addEventListener("click", closeCharPopup);
    dom.charPopupModal.addEventListener("click", (e) => {
      if (e.target === dom.charPopupModal) {
        closeCharPopup();
      }
    });

    // 下部ドックボタン（右ボタン: 次へ、左ボタン: 前へ）
    dom.dockNextBtn.addEventListener("click", goToNextStep);
    dom.dockPrevBtn.addEventListener("click", goToPrevStep);

    // キーボード操作対応
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !dom.charPopupModal.hasAttribute("hidden")) {
        closeCharPopup();
        return;
      }
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
