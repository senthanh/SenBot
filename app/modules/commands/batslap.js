module.exports.config = {
  name: "batslap",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SenProject",
  description: "Slap the shit out of someone.",
  group: "minigame",
  usages: "@mention [messageOne] | [messageTwo]",
  cooldowns: 5,
  dependencies: {
    "canvas": "",
    "fs": "",
    "path": "",
    "axios": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, mentions } = event;
  const { writeFileSync, createReadStream, unlinkSync } = global.nodemodule["fs"];
  const { join } = global.nodemodule["path"];

  const example = join(__dirname, '/../../includes/assets/images/meme/BatSlapExample.png');
  if (!args.length) return api.sendMessage({
    body: 'Please use @mention messageOne | messageTwo\nFor example: @SenProject SHUT UP | HI',
    attachment: createReadStream(example)
  }, threadID, messageID);


  const mention = Object.keys(mentions);

  if (!mention.length) return api.sendMessage("Please tag someone to slap them!", threadID, messageID);
  if (mention.length > 1) return api.sendMessage("Please tag only one person to slap them!", threadID, messageID);
  
  const nameL = mentions[mention[0]].split(" ").length;
  
  args = args.slice(nameL).join(" ").split("|");
  if (args.length < 2) return api.sendMessage("Please provide at least 2 messages to slap them!", threadID, messageID);
  if (args.length > 2) return api.sendMessage("Please provide at most 2 messages to slap them!", threadID, messageID);

  const messageOne = args[0].trim();
  const messageTwo = args[1].trim();
  
  const { createCanvas, loadImage, registerFont } = global.nodemodule["canvas"];
  const { get } = global.nodemodule["axios"];

  const template = join(__dirname, '/../../includes/assets/images/meme/BatSlap.png');
  const pathFont = join(__dirname, '/../../includes/assets/fonts/Arimo-Regular.ttf');
  const savePath = join(__dirname, `/cache/batslap_${senderID}_${mention[0]}.png`);

  const avatarOnePath = join(__dirname, `/cache/batslap_${senderID}.png`);
  const avatarTwoPath = join(__dirname, `/cache/batslap_${mention[0]}.png`);

  let getAvatarOne = (await get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data; //Need to rework
	writeFileSync(avatarOnePath, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await get(`https://graph.facebook.com/${mention[0]}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data; //Need to rework
	writeFileSync(avatarTwoPath, Buffer.from(getAvatarTwo, 'utf-8'));


  await new Promise(async (resolve) => {
    try {
      registerFont(pathFont, { family: 'Unicode' });
      const canvas = createCanvas(400, 387);
      const ctx = canvas.getContext("2d");
      const pic = await loadImage(template).catch(err => console.log(err));

      ctx.drawImage(pic, 0, 0, canvas.width, canvas.height);
      ctx.font = `20px "Unicode"`;
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      
      //Draw the first message
      wrapText(ctx, messageOne, 314, 30, 160, 20);
      //Draw the second message
      wrapText(ctx, messageTwo, 113, 30, 160, 20);

      //Draw the first avatar
      const avatarOne = await loadImage(avatarOnePath).catch(err => console.log(err));
      await circleImage(ctx, avatarOne, 296, 190, 43);
      console.log("FIRST AVATAR DONE");

      //Draw the second avatar
      const avatarTwo = await loadImage(avatarTwoPath).catch(err => console.log(err));
      await circleImage(ctx, avatarTwo, 162, 240, 60);
      console.log("SECOND AVATAR DONE");

      const imageBuffer = canvas.toBuffer();
      unlinkSync(avatarOnePath);
      unlinkSync(avatarTwoPath);
      writeFileSync(savePath, imageBuffer);
      return resolve();
    } catch (e) {
      console.log(e);
    }
  });

  api.sendMessage({
    attachment: createReadStream(savePath)
  }, threadID, () => unlinkSync(savePath), messageID);
}


//function  to wrap the text from canvas with max width and max height anđ fill in center
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

//a promise function to circle image and draw it on current canvas
const circleImage = (ctx, image, x, y, radius) => new Promise((resolve, reject) => {
  try {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
    return resolve();
  } catch (e) {
    return reject(e);
  }
})