import { useEffect, useState, useRef } from 'react';
import API from '../api/axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const ENDPOINT = "http://localhost:5000"; // Backend URL

const Chat = () => {
    const [contacts, setContacts] = useState([]);
    const [currentChat, setCurrentChat] = useState(null); // The user I am talking to
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    
    const socket = useRef();
    const scrollRef = useRef(); // Auto-scroll to bottom

    // 1. Initial Setup (Get My ID + Connect Socket)
    useEffect(() => {
        const setup = async () => {
            try {
                // Get My Profile
                const res = await API.get('/users/me');
                setCurrentUser(res.data);

                // Fetch All Contacts (Using Directory API)
                const usersRes = await API.get('/users');
                // Filter out myself
                setContacts(usersRes.data.filter(u => u.user_id !== res.data.user_id));

                // Initialize Socket
                socket.current = io(ENDPOINT);
                socket.current.emit("join_chat", res.data.user_id);

                // Listen for incoming messages
                socket.current.on("receive_message", (data) => {
                    // Only append if the message is from the person I'm currently chatting with
                    setMessages((prev) => [...prev, data]);
                });

            } catch (err) {
                console.error(err);
            }
        };
        setup();
        
        return () => {
             // Cleanup on unmount
             if(socket.current) socket.current.disconnect(); 
        }
    }, []);

    // 2. Fetch Chat History when clicking a user
    useEffect(() => {
        const getMessages = async () => {
            if (currentChat) {
                try {
                    const res = await API.get(`/chat/${currentChat.user_id}`);
                    setMessages(res.data);
                } catch (err) {
                    console.error(err);
                }
            }
        };
        getMessages();
    }, [currentChat]);

    // 3. Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 4. Send Message Function
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: currentUser.user_id,
            receiver_id: currentChat.user_id,
            content: newMessage,
            created_at: new Date().toISOString() // Optimistic update
        };

        // Emit to Socket Server
        socket.current.emit("send_message", messageData);

        // Update Local State instantly (so I don't wait for server)
        setMessages((prev) => [...prev, messageData]);
        setNewMessage("");
    };

    return (
        <div className="container mx-auto p-6 h-[calc(100vh-100px)]">
            <div className="flex h-full bg-white rounded-lg shadow-lg border overflow-hidden">
                
                {/* LEFT: Sidebar (Contacts) */}
                <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
                    <div className="p-4 bg-gray-100 border-b font-bold text-gray-700">Messages</div>
                    {contacts.map(u => (
                        <div 
                            key={u.user_id} 
                            onClick={() => setCurrentChat(u)}
                            className={`p-4 flex items-center cursor-pointer hover:bg-blue-50 transition border-b ${currentChat?.user_id === u.user_id ? 'bg-blue-100' : ''}`}
                        >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {u.full_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{u.full_name}</h3>
                                <p className="text-xs text-gray-500 truncate w-32">{u.job_title || 'Alumni'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {currentChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b bg-white flex items-center shadow-sm">
                                <h2 className="text-xl font-bold text-gray-800">{currentChat.full_name}</h2>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-4">
                                {messages.map((m, index) => {
                                    const isMine = m.sender_id === currentUser.user_id;
                                    return (
                                        <div key={index} ref={scrollRef} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs px-4 py-2 rounded-lg shadow ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                                <p>{m.content}</p>
                                                <span className={`text-[10px] block mt-1 text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex gap-2">
                                <input 
                                    type="text" 
                                    className="grow p-2 border rounded-full px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white px-6 rounded-full hover:bg-blue-700 font-bold">
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="text-6xl mb-4">💬</span>
                            <p className="text-xl">Select an alumnus to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;