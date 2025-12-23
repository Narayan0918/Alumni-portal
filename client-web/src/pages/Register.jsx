import { useState , useEffect} from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        graduation_year: '',
        major: '',
        institution_id: '',
        new_institute_name: '', 
        new_institute_location: ''
    });

    const { email, password, full_name, graduation_year, major,institution_id,new_institute_name, new_institute_location } = formData;

    // 2. Fetch Colleges on Page Load
    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const res = await API.get('/institutions');
                setInstitutions(res.data);
                
                // Auto-select the first one if available (User Friendly)
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, institution_id: res.data[0].institution_id }));
                }
            } catch (err) {
                console.error("Failed to load colleges");
            }
        };
        fetchInstitutions();
    }, []);


    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            toast.success('Registration Successful!');
            navigate('/dashboard');
            window.location.href = '/feed'; // Redirect to the new Feed
        } catch (err) {
            toast.error(err.response?.data || 'Error registering');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Alumni Join</h2>
                
                {/* College Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Select Your College</label>
                    <select 
                        name="institution_id" 
                        value={institution_id} 
                        onChange={onChange} 
                        className="w-full p-2 border rounded bg-white"
                        required
                    >
                        <option value="" disabled>-- Select Institute --</option>
                        {institutions.map(inst => (
                            <option key={inst.institution_id} value={inst.institution_id}>{inst.name}</option>
                        ))}
                        <option value="other" className="font-bold text-blue-600">+ Add New Institute</option>
                    </select>
                </div>

                {/* CONDITIONAL INPUTS: Only show if "Other" is selected */}
                {institution_id === 'other' && (
                    <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                        <p className="text-xs text-blue-600 mb-2 font-bold">New Institute Details:</p>
                        <input 
                            type="text" 
                            name="new_institute_name" 
                            value={new_institute_name} 
                            onChange={onChange} 
                            placeholder="Institute Name" 
                            className="w-full mb-2 p-2 border rounded text-sm" 
                            required 
                        />
                        <input 
                            type="text" 
                            name="new_institute_location" 
                            value={new_institute_location} 
                            onChange={onChange} 
                            placeholder="City/Location" 
                            className="w-full p-2 border rounded text-sm" 
                            required 
                        />
                    </div>
                )}


                <input type="text" name="full_name" value={full_name} onChange={onChange} placeholder="Full Name" className="w-full mb-3 p-2 border rounded" required />
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" className="w-full mb-3 p-2 border rounded" required />
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" className="w-full mb-3 p-2 border rounded" required />
                <input type="number" name="graduation_year" value={graduation_year} onChange={onChange} placeholder="Graduation Year" className="w-full mb-3 p-2 border rounded" required />
                <input type="text" name="major" value={major} onChange={onChange} placeholder="Major (e.g. CSE)" className="w-full mb-4 p-2 border rounded" required />
                
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;