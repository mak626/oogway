const Discord = require('discord.js');
const { reactionDataArray } = require('../firebase/firebase_handler');
const { FirebaseReaction } = require('../utils/models');
const { colors, team_emojis, REACTION_TYPE } = require('../utils/constants');
const { findRoleById, findChannelById, sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'messageReactionRemove',

    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User | Discord.PartialUser} user
     */
    async execute(reaction, user) {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        const reactionRole = reactionDataArray.find(e => e.id == reaction.message.id);
        if (!reactionRole) return;

        const args = [reaction, user, reactionRole];
        if (reactionRole.type == REACTION_TYPE.TEAM) this.handleTeamReaction(...args);
    },

    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User | Discord.PartialUser} user
     * @param {FirebaseReaction} reactionRole
     */
    async handleTeamReaction(reaction, user, reactionRole) {
        let embed;
        const team_data = reactionRole.data.map(e => {
            if (!e.channel) return { role: findRoleById(reaction.message, e.role) };
            else
                return {
                    role: findRoleById(reaction.message, e.role),
                    channel: findChannelById(reaction.message, e.channel),
                };
        });

        const team_no = team_emojis.findIndex(e => e === reaction.emoji.name);
        try {
            const user_roles = reaction.message.guild.members.cache.get(user.id).roles;
            user_roles.remove(team_data[team_no].role.id);
        } catch (e) {
            console.error(`Event: ${this.name}, User:  ${user.username} Error: ${e.name}: ${e.message}`);
            return sendDissapearingMessage(
                reaction.message,
                `Some error occured removing your ${team_data[team_no].role} role my friend ${user}`
            );
        }

        if (team_data[team_no].channel) {
            embed = new Discord.MessageEmbed({
                footer: {
                    text: `${user.username} has left this team`,
                    icon_url: user.displayAvatarURL(),
                },
                color: colors.red,
            });
            await team_data[team_no].channel.send(embed);
        }
    },
};
