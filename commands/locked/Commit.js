module.exports = Cmds.addCommand({
    cmds: [';commit ', ';editr '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Commit some changes',

    args: '([roleName]) ([newName]) ([newColor]) ([newHoist]) ([newMentionable]) ([newPosition])',

    example: 'Vaeben Gaeben 0xFF0000 null null 3',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(args, [
            function (str) {
                return Util.getRole(str, guild);
            },
            function (str) {
                return str;
            },
            function (str) {
                if (str === 'null') return str;
                return Util.getNum(str);
            },
            function (str) {
                if (str === 'null') return str;
                return Util.toBoolean(str);
            },
            function (str) {
                if (str === 'null') return str;
                return Util.toBoolean(str);
            },
            function (str) {
                if (str === 'null') return str;
                return Util.getNum(str);
            },
        ], false);
        if (!data) return Util.commandFailed(channel, speaker, 'Invalid parameters');

        for (let i = 1; i < data.length; i++) {
            data[i] = data[i] !== 'null' ? data[i] : null;
        }

        const role = data[0];
        const name = data[1];
        const color = data[2];
        const hoist = data[3];
        const mentionable = data[4];
        const pos = data[5];

        if (!role) {
            return Util.commandFailed(channel, speaker, 'Invalid parameters');
        }

        if (name) {
            role.setName(name)
            .catch(error => Util.log(`[E_RoleComm1] ${error}`));
        }

        if (color) {
            role.setColor(color)
            .catch(error => Util.log(`[E_RoleComm2] ${error}`));
        }

        if (hoist) {
            role.setHoist(hoist)
            .catch(error => Util.log(`[E_RoleComm3] ${error}`));
        }

        if (mentionable) {
            role.setMentionable(mentionable)
            .catch(error => Util.log(`[E_RoleComm4] ${error}`));
        }

        if (pos) {
            role.setPosition(pos)
            .catch(error => Util.log(`[E_RoleComm5] ${error}`));
        }

        return undefined;
    },
});
