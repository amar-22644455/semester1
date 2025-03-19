import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import profile from "@/assets/profile.jpg";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/Profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <section className="flex h-screen">
        {/* Left Sidebar */}
        <div className="flex flex-col w-60 h-screen border-r border-gray-400 overflow-hidden">
          <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
            ShareXP
          </div>

          <div className="flex-1"></div>

          <Link to="/" className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
            <button className="w-full text-left">Home</button>
          </Link>
          <Link to="/search" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
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
          <Link to="/profile" className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
            <button className="w-full text-left">Profile</button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <header className="flex flex-row h-[33vh]">
            <div className="flex w-1/3 items-center justify-center mt-[72px]">
              <img src={profile} className="w-40 h-40 rounded-full" />
            </div>

            <div className="flex flex-col">
              {user ? (
                <>
                  <div className="flex flex-row h-1/3 ml-5 mt-15">
                    <div className="flex flex-col">
                      <p className="text-[15px] text-white font-serif flex items-left">
                        <Link to="/profile" className="text-left text-[15px]">{user.username}</Link>
                      </p>
                      <p className="text-[15px] text-white font-serif flex items-left">
                        {user.posts.length} posts
                      </p>
                    </div>

                    <div className="flex flex-col ml-5">
                      <Link to="." className="text-[15px] text-white font-serif flex items-left">
                        Edit Profile
                      </Link>
                      <Link to="" className="text-[15px] text-white font-serif flex items-left">
                        {user.learners || 0} learners
                      </Link>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-[15px] w-full text-left text-white font-serif flex items-center ml-5">
                      {user.name}
                    </p>
                  </div>

                  <div className="mt-2">
                    <p className="text-[15px] w-full text-left text-white font-serif flex items-center ml-5">
                      {user.institutename}
                    </p>
                  </div>

                  <div className="mt-2">
                    <Link to="" className="text-[15px] w-full text-left text-white font-serif flex items-center ml-5">
                      Proficiency
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 pl-4 mt-5">Loading profile...</p>
              )}
            </div>
          </header>

          <div className="mt-10 flex justify-center font-serif border-t border-gray-100 border-b border-gray-100 text-xl items-center h-[6vh]">
            Posts
          </div>
        </div>
      </section>
    </>
  );
}
