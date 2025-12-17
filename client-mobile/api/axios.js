import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// REPLACE '192.168.x.x' WITH YOUR ACTUAL COMPUTER IP ADDRESS
// Keep the port :5000
const BASE_URL = 'http://192.168.0.127:5000/api/v1'; 

const API = axios.create({
    baseURL: BASE_URL,
});

// Add Token to requests
API.interceptors.request.use(async (req) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;