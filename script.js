(function(){
"use strict";

/* ============================================================
   THEME (light / dark night-sky)
   ============================================================ */
const THEME_KEY = "dayoraTheme";
const root = document.documentElement;

function getPreferredTheme(){
  try{
    const saved = localStorage.getItem(THEME_KEY);
    if(saved === "light" || saved === "dark") return saved;
  } catch(e){ /* ignore */ }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme){
  root.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.setAttribute("aria-pressed", String(theme === "dark"));
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light sky" : "Switch to night sky");
  });
  document.querySelectorAll(".theme-toggle-label").forEach(lbl => {
    lbl.textContent = theme === "dark" ? "Night Sky" : "Day Sky";
  });
  try{ localStorage.setItem(THEME_KEY, theme); } catch(e){ /* ignore */ }
}

function toggleTheme(){
  const current = root.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

applyTheme(getPreferredTheme());

document.querySelectorAll(".theme-toggle").forEach(btn => {
  btn.addEventListener("click", toggleTheme);
});

/* ============================================================
   NAVIGATION
   ============================================================ */
const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-nav]");
const mobileMenu = document.getElementById("mobileMenu");
const hamburger = document.getElementById("hamburger");

const VIEW_KEY = "dayoraCurrentView";
const validViewNames = Array.from(views).map(v => v.id.replace("view-",""));

function goTo(name){
  views.forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.nav === name));
  closeMobileMenu();
  window.scrollTo({top:0, behavior:"smooth"});
  triggerReveal();
  try{ localStorage.setItem(VIEW_KEY, name); } catch(e){ /* ignore */ }
}
navButtons.forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.nav)));

// Restore whichever page was open before the reload, instead of always
// snapping back to Home. The markup already defaults to Home, so this
// only needs to act when a different page was saved.
(function restoreView(){
  let saved = null;
  try{ saved = localStorage.getItem(VIEW_KEY); } catch(e){ /* ignore */ }
  if(saved && saved !== "home" && validViewNames.includes(saved)){
    views.forEach(v => v.classList.toggle("active", v.id === "view-" + saved));
    navButtons.forEach(b => b.classList.toggle("active", b.dataset.nav === saved));
  }
})();

function closeMobileMenu(){
  mobileMenu.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded","false");
}
hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealTargets = document.querySelectorAll(".reveal-target, .feature-card");
const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("reveal");
      observer.unobserve(entry.target);
    }
  });
}, {threshold:0.15}) : null;

function triggerReveal(){
  if(observer){
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("reveal"));
  }
}
triggerReveal();

/* ============================================================
   SKY DECORATION GENERATION
   ============================================================ */
const skyLayer = document.getElementById("skyLayer");
function rand(min,max){ return Math.random() * (max-min) + min; }

// Sun / moon
const celestial = document.createElement("div");
celestial.className = "celestial";
celestial.innerHTML = `
  <span class="crater c1"></span>
  <span class="crater c2"></span>
  <span class="crater c3"></span>
`;
skyLayer.appendChild(celestial);

// Stars (denser field; dimmed via CSS opacity in daytime, bright at night)
const starCount = 55;
for(let i=0;i<starCount;i++){
  const star = document.createElement("div");
  const isSpark = Math.random() < 0.24;
  const size = rand(3, isSpark ? 14 : 5);
  star.className = "star" + (isSpark ? " spark" : "");
  star.style.left = rand(0,100) + "vw";
  star.style.top = rand(0,92) + "vh";
  star.style.width = size + "px";
  star.style.height = size + "px";
  star.style.animationDuration = rand(2.5,5.5) + "s";
  star.style.animationDelay = rand(0,4) + "s";
  if(isSpark){
    const inner = document.createElement("div");
    inner.className = "spark-shape";
    star.appendChild(inner);
  }
  skyLayer.appendChild(star);
}

// Clouds — each one drifts the full width of the sky on its own random
// path: random direction (left-to-right or right-to-left), random speed,
// random vertical position, and a random negative delay so they don't
// all start their journey from the same spot at once.
function makeCloud(scale, opacity, top, duration, blobs){
  const cloud = document.createElement("div");
  cloud.className = "cloud";

  const leftToRight = Math.random() < 0.5;
  const xStart = leftToRight ? "-30vw" : "130vw";
  const xEnd = leftToRight ? "130vw" : "-30vw";
  const jitteredDuration = duration * rand(0.85, 1.2);
  const negativeDelay = -rand(0, jitteredDuration); // start mid-flight, at a random point

  cloud.style.top = top;
  cloud.style.left = "0";
  cloud.style.width = (140*scale)+"px";
  cloud.style.height = (70*scale)+"px";
  cloud.style.opacity = opacity;
  cloud.style.setProperty("--x-start", xStart);
  cloud.style.setProperty("--x-end", xEnd);
  cloud.style.animationDuration = jitteredDuration + "s";
  cloud.style.animationDelay = negativeDelay + "s";

  blobs.forEach(b => {
    const span = document.createElement("span");
    span.style.width = (b.w*scale)+"px";
    span.style.height = (b.h*scale)+"px";
    span.style.left = (b.x*scale)+"px";
    span.style.top = (b.y*scale)+"px";
    cloud.appendChild(span);
  });
  skyLayer.appendChild(cloud);
}
const cloudShape = [
  {w:70,h:70,x:0,y:10},
  {w:90,h:90,x:35,y:-8},
  {w:70,h:70,x:80,y:8},
  {w:55,h:55,x:20,y:22},
  {w:55,h:55,x:60,y:24}
];
// background (far, subtle, slow)
makeCloud(1.5,0.35,rand(2,10)+"vh",rand(55,75),cloudShape);
makeCloud(1.7,0.3,rand(10,18)+"vh",rand(55,75),cloudShape);
makeCloud(1.3,0.4,rand(28,36)+"vh",rand(50,70),cloudShape);
// middle
makeCloud(1.0,0.7,rand(16,24)+"vh",rand(38,55),cloudShape);
makeCloud(0.9,0.65,rand(42,50)+"vh",rand(40,58),cloudShape);
makeCloud(1.0,0.75,rand(54,62)+"vh",rand(36,52),cloudShape);
// foreground (near, faster)
makeCloud(0.75,1,rand(62,70)+"vh",rand(26,38),cloudShape);
makeCloud(0.7,1,rand(72,80)+"vh",rand(28,40),cloudShape);
makeCloud(0.65,0.95,rand(34,42)+"vh",rand(24,36),cloudShape);

