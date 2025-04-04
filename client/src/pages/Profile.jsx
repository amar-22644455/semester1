import { useState, useEffect,useRef } from "react";
import { Link, useParams } from "react-router-dom";
import profile from "@/assets/profile.jpg";
import PostThumbnail from "@/components/PostThumbnail";
import ProficiencyThumbnail from "../components/ProficiencyThumbnail";



export default function Profile() {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const currentUserId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);


  const handlePostDeleted = (deletedPostId) => {
    // Update the posts state by filtering out the deleted post
    setPosts(posts.filter(post => post._id !== deletedPostId));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/Profile/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user");

        const userData = await response.json();
        setUser(userData);
        // FIXED: Added fallback empty array to prevent undefined errors
        setPosts(userData.posts || []);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);


  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch(`http://localhost:3000/api/${id}/profile-image`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile image");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error("Error updating profile image:", error);
      alert(error.message);
    }
  };
    // Calculate counts from arrays
    const followersCount = user?.followers?.length || 0;
    const followingCount = user?.following?.length || 0;

  return (
    <>
      <section className="flex h-screen">
        {/* Left Sidebar - No changes here */}
        <div className="flex flex-col w-60 h-screen overflow-hidden">
          <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
            ShareXP
          </div>

          <div className="flex-1"></div>

          <Link to={`/home/${id}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
            <button className="w-full text-left">Home</button>
          </Link>
          <Link to={`/search/${id}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Search</button>
        </Link>
        <Link to={`/message/${id}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Messages</button>
        </Link>
        <Link to={`/notification/${id}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Notifications</button>
        </Link>
          <Link to="/create" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
            <button className="w-full text-left">Create</button>
          </Link>
          <Link to={`/profile/${id}`} className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Profile</button>
        </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          {/* Profile Header - No changes here */}
          <header className="flex flex-row h-[33vh]">
            <div className="flex w-1/3 items-center justify-center mt-[72px]">
              <img 
                src={user?.profileImage || profile} 
                alt="User Profile" 
                className="w-40 h-40 rounded-full" 
              />
            </div>

            <div className="flex flex-col">
              {user ? (
                <>
                  <div className="flex flex-row h-1/3 ml-5 mt-15">
                    <div className="flex flex-col">
                      <p className="text-[15px] text-white font-serif flex items-left">
                        <Link to="/profile" className="text-left text-[15px]">{user.username}</Link>
                      </p>
                      {/* FIXED: Changed from user.posts.length to posts.length for consistency */}
                      <p className="text-[15px] text-white font-serif flex items-left">
                        {posts.length} posts
                      </p>
                    </div>

                    <div className="flex flex-col ml-5">
                    <a
                        onClick={handleEditClick}
                        className="text-[15px] text-white font-serif flex items-left cursor-pointer"
                        
                      >
                        Edit
                      </a>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <Link to="" className="text-[15px] text-white font-serif flex items-left">
                        {followersCount || 0} follower
                      </Link>
                    </div>

                    <div className="flex flex-col ml-5">
                      <Link to="/LoginXP" className="text-[15px] text-white font-serif flex items-left">
                        Logout
                      </Link>
                      <Link to="" className="text-[15px] text-white font-serif flex items-left">
                        {followingCount || 0} following
                      </Link>
                    </div>
                  </div>

                  

                  <div className="flex flex-row">
                    <div>
                      <div className="mt-2">
                        <p className="text-[15px] w-full text-left text-white font-serif flex items-center ml-5">
                          {user.name}
                        </p>
                      </div>

                      <div className="mt-2">
                        <p className="text-[15px] w-full text-left text-white font-serif flex items-center ml-5">
                          {user.institute}
                        </p>
                      </div>

                      <div className="mt-2">
                      <ProficiencyThumbnail user={user}  isCurrentUser={id === currentUserId} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 pl-4 mt-5">Loading profile...</p>
              )}
            </div>
          </header>

          <div className="mt-10 flex justify-center font-serif text-xl items-center h-[6vh]">
            Posts
          </div>
          {/* FIXED: Entire posts section rewritten */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {/* FIXED: Removed duplicate mapping and extra div wrapper */}
              {posts.map(post => (
                <PostThumbnail 
                  key={post._id}
                  post={post}
                  profileFallback={profile}
                  currentUserId={currentUserId}
                  onDelete={handlePostDeleted}  // Simplified callback
                />
              ))}
            </div>
          ) : (
            <div className="col-span-3 py-10 text-center text-gray-400">
              No posts yet
            </div>
          )}
        </div>
      </section>
    </>
  );
}