let user = JSON.parse(localStorage.getItem("sk_user"));
let needs = JSON.parse(localStorage.getItem("sk_needs")) || [];
let gratitudes = JSON.parse(localStorage.getItem("sk_gratitudes")) || [];

function saveUser() {
  localStorage.setItem("sk_user", JSON.stringify(user));
}

/* ===== AUTH ===== */
function login() {
  const input = document.getElementById("pseudoInput").value.trim();
  user = {
    pseudo: input || "Anonyme" + Math.floor(1000 + Math.random() * 9000),
    aura: 0,
    actionDone: false
  };
  saveUser();
  showApp();
}

function logout() {
  localStorage.removeItem("sk_user");
  location.reload();
}

/* ===== UI ===== */
function showApp() {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("pseudo").innerText = "Bienvenue " + user.pseudo;
  updateAuraUI();
  loadNeeds();
  loadGratitudes();
  checkDailyAction();
}

/* ===== AURA + NIVEAUX ===== */
function updateAuraUI() {
  document.getElementById("aura").innerText = user.aura;
  const box = document.getElementById("userAuraBox");
  const niveau = document.getElementById("niveau");

  box.classList.remove("novice","bienveillant","ange");

  if (user.aura >= 15) {
    box.classList.add("ange");
    niveau.innerText = "🕊️ Ange";
  } else if (user.aura >= 5) {
    box.classList.add("bienveillant");
    niveau.innerText = "💙 Bienveillant";
  } else {
    box.classList.add("novice");
    niveau.innerText = "🌱 Novice";
  }

  saveUser();
}

function addAura(val) {
  user.aura += val;
  updateAuraUI();
}

/* ===== ACTION DU JOUR ===== */
function checkDailyAction() {
  if (user.actionDone) {
    document.getElementById("actionBtn").classList.add("hidden");
    document.getElementById("actionDone").classList.remove("hidden");
  }
}

function doDailyAction() {
  if (!user.actionDone) {
    addAura(1);
    user.actionDone = true;
    checkDailyAction();
  }
}

/* ===== POSTER UN BESOIN ===== */
function postNeed() {
  const text = document.getElementById("needText").value.trim();
  const category = document.getElementById("needCategory").value;
  if (!text) return;

  needs.unshift({
    id: Date.now(),
    category,
    text,
    replies: []
  });

  localStorage.setItem("sk_needs", JSON.stringify(needs));
  document.getElementById("needText").value = "";
  loadNeeds();
}

/* ===== RÉPONDRE + NOTIF ===== */
function replyToNeed(id, inputId) {
  const text = document.getElementById(inputId).value.trim();
  if (!text) return;

  const need = needs.find(n => n.id === id);
  need.replies.push("Anonyme : " + text);

  localStorage.setItem("sk_needs", JSON.stringify(needs));
  addAura(1);
  loadNeeds();
  notify("💛 Quelqu’un a répondu à un besoin");
}

/* ===== AFFICHAGE BESOINS ===== */
function loadNeeds() {
  const container = document.getElementById("needs");
  container.innerHTML = "";

  needs.forEach(need => {
    const div = document.createElement("div");
    div.className = "need";
    const replyId = "reply_" + need.id;

    div.innerHTML = `
      <strong>${need.category}</strong>
      <p>${need.text}</p>
      <input id="${replyId}" placeholder="Répondre anonymement">
      <button onclick="replyToNeed(${need.id}, '${replyId}')">Envoyer</button>
      ${need.replies.map(r => `<div class="reply">${r}</div>`).join("")}
    `;
    container.appendChild(div);
  });
}

/* ===== GRATITUDE ===== */
function sendGratitude() {
  const text = document.getElementById("gratitudeText").value.trim();
  if (!text) return;

  gratitudes.unshift("Anonyme : " + text);
  localStorage.setItem("sk_gratitudes", JSON.stringify(gratitudes));
  addAura(1);
  document.getElementById("gratitudeText").value = "";
  loadGratitudes();
}

/* ===== AFFICHAGE GRATITUDE ===== */
function loadGratitudes() {
  const container = document.getElementById("gratitudes");
  container.innerHTML = "";
  gratitudes.forEach(g => {
    const div = document.createElement("div");
    div.className = "gratitude";
    div.innerText = g;
    container.appendChild(div);
  });
}

/* ===== NOTIFICATION ===== */
function notify(message) {
  const notif = document.getElementById("notification");
  notif.innerText = message;
  notif.classList.remove("hidden");
  notif.classList.add("show");

  setTimeout(() => {
    notif.classList.remove("show");
    notif.classList.add("hidden");
  }, 2500);
}

