import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useState } from "react"; // Import useState
import Register from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Jobs from "./pages/Jobs";
import Donations from "./pages/Donations";
import Events from "./pages/Events";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Stories from "./pages/Stories";
import Directory from "./pages/Directory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeFeed from "./pages/HomeFeed";

// Navbar Component
// const Navbar = () => (
//   <nav className="bg-blue-900 p-4 text-white shadow-md">
//     <div className="container mx-auto flex justify-between items-center">
//       <Link
//         to="/dashboard"
//         className="font-bold text-xl flex items-center gap-2"
//       >
//         🎓 Alumni Platform
//       </Link>
//       <div className="space-x-6">
//         <Link to="/jobs" className="hover:text-yellow-300 transition">
//           Jobs
//         </Link>{" "}
//         {/* ADD THIS */}
//         <Link to="/directory" className="hover:text-yellow-300 transition">
//           Directory
//         </Link>
//         <Link to="/dashboard" className="hover:text-yellow-300 transition">
//           My Profile
//         </Link>
//         <Link to="/chat">Messages</Link>
//         <Link to="/events">Events</Link>
//         <Link to="/stories">Stories</Link>
//         <Link to="/donations">Donate</Link>
//         <button
//           onClick={() => {
//             localStorage.removeItem("token"); // Destroy the key
//             window.location.href = "/login"; // Redirect to login
//           }}
//           className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   </nav>
// );

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/feed" className="font-bold text-xl flex items-center gap-2">
          🎓 Alumni Platform
        </Link>

        {/* Desktop Menu (Hidden on Mobile) */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/directory" className="hover:text-yellow-300 transition">
            Directory
          </Link>
          <Link to="/jobs" className="hover:text-yellow-300 transition">
            Jobs
          </Link>
          <Link to="/events" className="hover:text-yellow-300 transition">
            Events
          </Link>
          <Link to="/stories" className="hover:text-yellow-300 transition">
            Stories
          </Link>
          <Link to="/donations" className="hover:text-yellow-300 transition">
            Donate
          </Link>
          <Link to="/chat" className="hover:text-yellow-300 transition">
            Messages
          </Link>

          <div className="h-6 w-px bg-blue-700 mx-2"></div>

          <Link
            to="/dashboard"
            className="hover:text-yellow-300 transition font-semibold"
          >
            My Profile
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-red-500 px-4 py-1.5 rounded hover:bg-red-600 transition text-sm font-bold"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Button (Visible only on Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-blue-800 px-4 pt-2 pb-4 space-y-2 border-t border-blue-700">
          <Link to="/directory" className="block py-2 hover:text-yellow-300">
            Directory
          </Link>
          <Link to="/jobs" className="block py-2 hover:text-yellow-300">
            Jobs
          </Link>
          <Link to="/events" className="block py-2 hover:text-yellow-300">
            Events
          </Link>
          <Link to="/stories" className="block py-2 hover:text-yellow-300">
            Stories
          </Link>
          <Link to="/donations" className="block py-2 hover:text-yellow-300">
            Donate
          </Link>
          <Link to="/chat" className="block py-2 hover:text-yellow-300">
            Messages
          </Link>
          <Link
            to="/dashboard"
            className="block py-2 hover:text-yellow-300 font-bold"
          >
            My Profile
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full text-left py-2 text-red-300 hover:text-white"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

// Private Route Wrapper (Protects Dashboard/Directory)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Show Navbar only if logged in */}
      {token && <Navbar />}

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <HomeFeed />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/directory"
          element={
            <PrivateRoute>
              <Directory />
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <Jobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/donations"
          element={
            <PrivateRoute>
              <Donations />
            </PrivateRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <PrivateRoute>
              <Stories />
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          }
        />
        {/* Default Redirect */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
