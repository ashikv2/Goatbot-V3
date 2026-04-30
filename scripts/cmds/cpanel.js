const { createCanvas, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gifencoder");
const os = require("os");

const fontDir = path.join(__dirname, "assets", "font");
const cacheDir = path.join(__dirname, "cache");

try {
  registerFont(path.join(fontDir, "BeVietnamPro-Bold.ttf"), {
    family: "BeVietnamPro"
  });
} catch (e) {
  console.log("Font load skip");
}

/* ---------- STAR BACKGROUND ---------- */
function stars(ctx, w, h, n = 400) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * w,
      Math.random() * h,
      Math.random() * 1.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

/* ---------- GEAR SHAPE ---------- */
function gear(ctx, teeth, r1, r2) {
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (Math.PI / teeth) * i;
    const r = i % 2 === 0 ? r2 : r1;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
}

function neonGear(ctx, teeth, r1, r2, color) {
  for (let i = 14; i > 0; i--) {
    ctx.shadowBlur = i * 3;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    gear(ctx, teeth, r1, r2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#070b14";
  gear(ctx, teeth, r1, r2);
  ctx.fill();
}

/* ---------- LIVE SYSTEM STATS ---------- */
function getStats() {
  const cpus = os.cpus();
  let idle = 0, total = 0;

  cpus.forEach(cpu => {
    for (let t in cpu.times) total += cpu.times[t];
    idle += cpu.times.idle;
  });

  return {
    cpu: Math.round(100 - idle / total * 100),
    ram: Math.round(
      ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
    ),
    totalRam: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1),
    uptime: Math.floor(process.uptime() / 60),
    sysUp: Math.floor(os.uptime() / 3600),
    cores: cpus.length,
    node: process.version,
    host: os.hostname()
  };
}

/* ---------- GENERATE PANEL ---------- */
async function generatePanel(owner = "Ashikv2") {
  if (!fs.existsSync(cacheDir)) fs.mkdirpSync(cacheDir);

  const W = 1600, H = 1000;
  const gifPath = path.join(cacheDir, `panel_${Date.now()}.gif`);

  const encoder = new GIFEncoder(W, H);
  const writeStream = fs.createWriteStream(gifPath);
  encoder.createReadStream().pipe(writeStream);

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(45); // slow neon
  encoder.setQuality(10);

  const cx = W / 2, cy = H / 2;
  const R = 330;

  const rainbow = [
    "#ffb000", "#ff7a00", "#ffee00",
    "#00ff9c", "#00c3ff", "#8a2be2"
  ];

  const frames = 60;

  for (let f = 0; f < frames; f++) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#050810";
    ctx.fillRect(0, 0, W, H);
    stars(ctx, W, H);

    const color = rainbow[Math.floor(f / 5) % rainbow.length];
    const rot = (Math.PI * 2 / frames) * f;
    const sideRot = -rot * 1.35;

    const s = getStats();

    /* CENTER GEAR */
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    neonGear(ctx, 18, 100, 160, color);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.font = "bold 24px BeVietnamPro";
    ctx.fillStyle = color;
    ctx.fillText("OWNER", cx, cy - 28);

    const half = Math.ceil(owner.length / 2);
    ctx.font = "bold 36px BeVietnamPro";
    ctx.fillText(owner.slice(0, half), cx - 50, cy + 30);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(owner.slice(half), cx + 50, cy + 30);

    /* SIDE GEARS (8) */
    const data = [
      `BOT ${s.uptime}m`,
      `${s.cores} CORES`,
      s.node,
      `CPU ${s.cpu}%`,
      `RAM ${s.ram}%`,
      `${s.totalRam} GB`,
      `SYS ${s.sysUp}h`,
      s.host
    ];

    data.forEach((txt, i) => {
      const a = (Math.PI * 2 / data.length) * i;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(sideRot);
      neonGear(ctx, 14, 65, 105, color);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px BeVietnamPro";
      ctx.fillText(txt, x, y + 6);
    });

    encoder.addFrame(ctx);
  }

  encoder.finish();

  // 🔥 CRITICAL FIX — wait until GIF is fully written
  await new Promise(resolve => writeStream.on("finish", resolve));

  return gifPath;
}

/* ---------- COMMAND ---------- */
module.exports = {
  config: {
    name: "cpanel",
    version: "FINAL-GEAR",
    author: "Ashik",
    role: 0,
    category: "utility"
  },

  onStart: async ({ message, event }) => {
    try {
      message.reaction("⏳", event.messageID);

      const gif = await generatePanel("Ashikv2");

      await message.reply({
        body: "⚙️ SYSTEM CONTROL PANEL",
        attachment: fs.createReadStream(gif)
      });

      message.reaction("✅", event.messageID);

      setTimeout(() => {
        if (fs.existsSync(gif)) fs.unlinkSync(gif);
      }, 10000);

    } catch (err) {
      console.error(err);
      message.reply("❌ Panel generate error");
    }
  }
};