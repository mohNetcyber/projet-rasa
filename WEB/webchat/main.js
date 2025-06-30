let lastSentTime = null;

// ---- Connexion WebSocket ----
const socket = io("http://localhost:5005", {
  path: "/socket.io/",
  transports: ["websocket"],
});

// ---- Références DOM ----
const form = document.getElementById("form");
const input = document.getElementById("input");
const box = document.getElementById("messages");

// ---- Connexion établie ----
socket.on("connect", () => {
  console.log("✅ Connecté avec l'ID :", socket.id);

  socket.emit("session_request", { session_id: socket.id });

  addMsg("bot", "Bonjour ! Comment puis‑je vous aider ?");
});

// ---- Envoi de message utilisateur ----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMsg("user", message);
  input.value = "";

  lastSentTime = Date.now();

  socket.emit("user_uttered", {
    message,
    session_id: socket.id,
  });
});

// ---- Affichage d'un message texte simple ----
function addMsg(sender, text) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `message ${sender}`;

  const msgContent = document.createElement("div");
  msgContent.className = "message-content";
  msgContent.innerHTML = DOMPurify.sanitize(marked.parseInline(text));

  msgWrapper.appendChild(msgContent);
  box.appendChild(msgWrapper);
  box.scrollTop = box.scrollHeight;
}

// ---- Affichage d'un message avec image intégrée ----
function addMsgWithImage(text, imageUrl) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = "message bot";

  const msgContent = document.createElement("div");
  msgContent.className = "message-content";
  msgContent.innerHTML = DOMPurify.sanitize(marked.parseInline(text));

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Image envoyée par le bot";
  img.style.maxWidth = "100%";
  img.style.borderRadius = "8px";
  img.style.marginTop = "10px";

  msgContent.appendChild(img);
  msgWrapper.appendChild(msgContent);
  box.appendChild(msgWrapper);
  box.scrollTop = box.scrollHeight;
}

// ---- Gestion des réponses du bot ----
socket.on("bot_uttered", (data) => {
  const now = Date.now();
  if (lastSentTime !== null) {
    const responseTime = now - lastSentTime;
    console.log(`⏱️ Temps de réponse du bot : ${responseTime} ms`);
    lastSentTime = null;
  }

  console.log("📥 Réponse brute du bot :", data);

  const text = data.text || "";
  const image =
    data.image ||
    (data.custom && data.custom.image) ||
    (data.attachment &&
      data.attachment.type === "image" &&
      data.attachment.payload &&
      data.attachment.payload.src);

  if (text && image) {
    addMsgWithImage(text, image);
  } else {
    if (text) addMsg("bot", text);
    if (image) addImg(image);
  }
});


// ---- Affichage d'une image seule ----
function addImg(url) {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot";

  const img = document.createElement("img");
  img.src = url;
  img.alt = "Image envoyée par le bot";
  img.style.maxWidth = "100%";
  img.style.borderRadius = "8px";

  wrapper.appendChild(img);
  box.appendChild(wrapper);
  box.scrollTop = box.scrollHeight;
}
