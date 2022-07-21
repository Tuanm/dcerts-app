import { ethers } from 'ethers';

export default class Web3 {
    private provider: ethers.providers.Web3Provider;

    private constructor(provider: ethers.providers.Web3Provider) {
        this.provider = provider;
    }

    static of(provider: ethers.providers.Web3Provider) {
        return new Web3(provider);
    }

    getProvider() {
        return this.provider;
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
        const regex = /reverted with reason string '(.*)'/g;
        const matches = [];
        const iterator = message.matchAll(regex);
        while (true) {
            const match = iterator.next();
            if (match.done) break;
            matches.push(match.value);
        }
        let matched = ([...matches][0] || [])[1] || '';
        const end = matched.indexOf(`'`)
        if (end >= 0) matched = matched.substring(0, end);
        return matched || message;
    }

    async send(address: string, method: string, types: string[], ...params: any[]) {
        const signature = ethers.utils.id(`${method}(${types.join(',')})`).slice(0, 10);
        const values = new ethers.utils.AbiCoder().encode(types, params).substring(2);
        return this.provider.getSigner().sendTransaction({
            to: address,
            data: signature + values,
        });
    }
}
