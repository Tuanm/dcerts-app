import { BigNumber, ethers } from 'ethers';
import Web3 from '../utils/web3';
const { abi } = require('./BallotWallet.json');
const { functions } = require('./ContentPool.json');

export default class BallotWallet {

    private contract: ethers.Contract;
    private web3: Web3;

    private constructor(address: string, web3: Web3) {
        this.contract = new ethers.Contract(address, new ethers.utils.Interface(abi), web3.getProvider());
        this.web3 = web3;
    }

    static attach(address: string, web3: Web3) {
        return new BallotWallet(address, web3);
    }

    async peek(action: number) {
        const result = await this.contract.peek(action) as {
            id: number,
            starter: string,
            startTime: number,
            executionTime: number,
            cancellationTime: number,
            data: string,
            executed: boolean,
            cancelled: boolean,
        };
        return {
            ...result,
            decodedData: this.decodeData(result.data),
        };
    }

    decodeData(data: string) {
        for (const name of Object.keys(functions)) {
            try {
                const types = functions[name];
                const inputs = this.web3.decode(name, types, data);
                return {
                    method: name,
                    inputs,
                };
            } catch {};
        }
        throw new Error('Action unidentified');
    }

    static parseAddBatch(inputs: ethers.utils.Result) {
        const result = [] as {
            cid: string,
            tag: number,
        }[];
        for (const input of (inputs[0] || [])) {
            const cid = input[0] as string;
            const tag = input[1] as BigNumber;
            result.push({
                cid: cid,
                tag: tag.toNumber(),
            });
        }
        return result;
    }

    static parseLockBatch(inputs: ethers.utils.Result) {
        return (inputs[0] as BigNumber).toNumber();
    }

    static parseUnlockBatch(inputs: ethers.utils.Result) {
        return (inputs[0] as BigNumber).toNumber();
    }

    static parseLockContent(inputs: ethers.utils.Result) {
        return (inputs[0] as BigNumber).toNumber();
    }

    static parseUnlockContent(inputs: ethers.utils.Result) {
        return (inputs[0] as BigNumber).toNumber();
    }
}