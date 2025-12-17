import { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        graduation_year: '',
        major: ''
    });

    const { email, password, full_name, graduation_year, major } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            toast.success('Registration Successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data || 'Error registering');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Alumni Join</h2>
                
                <input type="text" name="full_name" value={full_name} onChange={onChange} placeholder="Full Name" className="w-full mb-3 p-2 border rounded" required />
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" className="w-full mb-3 p-2 border rounded" required />
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" className="w-full mb-3 p-2 border rounded" required />
                <input type="number" name="graduation_year" value={graduation_year} onChange={onChange} placeholder="Graduation Year" className="w-full mb-3 p-2 border rounded" required />
                <input type="text" name="major" value={major} onChange={onChange} placeholder="Major (e.g. CSE)" className="w-full mb-4 p-2 border rounded" required />
                
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
            </form>
        </div>
    );
};

export default Register;