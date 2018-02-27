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

    func: (cmd, args, msgObj, speaker) => {
        Util.print(speaker, `Click this **personal** link to update your Veil Discord account: https://veil.pkamara.me/linkdiscord.php?discordid=${speaker.id}`);
    },
});