// Balloons — built as real SVG shapes (envelope, ropes, basket) rather
// than approximated with stacked divs, so they actually read as balloons
// and pick up proper theme-aware colors.
let balloonUid = 0;
function balloonSVG(){
  const id = "dayora-balloon-" + (balloonUid++);
  return `
    <svg class="balloon-svg" viewBox="0 0 100 150" aria-hidden="true">
      <defs>
        <pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="9" height="18" class="balloon-stripe-a"></rect>
          <rect x="9" width="9" height="18" class="balloon-stripe-b"></rect>
        </pattern>
      </defs>
      <path d="M50 4
        C 76 4 90 32 90 55
        C 90 80 73 98 58 103
        L 55 112 L 45 112 L 42 103
        C 27 98 10 80 10 55
        C 10 32 24 4 50 4 Z"
        fill="url(#${id})"></path>
      <path class="balloon-shine" d="M27 22 C 20 36 19 50 23 64"></path>
      <line class="balloon-rope" x1="45" y1="112" x2="31" y2="130"></line>
      <line class="balloon-rope" x1="55" y1="112" x2="69" y2="130"></line>
      <line class="balloon-rope" x1="49" y1="112" x2="38" y2="130"></line>
      <line class="balloon-rope" x1="51" y1="112" x2="62" y2="130"></line>
      <rect class="balloon-basket" x="31" y="128" width="38" height="20" rx="4"></rect>
    </svg>`;
}
function makeBalloon(top,left,scale,duration,delay){
  const wrap = document.createElement("div");
  wrap.className = "balloon";
  wrap.style.top = top;
  wrap.style.left = left;
  wrap.style.transform = `scale(${scale})`;
  wrap.style.transformOrigin = "center";
  wrap.style.animationDuration = duration + "s";
  wrap.style.animationDelay = delay + "s";
  wrap.innerHTML = balloonSVG();
  skyLayer.appendChild(wrap);
}
makeBalloon("12vh","8vw",0.85,7,0);
makeBalloon("18vh","82vw",1.05,8,1.2);
makeBalloon("55vh","90vw",0.7,6.5,0.6);
makeBalloon("70vh","4vw",0.9,7.5,1.8);

// Birds
function makeBird(top, duration, delay, scale){
  const bird = document.createElement("div");
  bird.className = "bird";
  bird.style.top = top;
  bird.style.left = "0";
  bird.style.transform = `scale(${scale})`;
  bird.style.animation = `flyAcross ${duration}s linear infinite`;
  bird.style.animationDelay = delay + "s";
  bird.innerHTML = `<svg viewBox="0 0 26 14"><path d="M1 8 Q 6 1 13 8 Q 19 1 25 8"/></svg>`;
  skyLayer.appendChild(bird);
}
makeBird("15vh", 26, 0, 1);
makeBird("28vh", 32, 8, 0.8);
makeBird("9vh", 22, 15, 1.15);

/* Parallax on scroll (subtle) */
let ticking = false;
window.addEventListener("scroll", () => {
  if(!ticking){
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      const clouds = skyLayer.querySelectorAll(".cloud");
      clouds.forEach((c,i) => {
        const speed = 0.02 + (i % 3) * 0.015;
        c.style.marginTop = (-y*speed) + "px";
      });
      const balloons = skyLayer.querySelectorAll(".balloon");
      balloons.forEach((b,i) => {
        const speed = 0.05 + (i % 2)*0.02;
        b.style.marginTop = (-y*speed) + "px";
      });
      ticking = false;
    });
    ticking = true;
  }
});

/* ============================================================
   SHARED HELPERS
   ============================================================ */
function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   TASKS
   ============================================================ */
const TASKS_KEY = "dayoraTasks";
let tasks = loadTasks();
let currentFilter = "all";

