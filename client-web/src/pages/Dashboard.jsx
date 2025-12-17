import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'; // <--- 1. ADD THIS IMPORT

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // State for form inputs
    const [formData, setFormData] = useState({
        full_name: '',
        current_company: '',
        job_title: '',
        bio: '',
        skills: '', // We will manage skills as a comma-separated string in the form (e.g. "React, Node")
        linkedin: '',
        twitter: '',
        github: ''
    });

    // Fetch Profile on Load
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get('/users/me');
                setProfile(res.data);
                
                // Parse social links safely
                const social = res.data.social_links || {};
                
                setFormData({
                    full_name: res.data.full_name || '',
                    current_company: res.data.current_company || '',
                    job_title: res.data.job_title || '',
                    bio: res.data.bio || '',
                    // Convert array ["A", "B"] -> string "A, B" for the input field
                    skills: res.data.skills ? res.data.skills.join(', ') : '', 
                    linkedin: social.linkedin || '',
                    twitter: social.twitter || '',
                    github: social.github || ''
                });
            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
            }
        };
        fetchProfile();
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            // Prepare data for backend
            const payload = {
                full_name: formData.full_name,
                current_company: formData.current_company,
                job_title: formData.job_title,
                bio: formData.bio,
                // Convert string "A, B" -> array ["A", "B"]
                skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''), 
                // Pack social links into JSON object
                social_links: {
                    linkedin: formData.linkedin,
                    twitter: formData.twitter,
                    github: formData.github
                }
            };

            const res = await API.put('/users/me', payload);
            setProfile({ ...profile, ...res.data }); // Update UI immediately
            setIsEditing(false);
            toast.success("Profile Updated!");
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

if (!profile) return <Spinner />;
    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {/* VIEW MODE */}
            {!isEditing ? (
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                            {profile.full_name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                            <p className="text-gray-600">{profile.job_title} at {profile.current_company}</p>
                            <p className="text-sm text-gray-500">{profile.email} • Class of {profile.graduation_year}</p>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-semibold text-gray-700 mb-2">About</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{profile.bio || 'No bio added yet.'}</p>
                    </div>

                    {/* Skills */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic">No skills listed.</span>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Social Profiles</h3>
                        <div className="flex space-x-4">
                            {profile.social_links?.linkedin && (
                                <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>
                            )}
                            {profile.social_links?.twitter && (
                                <a href={profile.social_links.twitter} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Twitter</a>
                            )}
                            {profile.social_links?.github && (
                                <a href={profile.social_links.github} target="_blank" rel="noreferrer" className="text-gray-800 hover:underline">GitHub</a>
                            )}
                            {!profile.social_links?.linkedin && !profile.social_links?.twitter && !profile.social_links?.github && (
                                <span className="text-gray-500 italic">No social links added.</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* EDIT MODE FORM */
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={onChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Current Company</label>
                        <input type="text" name="current_company" value={formData.current_company} onChange={onChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Job Title</label>
                        <input type="text" name="job_title" value={formData.job_title} onChange={onChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-700 font-semibold mb-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={onChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-700 font-semibold mb-1">Skills (Comma separated)</label>
                        <input type="text" name="skills" value={formData.skills} onChange={onChange} placeholder="React, Python, Project Management" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        <p className="text-xs text-gray-500 mt-1">Separate skills with commas.</p>
                    </div>

                    <div className="col-span-2 border-t pt-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Social Links</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="text" name="linkedin" value={formData.linkedin} onChange={onChange} placeholder="LinkedIn URL" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="text" name="twitter" value={formData.twitter} onChange={onChange} placeholder="Twitter URL" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="text" name="github" value={formData.github} onChange={onChange} placeholder="GitHub URL" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="col-span-2 mt-4 flex justify-end space-x-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow">Save Changes</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Dashboard;