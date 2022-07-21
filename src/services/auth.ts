import API from '.';

export default class Auth {
    static async authenticate(accountId: string, signature: string) {
        const response = await API.noAuth().post(
            `/auth/${accountId}`,
            {
                signature,
            },
        );
        const token = response.data as string;
        API.updateToken(token);
        return token;
    }

    static async nonce() {
        const response = await API.noAuth().get('/auth');
        return response.data as string;
    }
}