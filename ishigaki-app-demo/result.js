// 画面ロード時
document.addEventListener("DOMContentLoaded", () => {
    // 基礎点項目
    kihonjohoTable("kihonArea", "kihonjoho");

    // 基礎点項目
    yobishindanTable("kisotenArea", "kisotenkomoku");

    // 変状点項目
    yobishindanTable("henjotenArea", "henjotenkomoku");

    // 判定
    hanteiTable("hanteiArea", "hantei");
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
          makeTd(childLabel, { className: "label sub" }),
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
