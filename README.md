# 古文 助動詞マスター（活用暗記Webアプリ）

高校生の古文学習（助動詞の活用暗記）をサポートするための、スマートフォン特化型Webアプリケーションです。  
サーバー不要の完全な静的構成（HTML / CSS / JavaScript）となっており、GitHub Pagesで簡単に無償公開・更新が可能です。

---

## 🔒 限定公開（実質的にリンクを知っている人のみアクセス可能にする設定）

不特定多数の人にアクセスされたりGoogle検索で見つかったりするのを防ぐため、以下の2重対策を施しています。

### 1. Google検索の対象から外す（検索避け対策済み）
* **`index.html` のメタタグ**: `<meta name="robots" content="noindex, nofollow">` を `<head>` 内に記述済みです。
* **`robots.txt`**: 検索エンジンのクローラー巡回を遮断する設定ファイルを配置済みです。
* これにより、第三者が「古文 助動詞」などでGoogle検索しても、検索結果にサイトが表示されません。

### 2. URLを予測されにくいものにする（リポジトリ名の工夫）
GitHub Pagesの公開URLは、以下のように決まります。  
`https://<あなたのGitHub_ID>.github.io/<リポジトリ名>/`

そのため、GitHubで新しいリポジトリを作成する際に、リポジトリ名を **予測されにくい英数字** に設定してください。
* **おすすめのリポジトリ名例**: `kobun-jodoushi-12345` や `kobun-jodoushi-x8k2p`
* **完成するURL**: `https://<あなたのGitHub_ID>.github.io/kobun-jodoushi-12345/`
* このURLをLINE等で従弟様に共有すれば、「リンクを知っている人だけがアクセスできる状態」になります。

---

## 📂 ファイル構成

```text
Rihito/
├── index.html   # アプリケーションの画面構造（noindex設定済み）
├── style.css    # スマートフォン向けUIデザイン・アニメーション定義
├── data.js      # 助動詞データ（ここを編集して新しい助動詞を追加）
├── app.js       # 画面遷移、個別表示・一括表示などのロジック
├── robots.txt   # 検索エンジンのクローラー除外設定
└── README.md    # 本マニュアル（更新・運用手順）
```

---

## 🚀 ローカルでの動作確認方法

1. Finderで `Rihito` フォルダを開きます。
2. `index.html` をダブルクリックして、ブラウザ（Safari, Chromeなど）で開きます。
3. 画面のレイアウトや、マスタップ・原形ヘッダータップによる一括表示アニメーションの動作を確認してください。  
   ※ブラウザの開発者ツール（F12、または右クリック「検証」）で「モバイル表示」に切り替えると、スマホ実機での見え方を確認できます。

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

## 🌐 GitHub Pages への公開手順

### 初回セットアップ
GitHub上で新しいリポジトリを **`kobun-jodoushi-12345`**（予測されにくい名前）として作成（Public）します。  
その後、Macのターミナルで `Rihito` フォルダに移動して以下を実行します。

```bash
cd /Users/yamato_mba/Study_UTokyo/Rihito

# 変更をステージ・コミット
git add .
git commit -m "Add noindex meta tag and robots.txt for privacy"

# リモートURLを紐付け（リポジトリ名を予測されにくいものに指定）
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/kobun-jodoushi-12345.git
git push -u origin main
```

#### GitHub Pages の有効化
1. GitHubの該当リポジトリのページを開きます。
2. 上部メニューの **「Settings」** をクリックします。
3. 左サイドバーの **「Pages」** をクリックします。
4. **Build and deployment** の **Source** で「Deploy from a branch」を選択します。
5. **Branch** で `main` ブランチ、フォルダは `/ (root)` を選択し、**Save** をクリックします。
6. 数分待つと、`https://<ユーザー名>.github.io/kobun-jodoushi-12345/` でアプリが公開されます。

---

### 日常の更新手順（助動詞を追加した時）
`data.js` を編集・保存した後、ターミナルで以下のコマンドを実行するだけで自動更新されます。

```bash
cd /Users/yamato_mba/Study_UTokyo/Rihito

git add .
git commit -m "助動詞『す・さす』を追加"
git push
```

プッシュ後、1〜2分程度でGitHub Pagesが自動更新され、従弟様がスマートフォンでアクセスした際に新しい助動詞が反映されます。
