module.exports = Cmds.addCommand({
    cmds: [';voteskip'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Vote to skip the current song (will skip when the vote reaches 50% of the users in the voice channel)',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const connection = guild.voiceConnection;
        if (connection) {
            const allChannels = guild.channels;
            const voiceChannel = allChannels.find((c) => {
                if (!c.type == 'voice') return false;
                const hasMember = c.members.find(o => o.id == selfId);
                if (hasMember != null) return true;
                return false;
            });
            const voiceMembers = voiceChannel.members;
            const numMembers = voiceMembers.size - 1;
            if (!voiceMembers.find(o => o.id == speaker.id)) {
                Util.print(channel, 'You are not in the voice channel');
                return;
            }
            let alreadyExists = false;
            const guildMusicInfo = Music.guildMusicInfo[guild.id];
            const voteSkips = guildMusicInfo.voteSkips;
            for (let i = 0; i < voteSkips.length; i++) {
                if (voteSkips[i] == speaker.id) {
                    alreadyExists = true;
                    break;
                }
            }
            if (alreadyExists == true) {
                Util.print(channel, "You can't vote more than once!");
                return;
            }
            voteSkips.push(speaker.id);
            const numVotes = voteSkips.length;
            const voteStr = numVotes == 1 ? 'vote' : 'votes';
            Util.print(channel, 'Vote skip:', numVotes, voteStr);
            Util.log(`Vote skip: ${numVotes / numMembers}`);
            if (numVotes / numMembers >= 0.5) {
                const guildQueue = Music.guildQueue[guild.id];
                const autoPlaylist = Data.guildGet(guild, Data.playlist);
                const firstInQueue = guildQueue[0];
                if (guildMusicInfo.isAuto == false && guildQueue.length > 0 && guildMusicInfo.activeSong != null && guildMusicInfo.activeSong.title == firstInQueue[0].title) guildQueue.splice(0, 1);
                Music.playNextQueue(guild, channel, true);
            }
        }
    },
});
