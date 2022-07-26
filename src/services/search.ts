import API from '.';

export default class Search {
    static async forCollection<T>(collection: string, query: Object = {}): Promise<{
        data: T[],
        total: number,
    }> {
        const response = await API.auth().get(
            `/search/${collection}`,
            {
                params: query,
            },
        );
        return response.data;
    }
}