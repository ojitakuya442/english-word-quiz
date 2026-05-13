# 英単語8択クイズ

CSVに同梱した英単語データを使って、英語から日本語訳を選ぶ8択クイズPWAです。外部バックエンドやAI APIは使わず、ブラウザだけで動作します。

## 使い方

1. データセットを選びます。
2. 問題数を `10 / 20 / 30 / 50 / 100 / 200` から選びます。
3. スタートして、A〜Hの選択肢から日本語訳を選びます。

## CSVの配置場所

CSVは `public/data/` に置きます。

- `public/data/words-ngsl.csv`
- `public/data/words-2.csv`
- `public/data/words-3.csv`

## CSVの必要列

必須列:

- `entry`
- `meaning_ja`

任意列:

- `example_sentence`
- `translated_sentence`
- `pos`
- `word_id`

`entry` または `meaning_ja` が空欄の行は除外されます。同じ `entry` が重複する場合は最初の1件だけ使います。

## 開発コマンド

```bash
npm install
npm run dev
```

## ビルドコマンド

```bash
npm run build
```

## GitHub Pages公開方法

GitHub Pagesで公開する場合は、リポジトリの Settings で Pages の Source を GitHub Actions に設定してください。`main` ブランチへpushすると `.github/workflows/deploy.yml` がビルドしてPagesへデプロイします。

## Viteのbase設定

GitHub Pagesはサブパス配信になるため、ビルド時に `VITE_BASE_PATH` を指定します。

```bash
VITE_BASE_PATH=/リポジトリ名/ npm run build
```

workflowでは自動で `/${{ github.event.repository.name }}/` を使います。ユーザー/組織ページ直下で公開する場合は `/` に変更してください。

## PWAとしてホーム画面に追加する方法

一度ブラウザで開いたあと、スマホブラウザの共有メニューまたはインストール案内から「ホーム画面に追加」を選びます。初回読み込み後は、アプリ本体とCSVがservice workerにキャッシュされます。
