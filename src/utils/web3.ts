import { ethers } from 'ethers';

export default class Web3 {
    private provider: ethers.providers.Web3Provider;

    private constructor(provider: ethers.providers.Web3Provider) {
        this.provider = provider;
    }

    static of(provider: ethers.providers.Web3Provider) {
        return new Web3(provider);
    }

    contract(address: string = '', abi: string[]) {
        const contractInterface = new ethers.utils.Interface(abi);
        return new ethers.Contract(address, contractInterface, this.provider.getSigner());
    }
}
