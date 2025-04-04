import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import profile from "@/assets/profile.jpg";
import PostThumbnail from "@/components/PostThumbnail";
export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  // Get current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id;

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`http://localhost:3000/api/userprofile/${id}`, {
          method:"GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        if (!userResponse.ok) throw new Error("Failed to fetch user");
        const { user: userData, isFollowing: followingStatus, posts:userposts } = await userResponse.json();
        
        setUser(userData);
        setIsFollowing(followingStatus);
        setPosts(userposts || []);

      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserAndPosts();
  }, [id]);

  const handleFollow = async () => {
    try {
      const newFollowingStatus = !isFollowing;
  
      // Optimistic UI Update (immediately reflect changes)
      setIsFollowing(newFollowingStatus);
      setUser(prev => {
        const updatedFollowers = newFollowingStatus
          ? [...prev.followers, currentUserId]  // Add follower
          : prev.followers.filter(id => id !== currentUserId);  // Remove follower
  
        return {
          ...prev,
          followers: updatedFollowers,
        };
      });
  
      // Send request to backend
      const response = await fetch(`http://localhost:3000/api/follow/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }
  
      // Optional: Fetch latest data to ensure sync (if needed)
      const updatedUserResponse = await fetch(`http://localhost:3000/api/userprofile/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const { user: updatedUser } = await updatedUserResponse.json();
      setUser(updatedUser);  // Force update with latest data
  
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
      // Revert optimistic update on failure
      setIsFollowing(!newFollowingStatus);
      setUser(prev => ({
        ...prev,
        followers: prev.followers,  // Revert to previous state
      }));
      setError(error.message);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!user) return <p className="text-gray-400 p-4">User not found</p>;

  return (
    <section className="flex h-screen">
      {/* Left Sidebar */}
      <div className="flex flex-col w-60 h-screen overflow-hidden">
        {/* ... sidebar content ... */}
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <header className="flex flex-col md:flex-row p-4">
          <div className="flex justify-center md:justify-start md:w-1/3">
            <img 
              src={user.profileImage || profile} 
              alt="Profile" 
              className="w-40 h-40 rounded-full object-cover"
            />
          </div>

          <div className="mt-4 md:mt-0 md:ml-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">{user.username}</h1>
              {currentUserId !== id && (
                <button 
                  onClick={handleFollow}
                  className={`px-4 py-1 rounded-md ${
                    isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>

            <div className="flex space-x-6 my-4">
              <p><span className="font-bold">{posts.length}</span> posts</p>
              <p><span className="font-bold">{user.followers?.length || 0}</span> followers</p>
              <p><span className="font-bold">{user.following?.length || 0}</span> following</p>
            </div>

            <div>
              <p className="font-bold">{user.name}</p>
              <p>{user.institute}</p>
              {user.skills?.length > 0 && (
                <div className="mt-2">
                  <p className="font-bold">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <span key={skill} className="bg-gray-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="border-t border-gray-600 py-2 text-center">
          Posts
        </div>
        {posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 p-1">
                      {/* FIXED: Removed duplicate mapping and extra div wrapper */}
                      {posts.map(post => (
                        <PostThumbnail 
                          key={post._id}
                          post={post}
                          profileFallback={profile}
                          currentUserId={currentUserId}
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
  );
}