import { ethers } from 'ethers';
import { textToUTF8Bytes } from '../utils/hex';

const { abi } = require('./ContentPool.json');
const contentPoolInterface = new ethers.utils.Interface(abi);

export function signAdd(cid: string) {
    const signature = contentPoolInterface.getSighash('add');
    const data = textToUTF8Bytes(
        ethers.utils.defaultAbiCoder.encode(['string'], [cid]),
    );
    return {
        functionName: signature,
        parameters: data,
    };
}