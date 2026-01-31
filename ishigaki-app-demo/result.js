// 画面ロード時
document.addEventListener("DOMContentLoaded", async () => {
  // 基礎点項目
  kihonjohoTable("kihonArea", "kihonjoho");

  // 基礎点項目
  yobishindanTable("kisotenArea", "kisotenkomoku");

  // 変状点項目
  yobishindanTable("henjotenArea", "henjotenkomoku");

  // 判定
  hanteiTable("hanteiArea", "hantei");

  // 日本語フォント読み込み
  try {
    await loadJapaneseFontDataOnce();
  } catch (e) {
    console.error(e);
    // 必要ならUIに表示（任意）
    // alert("日本語フォントの事前読み込みに失敗しました。");
  }
});

// 予備診断結果のテーブル表示
function yobishindanTable(tableArea, sessionStrageKey) {
  const area = document.getElementById(tableArea);

  // SessionStorageから取得（キー名は必要に応じて変更）
  const raw = sessionStorage.getItem(sessionStrageKey);

  if (!raw) {
    area.textContent = `SessionStorage に「${sessionStrageKey}」が見つかりません。`;
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    area.textContent = "SessionStorage のJSONが壊れています。";
    return;
  }

  const itemObj = data.items ?? "";
  const totalPoint = data["合計"] ?? "";

  // テーブル生成
  const table = document.createElement("table");
  table.className = "resultTable";

  // ヘッダ（「診断項目」は2列結合）
  table.appendChild(makeTr([
    makeTh("診断項目", { colSpan: 2, className: "head" }),
    makeTh("評点", { className: "head point" }),
    makeTh("特記事項", { className: "head note" }),
  ]));

  Object.entries(itemObj).forEach(([label, value]) => {
    // valueが配列 → 親行 + 子行群
    if (Array.isArray(value)) {
      // 親（カテゴリ）行：labelだけ出して、他は空
      table.appendChild(makeTr([
        makeTd(label, { colSpan: 4, className: "label category" }),
      ]));

      // 子要素（[{ "ア 石垣タイプ": {...}}, {...}]）を展開
      value.forEach((childObj) => {
        const [childLabel, childVal] = Object.entries(childObj)[0] ?? ["", {}];
        table.appendChild(makeTr([
          makeTd(childLabel, { className: "label sub" }),
          makeTd(childVal?.text ?? "", { className: "text" }),
          makeTd(childVal?.point ?? "", { className: "point" }),
          makeTd(childVal?.note ?? "", { className: "note" }),
        ]));
      });

    // valueがオブジェクト → そのまま1行
    } else if (value && typeof value === "object") {
      table.appendChild(makeTr([
        makeTd(label, { className: "label single" }),
        makeTd(value.text ?? "", { className: "text" }),
        makeTd(value.point ?? "", { className: "point" }),
        makeTd(value.note ?? "", { className: "note" }),
      ]));

    // 想定外（文字列など）も一応表示
    } else {
      table.appendChild(makeTr([
        makeTd(label, { className: "label" }),
        makeTd(String(value ?? ""), { className: "text" }),
        makeTd("", { className: "point" }),
        makeTd("", { className: "note" }),
      ]));
    }
  });

  // 合計行（pointはSessionStorageの値をそのまま表示：計算しない）
  table.appendChild(makeTr([
    makeTd("合計", { colSpan: 2, className: "totalLabel" }),
    makeTd(totalPoint, { className: "totalPoint" }),
    makeTd("", { className: "totalNote" }),
  ]));

  area.innerHTML = "";
  area.appendChild(table);
}

function hanteiTable(tableArea, sessionStrageKey) {
    const area = document.getElementById(tableArea);

    // SessionStorageから取得（キー名は必要に応じて変更）
    const data = sessionStorage.getItem(sessionStrageKey);

    if (!data) {
        area.textContent = `SessionStorage に「${sessionStrageKey}」が見つかりません。`;
        return;
    }

    // テーブル生成
    const table = document.createElement("table");
    table.className = "resultTable";

    // ヘッダ（「診断項目」は2列結合）
    table.appendChild(makeTr([
        makeTd(data, { className: "label" })
    ]));

    area.innerHTML = "";
    area.appendChild(table);
}

