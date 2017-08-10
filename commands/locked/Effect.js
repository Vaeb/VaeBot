function byte2Hex(n) {
    const nybHexString = '0123456789ABCDEF';
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function RGB2Color(r, g, b) {
    return `#${byte2Hex(r)}${byte2Hex(g)}${byte2Hex(b)}`;
}

function colorText(i, maxExclusive, phaseParam) {
    let phase = phaseParam;
    if (phase == null) phase = 0;

    const center = 128;
    const width = 127;
    const frequency = (Math.PI * 2) / maxExclusive;

    const red = Math.sin(frequency * i + 2 + phase) * width + center;
    const green = Math.sin(frequency * i + 0 + phase) * width + center;
    const blue = Math.sin(frequency * i + 4 + phase) * width + center;

    const hexColor = RGB2Color(red, green, blue);

    return hexColor;
}

function setRoleColor(role, i, maxExclusive) {
    let nowIter = i;

    const newColor = colorText(nowIter, maxExclusive, 0);

    nowIter++;

    if (nowIter === maxExclusive) nowIter = 0;

    // role.setColor(newColor)
    // .catch(console.error); // 168, 184, 560, 175, 231, 179

    // setTimeout(setRoleColor, 50, role, nowIter, maxExclusive);

    role.setColor(newColor)
        .then(() => setRoleColor(role, nowIter, maxExclusive))
        .catch((err) => {
            Util.log(err);
            Util.log('^ This is from setRoleColor');
        });
}

module.exports = Cmds.addCommand({
    cmds: [';effect', ';color', ';addeffect'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Magic',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const Vaeben = Util.getRole('Vaeben', guild);
        setRoleColor(Vaeben, 0, 100);
    },
});
