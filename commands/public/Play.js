module.exports = Cmds.addCommand({
    cmds: [';play ', ';add ', ';addqueue '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Make VaeBot play some bangin' tunes (or add them to the queue if the party's already started)",

    args: '([song_name] | [youtube_id] | [youtube_url])',

    example: 'never gonna give you up',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (has.call(Music.noPlay, speaker.id)) return;

        Music.joinMusic(guild, channel, () => {
            if (args.includes('http')) {
                let songId = /[^/=]+$/.exec(args);
                if (songId != null && songId[0]) {
                    songId = songId[0];
                    index.YtInfo.getById(songId, (error, result) => {
                        const songData = result.items[0];
                        if (songData != null) {
                            Music.addSong(speaker, guild, channel, Music.formatSong(songData, false));
                        } else {
                            Util.print(channel, 'Audio not found');
                        }
                    });
                } else {
                    Util.print(channel, 'Incorrect format for URL');
                }
            } else {
                index.YtInfo.search(args, 6, (error, result) => {
                    if (error) {
                        Util.print(channel, error);
                    } else {
                        const items = result.items;
                        let hasFound = false;
                        for (let i = 0; i < items.length; i++) {
                            const songData = items[i];
                            if (songData != null && has.call(songData, 'id') && songData.id.kind == 'youtube#video') {
                                hasFound = true;
                                Music.addSong(speaker, guild, channel, Music.formatSong(songData, false));
                                break;
                            }
                        }
                        if (!hasFound) {
                            Util.print(channel, 'Audio not found');
                        }
                    }
                });
            }
        });
    },
});
