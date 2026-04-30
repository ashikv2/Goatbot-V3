const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const fontDir = path.join(__dirname, 'assets', 'font');
const cacheDir = path.join(__dirname, 'cache');

/* 🅰 Fonts */
try {
    if (fs.existsSync(path.join(fontDir, 'NotoSans-Bold.ttf')))
        registerFont(path.join(fontDir, 'NotoSans-Bold.ttf'), { family: 'NotoSans', weight: 'bold' });
    if (fs.existsSync(path.join(fontDir, 'NotoSans-SemiBold.ttf')))
        registerFont(path.join(fontDir, 'NotoSans-SemiBold.ttf'), { family: 'NotoSans', weight: '600' });
    if (fs.existsSync(path.join(fontDir, 'NotoSans-Regular.ttf')))
        registerFont(path.join(fontDir, 'NotoSans-Regular.ttf'), { family: 'NotoSans', weight: 'normal' });
    if (fs.existsSync(path.join(fontDir, 'BeVietnamPro-Bold.ttf')))
        registerFont(path.join(fontDir, 'BeVietnamPro-Bold.ttf'), { family: 'BeVietnamPro', weight: 'bold' });
    if (fs.existsSync(path.join(fontDir, 'BeVietnamPro-SemiBold.ttf')))
        registerFont(path.join(fontDir, 'BeVietnamPro-SemiBold.ttf'), { family: 'BeVietnamPro', weight: '600' });
} catch {
    console.log("Font fallback enabled");
}

const CURRENCY_SYMBOL = "$";