function makeTr(cells) {
  const tr = document.createElement("tr");
  cells.forEach(c => tr.appendChild(c));
  return tr;
}

function makeTh(text, opts = {}) {
  const th = document.createElement("th");
  th.textContent = text;
  applyOpts(th, opts);
  return th;
}

function makeTd(text, opts = {}) {
  const td = document.createElement("td");
  td.textContent = text;
  applyOpts(td, opts);
  return td;
}

function applyOpts(el, opts) {
  if (opts.className) el.className = opts.className;
  if (opts.colSpan) el.colSpan = opts.colSpan;
}

function kihonjohoTable(tableArea, sessionStrageKey) {
  const area = document.getElementById(tableArea);

  // SessionStorageから取得（キー名は必要に応じて変更）
  const raw = sessionStorage.getItem(sessionStrageKey);

  if (!raw) {
    area.textContent = `SessionStorage に「${sessionStrageKey}」が見つかりません。`;
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    area.textContent = "SessionStorage のJSONが壊れています。";
    return;
  }

  // テーブル生成
  const table = document.createElement("table");
  table.className = "resultTable";

  Object.entries(data).forEach(([label, value]) => {
    // valueが配列 → 親行 + 子行群
    if (Array.isArray(value)) {
      // 親（カテゴリ）行：labelだけ出して、他は空
      table.appendChild(makeTr([
        makeTd(label, { colSpan: 4, className: "label category" }),
      ]));

      // 子要素（[{ "ア 石垣タイプ": {...}}, {...}]）を展開
      value.forEach((childObj) => {
        const [childLabel, childVal] = Object.entries(childObj)[0] ?? ["", {}];
        table.appendChild(makeTr([
          makeTd("- " + childLabel, { className: "label sub" }),
          makeTd(childVal?.text ?? "", { className: "text" }),
        ]));
      });

    // valueがオブジェクト → そのまま1行
    } else if (value && typeof value === "object") {
      table.appendChild(makeTr([
        makeTd(label, { className: "label single" }),
        makeTd(value.text ?? "", { className: "text" }),
      ]));

    // 想定外（文字列など）も一応表示
    } else {
      table.appendChild(makeTr([
        makeTd(label, { className: "label" }),
        makeTd(String(value ?? ""), { className: "text" }),
      ]));
    }
  });

  area.innerHTML = "";
  area.appendChild(table);
}

// pdfをダウンロードしようとしたのですがうまくできなかったので教えてほしいです。一応できはします。
// pdfでダウンロードできるようにする

/// html2canvasを使った画像ベースのPDF出力処理はいったんコメント化しておく
/*
const thepdf = document.getElementById('thepdf');
thepdf.addEventListener("click", async () => {
    
  const pdfarea = document.getElementById("pdfarea");
  pdfarea.classList.add("pdf-export");

  const canvas = await html2canvas(pdfarea, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  pdfarea.classList.remove("pdf-export");

  const imgData = canvas.toDataURL("image/png");


  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();      // A4の横幅(mm)
  const pageHeight = pdf.internal.pageSize.getHeight();   // A4の高さ(mm)

  // 画像をPDF幅に合わせたときの画像の高さ(mm)
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // 1ページ目
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
  heightLeft -= pageHeight;

  // 2ページ目以降
  while (heightLeft > 0) {
    position -= pageHeight;   
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("ishigaki_capture.pdf");
});
*/

const downloading = document.getElementById("downloading");
const thepdf = document.getElementById("thepdf");

