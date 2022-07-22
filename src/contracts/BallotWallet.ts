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
        const { method, inputs } = this.decodeData(result.data);
        return {
            ...result,
            decodedData: {
                method,
                inputs: inputs[0] as [],
            },
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
}