import API from '.';

export default class IPFS {
    static async get(cid: string) {
        const response = await API.raw().get(
            `https://ipfs.io/ipfs/${cid}`,
        );
        return response.data;
    }
}