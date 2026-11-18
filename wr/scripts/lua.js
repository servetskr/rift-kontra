/* Wiki'deki Lua veri modüllerini (return { ... }) JavaScript nesnesine çeviren küçük ayrıştırıcı. */
"use strict";
function parseLua(src) {
  let i = src.indexOf("return");
  if (i < 0) throw new Error("Lua: return bulunamadı");
  i += 6;
  const ws = () => {
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src.startsWith("--[[", i)) { const e = src.indexOf("]]", i); i = e < 0 ? src.length : e + 2; continue; }
      if (src.startsWith("--", i)) { const e = src.indexOf("\n", i); i = e < 0 ? src.length : e + 1; continue; }
      break;
    }
  };
  const str = () => {
    const q = src[i++]; let out = "";
    while (i < src.length && src[i] !== q) {
      if (src[i] === "\\") { const n = src[i + 1]; out += n === "n" ? "\n" : n === "t" ? "\t" : n; i += 2; }
      else out += src[i++];
    }
    i++; return out;
  };
  const longStr = () => { const m = src.slice(i).match(/^\[(=*)\[/); const close = "]" + m[1] + "]"; const s = i + m[0].length; const e = src.indexOf(close, s); i = e + close.length; return src.slice(s, e); };
  function value() {
    ws();
    const c = src[i];
    if (c === "{") return table();
    if (c === '"' || c === "'") return str();
    if (c === "[" && /^\[=*\[/.test(src.slice(i, i + 10))) return longStr();
    const m = src.slice(i).match(/^(-?(?:0x[0-9a-f]+|\d*\.?\d+(?:e[+-]?\d+)?)|true|false|nil)/i);
    if (!m) throw new Error("Lua: beklenmeyen karakter '" + src.slice(i, i + 20) + "'");
    i += m[0].length;
    if (m[0] === "true") return true; if (m[0] === "false") return false; if (m[0] === "nil") return null;
    return Number(m[0]);
  }
  function table() {
    i++; const obj = {}; const arr = []; let isArr = true;
    for (;;) {
      ws();
      if (src[i] === "}") { i++; break; }
      let key = null;
      if (src[i] === "[" && !/^\[=*\[/.test(src.slice(i, i + 10))) {
        i++; key = value(); ws(); i++; /* ] */ ws(); i++; /* = */
      } else {
        const m = src.slice(i).match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/);
        if (m) { key = m[1]; i += m[0].length; }
      }
      const v = value();
      if (key === null) arr.push(v); else { obj[key] = v; if (typeof key !== "number") isArr = false; }
      ws(); if (src[i] === "," || src[i] === ";") i++;
    }
    if (isArr && !Object.keys(obj).length) return arr;
    if (isArr && Object.keys(obj).every(k => /^\d+$/.test(k))) return Object.keys(obj).sort((a, b) => a - b).map(k => obj[k]).concat(arr);
    arr.forEach((v, k) => obj[k + 1] = v);
    return obj;
  }
  return value();
}
module.exports = { parseLua };
