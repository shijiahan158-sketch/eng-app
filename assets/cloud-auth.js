/* ============================================================
   EngHub · 账号系统（CloudBase 新版认证 · HTTP API · 无构建）
   邮箱 + 密码注册 / 登录；token 存 localStorage，跨页/跨设备
   ============================================================ */
(function () {
  "use strict";
  var BASE = "https://enghub-d6g6cy0i76d568205.ap-shanghai.tcb-api.tencentcloudapi.com";
  var PKEY = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2VuZ2h1Yi1kNmc2Y3kwaTc2ZDU2ODIwNS5hcC1zaGFuZ2hhaS50Y2ItYXBpLnRlbmNlbnRjbG91ZGFwaS5jb20iLCJzdWIiOiJhbm9uIiwiYXVkIjoiZW5naHViLWQ2ZzZjeTBpNzZkNTY4MjA1IiwiZXhwIjo0MDg1MzcwNDU5LCJpYXQiOjE3ODE2ODcyNTksIm5vbmNlIjoiS2JWdlBzRHBUYjZ5ZHpZM3NzQ3RhQSIsImF0X2hhc2giOiJLYlZ2UHNEcFRiNnlkelkzc3NDdGFBIiwibmFtZSI6IkFub255bW91cyIsInNjb3BlIjoiYW5vbnltb3VzIiwicHJvamVjdF9pZCI6ImVuZ2h1Yi1kNmc2Y3kwaTc2ZDU2ODIwNSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.ZzLNJFIngxvg0G6EBhWUVnQdxYYK09gwCCpJyjH1UbG0k9o0H68dfWK3I8oz1tQVatQHs5HliRbJFCZKsnArvts4jpS60zLpknKbT8aQWxwzzOu-m3C3jKiK-kPG-Royc0lYpfrafjzlC7wp6XjkDXnE04DruI1CNu1C8DVZE7XA4ccoWtYtEBdu5sSpuC_TabHUbKDAqLf6M0VhcBr5L4gg0qiBnfaJ__X4D9jlce7sCEJqPi8yik1zLWZ-yEQ2FAEOpH-glwvWX-0dAyZ1KrkIXlcgLg2is6I884G3krLvgoEFoidsHmjPJLBBc4E7jyPM6rGdYQKvG0BQjrSxyA";
  var TK = "engapp-auth";          // localStorage 里存 token 的键
  var verificationId = null;       // 注册时暂存

  /* ---------- 底层请求 ---------- */
  function call(path, body, bearer) {
    return fetch(BASE + path, {
      method: "POST",
      headers: { "Authorization": "Bearer " + bearer, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || j.error) throw new Error(j.error_description || j.error || ("请求失败 " + r.status));
        return j;
      });
    });
  }
  function authCall(path, body) { return call(path, body, PKEY); }

  /* ---------- session ---------- */
  function decode(jwt) { try { return JSON.parse(atob(jwt.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))); } catch (e) { return {}; } }
  function save(res) {
    var p = decode(res.access_token || "");
    var sess = { access_token: res.access_token, refresh_token: res.refresh_token,
      sub: res.sub || p.sub, email: p.email || "", name: p.name || "", exp: p.exp || 0 };
    localStorage.setItem(TK, JSON.stringify(sess));
    return sess;
  }
  function session() { try { return JSON.parse(localStorage.getItem(TK) || "null"); } catch (e) { return null; } }
  function user() { var s = session(); return s ? { sub: s.sub, email: s.email, name: s.name || s.email } : null; }
  function accessToken() { var s = session(); return s ? s.access_token : null; }

  /* ---------- 认证动作 ---------- */
  function sendCode(email) {
    return authCall("/auth/v1/verification", { email: email }).then(function (r) { verificationId = r.verification_id; return r; });
  }
  function register(code, email, password, username) {
    if (!verificationId) return Promise.reject(new Error("请先获取验证码"));
    return authCall("/auth/v1/verification/verify", { verification_id: verificationId, verification_code: code })
      .then(function (v) {
        var body = { email: email, password: password, verification_token: v.verification_token };
        if (username) body.username = username;
        return authCall("/auth/v1/signup", body);
      })
      .then(function (res) { var s = save(res); if (username) { s.name = username; localStorage.setItem(TK, JSON.stringify(s)); } return s; });
  }
  function login(username, password) {
    return authCall("/auth/v1/signin", { username: username, password: password }).then(function (res) { return save(res); });
  }
  function logout() { localStorage.removeItem(TK); }

  /* ============================================================
     云端数据同步（users_data，每个用户一份文档 _id=用户id）
     ============================================================ */
  var ENVID = "enghub-d6g6cy0i76d568205";
  var EXAMS = ["cet4", "cet6", "ielts"];
  // 用 refresh_token 换新 access_token（access_token 2 小时过期，续期后用户无感）
  function refresh() {
    var s = session(); if (!s || !s.refresh_token || !s.access_token) return Promise.reject(new Error("no refresh"));
    var prevName = s.name, prevRT = s.refresh_token;
    return fetch(BASE + "/auth/v1/token", {
      method: "POST", headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: s.refresh_token })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.error || !j.access_token) throw new Error(j.error_description || "续期失败");
      var ns = save(j);                                   // 用新 token 更新会话
      if (!ns.name && prevName) ns.name = prevName;        // 续期 token 可能不带自定义用户名 → 保留原来的
      if (!j.refresh_token) ns.refresh_token = prevRT;     // 没返回新 refresh_token 就沿用旧的
      localStorage.setItem(TK, JSON.stringify(ns));
      return ns;
    });
  }
  // 调用云端前确保 access_token 有效（剩余 <60s 就先续期）
  function ensureToken() {
    var s = session(); if (!s) return Promise.resolve();
    if (s.exp && (s.exp * 1000 - Date.now() > 60000)) return Promise.resolve();
    return refresh().catch(function () {});
  }
  function dbCall(action, params) {
    return ensureToken().then(function () {
      var at = accessToken(); if (!at) return Promise.reject(new Error("未登录"));
      var body = Object.assign({ action: action, dataVersion: "2020-01-10", env: ENVID, access_token: at, collectionName: "users_data" }, params);
      return fetch(BASE + "/web", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); }).then(function (j) { if (j.code) throw new Error(j.message || j.code); return j.data; });
    });
  }
  function loadData() { return dbCall("database.queryDocument", { query: {}, queryType: "DOC" }).then(function (d) { return (d && d.list && d.list[0]) || null; }); }
  function saveData(obj) { var u = user(); if (!u) return Promise.reject(new Error("未登录")); return dbCall("database.updateDocument", { query: { _id: u.sub }, data: obj, queryType: "DOC", multi: false, merge: true, upsert: true }); }
  function readJSON(k, def) { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch (e) { return def; } }
  function gather() {
    var s = session() || {}, study = {};
    EXAMS.forEach(function (ex) { study[ex] = readJSON("study-" + ex + "-results", {}); });
    return {
      _id: s.sub, name: s.name || "", study: study,
      notes: readJSON("engapp-notes", []),       // 笔记
      mistakes: readJSON("engapp-mistakes", []),  // 错题本
      quiz: readJSON("engapp-quiz", {}),          // 做题记录
      checkin: readJSON("engapp-checkin", []),    // 打卡
      plan: readJSON("engapp-plan", {}),          // 今日计划
      updatedAt: Date.now()
    };
  }
  function mergeById(cloudArr, localArr) {   // 按 id 合并去重（数组类，如笔记/错题）
    var map = {};
    (cloudArr || []).concat(localArr || []).forEach(function (x) { if (x && x.id != null) map[x.id] = x; }); // 本地覆盖同 id
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }
  function applyData(doc) {
    if (!doc) return;
    if (doc.name) { var s = session(); if (s) { s.name = doc.name; localStorage.setItem(TK, JSON.stringify(s)); } }
    if (doc.study) EXAMS.forEach(function (ex) {
      localStorage.setItem("study-" + ex + "-results", JSON.stringify(Object.assign({}, doc.study[ex] || {}, readJSON("study-" + ex + "-results", {})))); // 对象合并，本地优先
    });
    if (doc.notes) localStorage.setItem("engapp-notes", JSON.stringify(mergeById(doc.notes, readJSON("engapp-notes", []))));
    if (doc.mistakes) localStorage.setItem("engapp-mistakes", JSON.stringify(mergeById(doc.mistakes, readJSON("engapp-mistakes", []))));
    if (doc.quiz) localStorage.setItem("engapp-quiz", JSON.stringify(Object.assign({}, doc.quiz, readJSON("engapp-quiz", {}))));
    if (doc.checkin) { var set = {}; doc.checkin.concat(readJSON("engapp-checkin", [])).forEach(function (x) { set[x] = 1; }); localStorage.setItem("engapp-checkin", JSON.stringify(Object.keys(set).sort())); }
    if (doc.plan) localStorage.setItem("engapp-plan", JSON.stringify(Object.assign({}, doc.plan, readJSON("engapp-plan", {}))));
  }
  var syncing = false;
  function syncDown() { if (!user()) return Promise.resolve(); return loadData().then(function (d) { applyData(d); renderNav(); }).catch(function () {}); }
  function syncUp() { if (!user() || syncing) return Promise.resolve(); syncing = true; return saveData(gather()).catch(function () {}).then(function () { syncing = false; }); }

  /* ============================================================
     UI：登录/注册弹窗 + 顶部按钮
     ============================================================ */
  function injectStyle() {
    if (document.getElementById("authStyle")) return;
    var s = document.createElement("style"); s.id = "authStyle";
    s.textContent =
      ".auth-mask{position:fixed;inset:0;z-index:1000;background:rgba(20,20,50,.5);display:none;align-items:center;justify-content:center}" +
      ".auth-mask.open{display:flex}" +
      ".auth-box{background:var(--card,#fff);color:var(--ink,#1b2236);width:92%;max-width:380px;border-radius:18px;padding:26px;box-shadow:0 18px 50px rgba(0,0,0,.3)}" +
      ".auth-box h3{font-size:1.3rem;font-weight:800;margin-bottom:4px}" +
      ".auth-box .sub{color:var(--dim,#6b7488);font-size:.88rem;margin-bottom:18px}" +
      ".auth-tabs{display:flex;gap:6px;margin-bottom:16px}" +
      ".auth-tabs button{flex:1;padding:9px;border:0;border-radius:10px;background:var(--bg,#f3f5fb);color:var(--dim,#6b7488);font-weight:700;cursor:pointer}" +
      ".auth-tabs button.on{background:linear-gradient(135deg,var(--brand,#4f46e5),var(--brand2,#7c3aed));color:#fff}" +
      ".auth-box label{display:block;font-size:.82rem;font-weight:700;color:var(--dim,#6b7488);margin:12px 0 5px}" +
      ".auth-box input{width:100%;padding:11px 13px;border:1px solid var(--line,#e7eaf3);border-radius:11px;background:var(--bg,#f8fafc);color:var(--ink,#1b2236);font-size:.95rem}" +
      ".auth-box input:focus{outline:none;border-color:var(--brand,#4f46e5)}" +
      ".auth-row{display:flex;gap:8px}.auth-row input{flex:1}" +
      ".auth-code{white-space:nowrap;padding:0 14px;border:0;border-radius:11px;background:var(--bg,#eef);color:var(--brand,#4f46e5);font-weight:700;cursor:pointer;border:1px solid var(--line,#e7eaf3)}" +
      ".auth-code:disabled{opacity:.5;cursor:default}" +
      ".auth-go{width:100%;margin-top:18px;padding:12px;border:0;border-radius:12px;background:linear-gradient(135deg,var(--brand,#4f46e5),var(--brand2,#7c3aed));color:#fff;font-weight:800;font-size:1rem;cursor:pointer}" +
      ".auth-go:disabled{opacity:.6;cursor:default}" +
      ".auth-msg{margin-top:12px;font-size:.85rem;min-height:1.1em;font-weight:600}" +
      ".auth-msg.err{color:#ef4444}.auth-msg.ok{color:#16a34a}" +
      ".auth-x{float:right;cursor:pointer;color:var(--dim,#999);font-size:1.3rem;line-height:1;border:0;background:none}" +
      ".user-chip{display:inline-flex;align-items:center;gap:7px;cursor:pointer}" +
      ".user-menu{position:fixed;z-index:1001;background:var(--card,#fff);border:1px solid var(--line,#e7eaf3);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);min-width:200px;overflow:hidden;animation:umpop .14s ease}" +
      "@keyframes umpop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}" +
      ".um-head{padding:14px 16px;border-bottom:1px solid var(--line,#eee)}" +
      ".um-name{font-weight:800;color:var(--ink,#1b2236)}.um-mail{font-size:.8rem;color:var(--dim,#6b7488);margin-top:2px;word-break:break-all}" +
      ".um-item{display:block;width:100%;text-align:left;padding:11px 16px;border:0;background:none;color:var(--ink,#1b2236);font-size:.92rem;font-weight:600;cursor:pointer}" +
      ".um-item:hover{background:var(--bg,#f3f5fb)}";
    document.head.appendChild(s);
  }

  function modal() {
    var m = document.getElementById("authMask");
    if (m) return m;
    injectStyle();
    m = document.createElement("div"); m.className = "auth-mask"; m.id = "authMask";
    m.innerHTML =
      '<div class="auth-box">' +
        '<button class="auth-x" id="authX">×</button>' +
        '<div class="auth-tabs"><button data-m="login" class="on">登录</button><button data-m="reg">注册</button></div>' +
        '<h3 id="authTitle">登录 EngHub</h3>' +
        '<div class="sub" id="authSub">登录后，背单词、做题、笔记都会云端保存，换设备也在。</div>' +
        '<div id="fLogin">' +
          '<label>邮箱 / 用户名</label><input id="lEmail" placeholder="邮箱或用户名" autocomplete="username">' +
          '<label>密码</label><input id="lPwd" type="password" placeholder="密码" autocomplete="current-password">' +
          '<button class="auth-go" id="btnLogin">登录</button>' +
        '</div>' +
        '<div id="fReg" style="display:none">' +
          '<label>用户名</label><input id="rName" placeholder="给自己起个名字（字母/数字，可含_）" autocomplete="off">' +
          '<label>邮箱</label><div class="auth-row"><input id="rEmail" type="email" placeholder="you@example.com"><button class="auth-code" id="btnCode">获取验证码</button></div>' +
          '<label>验证码</label><input id="rCode" placeholder="邮箱收到的 6 位码">' +
          '<label>设置密码</label><input id="rPwd" type="password" placeholder="至少 8 位，含字母和数字">' +
          '<button class="auth-go" id="btnReg">注册并登录</button>' +
        '</div>' +
        '<div class="auth-msg" id="authMsg"></div>' +
      '</div>';
    document.body.appendChild(m);

    var msg = m.querySelector("#authMsg");
    function setMsg(t, ok) { msg.textContent = t || ""; msg.className = "auth-msg " + (ok ? "ok" : "err"); }
    function switchMode(mode) {
      m.querySelectorAll(".auth-tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
      m.querySelector("#fLogin").style.display = mode === "login" ? "block" : "none";
      m.querySelector("#fReg").style.display = mode === "reg" ? "block" : "none";
      m.querySelector("#authTitle").textContent = mode === "login" ? "登录 EngHub" : "注册 EngHub";
      setMsg("");
    }
    m.querySelectorAll(".auth-tabs button").forEach(function (b) { b.onclick = function () { switchMode(b.dataset.m); }; });
    m.querySelector("#authX").onclick = function () { m.classList.remove("open"); };
    m.onclick = function (e) { if (e.target === m) m.classList.remove("open"); };

    // 获取验证码（带 60s 冷却）
    var codeBtn = m.querySelector("#btnCode");
    codeBtn.onclick = function () {
      var email = m.querySelector("#rEmail").value.trim();
      if (!email) { setMsg("请先填邮箱"); return; }
      codeBtn.disabled = true; setMsg("发送中…", true);
      sendCode(email).then(function () {
        setMsg("验证码已发送，请查收邮箱（含垃圾箱）", true);
        var n = 60; codeBtn.textContent = n + "s";
        var t = setInterval(function () { n--; codeBtn.textContent = n + "s"; if (n <= 0) { clearInterval(t); codeBtn.disabled = false; codeBtn.textContent = "获取验证码"; } }, 1000);
      }).catch(function (e) { codeBtn.disabled = false; setMsg(e.message); });
    };
    // 注册
    m.querySelector("#btnReg").onclick = function () {
      var name = m.querySelector("#rName").value.trim(), email = m.querySelector("#rEmail").value.trim(), code = m.querySelector("#rCode").value.trim(), pwd = m.querySelector("#rPwd").value;
      if (!name || !email || !code || !pwd) { setMsg("用户名、邮箱、验证码、密码都要填"); return; }
      if (!/^[A-Za-z][A-Za-z0-9_]{1,30}$/.test(name)) { setMsg("用户名需字母开头，仅含字母/数字/下划线"); return; }
      var btn = this; btn.disabled = true; setMsg("注册中…", true);
      register(code, email, pwd, name).then(function () { setMsg("注册成功！", true); finishAuth(m); })
        .catch(function (e) { btn.disabled = false; setMsg(e.message); });
    };
    // 登录
    m.querySelector("#btnLogin").onclick = function () {
      var email = m.querySelector("#lEmail").value.trim(), pwd = m.querySelector("#lPwd").value;
      if (!email || !pwd) { setMsg("请填邮箱和密码"); return; }
      var btn = this; btn.disabled = true; setMsg("登录中…", true);
      login(email, pwd).then(function () { setMsg("登录成功！", true); finishAuth(m); })
        .catch(function (e) { btn.disabled = false; setMsg(e.message); });
    };
    return m;
  }

  function finishAuth(m) {
    setTimeout(function () {
      m.classList.remove("open"); renderNav();
      syncDown().then(syncUp);   // 登录后：拉云端合并 → 再把合并结果推上去
      if (window.CloudAuth.onLogin) window.CloudAuth.onLogin(user());
    }, 600);
  }
  function openModal() { modal().classList.add("open"); }

  function setName(newName) {
    var s = session(); if (!s) return; s.name = newName; localStorage.setItem(TK, JSON.stringify(s)); renderNav(); syncUp();
  }

  /* ---------- 用户下拉菜单 ---------- */
  function closeMenu() { var d = document.getElementById("userMenu"); if (d) d.remove(); }
  function toggleMenu(btn) {
    if (document.getElementById("userMenu")) { closeMenu(); return; }
    var u = user(); if (!u) return;
    var r = btn.getBoundingClientRect();
    var d = document.createElement("div"); d.id = "userMenu"; d.className = "user-menu";
    d.style.top = (r.bottom + 8) + "px"; d.style.right = (window.innerWidth - r.right) + "px";
    d.innerHTML =
      '<div class="um-head"><div class="um-name">' + (u.name || u.email) + '</div><div class="um-mail">' + u.email + '</div></div>' +
      '<button class="um-item" id="umSet">账号设置</button>' +
      '<button class="um-item" id="umOut">退出登录</button>';
    document.body.appendChild(d);
    d.querySelector("#umSet").onclick = function () { closeMenu(); openSettings(); };
    d.querySelector("#umOut").onclick = function () { closeMenu(); logout(); location.reload(); };
    setTimeout(function () { document.addEventListener("click", onDoc); }, 0);
    function onDoc(e) { if (!d.contains(e.target) && e.target !== btn) { closeMenu(); document.removeEventListener("click", onDoc); } }
  }

  /* ---------- 账号设置弹窗 ---------- */
  function openSettings() {
    injectStyle();
    var u = user(); if (!u) return;
    var m = document.getElementById("setMask");
    if (!m) {
      m = document.createElement("div"); m.className = "auth-mask"; m.id = "setMask";
      m.innerHTML =
        '<div class="auth-box">' +
          '<button class="auth-x" id="setX">×</button>' +
          '<h3>账号设置</h3><div class="sub">改完点保存即可。</div>' +
          '<label>邮箱（不可改）</label><input id="setEmail" disabled>' +
          '<label>用户名</label><input id="setName" placeholder="字母开头，字母/数字/下划线">' +
          '<button class="auth-go" id="setSave">保存</button>' +
          '<div class="auth-msg" id="setMsg"></div>' +
        '</div>';
      document.body.appendChild(m);
      m.querySelector("#setX").onclick = function () { m.classList.remove("open"); };
      m.onclick = function (e) { if (e.target === m) m.classList.remove("open"); };
      m.querySelector("#setSave").onclick = function () {
        var v = m.querySelector("#setName").value.trim();
        var msg = m.querySelector("#setMsg");
        if (!/^[A-Za-z][A-Za-z0-9_]{1,30}$/.test(v)) { msg.className = "auth-msg err"; msg.textContent = "用户名需字母开头，仅含字母/数字/下划线"; return; }
        setName(v); msg.className = "auth-msg ok"; msg.textContent = "已保存";
        setTimeout(function () { m.classList.remove("open"); }, 600);
      };
    }
    m.querySelector("#setEmail").value = u.email || "";
    m.querySelector("#setName").value = u.name || "";
    m.querySelector("#setMsg").textContent = "";
    m.classList.add("open");
  }

  /* ---------- 顶部按钮：登录态切换 ---------- */
  function renderNav() {
    var btn = document.querySelector(".btn-login");
    if (!btn) return;
    var u = user();
    if (u) {
      btn.classList.add("user-chip");
      btn.textContent = "👤 " + (u.name || u.email);
      btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); toggleMenu(btn); };
    } else {
      btn.classList.remove("user-chip");
      btn.textContent = "登录";
      btn.onclick = function (e) { e.preventDefault(); openModal(); };
    }
  }

  window.CloudAuth = {
    user: user, accessToken: accessToken, isLoggedIn: function () { return !!user(); },
    open: openModal, logout: function () { logout(); renderNav(); },
    sendCode: sendCode, register: register, login: login,
    loadData: loadData, saveData: saveData, syncUp: syncUp, syncDown: syncDown,
    onLogin: null  // 页面可覆盖：登录后回调
  };

  function init() { renderNav(); if (user()) syncDown(); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  // 离开页面/切到后台时把本地数据推送到云端
  window.addEventListener("pagehide", syncUp);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") syncUp(); });
})();
