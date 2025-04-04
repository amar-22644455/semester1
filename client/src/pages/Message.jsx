import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import profile from "@/assets/profile.jpg";
import PostThumbnail from "@/components/PostThumbnail";
import ProficiencyThumbnail from "../components/ProficiencyThumbnail";

export default function Profile() {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const currentUserId = localStorage.getItem("userId");







  return (
    <>
      <section className="flex h-screen">
        {/* Left Sidebar - No changes here */}
        <div className="flex flex-col w-60 h-screen border-r border-gray-400 overflow-hidden">
          <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
            ShareXP
          </div>

          <div className="flex-1"></div>

          <Link to={`/home/${id}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
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
          
          <Link to={`/profile/${id}`} className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
            <button className="w-full text-left">Profile</button>
          </Link>
        </div>

        {/* Main Content */}
      
         

      </section>
    </>
  );
}