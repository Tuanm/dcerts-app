import { BigNumber, ethers } from 'ethers';
import Web3 from '../utils/web3';
const { abi } = require('./ContentPool.json');

export default class ContentPool {

    private contract: ethers.Contract;
    private web3: Web3;

    private constructor(address: string, web3: Web3) {
        this.web3 = web3;
        this.contract = this.web3.contract(address, abi);
    }

    static attach(address: string, web3: Web3) {
        return new ContentPool(address, web3);
    }

    async get(contentId: number) {
        const content = await this.contract.get(contentId) as {
            id: BigNumber,
            timestamp: BigNumber,
            author: string,
            locked: boolean,
            tag: string,
            cid: string,
        };
        return {
            ...content,
            id: content.id.toNumber(),
            timestamp: content.timestamp.toNumber(),
        };
    }

    async getBatch(batchId: number) {
        const contents = await this.contract.getBatch(batchId) as {
            id: BigNumber,
            timestamp: BigNumber,
            author: string,
            locked: boolean,
            tag: string,
            cid: string,
        }[];
        return contents.map((content) => {
            return {
                ...content,
                id: content.id.toNumber(),
                timestamp: content.timestamp.toNumber(),
            };
        });
    }
}