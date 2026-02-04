/*変える過程で消した部分は基本コメントアウトしています*/
/*const tukaikata = document.getElementById('tukaikata-takasa');
const setumei = document.getElementById('tukaikata-takasa-text');

tukaikata.addEventListener('click', () => {
  // ボタンクリックでhiddenクラスを付け外しする
  setumei.classList.toggle('hidden');
});*/
const shasin  = document.getElementById('takasa-shasin');
const canvas  = document.getElementById('preview');      // ← canvas を取得
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
    drawAll();
    URL.revokeObjectURL(url); // 後片付け

  };
  image.src = url;

});

/*const shakudo = document.getElementById('shakudo');
const hakaru = document.getElementById('hakaru');*/
const step4 = document.getElementById('step4');
const tensha = [];
const tenna = [];

let mode = "none";
/*function iroduke (){
if(mode === "none"){
  hakaru.classList.remove('active');
  shakudo.classList.remove('active');
}else if(mode === "shakudo"){
  hakaru.classList.remove('active');
  shakudo.classList.toggle('active');
}else{
  hakaru.classList.toggle('active');
  shakudo.classList.remove('active');
}
}*/

/*shakudo.addEventListener('click',(e)=>{
  mode = "shakudo"; 
})



hakaru.addEventListener('click',(e)=>{
  mode = "hakaru";
})*/

const sousin = document.getElementById('kettei');
const suuzi = document.getElementById('jissai');
const wariai = document.getElementById('wariai');
const tyanto = document.getElementById('tyanto');
const kijunjityou = document.getElementById('kijunjityou');
let distance = null;
let kijun = null;
sousin.addEventListener('click',(e) => {
    if (!gazou || !fitt){
    kijunjityou.innerHTML = '<span class="blue";">まずstep.1を行ってください</span>';
    return;
  }
  mode = "shakudo"; 
  /*if (tensha.length < 2) {
     wariai.innerHTML = '基準設定：<span class="blue";">まず「基準設定」で2点を選んでください</span>';
    return;
  }*/
  // px(canvas内)/cm
  kijun = Number(suuzi.value);
  kijunjityou.innerHTML = '<span class="green";">送信完了！</span>';
  
});

// ★ これまで2つあったものを削除して、1つにまとめる
canvas.addEventListener('click', (e) => {
  if (!gazou || !fitt) return; // 画像未読み込みなら何もしない
  const { x, y } = zahyou(e,canvas);
  const insideX = (x >= fitt.x) && (x <= fitt.x + fitt.w);
  const insideY = (y >= fitt.y) && (y <= fitt.y + fitt.h);
  if (!insideX || !insideY) {
    return; // ← 画像の外は無視
  }

  if (mode === 'shakudo') {
    tensha.push({ x, y });
    if (tensha.length > 2) tensha.shift(); // 最新2点だけ残す
    if (tensha.length >= 2){
    distance = kyori(tensha[0], tensha[1]) / kijun;
    wariai.innerHTML = '基準設定：<span class="green";">完了！</span>';
    mode='hakaru';
    step4.classList.remove('hidden');
}
    
  } else if (mode === 'hakaru') {
    tenna.push({ x, y });
    if (tenna.length > 2) tenna.shift();
  } else {
    return; // mode='none' の場合は何もしない
  }

  drawAll();
});

function zahyou(evt,canvas){
  const zahyo = canvas.getBoundingClientRect();
  const zahx = canvas.width/zahyo.width;
  const zahy = canvas.height/zahyo.height;
  return{
    x:(evt.clientX - zahyo.left)*zahx,
    y:(evt.clientY - zahyo.top)*zahy,
  };
}

// 画像を歪ませずにキャンバスへ収めるユーティリティ
function fitContain(iw, ih, cw, ch) {
  const ir = iw / ih, cr = cw / ch;
  let w, h;
  if (ir > cr) { w = cw; h = cw / ir; }
  else         { h = ch; w = ch * ir; }
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}


// ★ 新しい描画関数（全部を描く）
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gazou && fitt) {
    ctx.drawImage(gazou, fitt.x, fitt.y, fitt.w, fitt.h);
  }

  // ★ 斜度モードの点と線
  ctx.fillStyle = '#22c55e';
  for (const p of tensha) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (tensha.length >= 2) {
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tensha[0].x, tensha[0].y);
    ctx.lineTo(tensha[1].x, tensha[1].y);
    ctx.stroke();
    ctx.restore(); // ★ ← restore() に () を追加！
  }

  // ★ 測定モードの点と線
  ctx.fillStyle = '#c56622';
  for (const p of tenna) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (tenna.length >= 2) {
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tenna[0].x, tenna[0].y);
    ctx.lineTo(tenna[1].x, tenna[1].y);
    ctx.stroke();
    ctx.restore(); // ★ ← restore() に () を追加！
  }
}


function kyori(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

const keisoku = document.getElementById('keisoku');
keisoku.addEventListener('click',(e)=>{
 // px(canvas内)/cm
  const far = kyori(tenna[0],tenna[1])/distance;
 tyanto.textContent = "結果：" + far.toFixed(4) + "cm";
})

const risetto = document.getElementById('risetto');
risetto.addEventListener('click',(e)=>{
  tensha.length = 0;
  tenna.length  = 0;
  mode = null;
  kijun = null;
  distance = null;
  step4.classList.add('hidden');
  kijunjityou.innerHTML = '<span class="blue";">未送信</span>';
  wariai.innerHTML = '基準設定：<span class="blue";">未設定</span>';
  tyanto.textContent = '結果：';
  
  drawAll();
});


