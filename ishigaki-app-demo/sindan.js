// 画面ロード時
document.addEventListener("DOMContentLoaded", () => {
    // SessionStrageクリア
    sessionStorage.removeItem("kihonjoho");
    sessionStorage.removeItem("kisotenkomoku");
    sessionStorage.removeItem("henjotenkomoku");
    sessionStorage.removeItem("hantei");
});

// 指定したnameのラジオで「選択されているinput」を取得
function getCheckedRadio(name) {
    return document.querySelector(`input[type="radio"][name="${name}"]:checked`);
}

// input(id)に紐づくlabel(for=id)の表示文字列を取得
function getLabelTextByInputId(inputId) {
    const label = document.querySelector(`label[for="${CSS.escape(inputId)}"]`);
    return label ? label.textContent.trim() : "";
}

// inputから { text, point, note } を作る
function buildAnswer(inputEl) {
    const text = getLabelTextByInputId(inputEl.id);
    const scoreRaw = inputEl.dataset.score ?? "0";
    const point = Number(scoreRaw);
    return { text, point, note: "" };
}

// 診断するボタン押下処理
document.getElementById("sousin").addEventListener("click", () => {
    // 基本情報
    const kihonjoho = kihonjohoData();
    sessionStorage.setItem("kihonjoho", JSON.stringify(kihonjoho));

    // 基礎点項目
    const kisodata = kisotenData();
    sessionStorage.setItem("kisotenkomoku", JSON.stringify(kisodata));

    // 変状点項目
    const henjodata = henjotenData();
    sessionStorage.setItem("henjotenkomoku", JSON.stringify(henjodata));

    // 画面遷移
    if (kisodata && henjodata) {
        // 判定
        const kisopoint = kisodata["合計"];
        const henjopoint = henjodata["合計"];
        const fourkomoku = henjodata["4項目"];
        let hanteidata = "";
        if (kisopoint <= 4) {
            if (henjopoint <= 3) {
                hanteidata = "ア 基礎点項目０～４点かつ変状点項目０～３点";
            } else if ((henjopoint <= 5) && (fourkomoku == "無")) {
                hanteidata = "ウ 基礎点項目０～４点かつ変状点項目合計４～５点、４点（変状顕著）の項目なし";
            } else {
                hanteidata = "オ 基礎点項目０～４点かつ変状点項目合計６点以上もしくは４点（変状顕著）の項目あり";
            }
        } else {
            if (henjopoint <= 3) {
                hanteidata = "イ 基礎点項目５点以上かつ変状点項目０～３点";
            } else if ((henjopoint <= 5) && (fourkomoku == "無")) {
                hanteidata = "エ 基礎点項目５点以上かつ変状点項目４～５点、４点（変状顕著）の項目なし";
            } else {
                hanteidata = "カ 基礎点項目５点以上かつ変状点項目合計６点以上もしくは４点（変状顕著）の項目あり";
            }
        }
        sessionStorage.setItem("hantei", hanteidata);

        // 画面遷移
        window.location.href = "result.html";
    } else {
        alert("未選択の項目があります。すべて選択してください。");
    }
});

// 基礎点項目のJsonデータ取得
function kisotenData() {
    const q1   = getCheckedRadio("kisoten_q1");
    const q2_1 = getCheckedRadio("kisoten_q2_1");
    const q2_2 = getCheckedRadio("kisoten_q2_2");
//    const q3_1 = getCheckedRadio("kisoten_q3_1");
//    const q3_2 = getCheckedRadio("kisoten_q3_2");

    if (!q1 || !q2_1 || !q2_2) {
//    if (!q1 || !q2_1 || !q2_2 || !q3_1 || !q3_2) {
        return;
    }

    // 各回答を生成
    const kisoten_q1   = buildAnswer(q1);
    const kisoten_q2_1 = buildAnswer(q2_1);
    const kisoten_q2_2 = buildAnswer(q2_2);
//    const kisoten_q3_1 = buildAnswer(q3_1);
//    const kisoten_q3_2 = buildAnswer(q3_2);

    // items配列の中身
    const item = {
        "a. 地盤": kisoten_q1,
        "b. 石垣の形状": [
            { "ア 石垣タイプ": kisoten_q2_1 },
            { "イ 石垣の高さ、勾配": kisoten_q2_2 }
        ],
        "c. 過去の履歴": [
            { "ア 被災・修理履歴 ": "" },
            { "イ 修理の方法": "" }
        ]
    };

    // point合計を算出
    const totalPoint =
      kisoten_q1.point +
      kisoten_q2_1.point +
      kisoten_q2_2.point;
//      kisoten_q3_1.point +
//      kisoten_q3_2.point;

    // 最終保存オブジェクト
    return {
        "items": item,
        "合計": totalPoint
    };
}

