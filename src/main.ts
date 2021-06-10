import { BigNumber, providers } from 'ethers';

import { KittyCore } from './kitty-core';

// parse arguments
const args = process.argv.slice(2).reduce<Record<string, string>>((prev, cur) => {
    const props = cur.split('=');
    prev[props[0]] = props[1];
    return prev;
}, {});

const { start, end } = args;

if (!args.start || !args.end) {
    throw new Error('Must pass valid start and end block arguments (i.e. yarn main start=6607985 end=7028323');
}

// obtain info
(async () => {
    const provider = new providers.InfuraProvider("homestead", {
        projectId: 'd0b8dc318dd24fd9ab59b7270794b84a',
        projectSecret: 'f8eb648c8bb940ff949826320678a254'
    });

    const kittyCore = new KittyCore(provider);

    // find all birth events in the given block range
    const births = await kittyCore.getBirths(parseInt(start), parseInt(end));

    console.log(`Total Births: ${births.length}`);

    let maxChildren = 0;
    let maxMatronId = BigNumber.from(0);

    // find the matron that birthed the most children
    const children = new Map<string, number>();
    births.forEach(ev => {
        const { matronId } = ev.args;
        const matronIdStr = matronId.toString();

        const count = (children.get(matronIdStr) || 0) + 1;
        children.set(matronIdStr, count);

        if (count > maxChildren) {
            maxChildren = count;
            maxMatronId = matronId;
        }
    });

    console.log(`Max Children Count From Single Matron: ${maxChildren}`);
    console.log(`Matron Id: ${maxMatronId}`);

    // obtain details for the given matron
    const matron = await kittyCore.getKitty(maxMatronId);

    console.log(`Birth Time: ${matron.birthTime.toString()}`);
    console.log(`Generation: ${matron.generation.toString()}`);
    console.log(`Genes: ${matron.genes.toString()}`);
})();
