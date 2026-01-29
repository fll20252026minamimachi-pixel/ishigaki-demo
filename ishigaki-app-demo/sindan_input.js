/**
 * 数値入力ユーティリティ
 * - 入力中: 数字 / 先頭の- / 小数点(必要なら) だけ許可
 * - blur(フォーカスアウト)時: min/max & 桁数を反映し、カンマ整形して表示
 * - paste対応
 */
function attachNumericInputs(selector = ".num") {
  const inputs = document.querySelectorAll(selector);

  inputs.forEach((el) => {
    // 入力中は整形しすぎない（カーソルが飛ぶのを防ぐ）
    el.addEventListener("input", () => {
      const rule = readRule(el);
      const next = sanitizeForTyping(el.value, rule);
      if (next !== el.value) el.value = next;
    });

    // ペーストは一旦取り込んでsanitize
    el.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      const rule = readRule(el);
      const next = sanitizeForTyping(text, rule);
      el.value = next;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 確定（フォーカスアウト）で clamp + 桁数 + 表示整形
    el.addEventListener("blur", () => {
      const rule = readRule(el);
      const normalized = normalizeToNumberString(el.value, rule); // 例: "-1234.50" or ""
      if (normalized === "") {
        el.value = "";
        return;
      }

      let n = Number(normalized);
      if (!Number.isFinite(n)) {
        el.value = "";
        return;
      }

      // min/max
      if (rule.min != null) n = Math.max(rule.min, n);
      if (rule.max != null) n = Math.min(rule.max, n);

      // 小数桁
      if (rule.allowDecimal) {
        n = roundTo(n, rule.decimals);
      } else {
        n = Math.trunc(n);
      }

      // 桁数（digitsは「整数部」の桁数上限）
      const [intPart] = Math.abs(n).toString().split(".");
      if (rule.digits != null && intPart.length > rule.digits) {
        // digits超えは、超えない最大（例: digits=4 なら 9999）に寄せる
        const cap = Number("9".repeat(rule.digits));
        n = n < 0 ? -cap : cap;
        if (rule.min != null) n = Math.max(rule.min, n);
        if (rule.max != null) n = Math.min(rule.max, n);
      }

      el.value = formatForDisplay(n, rule);
    });

    // 初期値が入っている場合に整形したいなら
    if (el.value.trim() !== "") el.dispatchEvent(new Event("blur"));
  });
}

function readRule(el) {
  const d = el.dataset;
  const allowNegative = d.allowNegative === "true";
  const allowDecimal = d.allowDecimal === "true";
  const digits = d.digits ? Number(d.digits) : null;
  const decimals = d.decimals ? Number(d.decimals) : 0;
  const min = d.min !== undefined && d.min !== "" ? Number(d.min) : null;
  const max = d.max !== undefined && d.max !== "" ? Number(d.max) : null;
  const grouping = d.grouping !== "false"; // default true

  return {
    allowNegative,
    allowDecimal,
    digits,
    decimals: allowDecimal ? Math.max(0, decimals) : 0,
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
    grouping,
  };
}

// 入力中：許可されない文字を除去し、記号の位置/個数を整える
function sanitizeForTyping(raw, rule) {
  let s = String(raw ?? "");

  // 全角 -> 半角（数字と記号）
  s = s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/．/g, ".")
    .replace(/－/g, "-")
    .replace(/，/g, ",");

  // カンマは入力中は消す（表示整形はblurで）
  s = s.replace(/,/g, "");

  // 許可文字だけ残す
  const allowed = rule.allowDecimal ? /[^0-9.\-]/g : /[^0-9\-]/g;
  s = s.replace(allowed, "");

  // マイナス許可でないなら除去
  if (!rule.allowNegative) s = s.replace(/-/g, "");

  // "-" は先頭に1個だけ
  if (rule.allowNegative) {
    const minus = s.startsWith("-") ? "-" : "";
    s = s.replace(/-/g, "");
    s = minus + s;
  }

  // 小数点は1個だけ、許可でないなら除去
  if (!rule.allowDecimal) {
    s = s.replace(/\./g, "");
  } else {
    const firstDot = s.indexOf(".");
    if (firstDot !== -1) {
      // 2個目以降のドットを除去
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
    }
    // 小数部桁数制限（入力中も制限したい場合）
    if (firstDot !== -1 && rule.decimals >= 0) {
      const head = s.slice(0, firstDot + 1);
      const frac = s.slice(firstDot + 1).slice(0, rule.decimals);
      s = head + frac;
    }
  }

  // 整数部の桁数制限（digitsは整数部のみ）
  if (rule.digits != null && rule.digits >= 0) {
    const sign = s.startsWith("-") ? "-" : "";
    const body = sign ? s.slice(1) : s;
    const [intPart, fracPart] = body.split(".");
    const intClamped = intPart.slice(0, rule.digits);
    s =
      sign +
      intClamped +
      (rule.allowDecimal && fracPart != null ? "." + fracPart : (body.includes(".") ? "." : ""));
    // ↑ 入力中に「末尾ドット」も残したいので少し丁寧に
  }

  return s;
}

// Number化しやすい形へ（"-", ".", "-." などは空にする）
function normalizeToNumberString(s, rule) {
  const t = String(s ?? "").replace(/,/g, "").trim();
  if (t === "" || t === "-" || t === "." || t === "-.") return "";
  if (!rule.allowDecimal && t.includes(".")) {
    // 念のため
    return t.split(".")[0];
  }
  return t;
}

function roundTo(n, decimals) {
  const p = 10 ** decimals;
  return Math.round(n * p) / p;
}

function formatForDisplay(n, rule) {
  // Intl.NumberFormatでカンマ付け
  const opts = rule.allowDecimal
    ? { useGrouping: rule.grouping, minimumFractionDigits: 0, maximumFractionDigits: rule.decimals }
    : { useGrouping: rule.grouping, maximumFractionDigits: 0 };

  return new Intl.NumberFormat("ja-JP", opts).format(n);
}

// 使う側：ページ読み込み後に一括適用
document.addEventListener("DOMContentLoaded", () => {
  attachNumericInputs(".num");
});
