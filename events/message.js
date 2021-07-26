const Discord = require('discord.js');
const { colors, prefix } = require('../utils/constants');
const { logger } = require('../utils/logger');

module.exports = {
    name: 'message',

    /**
     * @param {Discord.Message} message
     * @param {Discord.Client} client
     * */
    async execute(message, client) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        let embed;

        if (message.channel.type === 'dm') {
            embed = new Discord.MessageEmbed({
                description: [`I cannot serve you here my friend ${message.author}`, 'Text me within the `GDSC MBCET` server'].join(
                    '\n'
                ),
                color: colors.red,
            });
            return message.channel.send(embed);
        }

        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();

        const commandFileData = client.commands.get(command);
        if (!commandFileData) {
            embed = new Discord.MessageEmbed({
                title: 'Invalid Command',
                description: [
                    '“There are no accidents”',
                    'But you my friend have made one',
                    'I will show you the way',
                    'Type: `!help-v`',
                ].join('\n'),
                color: colors.red,
            });
            return message.channel.send(embed).then(msg => {
                msg.delete({ timeout: 15000 });
            });
        }

        logger.log(`Recieved command from: ${message.author.tag} , command: ${message.content} `);
        try {
            await commandFileData.execute(message, args, client);
        } catch (e) {
            logger.error(`Command: ${command} Error:`, e);
            embed = new Discord.MessageEmbed({
                title: 'Error Occured',
                description: 'I am not feeling too well my friend',
                color: colors.red,
            });
            return message.channel.send(embed).then(msg => {
                msg.delete({ timeout: 5000 });
            });
        }
    },
};
