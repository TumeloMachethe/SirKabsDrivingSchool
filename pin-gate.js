/* PIN gate for Study Hub (Level 1: front-end only).
   To change the PIN: open your browser console and run
   crypto.subtle.digest("SHA-256", new TextEncoder().encode("YOURPIN")).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")))
   then paste the result into PIN_HASH below. Current PIN: 482913 (change it!) */
(function () {
  const PIN_HASH = "4a8eec4925826f4b60526d7ac3c0a9b61ef54ac19233bafce2f4a13eb49395d2";
  const KEY = "sk_study_unlocked";
  const links = [...document.querySelectorAll(".material-link[data-href]")];
  if (!links.length) return;

  const sha256 = async t => {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  };

  function unlock(silent) {
    links.forEach(a => {
      a.setAttribute("href", a.dataset.href);
      a.classList.remove("is-locked");
      a.removeEventListener("click", ask);
    });
    if (!silent && typeof showToast === "function") showToast("Unlocked. Tap a PDF to open it.");
  }

  const overlay = document.createElement("div");
  overlay.className = "pin-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = '<div class="pin-box"><div class="pin-lock">🔒</div><h2>Enter PIN</h2><p>Enter the Study Hub PIN to open the study material. Don\'t have it? Ask Sir Kabs.</p><input type="password" inputmode="numeric" autocomplete="off" placeholder="••••••" aria-label="PIN"><div class="pin-msg" role="alert"></div><div class="pin-actions"><button type="button" class="btn btn-primary pin-ok">Unlock</button><button type="button" class="pin-cancel">Cancel</button></div></div>';
  document.body.appendChild(overlay);
  const box = overlay.querySelector(".pin-box");
  const input = overlay.querySelector("input");
  const msg = overlay.querySelector(".pin-msg");

  const close = () => overlay.classList.remove("show");
  function ask(e) { e.preventDefault(); input.value = ""; msg.textContent = ""; overlay.classList.add("show"); setTimeout(() => input.focus(), 50); }

  async function submit() {
    if (!window.crypto || !crypto.subtle) { msg.textContent = "Please open this site over HTTPS."; return; }
    if (await sha256(input.value.trim()) === PIN_HASH) {
      try { sessionStorage.setItem(KEY, "1"); } catch (_) {}
      close(); unlock(false);
    } else {
      msg.textContent = "Wrong PIN, try again.";
      box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
      input.select();
    }
  }

  overlay.querySelector(".pin-ok").addEventListener("click", submit);
  overlay.querySelector(".pin-cancel").addEventListener("click", close);
  input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  let already = false;
  try { already = sessionStorage.getItem(KEY) === "1"; } catch (_) {}
  if (already) unlock(true);
  else links.forEach(a => { a.classList.add("is-locked"); a.addEventListener("click", ask); });
})();
