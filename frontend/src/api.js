import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", //Springboot API
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or wherever you store it
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

//After that call the api via fhe frontend somethin like that it all depends on the frontend 
//code components though and springboot endpoints 

const response = await api.post('/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess("Account Successfully Created!");
        setError('');

        const tokenResponse = await api.post('/token', new URLSearchParams({
          username: formData.email,
          password: formData.password
        }));

        if (tokenResponse.data.token){
          localStorage.setItem('token', tokenResponse.data.token);

          window.location.href = '/';
        }
}