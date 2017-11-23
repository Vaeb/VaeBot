const nums = [1, 2, 4, 4];
const sum = 8;

const cache = {};

for (let i = 0; i < nums.length; i++) {
    const now = nums[i];
    const off = sum - now;
    if (cache[off]) console.log(now, off);
    cache[now] = true;
}
