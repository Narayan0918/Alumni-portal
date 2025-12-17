import { useEffect, useState } from 'react';
import API from '../api/axios';
import Spinner from '../components/Spinner';

const Directory = () => {
    const [alumni, setAlumni] = useState([]);
    const [search, setSearch] = useState({ name: '', major: '', year: '' });
    const [loading, setLoading] = useState(true);

    // Fetch alumni with filters
    const fetchAlumni = async () => {
        try {
            // Build query string: /users?name=John&major=CS
            const query = new URLSearchParams(search).toString();
            const res = await API.get(`/users?${query}`);
            setAlumni(res.data);
        } catch (err) {
            console.error("Error fetching directory", err);
        }
        finally {
            // 👇 THIS BLOCK IS MANDATORY
            // It runs whether the result is 200, 304, or 500.
            setLoading(false); 
        }
    };

    // Initial load
    useEffect(() => {
        fetchAlumni();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAlumni();
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Alumni Directory</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white p-4 shadow rounded-lg flex flex-wrap gap-4 mb-8 justify-center">
                <input 
                    type="text" 
                    placeholder="Search by Name" 
                    className="p-2 border rounded w-full md:w-1/4"
                    value={search.name}
                    onChange={(e) => setSearch({...search, name: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="Major (e.g. CSE)" 
                    className="p-2 border rounded w-full md:w-1/4"
                    value={search.major}
                    onChange={(e) => setSearch({...search, major: e.target.value})}
                />
                 <input 
                    type="number" 
                    placeholder="Year" 
                    className="p-2 border rounded w-full md:w-1/5"
                    value={search.year}
                    onChange={(e) => setSearch({...search, year: e.target.value})}
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Search
                </button>
            </form>

            {/* Results Grid */}
            {loading ? (
                <Spinner />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumni.map(user => (
                    <div key={user.profile_id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                {user.full_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{user.full_name}</h3>
                                <p className="text-gray-500 text-sm">{user.job_title} at {user.current_company}</p>
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                            <p>🎓 {user.degree} in {user.major}, {user.graduation_year}</p>
                            {user.is_mentor && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                                    Available Mentor
                                </span>
                            )}
                        </div>
                        <button className="mt-4 w-full border border-blue-600 text-blue-600 py-1 rounded hover:bg-blue-50">
                            View Profile
                        </button>
                    </div>
                ))}
            </div>
            )}
            
            {alumni.length === 0 && <p className="text-center text-gray-500">No alumni found.</p>}
        </div>
    );
};

export default Directory;