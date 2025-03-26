const { Client, GatewayIntentBits, ActivityType, MessageEmbed } = require("discord.js");
require("dotenv").config();
const levenshtein = require("js-levenshtein");
const emo = require("./emo");

const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Bot is Ready");
});
app.listen(port, () =>
    console.log(`Web server ativo em http://localhost:${port}`)
);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: ["CHANNEL"],
});

const generalID = "1322987104384581714";
const triggerChannelId = "1328825114552172644";
const channelId = "1327303404975820861";
const escumalhaRoleId = "1323331824881242213";
const engenheiroRoleId = "1323331476250689598";
const gamesToMonitor = ["Roblox", "League of Legends"];
const escumalhaPhrases = [
    " Oh <@{id}> tá masé calado oh escumalha",
    " <@{id}>, escumalha detected! Porta-te como engenheiro...",
    " <@{id}> mais um para a lista dos escumalhas...",
    " Oh <@{id}> alguém perguntou-te alguma coisa? Volta lá pó teu cantinho.. ",
    " <@{id}> estás em modo escumalha full power.",
];

// Função para gerar uma frase aleatória
function getRandomPhrase(memberId) {
    const randomIndex = Math.floor(Math.random() * escumalhaPhrases.length);
    return escumalhaPhrases[randomIndex].replace("{id}", memberId);
}


client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content.trim().toLowerCase() === "vemo nos por ai" || message.content.trim().toLowerCase() === "vemos nos por ai") {
        message.channel.send("Vai te foder preto de merda, vai comer um gorila seu ALBINO DE MERDA 🐒🐒🐒");
    }
});

// Verificar horário permitido
function isWithinAllowedHours() {
    const now = new Date();
    const currentHour = now.getHours();
    console.log(`Current Hour: ${currentHour}`);
    return currentHour >= 2 && currentHour < 12;
}

// Evento ao iniciar o bot
client.once("ready", () => {
    console.log(`Bot logado como ${client.user.tag}`);
    client.user.setPresence({
        activities: [
            {
                name: "גלאי חלאות",
                type: ActivityType.Playing,
            },
        ],
        status: "online",
    });
    // (Optional) Send greeting message if desired
    // const generalChannel = client.channels.cache.get(generalID);
    // if (generalChannel && generalChannel.isTextBased()) {
    //     generalChannel.send("Salam aleikum habibis");
    // }
});

// --- Combined Escumalha Response & Spam Tracking ---
// This Map tracks the last message timestamp per user.
let spamTracker = new Map();

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const member = message.member;
    if (member && member.roles.cache.has(escumalhaRoleId)) {
        const now = Date.now();
        const threshold = 4000; // 4 seconds threshold
        // Retrieve previous tracking data or default values.
        const data = spamTracker.get(member.id) || { lastMessageTime: 0, warned: false };
        const timeDiff = now - data.lastMessageTime;
        
        if (timeDiff < threshold) {
            if (!data.warned) {
                // Second message in quick succession: issue a warning only.
                data.warned = true;
                spamTracker.set(member.id, data);
                message.reply("Queres spammar? Vai spammar lá pa tua terra seu CABRAO 🐒🐒🐒");
                return; // Do not send the regular random phrase.
            } else {
                // Already warned—apply timeout.
                try {
                    await member.timeout(60000, "Spamming messages");
                    message.reply("Toma lá timeout para ficares fino seu XIBARRO DO CARALHO 🐒🐒🐒");
                    // Clear tracking data after timeout.
                    spamTracker.delete(member.id);
                    return;
                } catch (err) {
                    console.error("Erro ao aplicar timeout:", err);
                }
            }
        }
        // Update tracker for a normal message (or after a sufficient delay).
        spamTracker.set(member.id, { lastMessageTime: now, warned: false });
        
        // Send the regular random phrase.
        const randomPhrase = getRandomPhrase(member.id);
        if (randomPhrase) {
            message.channel.send(randomPhrase);
        }
    }
});

