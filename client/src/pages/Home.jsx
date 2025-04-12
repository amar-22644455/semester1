import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { io } from "socket.io-client";
import Button from "@/components/ui/button";
import image from "@/assets/image.png";
import skill from "@/assets/skill.jpg";
import PostCard from "@/components/ui/PostCard";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default function Home() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]); // Combined feed posts
  const [file, setFile] = useState(null);
  const [postText, setPostText] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
// Modify your fetchData function to ensure token is available
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Check if token exists first
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    // Fetch user and feed sequentially
    const [userResponse, feedResponse] = await Promise.all([
      fetch(`http://localhost:3000/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch("http://localhost:3000/api/following", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    ]);

    if (!userResponse.ok || !feedResponse.ok) {
      const userError = await userResponse.json().catch(() => null);
      const feedError = await feedResponse.json().catch(() => null);
      throw new Error(userError?.message || feedError?.message || "Failed to fetch data");
    }

    const [userData, feedData] = await Promise.all([
      userResponse.json(),
      feedResponse.json()
    ]);

    setUser(userData);
    setFeedPosts(feedData.posts);
  } catch (err) {
    console.error("Error fetching data:", err);
    setError(err.message || "Failed to load data");
  } finally {
    setLoading(false);
  }
};
    fetchData();

    // Socket.io for real-time updates
    const handleNewPost = (newPost) => {
      setFeedPosts(prevPosts => {
        // Avoid duplicates
        if (!prevPosts.some(post => post._id === newPost._id)) {
          return [newPost, ...prevPosts];
        }
        return prevPosts;
      });
    };

    socket.on("newPost", handleNewPost);

    return () => {
      socket.off("newPost", handleNewPost);
    };
  }, [id]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handlePost = async () => {
    if (!file && !postText.trim()) {
      alert("Please enter text or select an image.");
      return;
    }

    const formData = new FormData();
    if (postText.trim()) formData.append("text", postText);
    if (file) formData.append("media", file);

    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const newPost = await response.json();
      
      // Add to feed posts
      setFeedPosts(prev => [newPost, ...prev]);
      
      // Reset form fields
      setPostText("");
      setFile(null);
      setPreview(null);
      
      // Emit socket event to notify followers
      socket.emit("newPost", newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar */}
      <div className="hidden md:flex flex-col w-60 h-screen overflow-hidden">
        <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">ShareXP</div>
        <div className="flex-1"></div>

        <Link to={`/home/${id}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Home</button>
        </Link>
        <Link to={`/search/${id}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Search</button>
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar">
        <Card className="p-4 shadow-md rounded-2xl !bg-black w-full">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <img 
                src={user?.profileImage 
                  ? user.profileImage.startsWith('http') 
                    ? user.profileImage 
                    : `http://localhost:3000${user.profileImage}`
                  : null}  
                alt="Profile" 
                className="w-10 h-10 rounded-full" 
              />
              <textarea
                className="w-full p-3 rounded-lg bg-gray-900 text-white resize-none focus:outline-none"
                placeholder="What's on your mind?"
                rows="3"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              ></textarea>
            </div>
            {preview && (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full max-h-80 rounded-lg object-contain" />
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => {
                    URL.revokeObjectURL(preview);
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  ✖
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleFileChange}
              accept="image/*,video/*" 
            />
            <div className="flex flex-wrap justify-between items-center border-t border-gray-800 pt-3 mt-2">
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-gray-400" 
                  onClick={() => fileInputRef.current.click()}
                >
                  <img src={image} alt="Upload" className="w-5 h-5" />
                  Photo/Video
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-400">
                  <img src={skill} alt="Upload" className="w-5 h-5" />
                  Proficiency
                </Button>
              </div>
              <Button 
                onClick={handlePost} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                disabled={!postText.trim() && !file}
              >
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="mt-10 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">{error}</div>
          ) : feedPosts.length > 0 ? (
            feedPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post}
                currentUserId={id}
              />
            ))
          ) : (
            <div className="text-center p-8 text-gray-400">
              <p>No posts yet.</p>
              <p>Create your first post or follow users to see their posts!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-screen p-4 overflow-y-auto">
        {user ? (
          <>
            <div className="flex items-center gap-3 mt-5">
              <img 
                src={user?.profileImage 
                  ? user.profileImage.startsWith('http') 
                    ? user.profileImage 
                    : `http://localhost:3000${user.profileImage}`
                  : profile} 
                alt="Profile" 
                className="w-10 h-10 rounded-full" 
              />
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">@{user.username}</p>
              </div>
            </div>
            <Link 
              to={`/profile/${id}`} 
              className="mt-4 text-white-400 hover:text-blue-300"
            >
              View Profile
            </Link>
            <Link 
              to="/LoginXp" 
              className="mt-1 text-red-400 hover:text-red-300"
            >
              Logout
            </Link>
          </>
        ) : (
          <p className="text-gray-400 mt-5">Loading user...</p>
        )}
      </div>
    </div>

  );
}