thepdf.addEventListener("click", async () => {
  // 表示ON + ボタン非活性
  downloading.classList.remove("hide");
  thepdf.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    // 日本語フォント（既存の関数を使用）
    await ensureJapaneseFont(pdf);
    pdf.setFont("NotoSansJP", "normal");

    // 汎用：SessionStorageを読む
    const readJSON = (key, fallback = null) => {
      const raw = sessionStorage.getItem(key);
      if (!raw) return fallback;
      try { return JSON.parse(raw); } catch { return fallback; }
    };

    // 汎用：オブジェクト/配列を表示用文字列へ
    const toDisplayValue = (v) => {
      if (v == null) return "";
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);

      // 配列：[{ "地盤": {text:"..."} }, { "造成": {text:"..."} }] 形式を展開して連結
      if (Array.isArray(v)) {
        const parts = v.map((item) => {
          // 典型：1キーオブジェクト
          if (item && typeof item === "object" && !Array.isArray(item)) {
            const entries = Object.entries(item);
            if (entries.length === 1) {
              const [k, val] = entries[0];
              const text =
                val && typeof val === "object" && "text" in val ? (val.text ?? "") : String(val ?? "");
              // 表示形式はお好みで： "地盤：〜" にする
              return `${k}：${text}`;
            }
            // 複数キーなら key:text を全部つなぐ
            return entries
              .map(([k, val]) => {
                const text = val && typeof val === "object" && "text" in val ? (val.text ?? "") : String(val ?? "");
                return `${k}：${text}`;
              })
              .join(" / ");
          }
          // 想定外（文字列など）
          return String(item ?? "");
        });

        // 連結記号（"、" でも "\n" でもOK）
        return parts.join("、");
      }

      // {text:"..."} 形式
      if (typeof v === "object") {
        if ("text" in v) return String(v.text ?? "");
        return JSON.stringify(v);
      }

      return String(v);
    };

    // 余白と開始位置
    let cursorY = 14;

    // タイトル
    pdf.setFontSize(16);
    pdf.setFont("NotoSansJP", "bold");
    pdf.text("石垣予備診断結果", 14, cursorY);
    cursorY += 6;

    // ===== ＜基本情報＞（2列で、親は結合行） =====
    pdf.setFontSize(12);
    pdf.setFont("NotoSansJP", "bold");
    cursorY += 6;
    pdf.text("＜基本情報＞", 14, cursorY);
    cursorY += 2;

    const kihon = readJSON("kihonjoho", {});

    // 2列のbodyを作る
    const kihonBody = [];

    for (const [k, v] of Object.entries(kihon)) {
      // 親（配列）: 見出し行（2列結合） + 子行（2列）
      if (Array.isArray(v)) {
        // 親見出し（2列結合）
        kihonBody.push([{ content: k, colSpan: 2, styles: { fontStyle: "bold" } }]);

        // 子行
        v.forEach((item) => {
          const entries = item && typeof item === "object" ? Object.entries(item) : [];
          if (entries.length === 1) {
            const [subKey, subVal] = entries[0];
            const text =
              subVal && typeof subVal === "object" && "text" in subVal
                ? String(subVal.text ?? "")
                : String(subVal ?? "");
            kihonBody.push([subKey, text]);
          } else {
            kihonBody.push(["", toDisplayValue(item)]);
          }
        });
        continue;
      }

      // 通常項目（親子じゃない）
      kihonBody.push([k, toDisplayValue(v)]);
    }

    const MARGIN_X = 14;
    const pageW = pdf.internal.pageSize.getWidth();
    const usableW = pageW - MARGIN_X * 2;

    // 左列は固定、右列は残りを使う（誤差対策で 0.8mm 引く）
    const w0 = 55;
    const w1 = Math.max(60, usableW - w0);

    pdf.autoTable({
      startY: cursorY,
      body: kihonBody,
      margin: { left: MARGIN_X, right: MARGIN_X }, // ★追加
      tableWidth: "auto",                          // ★追加（安定）
      styles: { font: "NotoSansJP", fontSize: 10, cellPadding: 2, overflow: "linebreak" },

      columnStyles: {
        0: { cellWidth: w0 },
        1: { cellWidth: w1, overflow: "linebreak" },
      },
      
      didParseCell: (data) => {
        // 親見出し行（colSpan=2）
        if (data.cell.raw && data.cell.raw.colSpan === 2) {
          data.cell.styles.fillColor = [235, 235, 235];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.cellPadding = 3;
          return;
        }

        // 子項目：直前が「親見出し」だった行以降を判定できないので、
        // 今回は「左列の文字が短い＝子項目」で寄せるのが簡単です。
        // ★確実にするなら、下の方法2がおすすめです

        // 子行っぽい時だけ、左列をインデント
        if (data.column.index === 0) {
          const row = data.row.raw; // [項目, 内容]
          if (Array.isArray(row) && row.length === 2) {
            const label = row[0] ?? "";

            // 親見出し（構造規模/積み方/石材）ではない、かつ値がある = 子扱い
            // ここは条件を少しゆるめています
            if (label && label !== "石垣番号" && label !== "地区名" && label !== "石垣面位置"
                && label !== "石垣タイプ" && label !== "年代" && label !== "被災の履歴" && label !== "改修の履歴") {
              // ★2文字分くらい（mm）は環境によるが、6mm前後が目安
              data.cell.styles.cellPadding = { top: 2, right: 2, bottom: 2, left: 8 };
            }
          }
        }
      }
    });

    cursorY = pdf.lastAutoTable.finalY + 8;


    // ===== 予備診断（表） =====
    const buildDiagnosisRows = (data) => {
      const rows = [];
      const items = data?.items ?? {};
      for (const [category, value] of Object.entries(items)) {
        // カテゴリ見出し行（1行まるごと）
        rows.push([{ content: category, colSpan: 4, styles: { fontStyle: "bold" } }]);

        if (Array.isArray(value)) {
          // 子要素が複数
          value.forEach(obj => {
            const [label, detail] = Object.entries(obj)[0] ?? ["", {}];
            rows.push([
              label,
              detail?.text ?? "",
              String(detail?.point ?? ""),
              detail?.note ?? ""
            ]);
          });
        } else if (value && typeof value === "object") {
          // 単体
          rows.push([
            category,               // 同じでもOK（気になるなら空文字にしてもOK）
            value?.text ?? "",
            String(value?.point ?? ""),
            value?.note ?? ""
          ]);
        }
      }
      return rows;
    };

    const renderDiagnosisTable = (title, key) => {
      const MARGIN_X = 14; // 左右マージン(mm)
      const pageW = pdf.internal.pageSize.getWidth();
      const usableW = pageW - MARGIN_X * 2;

      // 固定したい列幅
      const w0 = 45; // 診断項目
      const w2 = 15; // 評点
      const w3 = 25; // 特記事項

      // 残りを内容列に回す（★これで必ず収まる）
      const w1 = Math.max(60, usableW - (w0 + w2 + w3));

      const data = readJSON(key, null);

      pdf.setFontSize(12);
      pdf.setFont("NotoSansJP", "bold");
      pdf.text(title, 14, cursorY);
      cursorY += 2;

      const body = data ? buildDiagnosisRows(data) : [[{ content: `SessionStorageに「${key}」がありません`, colSpan: 4 }]];

      pdf.autoTable({
        startY: cursorY,
        head: [["診断項目", "内容", "評点", "特記事項"]],
        body,
        margin: { left: MARGIN_X, right: MARGIN_X },   // ★追加
        tableWidth: "auto",                             // ★wrapよりautoが安定しやすい
        styles: { font: "NotoSansJP", fontSize: 10, cellPadding: 2, overflow: "linebreak" },
        headStyles: { font: "NotoSansJP", fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: w0 },
          1: { cellWidth: w1, overflow: "linebreak" }, // ★自動計算
          2: { cellWidth: w2, halign: "center" },
          3: { cellWidth: w3, overflow: "linebreak" }
        },
        didParseCell: (hookData) => {
          if (hookData.cell.raw && hookData.cell.raw.colSpan === 4) {
            hookData.cell.styles.fillColor = [235, 235, 235];
          }
        }
      });

      // 合計（あれば）※評点列(3列目)に表示して横位置を揃える
      if (data && ("合計" in data)) {
        const total = data["合計"];

        pdf.autoTable({
          startY: pdf.lastAutoTable.finalY,
          body: [[
            { content: "合計", colSpan: 2, styles: { fontStyle: "bold" } },
            { content: String(total), styles: { halign: "center", fontStyle: "bold" } },
            { content: "" },
          ]],
          margin: { left: MARGIN_X, right: MARGIN_X },   // ★追加
          tableWidth: "auto",                             // ★追加
          styles: { font: "NotoSansJP", fontSize: 10, cellPadding: 2, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: w0 },
            1: { cellWidth: w1 },
            2: { cellWidth: w2, halign: "center" },
            3: { cellWidth: w3 }
          },
          tableLineWidth: 0.1,
        });
      }

      cursorY = pdf.lastAutoTable.finalY + 8;
    };

    pdf.addPage();
    cursorY = 14;

    // ===== ＜予備診断＞ 見出し =====
    pdf.setFontSize(14);
    pdf.setFont("NotoSansJP", "bold");
    pdf.text("＜予備診断＞", 14, cursorY);
    cursorY += 6;

    renderDiagnosisTable("1．基礎点項目", "kisotenkomoku");
    cursorY += 6;
    renderDiagnosisTable("2．変状点項目", "henjotenkomoku");
    cursorY += 6;

    // ===== 判定 =====
    pdf.setFontSize(12);
    pdf.setFont("NotoSansJP", "bold");
    pdf.text("3．判定", 14, cursorY);
    cursorY += 6;

    pdf.setFontSize(11);
    pdf.setFont("NotoSansJP", "normal");
    const hantei = sessionStorage.getItem("hantei") ?? "";
    const lines = pdf.splitTextToSize(hantei, 180);
    pdf.text(lines, 14, cursorY);

    // ===== ファイル名を「石垣予備診断結果_{a}_{b}.pdf」にする =====
    const kihonForName = readJSON("kihonjoho", {});

    // a=石垣番号, b=地区名（どちらも {text:"..."} の形式）
    const a = (kihonForName?.["石垣番号"]?.text ?? "").trim();
    const b = (kihonForName?.["地区名"]?.text ?? "").trim();

    // ファイル名に使えない文字を除去（Windows対策）
    const safe = (s) =>
      s.replace(/[\\\/:\*\?"<>\|]/g, "").replace(/\s+/g, " ").trim();

    const fileName =
      `石垣予備診断結果_${safe(a || "未入力")}_${safe(b || "未入力")}.pdf`;

    pdf.save(fileName);

  } catch (err) {
    console.error(err);
    alert("PDFの作成に失敗しました。もう一度お試しください。");
  } finally {
    // 表示OFF + ボタン復帰（成功/失敗どちらでも必ず実行）
    downloading.classList.add("hide");
    thepdf.disabled = false;
  }
});

