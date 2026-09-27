# 古文 助動詞マスター（活用暗記Webアプリ）

高校生の古文学習（助動詞の活用暗記）をサポートするための、スマートフォン特化型Webアプリケーションです。  
サーバー不要の完全な静的構成（HTML / CSS / JavaScript）となっており、GitHub Pagesで簡単に無償公開・更新が可能です。

---

## 📂 ファイル構成

```text
Rihito/
├── index.html   # アプリケーションの画面構造（モバイルファースト）
├── style.css    # スマートフォン向けUIデザイン・アニメーション定義
├── data.js      # 助動詞データ（ここを編集して新しい助動詞を追加）
├── app.js       # 画面遷移、個別表示・一括表示などのロジック
└── README.md    # 本マニュアル（更新・運用手順）
```

---

## 🚀 ローカルでの動作確認方法

1. Finderで `Rihito` フォルダを開きます。
2. `index.html` をダブルクリックして、普段お使いのブラウザ（Safari, Chromeなど）で開きます。
3. 画面のレイアウトや、マスタップ・原形ヘッダータップによる一括表示アニメーションの動作を確認してください。  
   ※ブラウザの開発者ツール（F12、または右クリック「検証」）で「モバイル表示（デバイスツールバー）」に切り替えると、スマートフォン実機での見え方を確認できます。

---

## ✍️ 新しい助動詞の追加手順（運用方法）

助動詞を追加する際は、**`data.js` だけを編集**すれば自動的に画面の一覧および活用表に反映されます。

### 1. `data.js` を開く
テキストエディタ（VS Code、メモ帳など）で `data.js` を開きます。

### 2. `jodoushiData` 配列に追記
末尾に以下のような形式でオブジェクトを追加します。

```javascript
  {
    id: "su",
    name: "す",
    meaning: "使役・尊敬",
    connection: "四段・ナ変・ラ変の未然形",
    type: "下二段型",
    conjugation: {
      mizen: "せ",
      renyou: "せ",
      shuushi: "す",
      rentai: "する",
      izen: "すれ",
      meirei: "せよ"
    }
  },
```

> **ポイント**  
> 活用がない箇所には `"〇"` や `"（〇）"` と記入してください。  
> アプリが自動的に「活用なし」と判定し、タップ不要で最初から「〇」と表示されます。

### 3. ローカルで確認
ブラウザで `index.html` をリロード（再読み込み）し、追加した助動詞が表示されることを確認します。

---

## 🌐 GitHub Pages への公開・更新手順

### 初回セットアップ（GitHubリポジトリ作成時）
ターミナルを開き、`Rihito` フォルダに移動して以下を実行します。

```bash
cd /Users/yamato_mba/Study_UTokyo/Rihito

# Gitリポジトリの初期化
git init
git add .
git commit -m "Initial commit: 古文助動詞暗記アプリの初期作成"

# GitHubにリポジトリを作成後、リモートURLを紐付け
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

#### GitHub側の設定（GitHub Pagesの有効化）
1. GitHubの該当リポジトリのページを開きます。
2. 上部メニューの **「Settings」** をクリックします。
3. 左サイドバーの **「Pages」** をクリックします。
4. **Build and deployment** の **Source** で「Deploy from a branch」を選択します。
5. **Branch** で `main` ブランチ、フォルダは `/ (root)` を選択し、**Save** をクリックします。
6. 数分待つと、発行されたURL（例: `https://<ユーザー名>.github.io/<リポジトリ名>/`）からスマートフォンでアクセスできるようになります。

---

### 日常の更新手順（助動詞を追加した時）
`data.js` を編集・保存した後、ターミナルで以下の3行を実行するだけで自動更新されます。

```bash
cd /Users/yamato_mba/Study_UTokyo/Rihito

git add .
git commit -m "助動詞『す・さす』を追加"
git push
```

プッシュ後、1〜2分程度でGitHub Pagesが自動更新され、従弟がスマートフォンでアクセスした際に新しい助動詞が反映されます。
