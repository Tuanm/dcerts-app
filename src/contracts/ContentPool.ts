import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import { textToUTF8Bytes } from '../utils/hex';

const { abi } = require('./ContentPool.json');
const contentPoolInterface = new ethers.utils.Interface(abi);

export function functionSignature(functionName: string) {
    return contentPoolInterface.getSighash(functionName);
}

export function signAdd(cid: string) {
    const signature = contentPoolInterface.getSighash('add');
    const data = ethers.utils.defaultAbiCoder.encode(['string'], [cid]);
    return {
        functionName: signature,
        parameters: data,
    };
}

export function signAddBatch(cids: string[]) {
    const signature = contentPoolInterface.getSighash('addBatch');
    const cidBytes = textToUTF8Bytes(cids.join(''));
    const prefixBytes = 8;
    const totalBytes = prefixBytes + cidBytes.length;
    const bytes = new Uint8Array(totalBytes);
    bytes[prefixBytes - 1] = cids[0].length; // <= 255
    for (let index = prefixBytes; index < totalBytes; index++) {
        bytes[index] = cidBytes[index + prefixBytes];
    }
    const data = '0x' + Buffer.from(bytes).toString('hex');
    return {
        functionName: signature,
        parameters: data,
    };
}

export function signLock(id: number) {
    const signature = contentPoolInterface.getSighash('lock');
    const data = ethers.utils.defaultAbiCoder.encode(['uint256'], [id]);
    return {
        functionName: signature,
        parameters: data,
    };
}

export function signLockBatch(id: number) {
    const signature = contentPoolInterface.getSighash('lockBatch');
    const data = ethers.utils.defaultAbiCoder.encode(['uint256'], [id]);
    return {
        functionName: signature,
        parameters: data,
    };
}

export function signUnlock(id: number) {
    const signature = contentPoolInterface.getSighash('unlock');
    const data = ethers.utils.defaultAbiCoder.encode(['uint256'], [id]);
    return {
        functionName: signature,
        parameters: data,
    };
}

export function signUnlockBatch(id: number) {
    const signature = contentPoolInterface.getSighash('unlockBatch');
    const data = ethers.utils.defaultAbiCoder.encode(['uint256'], [id]);
    return {
        functionName: signature,
        parameters: data,
    };
}