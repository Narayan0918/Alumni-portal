import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Stories = () => {
    const [stories, setStories] = useState([]);
    const [pendingStories, setPendingStories] = useState([]);
    const [view, setView] = useState('read'); // 'read', 'submit', 'admin'
    
    // Form State
    const [formData, setFormData] = useState({ title: '', content: '' });

    const fetchStories = async () => {
        try {
            const res = await API.get('/stories');
            setStories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPending = async () => {
        try {
            const res = await API.get('/stories/pending');
            setPendingStories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStories();
        fetchPending();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/stories', formData);
            toast.success("Story submitted for approval!");
            setFormData({ title: '', content: '' });
            setView('read');
        } catch (err) {
            toast.error("Failed to submit");
        }
    };

    const handleModeration = async (id, status) => {
        try {
            await API.put(`/stories/${id}/status`, { status });
            toast.success(`Story ${status}`);
            fetchPending(); // Remove from pending list
            fetchStories(); // Update public list if approved
        } catch (err) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="container mx-auto p-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Success Stories 🌟</h1>
                
                <div className="bg-white p-1 rounded-lg shadow border flex">
                    <button 
                        onClick={() => setView('read')}
                        className={`px-4 py-2 rounded-md transition ${view === 'read' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-600'}`}
                    >
                        Read Stories
                    </button>
                    <button 
                        onClick={() => setView('submit')}
                        className={`px-4 py-2 rounded-md transition ${view === 'submit' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-600'}`}
                    >
                        Share Yours
                    </button>
                    <button 
                        onClick={() => setView('admin')}
                        className={`px-4 py-2 rounded-md transition ${view === 'admin' ? 'bg-red-100 text-red-700 font-bold' : 'text-gray-600'}`}
                    >
                        Admin Panel ({pendingStories.length})
                    </button>
                </div>
            </div>

            {/* 1. READ VIEW */}
            {view === 'read' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {stories.map(story => (
                        <div key={story.story_id} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
                            <h2 className="text-2xl font-bold mb-2 text-gray-800">{story.title}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <span className="font-semibold text-blue-600">{story.author_name}</span>
                                <span>•</span>
                                <span>{story.job_title} at {story.current_company}</span>
                            </div>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {story.content}
                            </p>
                        </div>
                    ))}
                    {stories.length === 0 && <p className="text-gray-500">No stories yet. Be the first to share!</p>}
                </div>
            )}

            {/* 2. SUBMIT VIEW */}
            {view === 'submit' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6">Share Your Achievement</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Title</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., How I built my startup"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Your Story</label>
                            <textarea 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-64"
                                placeholder="Inspire us..."
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                            Submit for Review
                        </button>
                    </form>
                </div>
            )}

            {/* 3. ADMIN VIEW */}
            {view === 'admin' && (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-red-700">Moderation Queue</h2>
                    {pendingStories.length === 0 ? (
                        <div className="bg-green-50 p-6 rounded text-green-700 text-center">
                            All caught up! No pending stories.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingStories.map(story => (
                                <div key={story.story_id} className="bg-white p-6 rounded-lg shadow flex justify-between items-start gap-4">
                                    <div className="grow">
                                        <h3 className="text-xl font-bold">{story.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">By {story.author_name}</p>
                                        <p className="text-gray-600 line-clamp-2">{story.content}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-100px">
                                        <button 
                                            onClick={() => handleModeration(story.story_id, 'approved')}
                                            className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleModeration(story.story_id, 'rejected')}
                                            className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Stories;