/* ===== AUTO LOGIN ===== */
if (user) showApp();
/* ===== IA DOUCE – FILTRE BIENVEILLANT ===== */

const motsSensibles = [
  "idiot", "stupide", "nul", "haine", "ferme", "ta gueule",
  "débile", "con", "connard", "merde"
];

function analyserMessage(txt) {
  const message = txt.toLowerCase();
  return motsSensibles.some(mot => message.includes(mot));
}
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("sk_dark", document.body.classList.contains("dark"));
}

if (localStorage.getItem("sk_dark") === "true") {
  document.body.classList.add("dark");
}
/* ===== NOTIFICATIONS ===== */

function getNotifications() {
  return JSON.parse(localStorage.getItem("sk_notifications") || "[]");
}

function saveNotifications(notifs) {
  localStorage.setItem("sk_notifications", JSON.stringify(notifs));
}

function ajouterNotification(texte) {
  const notifs = getNotifications();
  notifs.push({
    texte,
    date: Date.now(),
    lu: false
  });
  saveNotifications(notifs);
  afficherNotifDot();
}

function afficherNotifDot() {
  const notifs = getNotifications();
  const nonLues = notifs.filter(n => !n.lu).length;
  const dot = document.querySelector(".notif-dot");
  if (!dot) return;
  dot.style.display = nonLues > 0 ? "block" : "none";
}
if (besoin.auteur !== utilisateur.pseudo) {
  ajouterNotification("Quelqu’un a répondu à ton besoin 🕊️");
}
function ouvrirNotifications() {
  const notifs = getNotifications();
  if (notifs.length === 0) {
    alert("🕊️ Aucune notification pour le moment");
    return;
  }

  let texte = "🔔 Notifications\n\n";
  notifs.forEach(n => {
    texte += "• " + n.texte + "\n";
    n.lu = true;
  });

  alert(texte);
  saveNotifications(notifs);
  afficherNotifDot();
}
ajouterHistorique("A posté un besoin");
ajouterHistorique("A aidé quelqu’un anonymement");
ajouterHistorique("A accompli l’action du jour");
ajouterHistorique("A accompli l’action du jour");
function voirHistorique() {
  const hist = JSON.parse(localStorage.getItem("sk_historique") || "[]");

  if (hist.length === 0) {
    alert("🌱 Ton parcours est encore vide");
    return;
  }

  let texte = "🧬 Ton parcours invisible\n\n";
  hist.forEach(h => {
    texte += "• " + h.action + " — " + h.date + "\n";
  });

  alert(texte);
}
function getAuraNiveau(aura) {
  if (aura < 20) return "Novice";
  if (aura < 60) return "Bienveillant";
  if (aura < 120) return "Lumineux";
  return "Ange";
}
/* ===== BADGES SILENCIEUX ===== */

const BADGES = {
  nuit: {
    id: "gardien_nuit",
    nom: "🌙 Gardien de la nuit",
    description: "Aide souvent la nuit"
  },
  aide30: {
    id: "main_invisible",
    nom: "🫱 Main invisible",
    description: "30 aides anonymes"
  },
  reconfort: {
    id: "reconforteur",
    nom: "💛 Réconforteur",
    description: "Aide surtout des messages tristes"
  }
};

function getBadges() {
  return JSON.parse(localStorage.getItem("sk_badges") || "[]");
}

function saveBadges(badges) {
  localStorage.setItem("sk_badges", JSON.stringify(badges));
}

function ajouterBadge(badgeId) {
  const badges = getBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    saveBadges(badges);
  }
}
const aides = Number(localStorage.getItem("sk_nb_aides") || 0) + 1;
localStorage.setItem("sk_nb_aides", aides);

if (aides >= 30) {
  ajouterBadge("main_invisible");
}
const heure = new Date().getHours();
if (heure >= 22 || heure <= 5) {
  ajouterBadge("gardien_nuit");
}
const estMal = document.getElementById("besoinMal")?.checked || false;

const besoin = {
  id: Date.now(),
  texte: texteBesoin,
  categorie,
  auteur: utilisateur.pseudo,
  date: Date.now(),
  mal: estMal
};
function envoyerAppelSilencieux() {
  const aura = getAura();
  if (aura < 20) return;

  const appels = JSON.parse(localStorage.getItem("sk_appels") || "[]");
  appels.push({
    date: Date.now(),
    lu: false
  });
  localStorage.setItem("sk_appels", JSON.stringify(appels));
}
