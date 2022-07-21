import axios from 'axios';

const JWT_KEY = 'auth:token';

export default class API {
    static baseUrl() {
        return process.env.REACT_APP_BASE_API_URL;
    };

    static noAuth() {
        return axios.create({
            baseURL: API.baseUrl(),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    static auth() {
        const token = localStorage.getItem(JWT_KEY);
        if (!token) throw new Error();
        return axios.create({
            baseURL: API.baseUrl(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    static updateToken(token: string) {
        localStorage.setItem(JWT_KEY, token);
    }

    static clearToken() {
        localStorage.removeItem(JWT_KEY);
    }
}