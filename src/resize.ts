const app = document.querySelector("#app");

let m_pos = 320;
function resize(e) {
  m_pos = e.y;
  app.style.height = e.y + "px";
}

app.addEventListener(
  "mousedown",
  function (e) {
    if (e.offsetY > m_pos - 4 && e.offsetY <= m_pos) {
      document.addEventListener("mousemove", resize, false);
    }
  },
  false
);

app.addEventListener(
  "mouseup",
  function () {
    document.removeEventListener("mousemove", resize, false);
  },
  false
);
