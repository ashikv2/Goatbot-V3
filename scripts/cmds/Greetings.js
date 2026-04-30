exports.config = {
    name: "greetings",
    version: "5.0",
    author: "MOHAMMAD Ashik,
    countDown: 0,
    role: 0,
    shortDescription: "শুধু ওলাইকুমুস সালাম",
    longDescription: "সালাম দিলে শুধু 'ওলাইকুমুস সালাম'। ১০ সেকেন্ডে ১ বার।",
    category: "fun",
    guide: { en: "সালাম লিখুন" }
};

const lat = {};
const cool = 10000; // 10 seconds cooldown

exports.onStart = async function(){};

exports.onChat = async function({event:z, api:y}){
    const threadID = z.threadID;
    const now = Date.now();

    // cooldown check
    if(lat[threadID] && now - lat[threadID] < cool) return;

    const messageText = (z.body || "").toLowerCase().trim();
    if(!messageText) return;

    // check for salam
    const isSalam = messageText.includes("সালাম") || 
                    messageText.includes("আসসালাম") || 
                    messageText.includes("assalam") || 
                    messageText.includes("salam") || 
                    messageText.includes("w salam") || 
                    messageText.includes("alaikum");

    if(isSalam){
        y.sendMessage("ওলাইকুমুস সালাম", threadID, z.messageID);
        lat[threadID] = now;
    }
};