function loadTasks(){
  try{
    const raw = localStorage.getItem(TASKS_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){ return []; }
}
function saveTasks(){
  try{ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch(e){ /* storage unavailable */ }
}

const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filters button");
const statTotal = document.getElementById("statTotal");
const statRemaining = document.getElementById("statRemaining");
const statCompleted = document.getElementById("statCompleted");
const focusTaskSelect = document.getElementById("focusTaskSelect");

function uid(){ return "t" + Date.now() + Math.floor(Math.random()*1000); }

function addTask(){
  const title = taskInput.value.trim();
  if(!title) return;
  tasks.unshift({ id:uid(), title, completed:false, priority:prioritySelect.value });
  taskInput.value = "";
  saveTasks();
  renderTasks();
  renderFocusTaskOptions();
  taskInput.focus();
}
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if(e.key === "Enter") addTask(); });

function toggleTask(id){
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id){
  const el = taskList.querySelector(`[data-id="${id}"]`);
  const finish = () => {
    tasks = tasks.filter(x => x.id !== id);
    saveTasks();
    renderTasks();
    renderFocusTaskOptions();
  };
  if(el){
    el.classList.add("removing");
    setTimeout(finish, 280);
  } else {
    finish();
  }
}

function startEdit(id){ renderTasks(id); }

function saveEdit(id, newTitle){
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  const trimmed = newTitle.trim();
  if(trimmed) t.title = trimmed;
  saveTasks();
  renderTasks();
  renderFocusTaskOptions();
}

clearCompletedBtn.addEventListener("click", () => {
  const completedEls = taskList.querySelectorAll(".task-item.completed");
  if(completedEls.length === 0) return;
  completedEls.forEach(el => el.classList.add("removing"));
  setTimeout(() => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    renderFocusTaskOptions();
  }, 280);
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    renderTasks();
  });
});

function renderTasks(editingId){
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const remaining = total - completed;
  statTotal.textContent = total;
  statRemaining.textContent = remaining;
  statCompleted.textContent = completed;

  let visible = tasks;
  if(currentFilter === "active") visible = tasks.filter(t => !t.completed);
  if(currentFilter === "completed") visible = tasks.filter(t => t.completed);

  taskList.innerHTML = "";

  if(total === 0){
    taskList.innerHTML = `
      <div class="empty-state">
        <span class="emoji">☁</span>
        <h3>Your sky is clear</h3>
        <p>No tasks yet. Add something you'd like to accomplish today.</p>
      </div>`;
    return;
  }

  if(visible.length === 0 && currentFilter === "completed"){
    taskList.innerHTML = `
      <div class="empty-state">
        <span class="emoji">✦</span>
        <h3>Nothing completed yet</h3>
        <p>Finish a task and it will show up here.</p>
      </div>`;
    return;
  }
  if(visible.length === 0 && currentFilter === "active"){
    taskList.innerHTML = `
      <div class="empty-state">
        <span class="emoji">✨</span>
        <h3>All caught up</h3>
        <p>Every task is complete. Nice work.</p>
      </div>`;
    return;
  }

  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = "task-item" + (t.completed ? " completed" : "");
    li.dataset.id = t.id;
    const isEditing = editingId === t.id;

    li.innerHTML = `
      <button class="task-check" aria-label="Toggle task complete">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
      <div class="task-main">
        ${isEditing
          ? `<input type="text" class="task-title-input" value="${escapeHtml(t.title)}">`
          : `<span class="task-title">${escapeHtml(t.title)}</span>
             <span class="task-priority ${t.priority}">${t.priority}</span>`
        }
      </div>
      <div class="task-actions">
        <button class="icon-btn edit-btn" aria-label="Edit task" title="Edit">✎</button>
        <button class="icon-btn danger delete-btn" aria-label="Delete task" title="Delete">🗑</button>
      </div>
    `;

    li.querySelector(".task-check").addEventListener("click", () => toggleTask(t.id));
    li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(t.id));

    if(isEditing){
      const input = li.querySelector(".task-title-input");
      requestAnimationFrame(() => { input.focus(); input.select(); });
      input.addEventListener("keydown", e => {
        if(e.key === "Enter") saveEdit(t.id, input.value);
        if(e.key === "Escape") renderTasks();
      });
      input.addEventListener("blur", () => saveEdit(t.id, input.value));
      li.querySelector(".edit-btn").addEventListener("click", () => saveEdit(t.id, input.value));
    } else {
      li.querySelector(".edit-btn").addEventListener("click", () => startEdit(t.id));
    }

    taskList.appendChild(li);
  });

  if(total > 0 && completed === total){
    const celebrate = document.createElement("div");
    celebrate.className = "empty-state";
    celebrate.style.marginTop = "6px";
    celebrate.innerHTML = `<span class="emoji">✨</span><h3>Amazing!</h3><p>Your task list is clear. Enjoy the view from above the clouds.</p>`;
    taskList.appendChild(celebrate);
  }
}

renderTasks();

/* ============================================================
   POMODORO
   ============================================================ */
const STATS_KEY = "dayoraPomodoroStats";
const DURATIONS = { focus:25*60, short:5*60, long:15*60 };
const MODE_LABELS = { focus:"Focus Time", short:"Short Break", long:"Long Break" };

