const LIMIT = 5;
const DEBOUNCE_MS = 250;
const $ = id => document.getElementById(id);
const $q = $("q"), $drop = $("drop"), $theme = $("theme"), $lang = $("lang"), $fbtn = $("fbtn"), $fpanel = $("fpanel");
const $hbtn = $("hbtn"), $hpanel = $("hpanel");
const $gbtn = $("gbtn"), $gpanel = $("gpanel"), $gq = $("gq"), $gsug = $("gsug"), $gcard = $("gcard");
let timer = null, controller = null, active = -1;
let lastData = null, facetsData = null;

// ---------- translations ----------
// Dataset names and holders are proper names and stay as they are.
const I18N = {
  en: {
    placeholder: "Search cancer databases",
    searchLabel: "Search cancer databases",
    filter: "Filter", filters: "Filters", clear: "Clear filters",
    groups: { type: "Type", access: "Access", cancer: "Cancer type" },
    type: { registry: "registry", biobank: "biobank", cohort: "cohort", catalog: "catalog" },
    access: { open: "open access", request: "on request", contact: "contact holder" },
    accessTip: {
      open: "Freely available: use it directly.",
      request: "Apply through the holder's formal data request procedure.",
      contact: "No formal procedure: email the organisation that holds the data.",
    },
    cancer: {
      all: "all cancer types", breast: "breast", colorectal: "colorectal", lung: "lung",
      pancreatic: "pancreatic", melanoma: "melanoma", "upper-gi": "upper GI",
      pediatric: "pediatric", metastatic: "metastatic",
    },
    broken: "⚠ Link unverified",
    brokenTip: "Our weekly link check failed; the source may have moved.",
    noMatch: "No matches. Try another term or fewer filters.",
    unavailable: "Search is unavailable right now. Please try again.",
    filtersUnavailable: "Filters unavailable: is the backend up to date? Restart uvicorn.",
    toDark: "Switch to dark mode", toLight: "Switch to light mode",
    langBtn: "Language: English. Click for Dutch",
    guide: "Access guide: how to apply",
    guidePh: "Type your dataset",
    guideHint: "Type a dataset name to see how to apply for access.",
    hasGuide: "guide", noGuideTag: "no guide yet",
    noGuide: "No access guide yet for this dataset.",
    openSource: "Open the dataset page",
    gSteps: "How to apply", gDocs: "What you need", gReview: "Reviewed by", gDuration: "Duration",
    gCost: "Cost", gDelivery: "How you get the data", gConditions: "Conditions", gNotes: "Good to know",
    gGo: "Start here", gChecked: "Last checked", gContact: "Questions",
    gBack: "Other dataset", source: "source", noSuggest: "No dataset found.",
    help: "How this site works",
    hSearchT: "Searching",
    hSearch: ["Type anything in English or Dutch.", "<i>borstkanker</i> finds the same as <i>breast</i>.", "Typos are fine."],
    hFilterT: "Filters",
    hFilter: ["Narrow results by type, access or cancer type."],
    hResultT: "Reading a result",
    hResult: ["Click a name to open the source in a new tab.", "The labels on the right mean:"],
    hType: "Type", hAccess: "Access", hCancer: "Cancer", hWarn: "Warning",
    hWarnText: "our weekly link check failed; the source may have moved",
    hGuideT: "Access guide",
    hGuide: ["Type a dataset name.", "See how to apply, step by step.", "See what you need.", "Every fact links to its source."],
    hViewT: "Theme & language",
    hView: ["☾ / ☀ switches light and dark mode.", "The flag switches between English and Dutch."],
    hKeysT: "Keyboard",
    hKeys: ["<kbd>↑</kbd> <kbd>↓</kbd> move through results", "<kbd>Enter</kbd> opens", "<kbd>Esc</kbd> closes menus"],
  },
  nl: {
    placeholder: "Zoek kankerdatabases",
    searchLabel: "Zoek kankerdatabases",
    filter: "Filter", filters: "Filters", clear: "Filters wissen",
    groups: { type: "Soort", access: "Toegang", cancer: "Kankersoort" },
    type: { registry: "registratie", biobank: "biobank", cohort: "cohort", catalog: "catalogus" },
    access: { open: "open toegang", request: "op aanvraag", contact: "contact houder" },
    accessTip: {
      open: "Vrij beschikbaar: direct te gebruiken.",
      request: "Aanvragen via de formele dataprocedure van de houder.",
      contact: "Geen formele procedure: mail de organisatie die de data beheert.",
    },
    cancer: {
      all: "alle kankersoorten", breast: "borst", colorectal: "darm", lung: "long",
      pancreatic: "alvleesklier", melanoma: "melanoom", "upper-gi": "slokdarm/maag",
      pediatric: "kinderen", metastatic: "uitgezaaid",
    },
    broken: "⚠ Link niet geverifieerd",
    brokenTip: "Onze wekelijkse linkcontrole is mislukt; de bron is mogelijk verplaatst.",
    noMatch: "Geen resultaten. Probeer een andere term of minder filters.",
    unavailable: "Zoeken is nu niet beschikbaar. Probeer het opnieuw.",
    filtersUnavailable: "Filters niet beschikbaar: is de backend bijgewerkt? Herstart uvicorn.",
    toDark: "Donkere modus", toLight: "Lichte modus",
    langBtn: "Taal: Nederlands. Klik voor Engels",
    guide: "Toegangsgids: zo vraag je aan",
    guidePh: "Typ je dataset",
    guideHint: "Typ de naam van een dataset om te zien hoe je toegang aanvraagt.",
    hasGuide: "gids", noGuideTag: "nog geen gids",
    noGuide: "Nog geen toegangsgids voor deze dataset.",
    openSource: "Open de datasetpagina",
    gSteps: "Zo vraag je aan", gDocs: "Wat je nodig hebt", gReview: "Beoordeeld door", gDuration: "Doorlooptijd",
    gCost: "Kosten", gDelivery: "Zo krijg je de data", gConditions: "Voorwaarden", gNotes: "Goed om te weten",
    gGo: "Begin hier", gChecked: "Laatst gecontroleerd", gContact: "Vragen",
    gBack: "Andere dataset", source: "bron", noSuggest: "Geen dataset gevonden.",
    help: "Zo werkt deze site",
    hSearchT: "Zoeken",
    hSearch: ["Typ alles in het Nederlands of Engels.", "<i>borstkanker</i> vindt hetzelfde als <i>breast</i>.", "Typfouten zijn geen probleem."],
    hFilterT: "Filters",
    hFilter: ["Verfijn op soort, toegang of kankersoort."],
    hResultT: "Een resultaat lezen",
    hResult: ["Klik op een naam om de bron in een nieuw tabblad te openen.", "De labels rechts betekenen:"],
    hType: "Soort", hAccess: "Toegang", hCancer: "Kanker", hWarn: "Waarschuwing",
    hWarnText: "onze wekelijkse linkcontrole is mislukt; de bron is mogelijk verplaatst",
    hGuideT: "Toegangsgids",
    hGuide: ["Typ de naam van een dataset.", "Zie stap voor stap hoe je aanvraagt.", "Zie wat je nodig hebt.", "Elk feit linkt naar de bron."],
    hViewT: "Thema & taal",
    hView: ["☾ / ☀ wisselt tussen lichte en donkere modus.", "De vlag wisselt tussen Nederlands en Engels."],
    hKeysT: "Toetsenbord",
    hKeys: ["<kbd>↑</kbd> <kbd>↓</kbd> door resultaten", "<kbd>Enter</kbd> opent", "<kbd>Esc</kbd> sluit menu's"],
  },
};
let lang = document.documentElement.lang === "nl" ? "nl" : "en";
const T = () => I18N[lang];
const tr = (group, v) => T()[group]?.[v] ?? v;   // unknown values fall back to the raw value
const cap = t => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
const label = (group, v) => cap(tr(group, v));    // category text on pills: "On request", "Upper GI"

const FLAGS = {
  // Union Jack (60×30), cropped to the square button
  en: `<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
         <clipPath id="ukc"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath>
         <rect width="60" height="30" fill="#012169"/>
         <path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/>
         <path d="M0,0L60,30M60,0L0,30" clip-path="url(#ukc)" stroke="#C8102E" stroke-width="4"/>
         <path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/>
         <path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/>
       </svg>`,
  // Netherlands
  nl: `<svg viewBox="0 0 9 6" preserveAspectRatio="none" aria-hidden="true">
         <rect width="9" height="2" fill="#AE1C28"/><rect y="2" width="9" height="2" fill="#fff"/>
         <rect y="4" width="9" height="2" fill="#21468B"/>
       </svg>`,
};

const MOON_ICON = `<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>`;
const SUN_ICON = `<svg class="sun" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="4.5"/>
  <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" fill="none"/>
</svg>`;
const INFO_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg>`;
const HELP_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4.1"/><circle cx="12" cy="17.4" r=".6" fill="currentColor"/></svg>`;
const BACK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5.5"/><path d="M11 5.5 4.5 12l6.5 6.5"/></svg>`;
const FILTER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z"/></svg>`;
// Display order in the filter panel: access easiest → hardest, like a traffic light.
const ORDER = { type: ["registry", "cohort", "biobank", "catalog"], access: ["open", "request", "contact"] };
const ordered = (param, entries) => {
  const o = ORDER[param]; if (!o) return entries;
  const rank = v => (o.indexOf(v) + 1) || 99;
  return [...entries].sort((a, b) => rank(a[0]) - rank(b[0]));
};
const GROUPS = [["type", "type"], ["access", "access"], ["cancer_types", "cancer"]];  // [facet key, query param]
const selected = { type: new Set(), access: new Set(), cancer: new Set() };

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const pillClass = (param, v) => param === "cancer" ? "cancer" : v;
const pill = (cls, text, title = "") =>
  `<span class="pill ${esc(cls)}"${title ? ` title="${esc(title)}"` : ""}>${esc(text)}</span>`;

// ---------- theme toggle ----------
function renderTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  const icon = dark ? "sun" : "moon";
  if ($theme.dataset.icon !== icon) {            // swap (and animate) only on a real theme change
    $theme.innerHTML = dark ? SUN_ICON : MOON_ICON;
    $theme.dataset.icon = icon;
  }
  $theme.title = dark ? T().toLight : T().toDark;
  $theme.setAttribute("aria-label", $theme.title);
}
$theme.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  renderTheme();
});

// ---------- language toggle ----------
function renderLanguage() {
  document.documentElement.lang = lang;
  $lang.innerHTML = FLAGS[lang];
  $lang.title = T().langBtn;
  $lang.setAttribute("aria-label", T().langBtn);
  $q.placeholder = T().placeholder;
  $q.setAttribute("aria-label", T().searchLabel);
  $fbtn.title = T().filter;
  $fbtn.setAttribute("aria-label", T().filter);
  $fpanel.setAttribute("aria-label", T().filters);
  $gbtn.title = T().guide;
  $gbtn.setAttribute("aria-label", T().guide);
  $gpanel.setAttribute("aria-label", T().guide);
  $hbtn.title = T().help;
  $hbtn.setAttribute("aria-label", T().help);
  $hpanel.setAttribute("aria-label", T().help);
  renderHelp();
  $gq.placeholder = T().guidePh;
  $gq.setAttribute("aria-label", T().guidePh);
  renderGuide();
  renderTheme();
  renderFacets();
  if (lastData && isOpen($drop)) renderResults(lastData, true);
}
$lang.addEventListener("click", () => {
  lang = lang === "en" ? "nl" : "en";
  try { localStorage.setItem("lang", lang); } catch (e) {}
  renderLanguage();
});

// ---------- filters ----------
async function loadFacets() {
  try {
    const res = await apiFetch("/api/facets");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    facetsData = await res.json();
  } catch (e) {
    console.error("Loading /api/facets failed:", e);
    facetsData = null;
  }
  renderFacets();
}

function renderFacets() {
  if (!facetsData) { $fpanel.innerHTML = `<div class="info">${esc(T().filtersUnavailable)}</div>`; return; }
  $fpanel.innerHTML = GROUPS.map(([key, param]) => `
    <h3>${esc(T().groups[param])}</h3>
    <div class="opts">${ordered(param, Object.entries(facetsData[key] || {})).map(([v, n]) => {
      const on = selected[param].has(v);
      const tip = param === "access" ? ` title="${esc(tr("accessTip", v))}"` : "";
      return `<span class="pill ${esc(pillClass(param, v))}${on ? " on" : ""}"${tip} role="checkbox" aria-checked="${on}"
                    tabindex="0" data-param="${param}" data-value="${esc(v)}">${esc(label(param, v))} (${n})</span>`;
    }).join("")}</div>`).join("") + `<div class="factions"><button id="fclear" type="button">${esc(T().clear)}</button></div>`;
}

function updateFilterButton() {
  const n = Object.values(selected).reduce((a, s) => a + s.size, 0);
  $fbtn.innerHTML = FILTER_ICON + (n ? `<span class="n">${n}</span>` : "");
}

function deselectAnim(el) {
  el.classList.remove("unpop");
  void el.offsetWidth;                 // restart the animation if clicked quickly
  el.classList.add("unpop");
  el.addEventListener("animationend", () => el.classList.remove("unpop"), { once: true });
}

function toggleOption(el) {
  const set = selected[el.dataset.param], v = el.dataset.value;
  const on = !set.has(v);
  on ? set.add(v) : set.delete(v);
  el.classList.toggle("on", on);
  el.setAttribute("aria-checked", on);
  if (!on) deselectAnim(el);
  updateFilterButton();
  run();
}

$fpanel.addEventListener("click", e => {
  if (e.target.id === "fclear") {
    Object.values(selected).forEach(s => s.clear());
    $fpanel.querySelectorAll(".pill.on").forEach(p => {
      p.classList.remove("on"); p.setAttribute("aria-checked", "false"); deselectAnim(p);
    });
    updateFilterButton(); run(); return;
  }
  const el = e.target.closest(".pill[data-param]");
  if (el) toggleOption(el);
});
$fpanel.addEventListener("keydown", e => {
  const el = e.target.closest(".pill[data-param]");
  if (el && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggleOption(el); }
});
$fbtn.addEventListener("click", () => {
  const open = !isOpen($fpanel);
  if (open) { closeGuide(); closeHelp(); show($fpanel); } else hide($fpanel);
  $fbtn.setAttribute("aria-expanded", open);
  if (open && !facetsData) loadFacets();   // retry if the first load failed
});

// ---------- open / close with animation ----------
function show(el) { el.classList.remove("closing"); el.classList.add("open"); }
function hide(el) {
  if (!el.classList.contains("open") || el.classList.contains("closing")) return;
  el.classList.add("closing");
  if (getComputedStyle(el).animationName === "none") {      // reduced motion / first paint
    el.classList.remove("open", "closing"); return;
  }
  el.addEventListener("animationend", function done(e) {
    if (e.target !== el) return;                              // ignore pill pop animations
    el.removeEventListener("animationend", done);
    if (el.classList.contains("closing")) el.classList.remove("open", "closing");
  });
}
const isOpen = el => el.classList.contains("open") && !el.classList.contains("closing");
function closePanel() { hide($fpanel); $fbtn.setAttribute("aria-expanded", "false"); }

// ---------- access guide ----------
let gState = { view: "search", items: [], active: -1, guide: null, error: false };
let gTimer = null, gController = null;

function closeGuide() { hide($gpanel); $gbtn.setAttribute("aria-expanded", "false"); }

$gbtn.addEventListener("click", () => {
  const open = !isOpen($gpanel);
  if (open) {
    closePanel(); closeHelp(); show($gpanel);
    if (gState.view === "search") { renderGuide(); if (!gState.items.length) suggest(); setTimeout(() => $gq.focus(), 0); }
  } else hide($gpanel);
  $gbtn.setAttribute("aria-expanded", open);
});

async function suggest() {
  if (gController) gController.abort();
  gController = new AbortController();
  try {
    const res = await apiFetch(`/api/access?q=${encodeURIComponent($gq.value.trim())}`, { signal: gController.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    gState.items = await res.json(); gState.error = false;
  } catch (e) {
    if (e.name === "AbortError") return;
    gState.items = []; gState.error = true;
  }
  gState.active = gState.items.length ? 0 : -1;
  renderGuide();
}

async function openGuide(id) {
  try {
    const res = await apiFetch(`/api/access/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    gState.guide = await res.json(); gState.view = "card"; gState.error = false;
  } catch (e) { gState.error = true; }
  renderGuide();
}

const txt = f => (f && f.text && (f.text[lang] || f.text.en)) || "";
const srcLink = f => f && f.source
  ? `<a class="src" href="${esc(f.source)}" target="_blank" rel="noopener noreferrer">[${esc(T().source)} ↗]</a>` : "";
function section(title, facts, ordered = false) {
  if (!facts || !facts.length) return "";
  const tag = ordered ? "ol" : "ul";
  return `<h3>${esc(title)}</h3><${tag}>${facts.map(f => `<li>${esc(txt(f))}${srcLink(f)}</li>`).join("")}</${tag}>`;
}

function renderGuide() {
  const t = T();
  if (gState.view === "card" && gState.guide) {
    $gq.style.display = "none"; $gsug.innerHTML = "";
    const d = gState.guide, g = d.access_route;
    const head = `<button class="gback" type="button" data-act="back" title="${esc(t.gBack)}" aria-label="${esc(t.gBack)}">${BACK_ICON}</button>
      <h2>${esc(d.name)}</h2>
      <div class="meta">${esc(d.holder)}</div>
      <div class="pills" style="flex-direction:row;flex-wrap:wrap;align-items:center">
        ${pill(d.type, label("type", d.type))}${pill(d.access, label("access", d.access), tr("accessTip", d.access))}
      </div>`;
    if (!g) {
      $gcard.innerHTML = `<div class="gcard">${head}<p class="gnote">${esc(t.noGuide)}</p>
        <div class="gfoot"><span></span><a class="gbtn-go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(t.openSource)} ↗</a></div></div>`;
      return;
    }
    $gcard.innerHTML = `<div class="gcard">${head}
      ${section(t.gSteps, g.steps, true)}
      ${section(t.gDocs, g.documents)}
      ${section(t.gReview, g.reviewed_by)}
      ${section(t.gDuration, g.duration)}
      ${section(t.gCost, g.cost)}
      ${section(t.gDelivery, g.delivery)}
      ${section(t.gConditions, g.conditions)}
      ${section(t.gNotes, g.notes)}
      ${g.contact ? `<h3>${esc(t.gContact)}</h3><ul><li><a class="src" style="font-size:14px;margin:0" href="mailto:${esc(g.contact)}">${esc(g.contact)}</a></li></ul>` : ""}
      <div class="gfoot">
        <span>${esc(t.gChecked)}: ${esc(g.last_checked || "—")}</span>
        <a class="gbtn-go" href="${esc(g.request_url || d.url)}" target="_blank" rel="noopener noreferrer">${esc(t.gGo)} ↗</a>
      </div></div>`;
    return;
  }
  // search view
  $gq.style.display = ""; $gcard.innerHTML = "";
  if (gState.error) { $gsug.innerHTML = `<p class="gnote">${esc(t.unavailable)}</p>`; return; }
  if (!gState.items.length) {
    $gsug.innerHTML = `<p class="gnote">${esc($gq.value.trim() ? t.noSuggest : t.guideHint)}</p>`; return;
  }
  $gsug.innerHTML = gState.items.map((it, i) => `
    <button class="gs${i === gState.active ? " active" : ""}" type="button" data-id="${esc(it.id)}">
      ${it.has_guide ? "" : `<span class="tag">${esc(t.noGuideTag)}</span>`}
      ${esc(it.name)}<br><small>${esc(it.holder)}</small>
    </button>`).join("");
}

$gq.addEventListener("input", () => { clearTimeout(gTimer); gTimer = setTimeout(suggest, DEBOUNCE_MS); });
$gq.addEventListener("keydown", e => {
  const n = gState.items.length;
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && n) {
    e.preventDefault();
    gState.active = (gState.active + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
    renderGuide();
  } else if (e.key === "Enter" && gState.active >= 0) {
    e.preventDefault(); openGuide(gState.items[gState.active].id);
  }
});
$gpanel.addEventListener("click", e => {
  const s = e.target.closest(".gs");
  if (s) { openGuide(s.dataset.id); return; }
  if (e.target.closest("[data-act=back]")) {
    gState.view = "search"; gState.guide = null; renderGuide(); $gq.focus();
  }
});

// ---------- help / tutorial ----------
function closeHelp() { hide($hpanel); $hbtn.setAttribute("aria-expanded", "false"); }

function renderHelp() {
  const t = T();
  const icon = svg => svg.replace("<svg ", '<svg width="14" height="14" ');
  const lines = arr => arr.map(l => `<p>${l}</p>`).join("");   // one sentence per line
  // Strings with <i>/<kbd> are our own constants (not user input), so they are inserted as HTML.
  $hpanel.innerHTML = `
    <h2>${esc(t.help)}</h2>
    <h3>${esc(t.hSearchT)}</h3>${lines(t.hSearch)}
    <h3>${icon(FILTER_ICON)} ${esc(t.hFilterT)}</h3>${lines(t.hFilter)}
    <h3>${esc(t.hResultT)}</h3>${lines(t.hResult)}
    <div class="legend">
      <span>${esc(t.hType)}</span>
      <span class="row-pills">${["registry", "cohort", "biobank", "catalog"].map(v => pill(v, label("type", v))).join("")}</span>
      <span>${esc(t.hAccess)}</span>
      <span class="row-pills">${["open", "request", "contact"].map(v => pill(v, label("access", v), tr("accessTip", v))).join('<span class="arrow">→</span>')}</span>
      <span>${esc(t.hCancer)}</span>
      <span class="row-pills">${["all", "breast", "pediatric"].map(v => pill("cancer", label("cancer", v))).join("")}</span>
      <span>${esc(t.hWarn)}</span>
      <span class="row-pills">${pill("broken", t.broken)} <span class="arrow">${esc(t.hWarnText)}</span></span>
    </div>
    <h3>${icon(INFO_ICON)} ${esc(t.hGuideT)}</h3>${lines(t.hGuide)}
    <h3>${esc(t.hViewT)}</h3>${lines(t.hView)}
    <h3>${esc(t.hKeysT)}</h3><ul class="keys">${t.hKeys.map(k => `<li>${k}</li>`).join("")}</ul>`;
}

$hbtn.addEventListener("click", () => {
  const open = !isOpen($hpanel);
  if (open) { closePanel(); closeGuide(); show($hpanel); } else hide($hpanel);
  $hbtn.setAttribute("aria-expanded", open);
});

// ---------- results dropdown ----------
function openDrop(html, keepActive = false) {
  $drop.innerHTML = html; show($drop);
  $q.setAttribute("aria-expanded", "true");
  const rows = $drop.querySelectorAll(".row");
  if (keepActive && rows[active]) rows[active].classList.add("active"); else active = -1;
}
function closeDrop() { hide($drop); $q.setAttribute("aria-expanded", "false"); active = -1; }

function row(d) {
  const pills = [
    pill(d.type, label("type", d.type)),
    pill(d.access, label("access", d.access), tr("accessTip", d.access)),
    ...(d.cancer_types || []).map(t => pill("cancer", label("cancer", t))),
  ];
  if (d.link_status === "broken") pills.push(pill("broken", T().broken, T().brokenTip));
  return `
    <a class="row" role="option" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">
      <div>
        <div class="name">${esc(d.name)}</div>
        <div class="meta">${esc(d.holder)}</div>
      </div>
      <div class="pills">${pills.join("")}</div>
    </a>`;
}

function renderResults(data, keepActive = false) {
  if (data.error) { openDrop(`<div class="info">${esc(T().unavailable)}</div>`); return; }
  if (!data.total) { openDrop(`<div class="info">${esc(T().noMatch)}</div>`); return; }
  openDrop(data.results.map(row).join(""), keepActive);
}

function hasFilters() { return Object.values(selected).some(s => s.size); }

async function run() {
  const query = $q.value.trim();
  if (!query && !hasFilters()) { lastData = null; closeDrop(); return; }
  if (controller) controller.abort();          // drop stale in-flight request
  controller = new AbortController();
  const params = new URLSearchParams({ q: query, limit: LIMIT });
  for (const [param, set] of Object.entries(selected)) set.forEach(v => params.append(param, v));
  try {
    const res = await apiFetch(`/api/search?${params}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    lastData = await res.json();
  } catch (e) {
    if (e.name === "AbortError") return;
    lastData = { error: true };
  }
  renderResults(lastData);
}

$q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, DEBOUNCE_MS); });
$q.addEventListener("focus", () => {
  closePanel(); closeHelp();
  if (lastData) show($drop);
});

// Keyboard: ↑ ↓ to move, Enter to open, Esc to close.
$q.addEventListener("keydown", e => {
  const rows = [...$drop.querySelectorAll(".row")];
  if (e.key === "Escape") { closeDrop(); return; }
  if (!rows.length || !isOpen($drop)) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    active = (active + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length;
    rows.forEach((r, i) => r.classList.toggle("active", i === active));
  } else if (e.key === "Enter" && active >= 0) {
    e.preventDefault();
    window.open(rows[active].href, "_blank", "noopener");
  }
});

// Click outside closes popups.
document.addEventListener("click", e => {
  // Toggles keep menus open. composedPath(): the clicked icon may already be replaced by re-render.
  const path = e.composedPath();
  if (path.includes($lang) || path.includes($theme)) return;
  const inside = el => path.includes(el);
  if (!inside($("search")) && !inside($("tools"))) closeDrop();
  if (!inside($fbtn) && !inside($fpanel)) closePanel();
  if (!inside($gbtn) && !inside($gpanel)) closeGuide();
  if (!inside($hbtn) && !inside($hpanel)) closeHelp();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { closePanel(); closeGuide(); closeHelp(); } });

updateFilterButton();
$gbtn.innerHTML = INFO_ICON;
$hbtn.innerHTML = HELP_ICON;
renderLanguage();
loadFacets();
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("no-anim")));
