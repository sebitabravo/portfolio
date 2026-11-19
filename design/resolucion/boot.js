/* Tema y modo de motion antes del primer paint, sin parpadeo. */
(function () {
  var d = document.documentElement
  try { var t = localStorage.getItem("sb-theme"); if (t === "light" || t === "dark") d.dataset.theme = t } catch (e) {}
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  var saveData = navigator.connection && navigator.connection.saveData
  if (!reduce) d.classList.add("motion")
  if (!reduce && !saveData && matchMedia("(hover: hover) and (pointer: fine)").matches) d.classList.add("ambient")
})()