function loadStats(){
  try{
    const raw = localStorage.getItem(STATS_KEY);
    if(!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch(e){ return {}; }
}
function saveStats(){
  try{
    localStorage.setItem(STATS_KEY, JSON.stringify({
      cyclesToday: pomoState.focusCyclesCompleted,
      totalFocusMinutes: pomoState.totalFocusMinutes
    }));
  } catch(e){ /* ignore */ }
}

const initialStats = loadStats();
let pomoState = {
  mode:"focus",
  secondsLeft: DURATIONS.focus,
  running:false,
  intervalId:null,
  focusCyclesCompleted: initialStats.cyclesToday || 0,
  totalFocusMinutes: initialStats.totalFocusMinutes || 0,
  focusTaskId:""
};

const modeButtons = document.querySelectorAll(".mode-switch[aria-label='Pomodoro mode'] button");
const timerDisplay = document.getElementById("timerDisplay");
const timerModeLabel = document.getElementById("timerModeLabel");
const timerRing = document.getElementById("timerRing");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const skipBtn = document.getElementById("skipBtn");
const tomatoDots = document.getElementById("tomatoDots");
const sessionCountLine = document.getElementById("sessionCountLine");
const focusTimeLine = document.getElementById("focusTimeLine");
const completionToast = document.getElementById("completionToast");
const toastTitle = document.getElementById("toastTitle");
const toastBody = document.getElementById("toastBody");

const RING_CIRCUMFERENCE = 2 * Math.PI * 90;
timerRing.setAttribute("stroke-dasharray", RING_CIRCUMFERENCE);

/* ---- Growing plant companion ----
   The plant grows from a seed to full bloom over the course of
   whichever session is currently running (25 min focus by default,
   or the shorter break durations). Progress is derived straight from
   the timer's own countdown, so it always stays perfectly in sync
   with the ring and needs no timer of its own. */
const plantStem = document.getElementById("plantStem");
const plantSeed = document.getElementById("plantSeed");
const plantLeafLeft = document.getElementById("plantLeafLeft");
const plantLeafRight = document.getElementById("plantLeafRight");
const plantFlower = document.getElementById("plantFlower");
const plantCaption = document.getElementById("plantCaption");

const stemLength = plantStem.getTotalLength();
plantStem.style.strokeDasharray = stemLength;

function clamp01(n){ return Math.max(0, Math.min(1, n)); }
// Maps progress from [start,end] onto [0,1], clamped.
function stageProgress(progress, start, end){ return clamp01((progress - start) / (end - start)); }

function updatePlant(progress){
  const seedFade = 1 - stageProgress(progress, 0, 0.1);
  plantSeed.style.opacity = seedFade;

  const stemGrowth = stageProgress(progress, 0.04, 0.55);
  plantStem.style.strokeDashoffset = stemLength * (1 - stemGrowth);

  const leafLeftGrowth = stageProgress(progress, 0.35, 0.55);
  plantLeafLeft.style.transform = `scale(${leafLeftGrowth})`;

  const leafRightGrowth = stageProgress(progress, 0.52, 0.72);
  plantLeafRight.style.transform = `scale(${leafRightGrowth})`;

  const flowerGrowth = stageProgress(progress, 0.8, 1);
  plantFlower.style.transform = `scale(${flowerGrowth})`;
  plantFlower.style.opacity = flowerGrowth;

  if(plantCaption){
    let caption;
    if(progress <= 0.01) caption = "Plant a seed and watch it grow as you focus";
    else if(progress < 0.1) caption = "A tiny seed, waiting to sprout";
    else if(progress < 0.55) caption = "Pushing up through the soil";
    else if(progress < 0.8) caption = "Unfurling its leaves";
    else if(progress < 1) caption = "About to bloom";
    else caption = "In full bloom — session complete!";
    plantCaption.textContent = caption;
  }
}

updatePlant(0);

function renderFocusTaskOptions(){
  const activeOnes = tasks.filter(t => !t.completed);
  const prevValue = focusTaskSelect.value;
  focusTaskSelect.innerHTML = `<option value="">No task selected</option>` +
    activeOnes.map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join("");
  if(activeOnes.some(t => t.id === prevValue)){
    focusTaskSelect.value = prevValue;
  }
}
renderFocusTaskOptions();
focusTaskSelect.addEventListener("change", () => { pomoState.focusTaskId = focusTaskSelect.value; });

function formatTime(sec){
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function updateTimerUI(){
  timerDisplay.textContent = formatTime(pomoState.secondsLeft);
  timerModeLabel.textContent = MODE_LABELS[pomoState.mode];
  const total = DURATIONS[pomoState.mode];
  const progress = pomoState.secondsLeft / total;
  timerRing.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  updatePlant(1 - progress);

  startPauseBtn.textContent = pomoState.running ? "Pause" : (pomoState.secondsLeft === total ? "Start" : "Resume");

  const dots = "🍅 ".repeat(Math.min(pomoState.focusCyclesCompleted, 8)).trim();
  tomatoDots.textContent = dots || "—";
  sessionCountLine.textContent = `${pomoState.focusCyclesCompleted} session${pomoState.focusCyclesCompleted===1?"":"s"} completed today`;
  focusTimeLine.textContent = `Total focus time: ${pomoState.totalFocusMinutes} minute${pomoState.totalFocusMinutes===1?"":"s"}`;
  document.title = pomoState.running ? `${timerDisplay.textContent} · ${MODE_LABELS[pomoState.mode]} — Dayora` : "Dayora — Your Day. Your Focus. Your Sky.";
}

function setMode(mode, resetTimer){
  pomoState.mode = mode;
  modeButtons.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  if(resetTimer !== false){
    pomoState.secondsLeft = DURATIONS[mode];
  }
  updateTimerUI();
}

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    stopTimer();
    setMode(btn.dataset.mode, true);
  });
});

