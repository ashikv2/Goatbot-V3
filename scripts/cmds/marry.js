const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "marry",
        aliases: ["marry"],
        version: "1.0",
        author: "AceGun",
        countDown: 5,
        role: 0,
        shortDescription: "Get a cute marry image",
        longDescription: "",
        category: "marry",
        guide: "{pn} @mention"
    },

    onStart: async function ({ message, event, args }) {
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) return message.reply("Please mention someone!");

        let one, two;
        if (mention.length == 1) {
            one = event.senderID;
            two = mention[0];
        } else {
            one = mention[1];
            two = mention[0];
        }

        try {
            const imagePath = await createMarryImage(one, two);
            await message.reply({ 
                body: "「 I love you babe 🥰❤️ 」", 
                attachment: fs.createReadStream(imagePath) 
            });
            fs.unlinkSync(imagePath); // clean up temp file
        } catch (err) {
            console.log("Error creating marry image:", err);
            message.reply("❌ Failed to create marry image!");
        }
    }
};

async function createMarryImage(one, two) {
    // Replace this with your valid Facebook access token
    const token = "YOUR_FACEBOOK_ACCESS_TOKEN";

    // Default avatar if FB fails
    const defaultAvatar = "https://i.imgur.com/8Km9tLL.png";

    // Load avatars
    let avOne = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`)
        .catch(() => jimp.read(defaultAvatar));
    let avTwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`)
        .catch(() => jimp.read(defaultAvatar));

    avOne.circle();
    avTwo.circle();

    // Load background image
    let img = await jimp.read("https://i.imgur.com/qyn1vO1.jpg");

    // Resize background and composite avatars
    img.resize(432, 280)
       .composite(avOne.resize(60, 60), 120, 30) // adjust x, y
       .composite(avTwo.resize(60, 60), 250, 30);

    // Save temp file
    const pth = path.join(__dirname, `marry_${Date.now()}.png`);
    await img.writeAsync(pth);
    return pth;
}