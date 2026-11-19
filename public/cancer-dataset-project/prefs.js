// Apply saved theme + language before paint (dark + English are the defaults).
  try {
    if (localStorage.getItem("theme") !== "light") document.documentElement.dataset.theme = "dark";
    if (localStorage.getItem("lang") === "nl") document.documentElement.lang = "nl";
  } catch (e) { document.documentElement.dataset.theme = "dark"; }
