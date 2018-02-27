module.exports = Cmds.addCommand({
    cmds: [';updateowner'],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Update your Veil Owner role',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel) => {
        const newBuyer = guild.roles.find('name', 'Veil-Owner');

        Data.query(`SELECT * FROM whitelist WHERE Disabled IS NULL AND DiscordId=${speaker.id};`, null, Data.connectionVeil).then((whitelistData) => {
            if (whitelistData.length > 0) {
                Util.sendDescEmbed(channel, speaker.displayName, 'Veil owner confirmed, role given.', null, null, null);

                speaker.addRole(newBuyer);
            } else {
                Util.sendDescEmbed(channel, speaker.displayName, 'You are not registered as a Veil owner, if you do own Veil please say `;newdiscord` and follow the given link before using this command.', null, null, null);

                if (Util.hasRole(speaker, newBuyer)) {
                    speaker.removeRole(newBuyer);
                }
            }
        });
    },
});
