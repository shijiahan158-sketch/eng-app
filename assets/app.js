// ===== 移动端菜单 =====
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle) navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

// ===== 主题切换（两页共用，localStorage 跨页记忆） =====
const THEMES = [
  { id:"indigo",  name:"默认",   dots:["#4f46e5","#8b5cf6","#ec4899"] },
  { id:"pebl",    name:"自然",   dots:["#1f6f4f","#0d6568","#c18d7d"] },
  { id:"ocean",   name:"海洋",   dots:["#0284c7","#0ea5e9","#2563eb"] },
  { id:"forest",  name:"森林",   dots:["#15803d","#0d9488","#65a30d"] },
  { id:"sakura",  name:"樱花",   dots:["#db2777","#fb7185","#e879f9"] },
  { id:"sunset",  name:"日落",   dots:["#ea580c","#f43f5e","#f59e0b"] },
  { id:"night",   name:"暗夜",   dots:["#6366f1","#a78bfa","#0e1320"] },
  { id:"midnight",name:"午夜蓝", dots:["#2563eb","#0ea5e9","#0b1424"] },
];
const TKEY = "engapp-theme";
(function initTheme(){
  const btn = document.createElement("button");
  btn.className = "theme-btn"; btn.id = "themeBtn"; btn.title = "切换主题"; btn.textContent = "🎨";
  const navRight = document.querySelector(".nav-right");
  if (navRight) navRight.insertBefore(btn, navRight.querySelector(".btn-login"));
  else { document.body.appendChild(btn); btn.style.cssText = "position:fixed;top:14px;right:14px;z-index:300"; }

  const panel = document.createElement("div");
  panel.className = "theme-panel";
  panel.innerHTML = '<div class="tp-title">🎨 选择主题</div><div class="tp-grid">' +
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

// ===== 备考中心：考试预选 + 倒计时 + 计划勾选 =====
if (document.getElementById("examLabel")) {
  const EXAM_DATES = ["2026-06-13","2026-12-19","2027-06-12","2027-12-18"];
  const MAP = { cet4:"四级", cet6:"六级", ielts:"雅思" };
  const param = new URLSearchParams(location.search).get("exam");
  let level = MAP[param] || "四级";

  // 入口接通:词汇 / 继续背单词 → 背单词页；我的笔记 → 笔记本页
  const code = MAP[param] ? param : "cet4";
  const goList = () => { location.href = "words.html?exam=" + code; };
  const goStudy = () => { location.href = "study.html?exam=" + code; };
  const gv = document.getElementById("goVocab"); if (gv) { gv.style.cursor = "pointer"; gv.addEventListener("click", goList); }
  const cs = document.getElementById("contStudy"); if (cs) cs.addEventListener("click", goStudy);
  const gn = document.getElementById("goNotes"); if (gn) { gn.style.cursor = "pointer"; gn.addEventListener("click", () => { location.href = "notebook.html"; }); }
  const gm = document.getElementById("goMistakes"); if (gm) { gm.style.cursor = "pointer"; gm.addEventListener("click", () => { location.href = "mistakes.html"; }); }
  const gw = document.getElementById("goWords"); if (gw) { gw.style.cursor = "pointer"; gw.addEventListener("click", () => { location.href = "words.html?exam=" + code; }); }

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

  function nextExam(){ const now=new Date(); for(const d of EXAM_DATES){ const t=new Date(d+"T09:00:00"); if(t>now) return {days:Math.ceil((t-now)/86400000),t}; } return {days:0,t:new Date()}; }
  function renderCD(){ const {days,t}=nextExam(); document.getElementById("days").textContent=days; document.getElementById("examLabel").textContent=t.getFullYear()+" 年 "+(t.getMonth()+1)+" 月"+level; }
  renderCD();

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
  if (window.CloudAuth) CloudAuth.onLogin = function () { renderWeek(); if (todo) { const s2 = getPL()[today] || []; [].slice.call(todo.querySelectorAll("li")).forEach((li, i) => { const d = s2.indexOf(i) >= 0; li.classList.toggle("done", d); const b = li.querySelector(".b"); if (b) b.textContent = d ? "✓" : ""; }); } };
  setTimeout(renderWeek, 1200); // 等 syncDown 合并云端打卡后再刷新
}
