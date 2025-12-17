import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Donations = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await API.get('/donations/campaigns');
                setCampaigns(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCampaigns();
    }, []);

    // Helper to load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        
        if (!amount || amount <= 0) return toast.error("Enter valid amount");

        const res = await loadRazorpay();
        if (!res) return toast.error("Razorpay SDK failed to load");

        try {
            // 1. Create Order on Backend
            const orderRes = await API.post('/donations/order', { 
                amount: amount, 
                campaign_id: selectedCampaign.campaign_id 
            });
            
            const { id: order_id, amount: order_amount, currency } = orderRes.data;

            // 2. Open Razorpay Options
            const options = {
                key: "YOUR_RAZORPAY_TEST_KEY_ID", // REPLACE THIS WITH YOUR KEY ID
                amount: order_amount,
                currency: currency,
                name: "Alumni Association",
                description: `Donation for ${selectedCampaign.title}`,
                order_id: order_id,
                handler: async function (response) {
                    // 3. Verify Payment on Backend
                    try {
                        const verifyRes = await API.post('/donations/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            campaign_id: selectedCampaign.campaign_id,
                            amount: amount
                        });
                        
                        if (verifyRes.data.status === 'success') {
                            toast.success("Donation Successful! Thank you.");
                            setAmount('');
                            setSelectedCampaign(null);
                            // Refresh campaigns to see updated total
                            const refreshRes = await API.get('/donations/campaigns');
                            setCampaigns(refreshRes.data);
                        }
                    } catch (err) {
                        toast.error("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: "Alumni Donor",
                    email: "donor@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            toast.error("Donation initiation failed");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Support Your Alma Mater</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {campaigns.map(campaign => {
                    const progress = (campaign.current_amount / campaign.goal_amount) * 100;
                    
                    return (
                        <div key={campaign.campaign_id} className="bg-white rounded-xl shadow-lg overflow-hidden border">
                            <div className="h-48 bg-blue-600 flex items-center justify-center">
                                <span className="text-white text-4xl font-bold">{campaign.title.charAt(0)}</span>
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">{campaign.title}</h2>
                                <p className="text-gray-600 mb-4">{campaign.description}</p>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                        <span>Raised: ₹{campaign.current_amount}</span>
                                        <span>Goal: ₹{campaign.goal_amount}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedCampaign(campaign)}
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Donation Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Donate to {selectedCampaign.title}</h2>
                        
                        <label className="block text-gray-700 text-sm font-bold mb-2">Amount (₹)</label>
                        <input 
                            type="number" 
                            className="w-full border p-2 rounded mb-4" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount (e.g. 1000)"
                        />
                        
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedCampaign(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleDonate} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Proceed to Pay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Donations;


// Important: In Donations.jsx line 52, 
// make sure to replace "YOUR_RAZORPAY_TEST_KEY_ID" 
// with the actual Key ID you copied from the 
// dashboard, or the payment popup won't open.