/* 💰 Balance Short */
function formatShortBalance(amount) {
    const a = Math.abs(amount);
    if (a >= 1e12) return (amount / 1e12).toFixed(2).replace(/\.00$/, '') + "T";
    if (a >= 1e9)  return (amount / 1e9).toFixed(2).replace(/\.00$/, '') + "B";
    if (a >= 1e6)  return (amount / 1e6).toFixed(2).replace(/\.00$/, '') + "M";
    if (a >= 1e3)  return (amount / 1e3).toFixed(2).replace(/\.00$/, '') + "K";
    return amount.toString();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function neonGradient(ctx, x, y, s) {
    const g = ctx.createLinearGradient(x, y, x + s, y + s);
    ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#4b0082','#8b00ff']
        .forEach((c,i)=>g.addColorStop(i/6,c));
    return g;
}

/* 👤 PROFILE PICTURE – FIXED */
async function getProfilePicture(uid) {
    try {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        return await loadImage(url); // redirect-safe
    } catch (err) {
        console.error("Profile load failed:", err.message);
        return null;
    }
}

/* 👤 Default avatar */
function drawDefaultAvatar(ctx, x, y, size) {
    const g = ctx.createRadialGradient(x+size/2,y+size/2,0,x+size/2,y+size/2,size/2);
    g.addColorStop(0,'#22c55e');
    g.addColorStop(1,'#16a34a');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.arc(x+size/2,y+size/2-10,25,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x+size/2,y+size/2+45,40,30,0,Math.PI,0,true);
    ctx.fill();
}

async function createBalanceCard(user, uid, balance) {
    const W=950,H=520;
    const canvas=createCanvas(W,H);
    const ctx=canvas.getContext('2d');

    /* 🌌 Background */
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#000');
    bg.addColorStop(0.5,'#050505');
    bg.addColorStop(1,'#000');
    drawRoundedRect(ctx,0,0,W,H,25);
    ctx.fillStyle=bg;
    ctx.fill();

    /* ⭐ Stars */
    for(let i=0;i<200;i++){
        ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.7})`;
        ctx.beginPath();
        ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.2+0.2,0,Math.PI*2);
        ctx.fill();
    }

    /* 🌈 Border */
    ctx.lineWidth=4;
    ctx.strokeStyle=neonGradient(ctx,0,0,W);
    drawRoundedRect(ctx,12,12,W-24,H-24,20);
    ctx.stroke();

    /* 👤 Avatar */
    const avatar=await getProfilePicture(uid);
    const size=130, ax=W-size-55, ay=55;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ax+size/2,ay+size/2,size/2,0,Math.PI*2);
    ctx.clip();
    avatar ? ctx.drawImage(avatar,ax,ay,size,size) : drawDefaultAvatar(ctx,ax,ay,size);
    ctx.restore();

    ctx.strokeStyle=neonGradient(ctx,ax,ay,size);
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.arc(ax+size/2,ay+size/2,size/2,0,Math.PI*2);
    ctx.stroke();

    /* 🏷 Text */
    ctx.font='bold 30px NotoSans';
    ctx.fillStyle='#fff';
    ctx.fillText('AVAILABLE BALANCE',50,70); // পরিবর্তন হয়েছে

    ctx.font='600 14px NotoSans';
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText('Digital Payment Card',50,95);

    ctx.font='bold 68px NotoSans';
    ctx.fillStyle=neonGradient(ctx,50,200,400);
    ctx.fillText(`${CURRENCY_SYMBOL}${formatShortBalance(balance)}`,50,250);

    ctx.font='600 13px NotoSans';
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText('CARD HOLDER',50,320);

    ctx.font='bold 26px NotoSans';
    ctx.fillStyle='#fff';
    ctx.fillText(user.name.toUpperCase().slice(0,22),50,350);

    ctx.font='600 13px NotoSans';
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText('USER ID',50,395);

    ctx.font='bold 18px monospace';
    ctx.fillStyle='#bbf7d0';
    ctx.fillText(uid,50,425);

    /* 💾 Chip */
    const cx=W-190, cy=210;
    ctx.fillStyle='#d4af37';
    drawRoundedRect(ctx,cx,cy,65,50,6);
    ctx.fill();

    /* 📶 Network gap */
    ctx.fillStyle='#22c55e';
    for(let i=0;i<4;i++){
        ctx.fillRect(cx-60+i*10,cy+40-i*6,6,10+i*6);
    }

    /* 🏦 Bank bottom */
    ctx.font='bold 16px NotoSans';
    ctx.fillStyle=neonGradient(ctx,0,H-40,W);
    ctx.textAlign='center';
    ctx.fillText("ANNIE'S AI BANK",W/2,H-25);
    ctx.textAlign='left';

    /* 💎 Premium Blue Diamond – ডান নীচে */
    const dx = W - 80;
    const dy = H - 80;
    const diamondSize = 40;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(Math.PI / 4);
    const grad = ctx.createLinearGradient(-diamondSize/2, -diamondSize/2, diamondSize/2, diamondSize/2);
    grad.addColorStop(0, '#00f');
    grad.addColorStop(0.5, '#0ff');
    grad.addColorStop(1, '#00f');
    ctx.fillStyle = grad;
    ctx.fillRect(-diamondSize/2, -diamondSize/2, diamondSize, diamondSize);
    ctx.restore();

    return canvas.toBuffer('image/png');
}

module.exports={
    config:{
        name:"balancec",
        aliases:["bal","wallet","mybalance","wcard"],
        author:"Neoaz ゐ",
        role:0,
        countDown:10,
        category:"economy"
    },

    onStart:async function({message,event,usersData,args}){
        try{
            message.reaction("⏳",event.messageID);
            await fs.ensureDir(cacheDir);

            let uid=event.senderID;
            if(event.messageReply) uid=event.messageReply.senderID;
            else if(Object.keys(event.mentions).length) uid=Object.keys(event.mentions)[0];
            else if(args[0]&&!isNaN(args[0])) uid=args[0];

            const user=await usersData.get(uid);
            const balance=user.money||0;

            const img=await createBalanceCard(user,uid,balance);
            const imgPath=path.join(cacheDir,`balance_${uid}.png`);
            await fs.writeFile(imgPath,img);

            await message.reply({
    body: 
`╭───〔 🏦 ANNIE'S BANK 〕───╮
│ 👤 ${user.name}
│ 💰 Balance: ${CURRENCY_SYMBOL}${formatShortBalance(balance)}
│──────────────────
📌 Commands:
• deposit
• withdraw
• balance
• interest
• transfer
• richest
• loan
• payloan
╰────────────────────╯`,
    attachment: fs.createReadStream(imgPath)
});

            message.reaction("✅",event.messageID);
            setTimeout(()=>fs.unlink(imgPath).catch(()=>{}),5000);
        }catch(e){
            console.error(e);
            message.reaction("❌",event.messageID);
            message.reply("Balance card generate করতে সমস্যা হয়েছে");
        }
    }
};
