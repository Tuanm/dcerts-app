import API from '.';

interface WallData {
    id: string,
    data: string[],
}

export default class Wall {
    static async me() {
        const response = await API.auth().get('/wall/me');
        return response.data as WallData;
    }

    static async group(groupId: string) {
        const response = await API.auth().get(`/wall/members/${groupId}`);
        return response.data as WallData;
    }

    static async member(memberId: string) {
        const response = await API.auth().get(`/wall/groups/${memberId}`);
        return response.data as WallData;
    }
}