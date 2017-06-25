module.exports = Cmds.addCommand({
    cmds: [";playf "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Make VaeBot play some bangin' tunes... from a file :o",

    args: "([file_name])",

    example: "never gonna give you up",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        //Music.playFile(args, guild, channel);
        Music.addSong(speaker, guild, channel, Music.formatSong(args, true));
    }
});