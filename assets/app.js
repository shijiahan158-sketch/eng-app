// ===== 移动端菜单 =====
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle) navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

// ===== 主题切换（两页共用，localStorage 跨页记忆） =====
const THEMES = [
  { id:"indigo",  name:"纸墨",   dots:["#31584a","#b3562e","#f5f1e8"] },
  { id:"pebl",    name:"苔径",   dots:["#3e6049","#a9633a","#edf1ea"] },
  { id:"ocean",   name:"远洋",   dots:["#2f5e68","#a55e35","#ebf0ef"] },
  { id:"forest",  name:"松林",   dots:["#3a5c2e","#9c5d2b","#edf2e9"] },
  { id:"sakura",  name:"绯樱",   dots:["#9e4a5a","#3f5d54","#f6eee9"] },
  { id:"sunset",  name:"暮色",   dots:["#a6572b","#31584a","#f7efe2"] },
  { id:"night",   name:"夜读",   dots:["#c9a968","#c77950","#17130c"] },
  { id:"midnight",name:"子夜",   dots:["#7fa3c4","#c99668","#101418"] },
];
const TKEY = "engapp-theme";
(function initTheme(){
  const btn = document.createElement("button");
  btn.className = "theme-btn"; btn.id = "themeBtn"; btn.title = "切换主题"; btn.setAttribute("aria-label", "切换主题");
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';
  const navRight = document.querySelector(".nav-right");
  if (navRight) navRight.insertBefore(btn, navRight.querySelector(".btn-login"));
  else { document.body.appendChild(btn); btn.style.cssText = "position:fixed;top:14px;right:14px;z-index:300"; }

  const panel = document.createElement("div");
  panel.className = "theme-panel";
  panel.innerHTML = '<div class="tp-title">选择主题</div><div class="tp-grid">' +
    THEMES.map(t => '<button class="tp-item" data-id="'+t.id+'"><span class="tp-dots">'+t.dots.map(c=>'<i style="background:'+c+'"></i>').join("")+'</span><span>'+t.name+'</span></button>').join("") +
    '</div>';
  document.body.appendChild(panel);

  const mark = id => panel.querySelectorAll(".tp-item").forEach(it => it.classList.toggle("active", it.dataset.id === id));
  const apply = id => { document.documentElement.setAttribute("data-theme", id); try{localStorage.setItem(TKEY,id);}catch(e){} mark(id); };
  btn.addEventListener("click", e => { e.stopPropagation(); panel.classList.toggle("open"); });
  panel.addEventListener("click", e => { const it = e.target.closest(".tp-item"); if(!it) return; apply(it.dataset.id); panel.classList.remove("open"); });
  document.addEventListener("click", e => { if(!panel.contains(e.target) && e.target !== btn) panel.classList.remove("open"); });

  let cur = "indigo"; try{ cur = localStorage.getItem(TKEY) || "indigo"; }catch(e){}
  document.documentElement.setAttribute("data-theme", cur); mark(cur);
})();

// ===== 全站搜索:跳转到词表页定位单词 =====
(function () {
  const go = q => {
    q = (q || "").trim(); if (!q) return;
    let ex = "ielts"; try { ex = localStorage.getItem("engapp-exam") || "ielts"; } catch (e) {}
    location.href = "words.html?exam=" + ex + "&q=" + encodeURIComponent(q);
  };
  document.querySelectorAll(".nav-search input").forEach(inp => {
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(inp.value); });
  });
  const hs = document.querySelector(".home-search");
  if (hs) {
    const inp = hs.querySelector("input"), btn = hs.querySelector("button");
    const run = () => go(inp && inp.value);
    if (btn) btn.addEventListener("click", run);
    if (inp) inp.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
  }
})();