// ===== 日本語フォントを jsPDF に登録する =====

// フォントデータ（Base64）は一度だけ読み込んでキャッシュ
let jpFontDataPromise = null;

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function loadJapaneseFontDataOnce() {
  if (jpFontDataPromise) return jpFontDataPromise;

  jpFontDataPromise = (async () => {
    const [regRes, boldRes] = await Promise.all([
      fetch("./fonts/NotoSansJP-Regular.ttf"),
      fetch("./fonts/NotoSansJP-Bold.ttf"),
    ]);
    if (!regRes.ok || !boldRes.ok) {
      throw new Error("日本語フォントの読み込みに失敗しました。");
    }

    const [regBuf, boldBuf] = await Promise.all([
      regRes.arrayBuffer(),
      boldRes.arrayBuffer(),
    ]);

    return {
      regBase64: arrayBufferToBase64(regBuf),
      boldBase64: arrayBufferToBase64(boldBuf),
    };
  })();

  return jpFontDataPromise;
}

// 「この pdf インスタンスに」フォントが登録されているか確認して、なければ登録
function isFontRegistered(pdf, fontName, fontStyle) {
  const list = pdf.getFontList?.() || {};
  return !!(list[fontName] && list[fontName].includes(fontStyle));
}

async function ensureJapaneseFont(pdf) {
  const { regBase64, boldBase64 } = await loadJapaneseFontDataOnce();

  // normal
  if (!isFontRegistered(pdf, "NotoSansJP", "normal")) {
    pdf.addFileToVFS("NotoSansJP-Regular.ttf", regBase64);
    pdf.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal", "Identity-H");
  }

  // bold
  if (!isFontRegistered(pdf, "NotoSansJP", "bold")) {
    pdf.addFileToVFS("NotoSansJP-Bold.ttf", boldBase64);
    pdf.addFont("NotoSansJP-Bold.ttf", "NotoSansJP", "bold", "Identity-H");
  }
}
