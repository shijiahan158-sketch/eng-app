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

  // 顶部导航高亮当前考试
  document.querySelectorAll('.nav-links a[data-exam]').forEach(a => a.classList.toggle("active", MAP[a.dataset.exam] === level));

  function nextExam(){ const now=new Date(); for(const d of EXAM_DATES){ const t=new Date(d+"T09:00:00"); if(t>now) return {days:Math.ceil((t-now)/86400000),t}; } return {days:0,t:new Date()}; }
  function renderCD(){ const {days,t}=nextExam(); document.getElementById("days").textContent=days; document.getElementById("examLabel").textContent=t.getFullYear()+" 年 "+(t.getMonth()+1)+" 月"+level; }
  renderCD();

  const todo = document.getElementById("todo");
  if (todo) todo.addEventListener("click", e => { const li=e.target.closest("li"); if(li){ li.classList.toggle("done"); li.querySelector(".b").textContent = li.classList.contains("done")?"✓":""; } });
}
