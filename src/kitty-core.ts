import { ethers, BigNumber, Contract, Event, EventFilter, providers } from 'ethers';

import { KITTY_CORE_ABI } from './abi';

const CONTRACT_ADDRESS = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';
const MAX_BLOCK_QUERY = 5000;

interface BirthEvent extends Event {
    args: [] & {
        kittyId: BigNumber;
        matronId: BigNumber;
        sireId: BigNumber;
        genes: BigNumber;
    }
}

interface Kitty {
    birthTime: BigNumber;
    generation: BigNumber;
    genes: BigNumber;
}

export class KittyCore {
    private contract: Contract

    get Birth(): EventFilter { return this.contract.filters.Birth(); }

    constructor(readonly provider: providers.InfuraProvider) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, KITTY_CORE_ABI, provider)
    }

    async getBirths(startingBlock: number, endingBlock: number): Promise<BirthEvent[]> {
        const queries: Promise<BirthEvent[]>[] = [];

        // split up into multiple parallel queries; Infura limits query results to 10,000 events
        for (let start = startingBlock; start <= endingBlock; start += MAX_BLOCK_QUERY) {
            const end = Math.min(endingBlock, start + MAX_BLOCK_QUERY - 1);
            queries.push(this.contract.queryFilter(this.Birth, start, end) as Promise<BirthEvent[]>);
        }

        return (await Promise.all(queries)).flat();
    }

    async getKitty(id: BigNumber): Promise<Kitty> {
        return this.contract.getKitty(id);
    }
}