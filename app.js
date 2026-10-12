'use strict';
const $=s=>document.querySelector(s), KEY='app-shelf:v1', categories=['学び','教室の道具','遊び','その他'];
let state={custom:[],favorites:[]}, filter='all', editing=null, qrApp=null, deleting=null, pendingImport=null, timer;
const toast=message=>{ $('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),3200); };
function safeURL(value){ const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('http または https の公開URLを入力してください。');return u.href; }
function validate(data){
  if(!data||!Array.isArray(data.custom)||!Array.isArray(data.favorites)||data.custom.length>500||data.favorites.length>1000)throw Error('バックアップの形式が正しくありません。');
  const ids=new Set(window.DEFAULT_APPS.map(a=>a.id));
  const custom=data.custom.map(a=>{if(!a||typeof a.id!=='string'||!a.id.startsWith('custom-')||a.id.length>100||ids.has(a.id)||typeof a.name!=='string'||!a.name.trim()||a.name.length>80||typeof a.url!=='string'||a.url.length>2048||typeof a.description!=='string'||a.description.length>240||!categories.includes(a.category))throw Error('アプリ情報が正しくありません。');ids.add(a.id);return {id:a.id,name:a.name.trim(),url:safeURL(a.url),description:a.description,category:a.category,icon:'↗',color:'mint'};});
  if(data.favorites.some(id=>typeof id!=='string'))throw Error('お気に入り情報が正しくありません。');
  return {custom,favorites:[...new Set(data.favorites.filter(id=>ids.has(id)))]};
}
try{const raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));}catch{setTimeout(()=>toast('保存データを読めませんでした。バックアップがあれば読み込んでください。'),100);}
function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;return true;}catch{toast('保存できませんでした。ブラウザの保存設定や容量をご確認ください。');return false;}}
const all=()=>[...window.DEFAULT_APPS,...state.custom];
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function button(label,action,className){const b=el('button',className,label);b.type='button';b.addEventListener('click',action);return b;}
function render(){
 const query=$('#search').value.trim().toLocaleLowerCase();let apps=all().filter(a=>(filter==='all'||(filter==='favorites'?state.favorites.includes(a.id):a.category===filter))&&`${a.name} ${a.description} ${a.category} ${a.url}`.toLocaleLowerCase().includes(query));
 if($('#sort').value==='name')apps.sort((a,b)=>a.name.localeCompare(b.name,'ja'));
 $('#grid').replaceChildren();$('#count').textContent=apps.length;$('#empty').hidden=apps.length>0;
 for(const a of apps){const card=el('article','card'),top=el('div','card-top'),icon=el('span',`app-icon ${a.color}`,a.icon);icon.setAttribute('aria-hidden','true');const fav=button(state.favorites.includes(a.id)?'★':'☆',()=>{const favorites=state.favorites.includes(a.id)?state.favorites.filter(id=>id!==a.id):[...state.favorites,a.id];if(save({...state,favorites}))render();},'favorite');fav.setAttribute('aria-label',`${a.name}のお気に入り`);fav.setAttribute('aria-pressed',String(state.favorites.includes(a.id)));top.append(icon,fav);
 const actions=el('div','card-actions'),link=el('a','open','アプリをひらく ↗');link.href=a.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${a.name}を新しいタブでひらく`);const qr=button('▧ QR',()=>showQR(a)),copy=button('コピー',()=>copyURL(a.url));qr.setAttribute('aria-label',`${a.name}のQRコード`);copy.setAttribute('aria-label',`${a.name}のURLをコピー`);actions.append(link,qr,copy);card.append(top,el('p','category',a.category),el('h3','',a.name),el('p','description',a.description),actions);
 if(a.id.startsWith('custom-')){const tools=el('div','custom-actions');tools.append(button('編集',()=>edit(a)),button('削除',()=>{deleting=a;$('#delete-name').textContent=a.name;$('#delete-dialog').showModal();}));card.append(tools);}$('#grid').append(card); }
}
async function copyURL(url){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);}else{const input=el('textarea');input.value=url;input.style.position='fixed';input.style.opacity='0';(document.querySelector('dialog[open]')||document.body).append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw Error();}toast('URLをコピーしました');}catch{toast('コピーできませんでした。QR画面のURLを選択してコピーしてください。');}}
function showQR(a){try{const qr=qrcode(0,'M');qr.addData(a.url);qr.make();$('#qr-image').innerHTML=qr.createSvgTag({cellSize:5,margin:20,scalable:true});$('#qr-name').textContent=a.name;$('#qr-url').textContent=a.url;qrApp=a;$('#qr-dialog').showModal();}catch{toast('QRコードを生成できませんでした。URLが長すぎる場合は短いURLを使ってください。');}}
function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('#qr-copy').onclick=()=>qrApp&&copyURL(qrApp.url);
$('#qr-download').onclick=()=>{if(qrApp)download(new Blob([$('#qr-image').innerHTML],{type:'image/svg+xml'}),`qr-${qrApp.id}.svg`);};
function edit(a=null){editing=a;$('#edit-form').reset();$('#form-error').textContent='';$('#edit-title').textContent=a?'アプリを編集':'アプリを追加';if(a)for(const k of ['name','url','description','category'])$('#edit-form').elements[k].value=a[k];$('#edit-dialog').showModal();}
$('#add').onclick=()=>edit();
$('#edit-form').onsubmit=e=>{e.preventDefault();try{const f=e.currentTarget.elements,name=f.name.value.trim();if(!name)throw Error('アプリ名を入力してください。');const url=safeURL(f.url.value.trim());if(all().some(a=>a.url===url&&a.id!==editing?.id))throw Error('このURLはすでに登録されています。');if(!editing&&state.custom.length>=500)throw Error('追加アプリの上限は500件です。');const a={id:editing?.id||`custom-${crypto.randomUUID()}`,name,url,description:f.description.value.trim(),category:f.category.value,icon:'↗',color:'mint'};const custom=editing?state.custom.map(x=>x.id===editing.id?a:x):[...state.custom,a];if(save({...state,custom})){$('#edit-dialog').close();$('#search').value='';filter='all';syncFilters();render();toast('アプリを保存しました');}}catch(error){$('#form-error').textContent=error.message;}};
$('#confirm-delete').onclick=()=>{if(deleting&&save({custom:state.custom.filter(a=>a.id!==deleting.id),favorites:state.favorites.filter(id=>id!==deleting.id)})){$('#delete-dialog').close();render();toast('追加アプリを削除しました');}};
function syncFilters(){document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;syncFilters();render();});
$('#search').oninput=render;$('#sort').onchange=render;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#export').onclick=()=>{download(new Blob([JSON.stringify({version:1,...state},null,2)],{type:'application/json'}),'app-shelf-backup.json');toast('バックアップを保存しました');};
$('#import').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async e=>{const f=e.target.files[0];try{if(!f)return;if(f.size>2000000)throw Error('ファイルが大きすぎます（上限2MB）。');pendingImport=validate(JSON.parse(await f.text()));$('#import-summary').textContent=`追加アプリ ${pendingImport.custom.length}件・お気に入り ${pendingImport.favorites.length}件`;$('#import-dialog').showModal();}catch(error){toast(error.message);}finally{e.target.value='';}};
$('#confirm-import').onclick=()=>{if(pendingImport&&save(pendingImport)){$('#import-dialog').close();render();toast('バックアップを読み込みました');pendingImport=null;}};
window.addEventListener('storage',e=>{if(e.key===KEY){try{state=e.newValue?validate(JSON.parse(e.newValue)):{custom:[],favorites:[]};render();}catch{toast('別のタブの保存データを読めませんでした。');}}});
render();
