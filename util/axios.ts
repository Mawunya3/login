import axios from 'axios';

const api = axios.create({
  baseURL: 'https://memo-integration-server.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
