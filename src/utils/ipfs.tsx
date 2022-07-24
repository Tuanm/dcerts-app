import { create, IPFSHTTPClient } from 'ipfs-http-client';

export default class IPFS {
    private client: IPFSHTTPClient;

    private constructor(client: IPFSHTTPClient) {
        this.client = client;
    }

    static create() {
        return new IPFS(create({
            url: process.env.REACT_APP_IPFS_URL,
            headers: {
                authorization: process.env.REACT_APP_IPFS_AUTHORIZATION || '',
            }
        }));
    }

    async add(content: any) {
        const { cid } = await this.client.add(content);
        return cid;
    }

    async addAll(contents: any[]) {
        const cids = [];
        for await (const { cid } of this.client.addAll(contents)) {
            cids.push(cid);
        }
        return cids;
    }
}
