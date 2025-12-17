import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome Home, Alumni.</h1>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Reconnect with classmates, find career opportunities, and give back to the institution that made you who you are.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition shadow-lg">
              Join the Network
            </Link>
            <Link to="/login" className="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-900 transition">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Join?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition border-t-4 border-blue-500">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Reconnect</h3>
              <p className="text-gray-600">Find old classmates in the directory and chat in real-time.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition border-t-4 border-green-500">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2">Career Growth</h3>
              <p className="text-gray-600">Access exclusive job postings and find mentors in your industry.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition border-t-4 border-purple-500">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">Events</h3>
              <p className="text-gray-600">RSVP to reunions, webinars, and workshops happening near you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS BANNER */}
      <section className="bg-blue-800 text-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 text-center gap-6">
          <div>
            <div className="text-4xl font-bold text-yellow-400">5000+</div>
            <div className="text-blue-200 uppercase text-sm tracking-wide mt-1">Alumni</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400">120+</div>
            <div className="text-blue-200 uppercase text-sm tracking-wide mt-1">Events</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400">₹10L+</div>
            <div className="text-blue-200 uppercase text-sm tracking-wide mt-1">Raised</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400">50+</div>
            <div className="text-blue-200 uppercase text-sm tracking-wide mt-1">Success Stories</div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>© 2025 Government Engineering College Alumni Association. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;