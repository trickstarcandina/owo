require("dotenv").config({ path: "./.env" });
const Discord = require("discord.js-selfbot");
const data = require("./info.json");
const { scheduleJob, Job, RecurrenceRule } = require("node-schedule");
const client = new Discord.Client();
let channel = process.env.CHANNEL;
let owner = process.env.OWNER;
const huntBattleRule = new RecurrenceRule();
huntBattleRule.second = [0, 36];
const buyRule = new RecurrenceRule();
buyRule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const owoRule = new RecurrenceRule();
owoRule.second = [0, 29, 52];

const wakeUpRule = new RecurrenceRule();
wakeUpRule.hour = [0, 2, 6, 12];
/**
 * @type { Job }
 */
let huntJob;
let buyJob;
let owoJob;

let wakeUpJob;

client.on("ready", () => {
  console.log("Quẩy lên!");

  if (!data.disable.hunt || !data.disable.battle)
    huntJob = scheduleJob(huntBattleRule, () => {
      setTimeout(() => {
        if (!data.disable.hunt) client.channels.cache.get(channel).send("owoh");
      }, getRandomInt(1200));
      setTimeout(() => {
        if (!data.disable.battle)
          client.channels.cache.get(channel).send("owob");
      }, getRandomInt(1200));
    });

  buyJob = scheduleJob(buyRule, () => {
    if (!data.disable.buy) client.channels.cache.get(channel).send("owobuy 1");
  });
  owoJob = scheduleJob(owoRule, () => {
    if (!data.disable.owo) client.channels.cache.get(channel).send("owo");
  });

  wakeUpJob = scheduleJob(wakeUpRule, () => {
    client.channels.cache.get(channel).send("owopray");
  });
});

//spent 5 <:cowoncy:416043450337853441> and caught an
client.on("message", (message) => {
  if (message.channel.id !== channel && message.channel.type !== "dm") return;
  if (message.author.id !== "408785106942164992") return;
  if (
    ["spent 5", "and caught an"].some((phrase) =>
      message.content.toLowerCase().includes(phrase.toLowerCase())
    )
  ) {
    //stop
    huntJob.cancel();
    buyJob.cancel();
    owoJob.cancel();

    let randomGem = getRandomInt(data.inv.length);
    setTimeout(() => {
      client.channels.cache
        .get(channel)
        .send(
          "owouse " +
            data.inv[randomGem].toString() +
            " " +
            (data.inv[randomGem] + 14).toString() +
            " " +
            (data.inv[randomGem] + 21).toString()
        );
    }, 1686);
    //cont
    buyJob.reschedule(buyRule);
    huntJob.reschedule(huntBattleRule);
    owoJob.reschedule(owoRule);
  }
});

client.on("message", async (message) => {
  if (checkTimeSpam()) {
    if (message.channel.id !== channel && message.channel.type !== "dm") return;

    //check bot reply
    const messages = await message.channel.messages.fetch({ limit: 10 });
    let flag = 0;
    for (let m = 0; m < 10; m++) {
      if (
        messages.array()[m].content === "spy!stop" &&
        message.author.id === owner
      ) {
        return;
      }
      if (
        messages.array()[m].author.id === "408785106942164992" ||
        (messages.array()[m].content === "spy!cont" &&
          message.author.id === owner)
      ) {
        flag = flag + 1;
        break;
      }
    }
    if (flag === 0) {
      buyJob.cancel();
      huntJob.cancel();
      owoJob.cancel();
    } else if (flag > 0) {
      buyJob.reschedule(buyRule);
      huntJob.reschedule(huntBattleRule);
      owoJob.reschedule(owoRule);
    }

    // check captcha
    if (
      message.author.id !== owner &&
      message.author.id !== "408785106942164992"
    )
      return;

    if (
      [
        "Beep Boop. A",
        "real human?",
        "can check!",
        "Please DM me",
        "Wrong verification",
        " Please complete your captcha",
        "solving the captcha",
        "http://verify.owobot.com/",
        " Please use the link ",
      ].some((phrase) =>
        message.content.toLowerCase().includes(phrase.toLowerCase())
      )
    ) {
      buyJob.cancel();
      huntJob.cancel();
      owoJob.cancel();
      if (client.user.id === owner) return;
      client.users.cache.get(owner).send(message.content);
      if (!!message.attachments.size)
        client.users.cache.get(owner).send(message.attachments.first());
    }
    if (message.content.includes("Thank you! :3")) {
      buyJob.reschedule(buyRule);
      huntJob.reschedule(huntBattleRule);
      owoJob.reschedule(owoRule);
      if (client.user.id === owner) return;
      client.users.cache.get(owner).send(message.content);
    }
  } else {
    buyJob.cancel();
    huntJob.cancel();
    owoJob.cancel();
  }
});

client.on("message", (message) => {
  if (
    message.author.id === owner &&
    message.channel.type === "dm" &&
    message.content.length === 5
  ) {
    client.users.cache.get("408785106942164992").send(message.content);
  }
  if (message.channel.id === channel && message.author.id === owner) {
    if (message.content.toLowerCase() === "spy!stop") {
      huntJob.cancel();
      buyJob.cancel();
      owoJob.cancel();
    }
    if (message.content.toLowerCase() === "spy!cont") {
      buyJob.reschedule(buyRule);
      huntJob.reschedule(huntBattleRule);
      owoJob.reschedule(owoRule);
    }
  }
});

console.log(process.env.TOKEN);

client.login(process.env.TOKEN);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function checkTimeSpam() {
  const d = new Date();
  let hour = d.getHours();
  if (hour === 0 || hour === 2 || hour === 6 || hour === 12) {
    return 1;
  }
  return 0;
}
