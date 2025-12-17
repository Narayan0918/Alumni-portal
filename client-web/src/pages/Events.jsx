import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    // Form for new event
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        type: 'Webinar'
    });

    const fetchEvents = async () => {
        try {
            const res = await API.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRSVP = async (id, currentStatus) => {
        try {
            if (currentStatus === 'Going') {
                // Cancel RSVP
                await API.delete(`/events/${id}/rsvp`);
                toast.info("RSVP Cancelled");
            } else {
                // Join RSVP
                await API.post(`/events/${id}/rsvp`);
                toast.success("RSVP Successful! See you there.");
            }
            fetchEvents(); // Refresh list to update counts
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/events', formData);
            setEvents([...events, { ...res.data, attendee_count: 0, my_status: null }]);
            setShowModal(false);
            setFormData({ title: '', description: '', event_date: '', location: '', type: 'Webinar' });
            toast.success("Event Created!");
        } catch (err) {
            toast.error("Failed to create event");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Upcoming Events</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow flex items-center gap-2"
                >
                    + Create Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event.event_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition border border-gray-100">
                        {/* Date Banner */}
                        <div className="bg-purple-100 p-4 text-center">
                            <p className="text-purple-600 font-bold uppercase tracking-wide text-xs">{event.type}</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-2 truncate" title={event.title}>{event.title}</h2>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                            
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <span className="mr-4">📍 {event.location}</span>
                                <span>👥 {event.attendee_count} Attending</span>
                            </div>

                            <button 
                                onClick={() => handleRSVP(event.event_id, event.my_status)}
                                className={`w-full py-2 rounded font-semibold transition ${
                                    event.my_status === 'Going' 
                                    ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {event.my_status === 'Going' ? '✓ You are Going' : 'RSVP Now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Host an Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <input type="text" placeholder="Event Title" className="w-full p-2 border rounded" required 
                                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            
                            <textarea placeholder="Description" className="w-full p-2 border rounded" rows="3" required 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Date & Time</label>
                                    <input type="datetime-local" className="w-full p-2 border rounded" required 
                                        value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Event Type</label>
                                    <select className="w-full p-2 border rounded" 
                                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option>Webinar</option>
                                        <option>Workshop</option>
                                        <option>Reunion</option>
                                        <option>Meetup</option>
                                    </select>
                                </div>
                            </div>
                            
                            <input type="text" placeholder="Location or Zoom Link" className="w-full p-2 border rounded" required 
                                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;