// 変状点項目のJsonデータ取得
function henjotenData() {
    const q1_1 = getCheckedRadio("henjoten_q1_1");
    const q1_2 = getCheckedRadio("henjoten_q1_2");
    const q1_3 = getCheckedRadio("henjoten_q1_3");
//    const q2_1 = getCheckedRadio("henjoten_q2_1");
//    const q2_2 = getCheckedRadio("henjoten_q2_2");
//    const q3   = getCheckedRadio("henjoten_q3");
//    const q4   = getCheckedRadio("henjoten_q4");

    if (!q1_1 || !q1_2 || !q1_3) {
//    if (!q1_1 || !q1_2 || !q1_3 || !q2_1 || !q2_2 || !q3 || !q4) {
        return;
    }

    // 各回答を生成
    const henjoten_q1_1 = buildAnswer(q1_1);
    const henjoten_q1_2 = buildAnswer(q1_2);
    const henjoten_q1_3 = buildAnswer(q1_3);
//    const henjoten_q2_1 = buildAnswer(q2_1);
//    const henjoten_q2_2 = buildAnswer(q2_2);
//    const henjoten_q3   = buildAnswer(q3);
//    const henjoten_q4   = buildAnswer(q4);
  
    // items配列の中身
    const item = {
        "a. 築石の変状 ": [
            { "ア 緩み、築石の目地の開き": henjoten_q1_1 },
            { "イ 孕み": henjoten_q1_2 },
            { "ウ 割れ、抜け落ち、崩れ": henjoten_q1_3 }
        ],
        "b. 周辺の変状 ": [
            { "ア 天端または栗石部の沈下、地割れ": "" },
            { "イ 基礎部の変状": "" }
        ],
        "c. 変状の進行状況": {},
        "d. 湧水": {}
    };

    // point合計を算出
    const totalPoint =
        henjoten_q1_1.point +
        henjoten_q1_2.point +
        henjoten_q1_3.point;
//        henjoten_q2_1.point +
//        henjoten_q2_1.point +
//        henjoten_q3.point +
//        henjoten_q4.point;

    // 4点項目ありなし
    const values = [
        henjoten_q1_1.point,
        henjoten_q1_2.point,
        henjoten_q1_3.point
//        henjoten_q2_1.point,
//        henjoten_q2_2.point,
//        henjoten_q3.point,
//        henjoten_q4.point
    ];
    const hasFourOrMore = values.some(v => v >= 4);

    // 最終保存オブジェクト
    return {
        "items": item,
        "合計": totalPoint,
        "4点項目": hasFourOrMore ? "有" : "無"
    };
}

function kihonjohoData() {
    return {
        "石垣番号": document.getElementById("ishigakiNo").value,
        "地区名": document.getElementById("chikuName").value,
        "石垣面位置": "",
        "構造規模": [
            { "地盤": "" },
            { "造成": "" },
            { "石垣延長": "" },
            { "石垣高さ": "" },
            { "勾配": "" },
            { "面積": "" },
        ],
        "積み方": [
            { "隅部": "" },
            { "平部": "" },
        ],
        "石材": [
            { "形状": "" },
            { "合端加工": "" },
            { "岩石種": "" },
            { "築石控長": "" },
        ],
        "石垣タイプ": "",
        "年代": "",
        "被災の履歴": "",
        "回収の履歴": "",
    };
}
