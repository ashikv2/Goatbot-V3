const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

"; // ðŸ”´ à¦¨à¦¿à¦œà§‡à¦° UID à¦¬à¦¸à¦¾à¦“

/* ðŸ‘¤ WORKING PROFILE PICTURE SYSTEM */
async function getProfilePicture(uid) {
try {
const url = https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662;
return await loadImage(url);
} catch (e) {
return null;
}
}

const fontDir = path.join(__dirname, "assets", "font");
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

if (fs.existsSync(path.join(fontDir, "Orbitron-Bold.ttf"))) {
registerFont(path.join(fontDir, "Orbitron-Bold.ttf"), { family: "Orbitron" });
}

module.exports = {
config: {
name: "owner",
version: "3.1",
author: "Ashik",
role: 0,
shortDescription: "Neon Galaxy Owner Card",
category: "owner",
guide: "{pn}"
},

onStart: async function ({ api, event }) {
  
const canvas = createCanvas(900, 1200);  
const ctx = canvas.getContext("2d");  

/* ðŸ–¤ BLACK GALAXY BACKGROUND */  
ctx.fillStyle = "#000";  
ctx.fillRect(0, 0, canvas.width, canvas.height);  

/* ðŸŒŒ STARS */  
const starColors = ["#ff69b4", "#a855f7", "#ffffff", "#facc15"];  
for (let i = 0; i < 450; i++) {  
  ctx.fillStyle = starColors[Math.floor(Math.random() * starColors.length)];  
  ctx.shadowBlur = Math.random() * 18 + 6;  
  ctx.shadowColor = ctx.fillStyle;  
  ctx.fillRect(  
    Math.random() * canvas.width,  
    Math.random() * canvas.height,  
    Math.random() * 2 + 1,  
    Math.random() * 2 + 1  
  );  
}  
ctx.shadowBlur = 0;  

/* ðŸŒˆ RAINBOW FRAME */  
const frameGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);  
frameGrad.addColorStop(0, "#ff0000");  
frameGrad.addColorStop(0.2, "#ff00ff");  
frameGrad.addColorStop(0.4, "#00ffff");  
frameGrad.addColorStop(0.6, "#00ff00");  
frameGrad.addColorStop(0.8, "#ffff00");  
frameGrad.addColorStop(1, "#ff0000");  

ctx.lineWidth = 10;  
ctx.strokeStyle = frameGrad;  
ctx.shadowBlur = 25;  
ctx.shadowColor = "#ffffff";  
ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);  
ctx.shadowBlur = 0;  

/* ðŸŒˆ PROFILE IMAGE */  
const avatar = await getProfilePicture(OWNER_UID);  
const cx = canvas.width / 2;  
const cy = 220;  
const r = 130;  

if (avatar) {  
  const ring = ctx.createLinearGradient(cx - r, 0, cx + r, 0);  
  ring.addColorStop(0, "#ff0000");  
  ring.addColorStop(0.25, "#ff00ff");  
  ring.addColorStop(0.5, "#00ffff");  
  ring.addColorStop(0.75, "#00ff00");  
  ring.addColorStop(1, "#ffff00");  

  ctx.beginPath();  
  ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);  
  ctx.strokeStyle = ring;  
  ctx.lineWidth = 8;  
  ctx.shadowBlur = 35;  
  ctx.shadowColor = "#ffffff";  
  ctx.stroke();  
  ctx.shadowBlur = 0;  

  ctx.save();  
  ctx.beginPath();  
  ctx.arc(cx, cy, r, 0, Math.PI * 2);  
  ctx.clip();  
  ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);  
  ctx.restore();  
}  

/* ðŸ§‘ NAME */  
ctx.textAlign = "center";  
ctx.font = "46px Orbitron";  
ctx.fillStyle = "#ffffff";  
ctx.fillText("MOHAMMAD ASHIKUR RAHMAN", cx, 420);  

ctx.font = "24px Orbitron";  
ctx.fillStyle = "#00ffff";  
ctx.fillText("SYSTEM ADMINISTRATOR", cx, 455);  

/* ðŸ“¦ INFO BOX FUNCTION (FIXED) */  
function infoBox(x, y, title, value, boxGlow, textGlow) {  
  const w = 360;  
  const h = 100;  

  ctx.fillStyle = "rgba(0,0,0,0.75)";  
  ctx.shadowBlur = 22;  
  ctx.shadowColor = boxGlow;  
  ctx.fillRect(x, y, w, h);  
  ctx.shadowBlur = 0;  

  ctx.textAlign = "left";  
  ctx.font = "18px Orbitron";  
  ctx.fillStyle = "#cccccc";  
  ctx.fillText(title.toUpperCase(), x + 20, y + 34);  

  ctx.font = "28px Orbitron";  
  ctx.fillStyle = "#ffffff";  
  ctx.shadowBlur = 20;  
  ctx.shadowColor = textGlow;  
  ctx.fillText(value, x + 20, y + 74);  
  ctx.shadowBlur = 0;  
}  

/* â¬… LEFT (PURPLE BOX + PINK TEXT) */  
infoBox(80, 520, "Location", "Dhaka", "#a855f7", "#ff69b4");  
infoBox(80, 650, "Relationships", "Single", "#a855f7", "#ff69b4");  
infoBox(80, 780, "WhatsApp", "01976994818", "#a855f7", "#ff69b4");  

/* âž¡ RIGHT (GREEN BOX + YELLOW TEXT) */  
infoBox(460, 520, "Class", "Secret", "#22c55e", "#facc15");  
infoBox(460, 650, "Facebook", "ASHIK", "#22c55e", "#facc15");  
infoBox(460, 780, "Religion", "Islam", "#22c55e", "#facc15");  

/* ðŸŒˆ RAINBOW BOT NAME BAR */  
const footerGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);  
footerGrad.addColorStop(0, "#ff0000");  
footerGrad.addColorStop(0.2, "#ff00ff");  
footerGrad.addColorStop(0.4, "#00ffff");  
footerGrad.addColorStop(0.6, "#00ff00");  
footerGrad.addColorStop(0.8, "#ffff00");  
footerGrad.addColorStop(1, "#ff0000");  

ctx.fillStyle = footerGrad;  
ctx.shadowBlur = 30;  
ctx.shadowColor = "#ffffff";  
ctx.fillRect(0, 1040, canvas.width, 95);  
ctx.shadowBlur = 0;  

ctx.font = "30px Orbitron";  
ctx.fillStyle = "#000";  
ctx.textAlign = "left";  
ctx.fillText("BOT NAME : ANNIE'S BB'Z", 40, 1098);  

const now = new Date();  
ctx.textAlign = "right";  
ctx.fillText(  
  now.toLocaleDateString() + "  " + now.toLocaleTimeString(),  
  canvas.width - 40,  
  1098  
);  

const filePath = path.join(cacheDir, "owner_card.png");  
fs.writeFileSync(filePath, canvas.toBuffer());  

api.sendMessage(  
  { attachment: fs.createReadStream(filePath) },  
  event.threadID,  
  () => fs.unlinkSync(filePath)  
);

}
};
