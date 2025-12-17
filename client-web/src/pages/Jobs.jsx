import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'; // <--- 1. ADD IMPORT

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true); // <--- 2. ADD LOADING STATE
    const [search, setSearch] = useState({ title: '', location: '' });
    
    // Form State
    const [formData, setFormData] = useState({
        company_name: '',
        job_title: '',
        location: '',
        job_type: 'Full-time',
        description: '',
        apply_link: ''
    });

    const fetchJobs = async () => {
        try {
            const query = new URLSearchParams(search).toString();
            const res = await API.get(`/jobs?${query}`);
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false); // <--- 3. STOP LOADING AFTER FETCH
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/jobs', formData);
            setJobs([res.data, ...jobs]); // Add new job to top of list
            setShowModal(false);
            setFormData({ company_name: '', job_title: '', location: '', job_type: 'Full-time', description: '', apply_link: '' });
            toast.success("Job Posted Successfully!");
        } catch (err) {
            toast.error("Failed to post job");
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Are you sure you want to delete this job?")) return;
        try {
            await API.delete(`/jobs/${id}`);
            setJobs(jobs.filter(job => job.job_id !== id));
            toast.success("Job deleted");
        } catch (err) {
            toast.error(err.response?.data || "Delete failed");
        }
    };

    // Helper to check if current user is the owner (decoding token simply)
    // In production, better to store user ID in context.
    const getUserId = () => {
        const token = localStorage.getItem('token');
        if(!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user.id;
    };
    const currentUserId = getUserId();

    if (loading) return <Spinner />;
    
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Career Opportunities</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-lg flex items-center gap-2"
                >
                    + Post a Job
                </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white p-4 shadow rounded-lg flex flex-wrap gap-4 mb-8">
                <input 
                    type="text" 
                    placeholder="Job Title (e.g. Engineer)" 
                    className="p-2 border rounded grow"
                    value={search.title}
                    onChange={(e) => setSearch({...search, title: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="Location" 
                    className="p-2 border rounded grow"
                    value={search.location}
                    onChange={(e) => setSearch({...search, location: e.target.value})}
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Filter</button>
            </form>

            {/* Job List */}
            <div className="space-y-4">
                {jobs.map(job => (
                    <div key={job.job_id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{job.job_title}</h2>
                                <p className="text-gray-600 font-medium">{job.company_name} • <span className="text-gray-500 text-sm">{job.location}</span></p>
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">{job.job_type}</span>
                            </div>
                            
                            {/* Delete Button (Only for owner) */}
                            {currentUserId === job.posted_by_user_id && (
                                <button onClick={() => handleDelete(job.job_id)} className="text-red-500 text-sm hover:underline">
                                    Delete
                                </button>
                            )}
                        </div>

                        <p className="mt-4 text-gray-600 whitespace-pre-wrap">{job.description}</p>

                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                            <p className="text-sm text-gray-500 italic">Posted by {job.poster_name}</p>
                            <a 
                                href={job.apply_link.includes('@') ? `mailto:${job.apply_link}` : job.apply_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            >
                                Apply Now
                            </a>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && <p className="text-center text-gray-500">No jobs found matching your criteria.</p>}
            </div>

            {/* Create Job Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <input type="text" placeholder="Job Title" className="w-full p-2 border rounded" required 
                                value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} />
                            
                            <input type="text" placeholder="Company Name" className="w-full p-2 border rounded" required 
                                value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                            
                            <div className="flex gap-4">
                                <input type="text" placeholder="Location" className="w-full p-2 border rounded" required 
                                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                <select className="w-full p-2 border rounded" 
                                    value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})}>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Internship</option>
                                    <option>Remote</option>
                                </select>
                            </div>

                            <textarea placeholder="Job Description" className="w-full p-2 border rounded" rows="4" required 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            
                            <input type="text" placeholder="Apply Link (URL or Email)" className="w-full p-2 border rounded" required 
                                value={formData.apply_link} onChange={e => setFormData({...formData, apply_link: e.target.value})} />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Post Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;