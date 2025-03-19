import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send token for authentication
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        setUser(userData); // Store the user data in state
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="flex flex-col w-60 h-screen border-r border-gray-400 overflow-hidden">
        <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
          ShareXP
        </div>

        <div className="flex-1"></div>

        <Link to="." className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Home</button>
        </Link>
        <Link to="/Search" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Search</button>
        </Link>
        <Link to="/messages" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Messages</button>
        </Link>
        <Link to="/notifications" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Notifications</button>
        </Link>
        <Link to="/create" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Create</button>
        </Link>
        <Link to="/Profile" className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Profile</button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
        <h3 className="text-4xl font-bold text-white">Welcome to Student Community</h3>
        <p className="text-gray-400 mt-2">A place to share skills, experiences, and semester reports.</p>

        <div className="mt-10 space-y-10">
          {Array.from({ length: 20 }).map((_, index) => (
            <p key={index} className="text-gray-300">
              This is some sample content to test scrolling. Line {index + 1}.
            </p>
          ))}
        </div>
      </div>

      {/* Right Sidebar (User Info) */}
      <div className="flex flex-col w-55 ml-auto h-screen overflow-hidden">
        {user ? (
          <>
            <p className="text-[15px] mt-5 text-white font-serif h-5 flex items-center pl-4">
              {user.name} {/* Display the dynamic user's name */}
            </p>
            <p className="text-[15px] mt-2 text-white font-serif h-5 flex items-center pl-4">
              <Link to="/Profile" className="text-left">View Profile</Link>
              <Link to="/LoginXp" className="ml-5">Logout</Link>
            </p>
          </>
        ) : (
          <p className="text-gray-400 pl-4 mt-5">Loading user...</p>
        )}
      </div>
    </div>
  );
}