function tick(){
  pomoState.secondsLeft--;
  if(pomoState.secondsLeft <= 0){
    completeSession();
    return;
  }
  updateTimerUI();
}

function startTimer(){
  if(pomoState.running) return;
  pomoState.running = true;
  pomoState.intervalId = setInterval(tick, 1000);
  updateTimerUI();
}
function pauseTimer(){
  pomoState.running = false;
  clearInterval(pomoState.intervalId);
  updateTimerUI();
}
function stopTimer(){
  pomoState.running = false;
  clearInterval(pomoState.intervalId);
}
function resetTimerFn(){
  stopTimer();
  pomoState.secondsLeft = DURATIONS[pomoState.mode];
  updateTimerUI();
}

startPauseBtn.addEventListener("click", () => { pomoState.running ? pauseTimer() : startTimer(); });
resetBtn.addEventListener("click", resetTimerFn);
skipBtn.addEventListener("click", () => completeSession(true));

function showToast(title, body){
  toastTitle.textContent = title;
  toastBody.textContent = body;
  completionToast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => completionToast.classList.remove("show"), 4200);
}

function completeSession(isSkip){
  stopTimer();
  const finishedMode = pomoState.mode;

  if(finishedMode === "focus" && !isSkip){
    pomoState.focusCyclesCompleted++;
    pomoState.totalFocusMinutes += Math.round(DURATIONS.focus/60);
    saveStats();
  }

  let nextMode;
  if(finishedMode === "focus"){
    const cyclesMod = pomoState.focusCyclesCompleted % 4;
    nextMode = (cyclesMod === 0 && pomoState.focusCyclesCompleted > 0) ? "long" : "short";
  } else {
    nextMode = "focus";
  }

  if(!isSkip){
    if(finishedMode === "focus"){
      showToast("☁ Focus Complete", nextMode === "long" ? "Beautiful work. Time for a long break." : "Beautiful work. Time for a short break.");
    } else {
      showToast("✦ Break Complete", "Step away, breathe, and come back refreshed.");
    }
  }

  setMode(nextMode, true);
}

updateTimerUI();
triggerReveal();

/* ============================================================
   ACTIVITY TRACKER
   ============================================================ */
const ACTIVITY_ENTRIES_KEY = "dayoraActivityEntries";
const ACTIVITY_RUNNING_KEY = "dayoraActivityRunning";

