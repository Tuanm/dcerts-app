import { ethers } from 'ethers';

export default class Web3 {
    private provider: ethers.providers.Web3Provider;

    private constructor(provider: ethers.providers.Web3Provider) {
        this.provider = provider;
    }

    static of(provider: ethers.providers.Web3Provider) {
        return new Web3(provider);
    }

    async accounts() {
        return this.provider.listAccounts();
    }

    async sign(message: string) {
        return this.provider.getSigner().signMessage(message);
    }

    contract(address: string = '', abi: string[]) {
        const contractInterface = new ethers.utils.Interface(abi);
        return new ethers.Contract(address, contractInterface, this.provider.getSigner());
    }

    getRevertReason(message: string) {
        const regex = /reverted with reason string '(.*)'\",\"data/g;
        const matches = [];
        const iterator = message.matchAll(regex);
        while (true) {
            const match = iterator.next();
            if (match.done) break;
            matches.push(match.value);
        }
        return ([...matches][0] || [])[1] || message;
    }
}
