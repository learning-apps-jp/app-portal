# アプリの棚

公開URL: https://learning-apps-jp.github.io/app-portal/

公開したWebアプリを、PC・スマートフォンから使うためのポータルです。

- アプリを新しいタブで開く
- QRコード表示・SVG保存・URLコピー
- 検索・カテゴリ・名前順・お気に入り
- アプリの追加・編集・削除
- ブラウザ内の登録情報をJSONでバックアップ・読み込み

## アプリを公開一覧に追加する

`apps.js` の `DEFAULT_APPS` に情報を追加してください。既定のアプリは閲覧者共通、画面から追加したアプリとお気に入りは端末・ブラウザごとのlocalStorageに保存されます。PCからスマホへ追加情報を移すにはバックアップファイルを読み込みます。QRコードはアプリのURLを開くもので、アプリ内部の保存データは転送しません。

GitHub Pagesの公開サイトです。ポータルに認証はなく、既定アプリの一覧は誰でも閲覧できます。秘密のURLや認証情報をソースに登録しないでください。

## ローカル確認

`node scripts/serve.mjs` で http://127.0.0.1:4173 を開きます。ビルド・有料サービス・外部APIは不要です。QRコード生成用の qrcode-generator 1.4.4 を同梱しています（MIT、`vendor/qrcode.js` 内の著作権表示参照）。

公開ファイル：`index.html`、`style.css`、`app.js`、`apps.js`、`icon.svg`、`vendor/`、`.nojekyll`。
