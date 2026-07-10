import axios from "axios";

export const api = axios.create({
  baseURL: "https://casa-cambio-backend-3qsp.onrender.com",
  headers: {
    "x-user-id": "1",
  },
});