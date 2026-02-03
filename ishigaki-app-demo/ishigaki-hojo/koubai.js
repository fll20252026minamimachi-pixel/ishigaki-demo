const shasin = document.getElementById("koubai-shasin");
const canvas = document.getElementById("preview");
const ctx     = canvas.getContext('2d');
let gazou = null;
let fitt = null;

shasin.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // 画像の読み込み（FileReader でも良いが、ObjectURL が簡単）
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gazou = image;
    // キャンバスに収まるようにフィットさせて描画（そのままでもOK）
    fitt = fitContain(image.width, image.height, canvas.width, canvas.height);
    drawall();
    URL.revokeObjectURL(url); // 後片付け

  };
  image.src = url;
});

// 画像を歪ませずにキャンバスへ収めるユーティリティ
function fitContain(iw, ih, cw, ch) {
  const ir = iw / ih, cr = cw / ch;
  let w, h;
  if (ir > cr) { w = cw; h = cw / ir; }
  else         { h = ch; w = ch * ir; }
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

const ten = [];

canvas.addEventListener('click',(e)=>{
    const { x, y } = zahyou(e, canvas);
  const insideX = (x >= fitt.x) && (x <= fitt.x + fitt.w);
  const insideY = (y >= fitt.y) && (y <= fitt.y + fitt.h);
  if (!insideX || !insideY) {
    return; // ← 画像の外は無視
  }
    ten.push({ x, y });
    drawall();
});

function drawall(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = '#22c55e';
    if (gazou && fitt){
      ctx.drawImage(gazou, fitt.x, fitt.y, fitt.w, fitt.h);
    }
    for (const p of ten) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } 
  sen();
  
  keisan();
}

function zahyou(evt,canvas){
  const zahyo = canvas.getBoundingClientRect();
  const zahx = canvas.width/zahyo.width;
  const zahy = canvas.height/zahyo.height;
  return{
    x:(evt.clientX - zahyo.left)*zahx,
    y:(evt.clientY - zahyo.top)*zahy,
  };
}

function sen(){
  if (ten.length < 2) return;
  ctx.save();

  ctx.strokeStyle = "#ff0000";  // 赤（目立つ）
  ctx.lineWidth = 4;            // 太さ

  for (let i = 1; i < ten.length; i++){
    ctx.beginPath();
    ctx.moveTo(ten[i-1].x,ten[i-1].y);
    ctx.lineTo(ten[i].x,ten[i].y);
    ctx.stroke();  
  }
  ctx.restore();

}

const heikin = document.getElementById('heikin');
const dai = document.getElementById('dai');
const shou = document.getElementById('shou');
const sa = document.getElementById('sa');
const kekka = document.getElementById('kekka');

//tukareta ima 19:00;

function koubai (p1,p2){
  const dx = p2.x - p1.x;
  const dyCanvas = p2.y - p1.y;     // 下が+のキャンバス座標
  if (dx === 0) {
    return { slope: Infinity, angleDeg: 90, percent: Infinity, dx, dyCanvas };
  }
  const slope = -(dyCanvas / dx);   // 数学の傾き（上が＋）
  const kakudo = Math.atan2(-dyCanvas, dx) * 180/ Math.PI; // 右向きを0°，反時計回り+
  let zettaiti = Math.abs(kakudo);
  if (zettaiti > 90){
    const usokakudo = Math.abs(Math.atan2(-dyCanvas, dx) * 180/ Math.PI);
    const angleDeg = 180 - usokakudo;
    const percent = slope * 100;
    return { slope, angleDeg, percent, dx, dyCanvas };
  
  }else {
    const angleDeg = Math.abs(kakudo);
  const percent = slope * 100;
  return { slope, angleDeg, percent, dx, dyCanvas };
  }
}

let katamuki =[];
function suuti (){
  const a = ten[ten.length-2];
  const b = ten[ten.length-1];
  katamuki = koubai(a,b).percent;
}
function allGradients() {
  const res = [];
  for (let i = 1; i < ten.length; i++) {
    const info = koubai(ten[i-1], ten[i]);
    if (Number.isFinite(info.percent)) res.push(info.percent);
  }
  return res;
}

function keisan() {
  const angles = allAngles({ abs: true }); // ★ 角度(度)で集計。向き不要なら abs:true
 if (angles.length === 0) {
    heikin.textContent = '—';
    dai.textContent    = '—';
    shou.textContent   = '—';
    sa.textContent     = '—';
     return;
   }
  const max  = Math.max(...angles);
  const min  = Math.min(...angles);
  const avg  = angles.reduce((s, n) => s + n, 0) / angles.length;
  const diff = max - min;

  heikin.textContent = avg.toFixed(1) + '°';
  dai.textContent    = max.toFixed(1) + '°';
  shou.textContent   = min.toFixed(1) + '°';
  sa.textContent     = diff.toFixed(1) + '°';
}
// ★ 追加：全線分の角度[度]を配列で返す（abs=true なら 0〜90°）
function allAngles({ abs = true } = {}) {
  const res = [];
  for (let i = 1; i < ten.length; i++) {
    const info = koubai(ten[i-1], ten[i]);  // ← 既存の関数をそのまま利用
    if (Number.isFinite(info.angleDeg)) {
      res.push(abs ? Math.abs(info.angleDeg) : info.angleDeg);
    }
  }
  return res;
}

const risetto = document.getElementById('risetto');
risetto.addEventListener('click',(e)=>{
  ten.length = 0;
  heikin.textContent = '—';
  dai.textContent    = '—';
  shou.textContent   = '—';
  sa.textContent     = '—';
  drawall();
})

function fitCanvasToParent(canvas) {
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  // CSSサイズ（見た目）
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  // 実サイズ（描画解像度）
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function fitCanvasAndDrawContain(canvas, img){
  const ctx = canvas.getContext("2d");

  // CSS上の表示サイズ（親.eで決まる）
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;

  // Retina等の高DPI対応（ぼやけ防止）
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 収める倍率（縦横比維持）
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.min(cw / iw, ch / ih);

  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);

  // クリックで線を引く等のために、描画位置/倍率を保持したいなら戻り値で返す
  return { dx, dy, dw, dh, scale };
}