// Other existing events remain unchanged

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const member = message.member;
    if (member && member.roles.cache.has(escumalhaRoleId)) {
        try {
            await message.react("🐒"); // Adiciona o emoji de macaco
        } catch (err) {
            console.error("Erro ao reagir à mensagem:", err);
        }
    }
});

const triggerWords = ["menor", "meenor", "inferior", "sub", "minor", "under", "criança", "🔞", "-18", "abaixo", "1️⃣ 6️⃣", "<18", "-(17+1)", "16", "-(-16)", "<1️⃣ 8️⃣", "1️⃣ 8️⃣", "Ⓜ️ 🇪 🇳 🇴 🇷 🇪 🇸", "MEN0RES", "men0res", "M3N0RES", "M3N0R35", "menοr", "１６", "𝖒𝖊𝖓𝖔𝖗", "めのｒ", "15>n<17"];

const regexPatterns = [
    /\b(?:1[68]|-18)\b/,
    /\bunder\s?18\b/,
    /\b1️⃣\s?8️⃣\b/,
    /\b🔞\b/,
];
const MAX_DISTANCE = 2;

// Normalize substitutions (e.g., replace "3" with "e", "0" with "o", etc.)
function normalizeContent(content) {
    return content
        .toLowerCase()
        .replace(/[3]/g, "e")
        .replace(/[0]/g, "o")
        .replace(/[1]/g, "i")
        .replace(/[4]/g, "a")
        .replace(/[5]/g, "s")
        .replace(/[7]/g, "t");
}

function containsTriggerWord(content) {
    const normalizedContent = normalizeContent(content);

    for (const pattern of regexPatterns) {
        if (pattern.test(normalizedContent)) return true;
    }

    for (const word of triggerWords) {
        const distance = levenshtein(word, normalizedContent);
        if (distance <= MAX_DISTANCE && normalizedContent.includes(word)) return true;
    }

    return false;
}

// Handle messages with trigger words
client.on("messageCreate", async (message) => {
    if (message.author.bot || message.attachments.size > 0) return;

    if (containsTriggerWord(message.content)) {
        const roleMention = `<@&1326986436704075898>`;
        message.reply(`(teste)`);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Verificar se a mensagem foi enviada no canal específico pelo usuário autorizado
    if (message.channel.id === triggerChannelId) {
        try {
            const generalChannel = client.channels.cache.get(generalID);
            if (!generalChannel) {
                console.error("Canal especificado não é válido ou não é um canal de texto.");
                return;
            }

            // Repostar a mensagem no canal geral
            generalChannel.send(message.content);
            console.log(`Mensagem enviada no canal ${generalChannel}: ${message.content}`);
        } catch (error) {
            console.error("Erro ao enviar mensagem no canal:", error);
        }
    }
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.userId) return;

    const guild = newPresence.guild;
    if (!guild) return;

    const member = guild.members.cache.get(newPresence.userId);
    if (!member) return;

    // Log the current time and check result
    const now = new Date();
    console.log(`Current Time: ${now.toLocaleString()}`);
    console.log(`Is within allowed hours: ${isWithinAllowedHours()}`);

    if (!isWithinAllowedHours()) {
        console.log("Fora do horário permitido. Monitoramento ignorado.");
    }

    const activity = newPresence.activities.find(
        (a) => a.type === ActivityType.Playing && gamesToMonitor.includes(a.name)
    );

    if (activity) {
        // Usuário iniciou um jogo monitorado, atribuir "Escumalha"
        if (!member.roles.cache.has(escumalhaRoleId)) {
            member.roles.add(escumalhaRoleId).catch(console.error);
            console.log(`Role "Escumalha" atribuída a ${member.user.tag}`);
        }

        // Remover "Engenheiro" se o membro tiver essa role
        if (member.roles.cache.has(engenheiroRoleId)) {
            member.roles.remove(engenheiroRoleId).catch(console.error);
            console.log(`Role "Engenheiro" removida de ${member.user.tag}`);
        }

        // Enviar mensagem no canal de monitoramento
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send(
                `📡📡 Escumalha detected! 📡📡 O <@${member.id}> começou a jogar **${activity.name}**!`
            );
        }
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);