function loadActivityEntries(){
  try{
    const raw = localStorage.getItem(ACTIVITY_ENTRIES_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){ return []; }
}
function saveActivityEntries(){
  try{ localStorage.setItem(ACTIVITY_ENTRIES_KEY, JSON.stringify(activityEntries)); } catch(e){ /* storage unavailable */ }
}
function loadRunningActivity(){
  try{
    const raw = localStorage.getItem(ACTIVITY_RUNNING_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed && parsed.startTs) ? parsed : null;
  } catch(e){ return null; }
}
function saveRunningActivity(){
  try{
    if(runningActivity){
      localStorage.setItem(ACTIVITY_RUNNING_KEY, JSON.stringify(runningActivity));
    } else {
      localStorage.removeItem(ACTIVITY_RUNNING_KEY);
    }
  } catch(e){ /* ignore */ }
}

let activityEntries = loadActivityEntries();
let runningActivity = loadRunningActivity();
let activityIntervalId = null;

const activityNameInput = document.getElementById("activityNameInput");
const activityStartBtn = document.getElementById("activityStartBtn");
const activityStopBtn = document.getElementById("activityStopBtn");
const activityIdleRow = document.getElementById("activityIdleRow");
const activityRunningRow = document.getElementById("activityRunningRow");
const activityRunningName = document.getElementById("activityRunningName");
const activityElapsedDisplay = document.getElementById("activityElapsedDisplay");
const activityEntryList = document.getElementById("activityEntryList");
const activityTodayTotal = document.getElementById("activityTodayTotal");
const activityTodayCount = document.getElementById("activityTodayCount");
const activityAllTimeTotal = document.getElementById("activityAllTimeTotal");

function activityUid(){ return "a" + Date.now() + Math.floor(Math.random()*1000); }

function formatHMS(totalSeconds){
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function formatDurationShort(totalSeconds){
  const s = Math.max(0, Math.round(totalSeconds));
  if(s < 60) return `${s}s`;
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  if(h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function activityElapsedSeconds(){
  if(!runningActivity) return 0;
  return (Date.now() - runningActivity.startTs) / 1000;
}

function startActivityTicker(){
  stopActivityTicker();
  activityIntervalId = setInterval(() => {
    if(!runningActivity) return;
    activityElapsedDisplay.textContent = formatHMS(activityElapsedSeconds());
    renderActivityStats();
  }, 1000);
}
function stopActivityTicker(){
  clearInterval(activityIntervalId);
  activityIntervalId = null;
}

function startActivity(){
  if(runningActivity) return; // a session is already running; UI hides the start row in this case
  const name = activityNameInput.value.trim() || "Untitled activity";
  runningActivity = { name, startTs: Date.now() };
  saveRunningActivity();
  activityNameInput.value = "";
  renderActivityUI();
}

function stopActivity(){
  if(!runningActivity) return;
  const endTs = Date.now();
  const durationSec = Math.max(1, Math.round((endTs - runningActivity.startTs)/1000));
  activityEntries.unshift({
    id: activityUid(),
    name: runningActivity.name,
    date: dateKey(new Date(runningActivity.startTs)),
    startTs: runningActivity.startTs,
    endTs,
    durationSec
  });
  saveActivityEntries();
  runningActivity = null;
  saveRunningActivity();
  stopActivityTicker();
  renderActivityUI();
}

activityStartBtn.addEventListener("click", startActivity);
activityNameInput.addEventListener("keydown", e => { if(e.key === "Enter") startActivity(); });
activityStopBtn.addEventListener("click", stopActivity);

function deleteActivityEntry(id){
  const el = activityEntryList.querySelector(`[data-id="${id}"]`);
  const finish = () => {
    activityEntries = activityEntries.filter(e => e.id !== id);
    saveActivityEntries();
    renderActivityUI();
  };
  if(el){
    el.classList.add("removing");
    setTimeout(finish, 280);
  } else {
    finish();
  }
}

function activityTimeRangeLabel(entry){
  const start = new Date(entry.startTs);
  const end = new Date(entry.endTs);
  const dayLabel = dateKey(start) === dateKey(new Date())
    ? "Today"
    : start.toLocaleDateString(undefined, { month:"short", day:"numeric" });
  const startStr = start.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" });
  const endStr = end.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" });
  return `${dayLabel} · ${startStr} – ${endStr}`;
}

function renderActivityStats(){
  const todayKey = dateKey(new Date());
  const todayEntries = activityEntries.filter(e => e.date === todayKey);
  const runningIsToday = runningActivity && dateKey(new Date(runningActivity.startTs)) === todayKey;

  let todaySeconds = todayEntries.reduce((s,e) => s + e.durationSec, 0);
  if(runningIsToday) todaySeconds += activityElapsedSeconds();

  const allSeconds = activityEntries.reduce((s,e) => s + e.durationSec, 0) + (runningActivity ? activityElapsedSeconds() : 0);

  activityTodayTotal.textContent = formatDurationShort(todaySeconds);
  activityTodayCount.textContent = todayEntries.length + (runningIsToday ? 1 : 0);
  activityAllTimeTotal.textContent = formatDurationShort(allSeconds);
}

function renderActivityList(){
  activityEntryList.innerHTML = "";

  if(activityEntries.length === 0){
    activityEntryList.innerHTML = `
      <div class="empty-state">
        <span class="emoji">⏱</span>
        <h3>No activity logged yet</h3>
        <p>Start a timer above to begin tracking your time.</p>
      </div>`;
    return;
  }

  const sorted = [...activityEntries].sort((a,b) => b.startTs - a.startTs);
  sorted.forEach(entry => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = entry.id;
    li.innerHTML = `
      <div class="task-main">
        <span class="activity-entry-name">${escapeHtml(entry.name)}</span>
        <span class="activity-entry-meta">${activityTimeRangeLabel(entry)}</span>
      </div>
      <span class="activity-entry-duration">${formatDurationShort(entry.durationSec)}</span>
      <div class="task-actions">
        <button class="icon-btn danger delete-activity-btn" aria-label="Delete entry" title="Delete">🗑</button>
      </div>
    `;
    li.querySelector(".delete-activity-btn").addEventListener("click", () => deleteActivityEntry(entry.id));
    activityEntryList.appendChild(li);
  });
}

function renderActivityUI(){
  if(runningActivity){
    activityIdleRow.hidden = true;
    activityRunningRow.hidden = false;
    activityRunningName.textContent = runningActivity.name;
    activityElapsedDisplay.textContent = formatHMS(activityElapsedSeconds());
    startActivityTicker();
  } else {
    activityIdleRow.hidden = false;
    activityRunningRow.hidden = true;
    stopActivityTicker();
  }
  renderActivityStats();
  renderActivityList();
}

renderActivityUI();

/* ============================================================
   BUDGET
   ============================================================ */
const BUDGET_ENTRIES_KEY = "dayoraBudgetEntries";
const BUDGET_GOALS_KEY = "dayoraBudgetGoals";

const CATEGORIES = {
  expense: [
    { id:"food", label:"Food", emoji:"🍜" },
    { id:"transport", label:"Transport", emoji:"🚗" },
    { id:"shopping", label:"Shopping", emoji:"🛍" },
    { id:"bills", label:"Bills", emoji:"💡" },
    { id:"health", label:"Health", emoji:"⚕" },
    { id:"entertainment", label:"Entertainment", emoji:"🎬" },
    { id:"other", label:"Other", emoji:"✦" }
  ],
  income: [
    { id:"salary", label:"Salary", emoji:"💼" },
    { id:"freelance", label:"Freelance", emoji:"💻" },
    { id:"gift", label:"Gift", emoji:"🎁" },
    { id:"other", label:"Other", emoji:"✦" }
  ]
};

function findCategoryMeta(type, id){
  const list = CATEGORIES[type] || CATEGORIES.expense;
  return list.find(c => c.id === id) || { id, label:id, emoji:"✦" };
}

function loadBudgetEntries(){
  try{
    const raw = localStorage.getItem(BUDGET_ENTRIES_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){ return []; }
}
function saveBudgetEntries(){
  try{ localStorage.setItem(BUDGET_ENTRIES_KEY, JSON.stringify(budgetEntries)); } catch(e){ /* storage unavailable */ }
}
function loadBudgetGoals(){
  try{
    const raw = localStorage.getItem(BUDGET_GOALS_KEY);
    if(!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch(e){ return {}; }
}
function saveBudgetGoals(){
  try{ localStorage.setItem(BUDGET_GOALS_KEY, JSON.stringify(budgetGoals)); } catch(e){ /* ignore */ }
}

let budgetEntries = loadBudgetEntries();
let budgetGoals = loadBudgetGoals();
let currentDay = new Date();
let currentMonth = new Date(currentDay.getFullYear(), currentDay.getMonth(), 1);
let currentEntryType = "expense";

// DOM refs
const budgetPeriodButtons = document.querySelectorAll("[data-budget-period]");
const budgetDayView = document.getElementById("budgetDayView");
const budgetMonthView = document.getElementById("budgetMonthView");

const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");
const currentDayLabel = document.getElementById("currentDayLabel");
const dayIncomeNum = document.getElementById("dayIncomeNum");
const dayExpenseNum = document.getElementById("dayExpenseNum");
const dayBalanceNum = document.getElementById("dayBalanceNum");

const typeToggleButtons = document.querySelectorAll(".type-toggle button");
const budgetDesc = document.getElementById("budgetDesc");
const budgetCategory = document.getElementById("budgetCategory");
const budgetAmount = document.getElementById("budgetAmount");
const addBudgetBtn = document.getElementById("addBudgetBtn");
const budgetEntryList = document.getElementById("budgetEntryList");

const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const currentMonthLabel = document.getElementById("currentMonthLabel");
const monthIncomeNum = document.getElementById("monthIncomeNum");
const monthExpenseNum = document.getElementById("monthExpenseNum");
const monthBalanceNum = document.getElementById("monthBalanceNum");

const monthlyGoalInput = document.getElementById("monthlyGoalInput");
const setGoalBtn = document.getElementById("setGoalBtn");
const goalProgressWrap = document.getElementById("goalProgressWrap");
const goalProgressFill = document.getElementById("goalProgressFill");
const goalProgressLabel = document.getElementById("goalProgressLabel");
const categoryBreakdown = document.getElementById("categoryBreakdown");

function money(amount){
  const n = Number(amount) || 0;
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function dateKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function monthKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  return `${y}-${m}`;
}
function formatDayLabel(d){
  const isToday = dateKey(d) === dateKey(new Date());
  const str = d.toLocaleDateString(undefined, { weekday:"short", day:"numeric", month:"short", year:"numeric" });
  return isToday ? `Today · ${str}` : str;
}
function formatMonthLabel(d){
  const isThisMonth = monthKey(d) === monthKey(new Date());
  const str = d.toLocaleDateString(undefined, { month:"long", year:"numeric" });
  return isThisMonth ? `This Month · ${str}` : str;
}

function budgetUid(){ return "b" + Date.now() + Math.floor(Math.random()*1000); }

function getDayTotals(dateObj){
  const key = dateKey(dateObj);
  const entries = budgetEntries.filter(e => e.date === key);
  const income = entries.reduce((s,e) => e.type === "income" ? s + e.amount : s, 0);
  const expense = entries.reduce((s,e) => e.type === "expense" ? s + e.amount : s, 0);
  return { entries, income, expense, balance: income - expense };
}
function getMonthTotals(monthDate){
  const mKey = monthKey(monthDate);
  const entries = budgetEntries.filter(e => e.date.slice(0,7) === mKey);
  const income = entries.reduce((s,e) => e.type === "income" ? s + e.amount : s, 0);
  const expense = entries.reduce((s,e) => e.type === "expense" ? s + e.amount : s, 0);
  return { entries, income, expense, balance: income - expense };
}

function populateCategorySelect(type){
  budgetCategory.innerHTML = CATEGORIES[type].map(c => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join("");
}

typeToggleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentEntryType = btn.dataset.type;
    typeToggleButtons.forEach(b => b.classList.toggle("active", b === btn));
    populateCategorySelect(currentEntryType);
  });
});

/* ---- Day / Month tab switching ---- */
budgetPeriodButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    budgetPeriodButtons.forEach(b => b.classList.toggle("active", b === btn));
    const period = btn.dataset.budgetPeriod;
    budgetDayView.hidden = period !== "day";
    budgetMonthView.hidden = period !== "month";
    if(period === "month") renderMonthView();
  });
});

