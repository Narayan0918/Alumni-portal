import { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            // 1. Send credentials to Backend
            const res = await API.post('/auth/login', formData);
            
            // 2. Save the JWT token to LocalStorage (This is your "digital key")
            localStorage.setItem('token', res.data.token);
            
            // 3. Notify and Redirect
            toast.success('Login Successful!');
            // Force a reload to update the Navbar state immediately
            window.location.href = '/dashboard'; 
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || 'Invalid Credentials');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Alumni Login</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={email} 
                        onChange={onChange} 
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                        required 
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={password} 
                        onChange={onChange} 
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                        required 
                    />
                </div>
                
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200">
                    Login
                </button>
                
                <p className="mt-4 text-center text-sm text-gray-600">
                    New here? <Link to="/register" className="text-blue-500 hover:underline">Create an account</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;