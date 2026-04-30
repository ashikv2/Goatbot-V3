const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "toprich",
    version: "1.8.0",
    author: "Ashik",
    role: 0,
    shortDescription: "Top 15 Richest Users",
    longDescription: "Display top 15 richest users with Canvas image including profile pics & neon effects",
    category: "economy"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      // Step 1: Send loading ⏳ reaction
      try {
        await api.setMessageReaction("⏳", event.messageID, (err) => {
          if(err) console.log("⏳ reaction failed:", err);
        });
      } catch(e){
        console.log("Failed to send loading reaction:", e);
      }

      // Step 2: Get users
      let allUsers = [];
      try {
        allUsers = await usersData.getAll();
        if (!Array.isArray(allUsers)) allUsers = [];
      } catch(e) {
        console.log("⚠️ usersData.getAll() failed:", e);
        allUsers = [];
      }

      if (!allUsers.length) {
        await api.setMessageReaction("❌", event.messageID);
        return;
      }

      const topUsers = allUsers
        .filter(u => typeof u.money === "number")
        .sort((a,b)=>b.money - a.money)
        .slice(0,15);

      const formatMoney = n => {
  if (n >= 1e9) {
    const val = n / 1e9;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)) + "B $";
  }

  if (n >= 1e6) {
    const val = n / 1e6;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)) + "M $";
  }

  if (n >= 1e3) {
    const val = n / 1e3;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)) + "K $";
  }

  return n + " $";
};

      const defaultAvatar = 'https://i.ibb.co/0Jmshvb/default-avatar.png';
      const accessToken = '6628568379|c1e620fa708a1d5696fb991c1bde5662';

      function getNeonRainbowGradient(ctx, x, y, size){
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.17, '#ff7f00');
        gradient.addColorStop(0.34, '#ffff00');
        gradient.addColorStop(0.51, '#00ff00');
        gradient.addColorStop(0.68, '#0000ff');
        gradient.addColorStop(0.85, '#4b0082');
        gradient.addColorStop(1, '#8b00ff');
        return gradient;
      }

      async function getGraphAvatar(userID){
        try {
          const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=${accessToken}`;
          const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
          return await loadImage(Buffer.from(res.data));
        } catch {
          return await loadImage(defaultAvatar);
        }
      }

      async function safeUser(userID){
        try{
          const info = await api.getUserInfo(userID);
          const avatar = await getGraphAvatar(userID);
          return {
            name: info[userID]?.name || "Facebook User",
            avatar: avatar
          };
        }catch{
          const avatar = await loadImage(defaultAvatar);
          return {name:"Facebook User", avatar: avatar};
        }
      }

      // Step 3: Create canvas
      const canvas = createCanvas(900,1600);
      const ctx = canvas.getContext("2d");

      // Background
      const bgGradient = ctx.createLinearGradient(0,0,0,canvas.height);
      bgGradient.addColorStop(0, "#1a0033");
      bgGradient.addColorStop(1, "#330066");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // Main canvas neon border
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ffff00";
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 10;
      ctx.strokeRect(10,10,canvas.width-20,canvas.height-20);
      ctx.shadowBlur = 0;

      // Title
      ctx.font = "bold 46px Sans";
      ctx.fillStyle = "#ffd700";
      ctx.textAlign = "center";
      ctx.fillText("👑 TOP 15 RICHEST USERS 👑", canvas.width/2, 90);

      const cardW=240, cardH=300, gap=40;
      const startX=(canvas.width-(cardW*3+gap*2))/2;
      const neonColors = ["#ff00ff", "#ff69b4", "#00ff00"];

      // Top 3
      for(let i=0;i<3;i++){
        const user = topUsers[i]; if(!user) continue;
        const {name,avatar} = await safeUser(user.userID);
        const x = startX + i*(cardW+gap), y = 150;

        ctx.fillStyle="#151a2e";
        ctx.fillRect(x,y,cardW,cardH);

        ctx.shadowBlur = 20;
        ctx.shadowColor = i===0 ? "#fff" : neonColors[i];
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = i===0 ? getNeonRainbowGradient(ctx,x,y,cardW) : neonColors[i];
        ctx.strokeRect(x,y,cardW,cardH);
        ctx.shadowBlur = 0;

        ctx.font="bold 32px Sans";
        ctx.fillStyle="#ffd700";
        ctx.textAlign="center";
        ctx.fillText(`#${i+1}`, x+cardW/2, y+40);

        ctx.save();
        ctx.beginPath();
        ctx.arc(x+cardW/2, y+120, 55,0,Math.PI*2);
        ctx.clip();
        ctx.drawImage(avatar, x+cardW/2-55, y+65, 110,110);
        ctx.restore();

        ctx.shadowBlur = 15;
        ctx.shadowColor = i===0 ? "#fff" : neonColors[i];
        ctx.beginPath();
        ctx.arc(x+cardW/2, y+120, 55,0,Math.PI*2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = i===0 ? getNeonRainbowGradient(ctx,x,y,cardW) : neonColors[i];
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font="bold 22px Sans";
        ctx.fillStyle="#ffffff";
        ctx.fillText(name, x+cardW/2, y+220);

        ctx.font="bold 26px Sans";
        ctx.fillStyle="#00ff99";
        ctx.fillText(formatMoney(user.money), x+cardW/2, y+260);
      }

      // List 4-15
      ctx.textAlign="left";
      let baseY=520;
      for(let i=3;i<topUsers.length;i++){
        const user=topUsers[i];
        const {name,avatar} = await safeUser(user.userID);
        const y=baseY+(i-3)*70;

        ctx.fillStyle="#112233";
        ctx.fillRect(60,y,canvas.width-120,60);

        ctx.font="bold 22px Sans";
        ctx.fillStyle="#00ffe1";
        ctx.fillText(`#${i+1}`, 80, y+40);

        ctx.save();
        ctx.beginPath();
        ctx.arc(150,y+30,20,0,Math.PI*2);
        ctx.clip();
        ctx.drawImage(avatar,130,y+10,40,40);
        ctx.restore();

        ctx.font="22px Sans";
        ctx.fillStyle="#ffffff";
        ctx.fillText(name,190,y+40);

        ctx.font="bold 24px Sans";
        ctx.fillStyle="#ffd700";
        ctx.textAlign="right";
        ctx.fillText(formatMoney(user.money),canvas.width-80,y+40);
        ctx.textAlign="left";
      }

      ctx.font="18px Sans";
      ctx.fillStyle="#aaa";
      ctx.textAlign="center";
      ctx.fillText("Generated by Ashik", canvas.width/2, canvas.height-40);

      // Step 4: Save & send image
      const filePath = process.cwd()+"/tmp/toprich.png";
      await fs.ensureDir(process.cwd()+"/tmp");
      await fs.writeFile(filePath, canvas.toBuffer());

      try {
        await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID);
        fs.unlinkSync(filePath);

        // ✅ Success after 4s
        setTimeout(async () => {
          try {
            await api.setMessageReaction("✅", event.messageID);
          } catch(e){ console.log("✅ reaction failed:", e); }
        }, 4000);
      } catch(err){
        fs.unlinkSync(filePath);
        console.log("❌ Sending image failed:", err);
        await api.setMessageReaction("❌", event.messageID);
      }

    } catch(err){
      console.log("❌ toprich command runtime error:",err);
      await api.setMessageReaction("❌", event.messageID);
    }
  }
};