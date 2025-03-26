const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const ALLOWED_ROLE_ID = '1323315656137117748';
const EMO_PFP_PATH = './images/emo.jpg';
const NORMAL_PFP_PATH = './images/mj.jpg';
const NORMAL_NAME = 'escumalha detector';
let isEmoMode = false;
let emoInterval = null; 

const randomMessages = [
    'Mais um dia no inferno (a minha vida ughh) 😔',
    'Mas eu sou um crepe, sou estranhooooo 🎶',
    'saudades dos tempos que já não voltam... 😢',
    'Porque motivo nenhuma mulher gosta de mim 💔',
    'https://open.spotify.com/intl-pt/track/70LcF31zb1H0PyJoS1Sx1r?si=375fc96ffa3c4a28',
    'Não é só uma "fase", é uma maneira de viver... 🌧️',
    'sinto-me tão vazio ',
    "Partiste-me o coração. Agora a Alcateia sou só eu, e os meus demónios...🐺 AUUUUUUUUU",
    "O sorriso é só uma máscara que eu uso... 😷😷",
    "Dizem que tudo melhora mas eu ainda estou à espera.. 😔😔",
    "Dei demasiados fumbles vou me matar",
    "Sou o mistério que ninguém quer desvendar...😈🙈"
];

function postRandomMessage() {

    const channel = client.channels.cache.get('1322987104384581714');
    if (!channel) return;
    const messageIndex = Math.floor(Math.random() * randomMessages.length);
    const message = randomMessages[messageIndex];

    channel.send(`${message}`).catch(console.error);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Ativa modo emo
    if (message.content === '!emo') {
        if (!message.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return message.reply('Oh seu merdas deixa-me em paz fdp');
        }

        if (isEmoMode) {
            return message.reply('O modo emo já está ativado.');
        }

        isEmoMode = true;
        postRandomMessage();

        try {
            await message.guild.members.me.setNickname('ѕαd вσι');
            const emoAvatar = fs.readFileSync(EMO_PFP_PATH);
            await client.user.setAvatar(emoAvatar);

            client.user.setPresence({
                activities: [{ name: "Roleta russa 😔🔫", type: ActivityType.Playing }],
                status: 'dnd'
            });

            message.reply('Modo emo ativado. 😔🔫');

            // Inicia o loop para enviar mensagens a cada 5 minutos
            emoInterval = setInterval(postRandomMessage, 3 * 60 * 60 * 1000);

        } catch (error) {
            console.error('Erro ao ativar o modo emo:', error);
            message.reply('Falha ao ativar o modo emo.');
        }
    }

    // Desativa modo emo
    if (message.content === '!unemo') {
        if (!message.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return message.reply('Ughhh não é só uma fase eu nasci assim 😔🔫');
        }

        if (!isEmoMode) {
            return message.reply('O modo emo já está desativado.');
        }
        isEmoMode = false;
        try {
            await message.guild.members.me.setNickname(NORMAL_NAME);
            const normalAvatar = fs.readFileSync(NORMAL_PFP_PATH);
            await client.user.setAvatar(normalAvatar);

            client.user.setPresence({
                activities: [{ name: "גלאי חלאות", type: ActivityType.Playing }],
                status: "online"
            });

            message.reply('Obrigado por me salvares 🙏');

            // Para o loop de mensagens
            clearInterval(emoInterval);
            emoInterval = null;

        } catch (error) {
            console.error('Erro ao desativar o modo emo:', error);
            message.reply('Falha ao desativar o modo emo.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
