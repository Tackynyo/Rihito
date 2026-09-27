/**
 * 古文 助動詞マスター アプリケーションロジック (app.js)
 * Vanilla JavaScript (フレームワーク不使用 / ゼロ依存)
 */

(function () {
  "use strict";

  // 活用形の定義（表示順とラベル）
  const CONJUGATION_FORMS = [
    { key: "mizen", label: "未然形" },
    { key: "renyou", label: "連用形" },
    { key: "shuushi", label: "終止形" },
    { key: "rentai", label: "連体形" },
    { key: "izen", label: "已然形" },
    { key: "meirei", label: "命令形" }
  ];

  // DOM要素のキャッシュ
  const dom = {
    homeView: document.getElementById("home-view"),
    detailView: document.getElementById("detail-view"),
    jodoushiList: document.getElementById("jodoushi-list"),
    searchInput: document.getElementById("search-input"),
    clearSearchBtn: document.getElementById("clear-search-btn"),
    backToHomeBtn: document.getElementById("back-to-home-btn"),
    prevItemBtn: document.getElementById("prev-item-btn"),
    nextItemBtn: document.getElementById("next-item-btn"),
    headerCard: document.getElementById("jodoushi-header-card"),
    detailName: document.getElementById("detail-name"),
    detailMeaning: document.getElementById("detail-meaning"),
    detailMetaTags: document.getElementById("detail-meta-tags"),
    conjugationTbody: document.getElementById("conjugation-tbody"),
    revealAllBtn: document.getElementById("reveal-all-btn"),
    resetAllBtn: document.getElementById("reset-all-btn")
  };

  // 内部状態
  let currentIndex = -1;
  let filteredData = [];

  /**
   * 活用なし（〇やなしなど）の判定
   * @param {string} val 
   * @returns {boolean}
   */
  function isNoneConjugation(val) {
    if (!val) return true;
    const clean = val.trim();
    return clean === "〇" || clean === "（〇）" || clean === "なし" || clean === "-";
  }

  /**
   * ホーム画面: 助動詞リストの生成
   */
  function renderList(items) {
    dom.jodoushiList.innerHTML = "";

    if (!items || items.length === 0) {
      dom.jodoushiList.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: #a0aec0;">
          <p style="font-size: 1.1rem; margin-bottom: 6px;">該当する助動詞が見つかりません</p>
          <p style="font-size: 0.85rem;">検索キーワードを変えてお試しください</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "jodoushi-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${item.name}: ${item.meaning}`);

      const tagsHtml = [];
      if (item.type) {
        tagsHtml.push(`<span class="tag type-tag">${item.type}</span>`);
      }
      if (item.connection) {
        tagsHtml.push(`<span class="tag conn-tag">${item.connection}</span>`);
      }

      card.innerHTML = `
        <div class="card-left">
          <div class="card-name-badge">${item.name}</div>
          <div class="card-info">
            <div class="card-meaning">${item.meaning}</div>
            <div class="card-meta">${tagsHtml.join("")}</div>
          </div>
        </div>
        <div class="card-arrow">&rsaquo;</div>
      `;

      // クリック/タップで詳細表示
      card.addEventListener("click", () => {
        openDetailById(item.id);
      });

      // キーボード操作 (Enter / Space)
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetailById(item.id);
        }
      });

      dom.jodoushiList.appendChild(card);
    });
  }

  /**
   * 詳細画面: 指定の助動詞を表示
   */
  function showDetail(index) {
    if (index < 0 || index >= jodoushiData.length) return;
    currentIndex = index;
    const item = jodoushiData[currentIndex];

    // ヘッダー情報の更新
    dom.detailName.textContent = item.name;
    dom.detailMeaning.textContent = item.meaning;

    // タグの更新
    dom.detailMetaTags.innerHTML = "";
    if (item.type) {
      const span = document.createElement("span");
      span.className = "tag type-tag";
      span.textContent = item.type;
      dom.detailMetaTags.appendChild(span);
    }
    if (item.connection) {
      const span = document.createElement("span");
      span.className = "tag conn-tag";
      span.textContent = item.connection;
      dom.detailMetaTags.appendChild(span);
    }

    // 前へ・次へボタンの有効/無効化
    dom.prevItemBtn.disabled = currentIndex <= 0;
    dom.prevItemBtn.style.opacity = currentIndex <= 0 ? "0.4" : "1";

    dom.nextItemBtn.disabled = currentIndex >= jodoushiData.length - 1;
    dom.nextItemBtn.style.opacity = currentIndex >= jodoushiData.length - 1 ? "0.4" : "1";

    // 活用表の動的生成
    dom.conjugationTbody.innerHTML = "";

    CONJUGATION_FORMS.forEach((form) => {
      const tr = document.createElement("tr");

      // 活用形名
      const th = document.createElement("th");
      th.className = "td-form-name";
      th.scope = "row";
      th.textContent = form.label;

      // 答えセル
      const td = document.createElement("td");
      td.className = "td-answer-cell";

      const answerVal = (item.conjugation && item.conjugation[form.key]) ? item.conjugation[form.key] : "〇";
      const isNone = isNoneConjugation(answerVal);

      const box = document.createElement("div");
      box.className = "answer-box";

      if (isNone) {
        // 活用がない箇所は最初から「〇」として表示し、タップ不要にする
        box.classList.add("is-none");
        box.innerHTML = `
          <span class="answer-text">${answerVal}</span>
        `;
      } else {
        // 活用がある箇所は初期状態で隠す
        box.classList.add("is-hidden");
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
        box.setAttribute("aria-label", `${form.label}の活用を見る`);

        box.innerHTML = `
          <div class="cover-placeholder">
            <span>？</span>
            <span>タップ</span>
          </div>
          <span class="answer-text">${answerVal}</span>
        `;

        // 個別タップで答えを表示（もう一度タップすると再テスト用に隠す）
        const toggleAnswer = () => {
          if (box.classList.contains("is-hidden")) {
            box.classList.remove("is-hidden");
            box.classList.add("is-revealed");
          } else if (box.classList.contains("is-revealed")) {
            box.classList.remove("is-revealed");
            box.classList.add("is-hidden");
          }
        };

        box.addEventListener("click", toggleAnswer);
        box.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleAnswer();
          }
        });
      }

      td.appendChild(box);
      tr.appendChild(th);
      tr.appendChild(td);
      dom.conjugationTbody.appendChild(tr);
    });

    // 画面切り替え
    dom.homeView.classList.remove("active-view");
    dom.detailView.classList.add("active-view");
    dom.detailView.removeAttribute("hidden");
    dom.homeView.setAttribute("hidden", "true");

    // スクロールをトップに戻す
    window.scrollTo({ top: 0, behavior: "smooth" });

    // URLハッシュの更新（ブラウザの「戻る」ボタン対応）
    if (history.pushState) {
      history.pushState({ view: "detail", id: item.id }, "", `#${item.id}`);
    }
  }

  /**
   * IDから助動詞を開く
   */
  function openDetailById(id) {
    const idx = jodoushiData.findIndex((item) => item.id === id);
    if (idx !== -1) {
      showDetail(idx);
    }
  }

  /**
   * ホーム画面に戻る
   */
  function showHome() {
    dom.detailView.classList.remove("active-view");
    dom.homeView.classList.add("active-view");
    dom.homeView.removeAttribute("hidden");
    dom.detailView.setAttribute("hidden", "true");

    if (history.pushState) {
      history.pushState({ view: "home" }, "", window.location.pathname);
    }
  }

  /**
   * 一括表示機能: すべての隠しセルを表示する
   */
  function revealAllAnswers() {
    const boxes = dom.conjugationTbody.querySelectorAll(".answer-box.is-hidden");
    boxes.forEach((box, i) => {
      // わずかなディレイをつけて気持ちよく展開
      setTimeout(() => {
        box.classList.remove("is-hidden");
        box.classList.add("is-revealed");
      }, i * 35);
    });

    // ヘッダーカードをタップした際の軽いフィードバック演出
    dom.headerCard.style.transform = "scale(0.98)";
    setTimeout(() => {
      dom.headerCard.style.transform = "";
    }, 150);
  }

  /**
   * 一括リセット機能: もう一度隠す
   */
  function resetAllAnswers() {
    const boxes = dom.conjugationTbody.querySelectorAll(".answer-box.is-revealed");
    boxes.forEach((box) => {
      box.classList.remove("is-revealed");
      box.classList.add("is-hidden");
    });
  }

  /**
   * 検索フィルター
   */
  function handleSearch() {
    const query = dom.searchInput.value.trim().toLowerCase();
    dom.clearSearchBtn.hidden = query.length === 0;

    if (!query) {
      filteredData = [...jodoushiData];
    } else {
      filteredData = jodoushiData.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const meaningMatch = item.meaning.toLowerCase().includes(query);
        const typeMatch = item.type ? item.type.toLowerCase().includes(query) : false;
        const connMatch = item.connection ? item.connection.toLowerCase().includes(query) : false;
        return nameMatch || meaningMatch || typeMatch || connMatch;
      });
    }
    renderList(filteredData);
  }

  /**
   * イベントリスナーの登録
   */
  function setupEventListeners() {
    // 戻るボタン
    dom.backToHomeBtn.addEventListener("click", showHome);

    // 原形ヘッダーカードのタップで一括表示
    dom.headerCard.addEventListener("click", revealAllAnswers);
    dom.headerCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        revealAllAnswers();
      }
    });

    // 一括操作ボタン
    dom.revealAllBtn.addEventListener("click", revealAllAnswers);
    dom.resetAllBtn.addEventListener("click", resetAllAnswers);

    // 前へ・次へナビゲーション
    dom.prevItemBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        showDetail(currentIndex - 1);
      }
    });

    dom.nextItemBtn.addEventListener("click", () => {
      if (currentIndex < jodoushiData.length - 1) {
        showDetail(currentIndex + 1);
      }
    });

    // 検索入力
    dom.searchInput.addEventListener("input", handleSearch);
    dom.clearSearchBtn.addEventListener("click", () => {
      dom.searchInput.value = "";
      handleSearch();
      dom.searchInput.focus();
    });

    // ブラウザの戻る/進む（ポップステート）対応
    window.addEventListener("popstate", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        openDetailById(hash);
      } else {
        dom.detailView.classList.remove("active-view");
        dom.homeView.classList.add("active-view");
        dom.homeView.removeAttribute("hidden");
        dom.detailView.setAttribute("hidden", "true");
      }
    });
  }

  /**
   * 初期化処理
   */
  function init() {
    if (typeof jodoushiData === "undefined" || !Array.isArray(jodoushiData)) {
      console.error("data.js が正しく読み込まれていません。");
      return;
    }

    filteredData = [...jodoushiData];
    renderList(filteredData);
    setupEventListeners();

    // URLハッシュ付きで開かれた場合の直リンク対応
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash) {
      openDetailById(initialHash);
    }
  }

  // DOM構築完了後に実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