// ===== 备考中心：考试预选 + 英雄区 + 计划勾选 =====
if (document.getElementById("heroTitle")) {
  const EXAM_DATES = ["2026-06-13","2026-12-19","2027-06-12","2027-12-18"];
  const MAP = { cet4:"四级", cet6:"六级", ielts:"雅思" };
  const param = new URLSearchParams(location.search).get("exam");
  let level = MAP[param] || "四级";

  // 入口接通:词汇 / 继续背单词 → 背单词页；我的笔记 → 笔记本页
  const code = MAP[param] ? param : "cet4";
  try { localStorage.setItem("engapp-exam", code); } catch (e) {}
  const goList = () => { location.href = "words.html?exam=" + code; };
  const goStudy = () => { location.href = "study.html?exam=" + code; };
  const gv = document.getElementById("goVocab"); if (gv) { gv.style.cursor = "pointer"; gv.addEventListener("click", goList); }
  const cs = document.getElementById("contStudy"); if (cs) cs.addEventListener("click", goStudy);
  const qw = document.getElementById("quizWords"); if (qw) qw.addEventListener("click", () => { location.href = "study.html?exam=" + code + "&mode=quiz&range=unknown"; });
  const gn = document.getElementById("goNotes"); if (gn) { gn.style.cursor = "pointer"; gn.addEventListener("click", () => { location.href = "notebook.html"; }); }
  const gm = document.getElementById("goMistakes"); if (gm) { gm.style.cursor = "pointer"; gm.addEventListener("click", () => { location.href = "mistakes.html"; }); }
  const gw = document.getElementById("goWords"); if (gw) { gw.style.cursor = "pointer"; gw.addEventListener("click", () => { location.href = "words.html?exam=" + code + "&f=unknown"; }); }

  // 按题型学习（听力/阅读/写作/翻译）+ 真题实战 → 题库页 tests.html
  const goTest = type => { location.href = "tests.html?type=" + type + "&exam=" + code; };
  [["lis","listening"],["read","reading"],["wri","writing"],["tra","translation"]].forEach(([cls,type]) => {
    const el = document.querySelector(".tcard." + cls);
    if (el) { el.style.cursor = "pointer"; el.addEventListener("click", () => goTest(type)); }
  });
  [["goReal","real"],["goMock","mock"],["goScore","score"]].forEach(([id,type]) => {
    const el = document.getElementById(id);
    if (el) { el.style.cursor = "pointer"; el.addEventListener("click", () => goTest(type)); }
  });

  // 顶部导航高亮当前考试
  document.querySelectorAll('.nav-links a[data-exam]').forEach(a => a.classList.toggle("active", MAP[a.dataset.exam] === level));

  // 考试日期:自定义日期按考试分别记忆;四六级另有官方场次表
  const EDKEY = "engapp-examdate-" + code;
  function customDate(){ try { const v = localStorage.getItem(EDKEY); if (v && new Date(v + "T09:00:00") > new Date()) return v; } catch (e) {} return null; }
  function officialNext(){ const now = new Date(); for (const d of EXAM_DATES) { const t = new Date(d + "T09:00:00"); if (t > now) return t; } return null; }
  const daysTo = t => Math.ceil((t - new Date()) / 86400000);
  const di = document.createElement("input");
  di.type = "date"; di.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;border:0;padding:0";
  document.body.appendChild(di);
  const applyDate = v => { if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) { try { localStorage.setItem(EDKEY, v); } catch (e) {} renderHero(); } };
  di.addEventListener("change", () => applyDate(di.value));
  function pickDate(){
    const cur = customDate() || (function(){ const t = officialNext() || new Date(); return t.getFullYear() + "-" + String(t.getMonth()+1).padStart(2,"0") + "-" + String(t.getDate()).padStart(2,"0"); })();
    di.value = cur;
    try { di.showPicker(); }
    catch (e) { const v = prompt("输入" + level + "考试日期(格式 YYYY-MM-DD)", cur); if (v) applyDate(v.trim()); }
  }

  // ===== KPI 与词汇进度:全部用真实学习数据 =====
  const DECK_FALLBACK = { cet4: 40, cet6: 40, ielts: 3632 };
  function studyStats(){
    let k = 0, u = 0;
    try { const r = JSON.parse(localStorage.getItem("study-" + code + "-results") || "{}");
      for (const w in r) { if (r[w] === "known") k++; else if (r[w] === "unknown") u++; } } catch (e) {}
    return { k, u };
  }
  function deckSize(){ let s = 0; try { s = parseInt(localStorage.getItem("engapp-decksize-" + code), 10) || 0; } catch (e) {} return s || DECK_FALLBACK[code] || 0; }
  function renderKPI(){
    const { k, u } = studyStats(), marked = k + u, size = deckSize();
    const kpis = document.querySelectorAll(".kpi");
    if (kpis[1]) kpis[1].querySelector("b").textContent = marked;                                  // 已背词 = 标记过的词数
    if (kpis[2]) kpis[2].querySelector("b").textContent = marked ? Math.round(k / marked * 100) + "%" : "—";  // 掌握率 = 认识 / 已背
    const vocBar = document.querySelector(".tcard.voc .bar span");
    if (vocBar) vocBar.style.width = (size ? Math.min(100, Math.round(k / size * 100)) : 0) + "%";
    // 听力/阅读/写作/翻译暂无真实练习数据,进度条归零,接入后再点亮
    ["lis","read","wri","tra"].forEach(c => { const b = document.querySelector(".tcard." + c + " .bar span"); if (b) b.style.width = "0%"; });
  }
  renderKPI();

  // ===== 英雄区:问候 + 真实战果 + 词库进度 + 低调考期行 =====
  function renderHero(){
    const h = new Date().getHours();
    const hi = document.getElementById("hi");
    if (hi) hi.textContent = (h < 5 ? "夜深了,注意休息" : h < 11 ? "早上好" : h < 13 ? "中午好" : h < 18 ? "下午好,今天也要加油" : "晚上好") + " · " + level + "备考中";
    const { k, u } = studyStats(), marked = k + u, size = deckSize();
    const title = document.getElementById("heroTitle"), sub = document.getElementById("heroSub");
    if (title) title.innerHTML = marked ? '已拿下 <span class="big">' + k + '</span> 个词' : "从第一个词开始";
    if (sub) sub.textContent = marked
      ? "掌握率 " + Math.round(k / marked * 100) + "% · 生词还剩 " + u + " 个,继续保持"
      : "『" + level + "』词库共 " + (size || "--") + " 词,今天先背 10 个热热身";
    const vp = document.getElementById("vprog");
    if (vp && size) {
      vp.style.display = "flex";
      document.getElementById("vfill").style.width = Math.min(100, Math.round(k / size * 100)) + "%";
      document.getElementById("vtext").textContent = k + " / " + size;
    }
    const el = document.getElementById("examLine");
    if (el) {
      const c = customDate();
      if (c) el.innerHTML = "距你的" + level + "考试还有 <b>" + daysTo(new Date(c + "T09:00:00")) + "</b> 天　<a id=\"editDate\">修改日期</a>";
      else if (code === "ielts") el.innerHTML = "已预约考试?<a id=\"editDate\">设定日期</a>,这里会显示倒计时";
      else { const t = officialNext(); el.innerHTML = t ? ("距 " + t.getFullYear() + " 年 " + (t.getMonth() + 1) + " 月" + level + "考试还有 <b>" + daysTo(t) + "</b> 天　<a id=\"editDate\">修改日期</a>") : ""; }
      const ed = document.getElementById("editDate");
      if (ed) ed.addEventListener("click", pickDate);
    }
  }
  renderHero();

  // ===== 打卡 + 今日计划（持久化 + 云端同步）=====
  const sync = () => { if (window.CloudAuth && CloudAuth.isLoggedIn()) CloudAuth.syncUp(); };
  const pad = n => String(n).padStart(2, "0");
  const dstr = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = dstr(new Date());

  // 访问即打卡
  const CK = "engapp-checkin";
  const getCK = () => { try { return JSON.parse(localStorage.getItem(CK) || "[]"); } catch (e) { return []; } };
  (function () { const a = getCK(); if (a.indexOf(today) < 0) { a.push(today); localStorage.setItem(CK, JSON.stringify(a)); sync(); } })();

  function renderWeek() {
    const wk = document.getElementById("week"); if (!wk) return;
    const ck = getCK(), names = ["一","二","三","四","五","六","日"];
    const now = new Date(), off = (now.getDay() + 6) % 7, mon = new Date(now); mon.setDate(now.getDate() - off);
    let html = "";
    for (let i = 0; i < 7; i++) { const x = new Date(mon); x.setDate(mon.getDate() + i); const ds = dstr(x); const done = ck.indexOf(ds) >= 0, isT = ds === today;
      html += '<div class="day ' + (done ? "done " : "") + (isT ? "today" : "") + '"><span>' + names[i] + '</span><div class="d">' + (done ? "✓" : (isT ? "今" : "")) + "</div></div>"; }
    wk.innerHTML = html;
    let s = 0, d = new Date(); while (ck.indexOf(dstr(d)) >= 0) { s++; d.setDate(d.getDate() - 1); }
    const sb = document.getElementById("streakBadge"); if (sb) sb.textContent = "连续 " + s + " 天";
    const k = document.querySelector(".kpi b"); if (k) k.textContent = s;
  }
  renderWeek();

  // 今日计划：勾选状态按天持久化
  const PL = "engapp-plan";
  const getPL = () => { try { return JSON.parse(localStorage.getItem(PL) || "{}"); } catch (e) { return {}; } };
  const todo = document.getElementById("todo");
  if (todo) {
    const lis = [].slice.call(todo.querySelectorAll("li"));
    const saved = getPL()[today];
    if (saved) lis.forEach((li, i) => { const d = saved.indexOf(i) >= 0; li.classList.toggle("done", d); const b = li.querySelector(".b"); if (b) b.textContent = d ? "✓" : ""; });
    todo.addEventListener("click", e => {
      const li = e.target.closest("li"); if (!li) return;
      li.classList.toggle("done"); const b = li.querySelector(".b"); if (b) b.textContent = li.classList.contains("done") ? "✓" : "";
      const done = []; lis.forEach((l, i) => { if (l.classList.contains("done")) done.push(i); });
      const p = getPL(); p[today] = done; localStorage.setItem(PL, JSON.stringify(p)); sync();
    });
  }

  // 登录后云端数据合并到本地 → 重新渲染打卡/计划
  if (window.CloudAuth) CloudAuth.onLogin = function () { renderWeek(); renderKPI(); renderHero(); if (todo) { const s2 = getPL()[today] || []; [].slice.call(todo.querySelectorAll("li")).forEach((li, i) => { const d = s2.indexOf(i) >= 0; li.classList.toggle("done", d); const b = li.querySelector(".b"); if (b) b.textContent = d ? "✓" : ""; }); } };
  setTimeout(function(){ renderWeek(); renderKPI(); renderHero(); }, 1200); // 等 syncDown 合并云端数据后再刷新
}
