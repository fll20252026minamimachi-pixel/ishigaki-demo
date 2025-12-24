const tukaikata = document.getElementById('tukaikata-tensu');
const setumei = document.getElementById('tukaikata-tensu-text');

tukaikata.addEventListener('click', () => {
  // ボタンクリックでhiddenクラスを付け外しする
  setumei.classList.toggle('hidden');
});
const shasin  = document.getElementById('tensu-shasin');
const canvas  = document.getElementById('preview');      // ← canvas を取得
const ctx     = canvas.getContext('2d');


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

}
const sindan = document.getElementById('sindan');
sindan.addEventListener('click', (e) => {
   
})