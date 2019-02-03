module.exports = Cmds.addCommand({
    cmds: [';updateowner'],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Update your Vashta Owner role',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        Util.print(channel, 'This command is currently disabled');

        // const newBuyer = guild.roles.find('name', 'Vashta-Owner');

        // Data.query(`SELECT * FROM whitelist WHERE Disabled IS NULL AND DiscordId=${speaker.id};`, null, Data.connectionVeil).then(
        //     (whitelistData) => {
        //         if (whitelistData.length > 0) {
        //             Util.sendDescEmbed(channel, speaker.displayName, 'Vashta owner confirmed, role given.', null, null, null);

        //             speaker.addRole(newBuyer).catch(console.error);
        //         } else {
        //             // Util.sendDescEmbed(channel, speaker.displayName, 'You are not registered as a Vashta owner, if you do own Veil please say `;newdiscord` and follow the given link before using this command.', null, null, null);
        //             Util.sendDescEmbed(channel, speaker.displayName, 'You are not registered as a Vashta owner.', null, null, null);

        //             if (Util.hasRole(speaker, newBuyer)) {
        //                 speaker.removeRole(newBuyer).catch(console.error);
        //             }
        //         }
        //     },
        // );
    },
});
