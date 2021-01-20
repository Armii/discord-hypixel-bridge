const mineflayer = require("mineflayer");
const discord = require("discord.js");
const config = require("./config.json");
require("colors");

const client = new discord.Client({
    autoReconnect: true
});
const options = {
    host: 'mc.hypixel.net',
    port: 25565,
    version: '1.8.9',
    username: config["minecraft-username"],
    password: config["minecraft-password"],
};

// Minecraft bot
let mc;
(function init() {
    console.log("Logging in.");
    mc = mineflayer.createBot(options);
    mc._client.once("session", session => options.session = session);
    mc.once("end", () => {
        setTimeout(() => {
            console.log("Connection failed. Retrying..");
            init();
        }, 60000);
    });
}());

let uuid;
let name;
mc.on("login", () => {
    uuid = mc._client.session.selectedProfile.id;
    name = mc._client.session.selectedProfile.name;
    setTimeout(() => {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7c<3");
    }, 1000);
    setTimeout(() => {
        console.log("Switching to guild chat. (If not already.)");
        mc.chat("/chat g");
    }, 2000);
    mc.chat("Logged in")
});

mc.on("message", (chatMsg) => {
    const msg = chatMsg.toString();
    console.log("Minecraft: ".brightGreen + msg);
    if (msg.endsWith(" joined the lobby!") && msg.includes("[MVP+")) {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7ca");
        return;
    }

    if (msg.startsWith("Guild >")) {
        let v = msg.split(" ");
        // Debug code 
        // for (var j = 0; j < v.length; j++) {
        //     console.log(v[j]);
        // }
        
        // if (v[2].includes(name + ":") || v[3].includes(name + ":")) return;
        if (v[2] == "GuildB0t" || v[3] == "GuildB0t") return;
        // Login messages
        if (v.length == 4) {
            client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).sendMessage(v[2] + " " + v[3]);
        } else {
            let splitMsg = msg.split(" ");
            let i = msg.indexOf(":");
            let splitMsg2 = [msg.slice(0, i), msg.slice(i + 1)];
            let sender, sentMsg;
            if (splitMsg[2].includes("[")) {
                sender = splitMsg[3].replace(":", "");
            } else {
                sender = splitMsg[2].replace(":", "");
            }
            sentMsg = splitMsg2[1];

            let embed = new discord.RichEmbed()
                .setAuthor(sender + ": " + sentMsg, "https://www.mc-heads.net/avatar/" + sender)
                .setColor("GREEN");

            
            client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).send(embed);
        }
    }

    // Party accepting and responding.
    // if (msg.includes(" invited you") && msg.includes(" party")) {
    //     let p = msg.split(" ");
    //     if (p[0].includes("[")){
    //         pl = p[1];
    //     } else {
    //         pl = p[0];
    //     } 
    //     mc.chat("/p accept " + pl)
    //     setTimeout(() => {
    //         mc.chat("/pc no");
    //     }, 1000);
    //     setTimeout(() =>{
    //         mc.chat("/p leave");
    //     }, 1500);
    //     setTimeout(() => {
    //         mc.chat("/achat \u00a7c<3");
    //     }, 2000);
    //     return;
    // }

    // Guild Quest completion.
    if (msg.startsWith("The guild has completed Tier") && msg.endsWith(" Guild Quest!")) {
        let q = msg.split(" ");
        client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).sendMessage("The guild has just completed Tier " + q[5] + " of this week's guild quest! GG!");
    }

    // Join/Leave Messages
    if (msg.endsWith("the guild!")) {
        let j = msg.split(" ");
        if (msg.startsWith("[")) {
            if (j[2] == "joined") {
            client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(j[1] + " joined the guild.");
            mc.chat("Welcome " + j[1] + "!");
        } else {
            client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(j[1] + " left the guild.");
        }
    } else {
        if (j[1] == "joined") {
            client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(j[0] + " joined the guild.");
            mc.chat("Welcome " + j[0] + "!");
        } else {
            client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(j[0] + " left the guild.");
        }
    }
}
});

// Discord bot
client.on("ready", () => {
    console.log("Discord: Logged in.".bgBlue);
    client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).sendMessage("Logged In.");
});

client.on("message", (message) => {
    if (message.channel.id !== config["chat-channel"] || message.author.bot || message.content.startsWith(config["discord-bot-prefix"])) return;
    console.log("Discord: ".blue + message.author.username + ": " + message.content);
    mc.chat(client.guilds.get(config["discord-guild"]).member(message.author).displayName + ": " + message.content);
});

client.login(config["discord-token"]);