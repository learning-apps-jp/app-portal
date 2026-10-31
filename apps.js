// 公開一覧の追加・変更はこのファイルで管理します。
window.DEFAULT_APPS = [
  ['moon-phases','月の満ち欠け','月を動かして、形と時刻による見え方をくらべる。','学び','◒','purple'],
  ['earth-sun-motion','地球と太陽の一日','地球を回して、日の出・正午・日の入りを観察する。','学び','🌏','blue'],
  ['ichiji-denshin','一字伝心','漢字一字のヒントで早答え。3〜8人で遊ぶ連想ゲーム。','遊び','字','orange'],
  ['speed-experiment-camera','速さの実験カメラ','動画を使って、動きと速さを観察する。','学び','◉','mint'],
  ['solar-system-lab','太陽系','惑星を眺めながら、宇宙を探究する。','学び','☀','blue'],
  ['constellations','星座','星座の世界をひらいて、星空を楽しむ。','学び','✦','purple'],
  ['smart-seat-planner','スマート席替え','教室の座席表と席替えを、手軽に。','教室の道具','▦','mint'],
  ['class-gacha','出席番号ガチャ','だれの番？ 出席番号を楽しく抽選。','教室の道具','🎲','orange'],
  ['timetable-app','授業時間割マネージャー','日々の授業時間割を見やすく管理。','教室の道具','▤','blue'],
  ['game-home','あそびのテーブル','みんなで遊ぶゲームの入口。','遊び','♧','orange'],
  ['name-forest','なまえの森','名前をつけて、覚えて、声で呼ぼう。','遊び','♣','mint'],
  ['werewolf','月あかりの人狼','会話と推理で楽しむ人狼ゲーム。','遊び','☾','purple'],
  ['word-wolf','ワードウルフ','お題をめぐる会話から、少数派を探す。','遊び','❝','orange'],
  ['oekaki-dengon','お絵描き伝言','絵でつないで、みんなで笑おう。','遊び','✎','pink'],
  ['sanrentan-game','サンレンタン！','みんなの予想で盛り上がるゲーム。','遊び','③','blue'],
  ['one-night-werewolf','ひと晩の人狼','短い時間で楽しむ、人狼の推理。','遊び','☽','purple'],
  ['handball-studio','Handball Studio','ハンドボールの得点・失点・セーブを記録。動画分析と作戦盤で振り返る。','その他','◉','blue']
].map(([id,name,description,category,icon,color])=>({id,name,description,category,icon,color,url:`https://learning-apps-jp.github.io/${id}/`}));

