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
        const regex = /reverted with reason string ["']+(.*)["']+/g;
        const matches = [];
        const iterator = message.matchAll(regex);
        while (true) {
            const match = iterator.next();
            if (match.done) break;
            matches.push(match.value);
        }
        let matched = ([...matches][0] || [])[1] || '';
        let end = 0;
        while (true) {
            if (!matched[end] || matched[end] === `'` || matched[end] === `"`) {
                break;
            }
            end++;
        }
        if (end >= 0) matched = matched.substring(0, end);
        return matched || message;
    }

    getFunctionSignature(method: string, types: string[]) {
        return ethers.utils.id(`${method}(${types.join(',')})`).slice(0, 10);
    }

    getFunctionData(method: string, types: string[], ...params: any[]) {
        const signature = this.getFunctionSignature(method, types);
        const values = new ethers.utils.AbiCoder().encode(types, params).substring(2);
        return signature + values;
    }

    decode(method: string, types: string[], data: string) {
        const signature = this.getFunctionSignature(method, types);
        if (signature !== data.substring(0, 10)) {
            throw new Error('Function not matched');
        }
        return ethers.utils.defaultAbiCoder.decode(
            types,
            ethers.utils.hexDataSlice(data, 4),
        );
    }

    async call(address: string, method: string, types: string[], ...params: any[]) {
        return this.provider.getSigner().call({
            to: address,
            data: this.getFunctionData(method, types, ...params),
        });
    }

    async send(address: string, method: string, types: string[], ...params: any[]) {
        return this.provider.getSigner().sendTransaction({
            to: address,
            data: this.getFunctionData(method, types, ...params),
        });
    }
}
