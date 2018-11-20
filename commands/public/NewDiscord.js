module.exports = Cmds.addCommand({
    cmds: [';newdiscord'],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Update your connected Discord account',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel) => {
        Util.print(channel, 'This command is currently disabled');
        // Util.print(speaker, `Click this **personal** link to update your Veil Discord account: https://veil.pkamara.me/linkdiscord.php?discordid=${speaker.id}`);
        // Util.sendDescEmbed(channel, speaker.displayName, 'Update link sent, please check your Discord Messages.', null, null, null);
    },
});