/* ---- Day navigation ---- */
prevDayBtn.addEventListener("click", () => {
  currentDay.setDate(currentDay.getDate() - 1);
  renderDayView();
});
nextDayBtn.addEventListener("click", () => {
  currentDay.setDate(currentDay.getDate() + 1);
  renderDayView();
});

/* ---- Month navigation ---- */
prevMonthBtn.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderMonthView();
});
nextMonthBtn.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderMonthView();
});

/* ---- Add / delete entries ---- */
function addBudgetEntry(){
  const desc = budgetDesc.value.trim();
  const amount = parseFloat(budgetAmount.value);
  if(!desc || !amount || amount <= 0) return;

  budgetEntries.unshift({
    id: budgetUid(),
    date: dateKey(currentDay),
    type: currentEntryType,
    category: budgetCategory.value,
    description: desc,
    amount
  });
  saveBudgetEntries();
  budgetDesc.value = "";
  budgetAmount.value = "";
  renderDayView();
  budgetDesc.focus();
}
addBudgetBtn.addEventListener("click", addBudgetEntry);
[budgetDesc, budgetAmount].forEach(el => {
  el.addEventListener("keydown", e => { if(e.key === "Enter") addBudgetEntry(); });
});

function deleteBudgetEntry(id){
  const el = budgetEntryList.querySelector(`[data-id="${id}"]`);
  const finish = () => {
    budgetEntries = budgetEntries.filter(e => e.id !== id);
    saveBudgetEntries();
    renderDayView();
    if(!budgetMonthView.hidden) renderMonthView();
  };
  if(el){
    el.classList.add("removing");
    setTimeout(finish, 280);
  } else {
    finish();
  }
}

