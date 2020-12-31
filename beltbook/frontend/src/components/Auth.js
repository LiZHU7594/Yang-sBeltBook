import {BehaviorSubject} from "rxjs";
import axios from 'axios';

const AuthUrl = '/auth';

const userTokenSubject = new BehaviorSubject(localStorage.getItem('token'));
export const usernameSubject = new BehaviorSubject(localStorage.getItem('username'));

userTokenSubject.subscribe(t => {
    if (t) axios.defaults.headers.common['Authorization'] = `Token ${t}`;
    else delete axios.defaults.headers.common['Authorization'];
})


export const auth = {
    login,
    logout,
    register,
    userDetails,
    userToken: userTokenSubject.asObservable(),
    currentUsername: usernameSubject.asObservable(),

    get token() {
        return userTokenSubject.value
    },
    get username() {
        return usernameSubject.value
    }
}

function login(username, password) {
    return axios.post(`${AuthUrl}/login/`,
        {
            username: username,
            password: password
        }).then(handleResponse)
        .then(response => {
            const token = response.data;
            localStorage.setItem('token', token.key);
            localStorage.setItem('username', username);
            userTokenSubject.next(token.key);
            usernameSubject.next(username);
            return response;
        });
}

function register(username, pw1, pw2, email) {
    return axios.post(`${AuthUrl}/registration/`,
        {
            username: username,
            password1: pw1,
            password2: pw2,
            email: email
        });
}

function userDetails() {
    return axios.get(`${AuthUrl}/user/`)
        .then(handleResponse)
        .catch(function (thrown) {
            location.reload();
        });
}

function logout() {
    axios.post(`${AuthUrl}/logout/`).then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        userTokenSubject.next(null);
        usernameSubject.next(null);
    });
}

const handleResponse = (response) => {
    const {status} = response;
    if ([400, 401, 403].includes(status)) {
        auth.logout();
    }
    return response;
}