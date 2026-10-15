// ---------- Settings ----------
const GAME_FILE = "game/index.html";   // path to your HTML game (see README steps)

// SHA-256 of the secret code, so the code itself isn't written in this file.
// To change the code, hash your new code at any SHA-256 generator and paste it here.
const CODE_HASH = "2241ae4922c1bbd69ef2b72605e500982acd67b3392d401a6d9f3372ec7ddd8d";

// ---------- Elements ----------
const lock = document.getElementById("lock");
const game = document.getElementById("game");
const frame = document.getElementById("frame");
const input = document.getElementById("code");
const error = document.getElementById("error");
const box = document.querySelector(".lock-box");

// ---------- Helpers ----------
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function openGame() {
  lock.hidden = true;
  game.hidden = false;
  if (!frame.getAttribute("src")) frame.src = GAME_FILE;   // load game only now
}

function closeGame() {
  sessionStorage.removeItem("unlocked");
  frame.removeAttribute("src");
  game.hidden = true;
  lock.hidden = false;
  input.value = "";
  input.focus();
}

async function tryUnlock() {
  const entered = input.value.trim();
  if (!entered) return;

  if ((await sha256(entered)) === CODE_HASH) {
    error.hidden = true;
    try { sessionStorage.setItem("unlocked", "1"); } catch (e) {}
    openGame();
  } else {
    error.hidden = false;
    input.value = "";
    input.focus();
    box.classList.remove("shake");
    void box.offsetWidth;            // restart the animation
    box.classList.add("shake");
  }
}

// ---------- Events ----------
document.getElementById("unlock").addEventListener("click", tryUnlock);
input.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
document.getElementById("lockAgain").addEventListener("click", closeGame);
document.getElementById("fullscreen").addEventListener("click", () => {
  if (frame.requestFullscreen) frame.requestFullscreen();
});

// Stay unlocked for this browser tab only (closing the tab locks it again)
try {
  if (sessionStorage.getItem("unlocked") === "1") openGame();
} catch (e) {}