/* ---- Monthly goal ---- */
setGoalBtn.addEventListener("click", () => {
  const key = monthKey(currentMonth);
  const val = parseFloat(monthlyGoalInput.value);
  if(!val || val <= 0){
    delete budgetGoals[key];
  } else {
    budgetGoals[key] = val;
  }
  saveBudgetGoals();
  renderGoalProgress();
});
monthlyGoalInput.addEventListener("keydown", e => { if(e.key === "Enter") setGoalBtn.click(); });

function renderGoalProgress(){
  const key = monthKey(currentMonth);
  const goal = budgetGoals[key];
  monthlyGoalInput.value = goal || "";

  if(!goal){
    goalProgressWrap.hidden = true;
    return;
  }
  const { expense } = getMonthTotals(currentMonth);
  const pct = Math.min(100, (expense / goal) * 100);
  goalProgressFill.style.width = pct + "%";
  const isOver = expense > goal;
  goalProgressFill.classList.toggle("over", isOver);
  goalProgressLabel.textContent = isOver
    ? `${money(expense)} spent — ${money(expense - goal)} over your ${money(goal)} goal`
    : `${money(expense)} of ${money(goal)} spent (${Math.round((expense/goal)*100)}%)`;
  goalProgressWrap.hidden = false;
}

/* ---- Render: Day view ---- */
function renderDayView(){
  currentDayLabel.textContent = formatDayLabel(currentDay);
  const { entries, income, expense, balance } = getDayTotals(currentDay);

  dayIncomeNum.textContent = money(income);
  dayExpenseNum.textContent = money(expense);
  dayBalanceNum.textContent = money(balance);

  budgetEntryList.innerHTML = "";

  if(entries.length === 0){
    budgetEntryList.innerHTML = `
      <div class="empty-state">
        <span class="emoji">☁</span>
        <h3>Nothing logged yet</h3>
        <p>Add your first income or expense for this day.</p>
      </div>`;
    return;
  }

  entries.forEach(e => {
    const meta = findCategoryMeta(e.type, e.category);
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = e.id;
    li.innerHTML = `
      <span class="entry-type-dot ${e.type}"></span>
      <div class="task-main">
        <span class="task-title">${escapeHtml(e.description)}</span>
        <span class="entry-meta">${meta.emoji} ${meta.label}</span>
      </div>
      <span class="entry-amount ${e.type}">${e.type === "income" ? "+" : "−"}${money(e.amount)}</span>
      <div class="task-actions">
        <button class="icon-btn danger delete-entry-btn" aria-label="Delete entry" title="Delete">🗑</button>
      </div>
    `;
    li.querySelector(".delete-entry-btn").addEventListener("click", () => deleteBudgetEntry(e.id));
    budgetEntryList.appendChild(li);
  });
}

/* ---- Render: Month view ---- */
function renderMonthView(){
  currentMonthLabel.textContent = formatMonthLabel(currentMonth);
  const { income, expense, balance } = getMonthTotals(currentMonth);

  monthIncomeNum.textContent = money(income);
  monthExpenseNum.textContent = money(expense);
  monthBalanceNum.textContent = money(balance);

  renderGoalProgress();
  renderCategoryBreakdown();
}

function renderCategoryBreakdown(){
  const { entries, expense } = getMonthTotals(currentMonth);
  const expenseEntries = entries.filter(e => e.type === "expense");

  categoryBreakdown.innerHTML = "";

  if(expenseEntries.length === 0){
    categoryBreakdown.innerHTML = `
      <div class="empty-state">
        <span class="emoji">✦</span>
        <h3>Nothing spent yet</h3>
        <p>Expenses will be broken down here by category once you add some.</p>
      </div>`;
    return;
  }

  const totals = {};
  expenseEntries.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const rows = Object.entries(totals).sort((a,b) => b[1] - a[1]);

  rows.forEach(([catId, amt]) => {
    const meta = findCategoryMeta("expense", catId);
    const pct = expense > 0 ? (amt / expense) * 100 : 0;
    const li = document.createElement("li");
    li.className = "category-row";
    li.innerHTML = `
      <span class="cat-label">${meta.emoji} ${meta.label}</span>
      <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
      <span class="cat-amount">${money(amt)}</span>
    `;
    categoryBreakdown.appendChild(li);
  });
}

populateCategorySelect(currentEntryType);
renderDayView();

})();