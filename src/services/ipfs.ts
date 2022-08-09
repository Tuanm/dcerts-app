import API from '.';

export default class IPFS {
    static async get(cid: string) {
        const response = await API.raw().get(
            `${process.env.REACT_APP_IPFS_PUBLIC_URL}/ipfs/${cid}`,
        );
        return response.data;
    }
}
