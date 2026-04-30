/**
 * ACTIVITY CARD – GoatBot v2 (PREMIUM FINAL)
 * Yellow Glow + Rainbow Neon + 7 Days Activity
 * Author: Ashik + ChatGPT
 */

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "activity",
    version: "5.1.0",
    author: "Ashik + ChatGPT",
    role: 0,
    category: "group",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const uid = event.senderID;
      const userName = await usersData.getName(uid);

      /* DEMO DATA */
      const rank = 20;
      const totalMsg = 48;
      const busiestDay = "Saturday";
      const busiestCount = 34;

      const weekData = [2, 4, 3, 1, 34, 2, 2];
      const labels = ["Tue","Wed","Thu","Fri","Sat","Sun","Mon"];

      /* CANVAS */
      const canvas = createCanvas(900, 1400);
      const ctx = canvas.getContext("2d");
      ctx.textAlign = "center";

      /* 🌌 BACKGROUND */
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const stars = ["#ff4d4d", "#4da6ff", "#ffffff"];
      for (let i = 0; i < 420; i++) {
        const c = stars[Math.floor(Math.random() * stars.length)];
        ctx.fillStyle = c;
        ctx.shadowColor = c;
        ctx.shadowBlur = Math.random() * 10 + 6;
        ctx.fillRect(Math.random()*900, Math.random()*1400, 2, 2);
      }
      ctx.shadowBlur = 0;

      /* TITLE */
      ctx.font = "bold 40px Sans";
      ctx.fillStyle = "#ffd700";
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 30;
      ctx.fillText("ACTIVITY CARD", 450, 90);
      ctx.shadowBlur = 0;

      /* PROFILE */
      const avatar = await getProfilePicture(uid);
      const cx = 450, cy = 240, r = 88;

      const rainbow = ["#ff004c","#ff9900","#ffee00","#00ff88","#00aaff","#b400ff"];
      ctx.lineWidth = 6;
      ctx.shadowBlur = 35;

      rainbow.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.shadowColor = c;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 6 + i * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
      }

      /* NAME */
      ctx.fillStyle = "#fff";
      ctx.font = "bold 34px Sans";
      ctx.fillText(userName.toUpperCase(), 450, 370);

      /* INFO BOX */
      ctx.fillStyle = "#0b0f2e";
      ctx.fillRect(130, 395, 640, 100);

      ctx.strokeStyle = "#ffd93b";
      ctx.beginPath();
      ctx.moveTo(450, 405);
      ctx.lineTo(450, 485);
      ctx.stroke();

      ctx.fillStyle = "#ffd93b";
      ctx.font = "22px Sans";
      ctx.fillText("Server Rank", 290, 435);
      ctx.fillText("Total Messages", 610, 435);

      ctx.font = "bold 36px Sans";
      ctx.fillText(`#${rank}`, 290, 475);
      ctx.fillText(`${totalMsg}`, 610, 475);

      /* BUSIEST DAY */
      ctx.fillStyle = "#ffd93b";
      ctx.font = "22px Sans";
      ctx.fillText("BUSIEST DAY", 450, 555);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 30px Sans";
      ctx.fillText(`${busiestDay} - ${busiestCount} msgs`, 450, 590);

      /* 7 DAYS TITLE */
      ctx.font = "bold 22px Sans";
      ctx.fillStyle = "#ffd93b";
      ctx.shadowColor = "#ffd93b";
      ctx.shadowBlur = 25;
      ctx.fillText("Last 7 DAYS ACTIVITY", 270, 920);
      ctx.shadowBlur = 0;

      /* BAR CHART */
      const baseY = 820, maxH = 190, barW = 44, gap = 30;
      let barX = 150;
      const maxVal = Math.max(...weekData);

      weekData.forEach((v, i) => {
        const h = (v / maxVal) * maxH;
        const grad = ctx.createLinearGradient(0, baseY - h, 0, baseY);
        grad.addColorStop(0, "#ff3b3b");
        grad.addColorStop(0.5, "#ffd93b");
        grad.addColorStop(1, "#2bff88");

        ctx.shadowBlur = 18;
        ctx.shadowColor =
          v > maxVal * 0.7 ? "#ff3b3b" :
          v > maxVal * 0.4 ? "#ffd93b" : "#2bff88";

        ctx.fillStyle = grad;
        ctx.fillRect(barX, baseY - h, barW, h);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff";
        ctx.font = "16px Sans";
        ctx.fillText(v, barX + barW/2, baseY - h - 8);
        ctx.fillStyle = "#aaa";
        ctx.font = "18px Sans";
        ctx.fillText(labels[i], barX + barW/2, baseY + 26);

        barX += barW + gap;
      });

      /* ===== ACCURATE DONUT ACTIVITY ===== */
      const totalActivity = weekData.reduce((a,b)=>a+b,0);
      const maxDay = Math.max(...weekData);

      let low=0, mid=0, high=0;
      weekData.forEach(v=>{
        if(v<=maxDay*0.33) low+=v;
        else if(v<=maxDay*0.66) mid+=v;
        else high+=v;
      });

      const donutData = [
        { label:"Low Activity", val:low, col:"#2bff88" },
        { label:"Medium Activity", val:mid, col:"#9b5cff" },
        { label:"High Activity", val:high, col:"#ff9f1a" }
      ];

      const dx=280, dy=1050, dr=95;
      let start=0;

      donutData.forEach(d=>{
        const ang=(d.val/totalActivity)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(dx,dy);
        ctx.arc(dx,dy,dr,start,start+ang);
        ctx.fillStyle=d.col;
        ctx.shadowColor=d.col;
        ctx.shadowBlur=28;
        ctx.fill();
        start+=ang;
      });
      ctx.shadowBlur=0;

      ctx.fillStyle="#000";
      ctx.beginPath();
      ctx.arc(dx,dy,45,0,Math.PI*2);
      ctx.fill();

      ctx.fillStyle="#ffd93b";
      ctx.font="bold 22px Sans";
      ctx.fillText(totalActivity+" acts",dx,dy+8);

      ctx.textAlign="left";
      ctx.font="22px Sans";
      donutData.forEach((d,i)=>{
        ctx.fillStyle=d.col;
        ctx.fillText(
          `${d.label} ${(d.val/totalActivity*100).toFixed(1)}%`,
          470,1010+i*40
        );
      });

      /* SAVE */
      const file = path.join(__dirname,"cache",`activity_${uid}.png`);
      fs.ensureDirSync(path.dirname(file));
      fs.writeFileSync(file,canvas.toBuffer());
      await api.sendMessage({attachment:fs.createReadStream(file)},event.threadID);
      fs.unlinkSync(file);

    } catch(e){
      console.error(e);
      api.sendMessage("❌ Activity card generate করতে সমস্যা হয়েছে",event.threadID);
    }
  }
};

/* 👤 FB PROFILE SYSTEM */
async function getProfilePicture(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    return await loadImage(url);
  } catch {
    return null;
  }
}