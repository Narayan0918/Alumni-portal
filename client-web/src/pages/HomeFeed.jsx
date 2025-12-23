import { useEffect, useState } from 'react';
import API from '../api/axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const HomeFeed = () => {
    const [feed, setFeed] = useState({ stories: [], events: [], jobs: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await API.get('/feed');
                setFeed(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* 1. WELCOME HEADER */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 rounded-2xl shadow-lg text-white">
                <h1 className="text-4xl font-bold mb-2">Government Engineering College</h1>
                <p className="text-blue-100 text-lg">Welcome to your Alumni Community Hub. Here is what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. SUCCESS STORIES COLUMN */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-yellow-400">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🌟 Inspiring Stories
                        <Link to="/stories" className="text-xs text-blue-500 font-normal ml-auto hover:underline">View All</Link>
                    </h2>
                    <div className="space-y-4">
                        {feed.stories.map(story => (
                            <div key={story.story_id} className="border-b pb-3 last:border-0">
                                <h3 className="font-semibold text-gray-800">{story.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{story.preview}...</p>
                                <p className="text-xs text-blue-600 mt-1">— {story.author}</p>
                            </div>
                        ))}
                        {feed.stories.length === 0 && <p className="text-gray-400 italic">No stories yet.</p>}
                    </div>
                </div>

                {/* 3. UPCOMING EVENTS COLUMN */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        📅 Upcoming Events
                        <Link to="/events" className="text-xs text-blue-500 font-normal ml-auto hover:underline">View All</Link>
                    </h2>
                    <div className="space-y-4">
                        {feed.events.map(event => (
                            <div key={event.event_id} className="flex gap-3 items-start border-b pb-3 last:border-0">
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-center min-w-[60px]">
                                    <div className="text-xs font-bold uppercase">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</div>
                                    <div className="text-lg font-bold">{new Date(event.event_date).getDate()}</div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{event.type}</span>
                                </div>
                            </div>
                        ))}
                        {feed.events.length === 0 && <p className="text-gray-400 italic">No upcoming events.</p>}
                    </div>
                </div>

                {/* 4. LATEST JOBS COLUMN */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-purple-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        💼 Latest Jobs
                        <Link to="/jobs" className="text-xs text-blue-500 font-normal ml-auto hover:underline">View All</Link>
                    </h2>
                    <div className="space-y-4">
                        {feed.jobs.map(job => (
                            <div key={job.job_id} className="border-b pb-3 last:border-0">
                                <h3 className="font-semibold text-gray-800">{job.job_title}</h3>
                                <p className="text-sm text-gray-600">{job.company_name}</p>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded mt-1 inline-block">{job.job_type}</span>
                            </div>
                        ))}
                        {feed.jobs.length === 0 && <p className="text-gray-400 italic">No job postings.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeFeed;