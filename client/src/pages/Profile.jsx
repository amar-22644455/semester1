import { useState, useEffect,useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import profile from "@/assets/profile.jpg";
import PostThumbnail from "@/components/PostThumbnail";
import ProficiencyThumbnail from "../components/ProficiencyThumbnail";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { GraduationCap, Award, Camera, Edit3 } from "lucide-react";



export default function Profile() {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const currentUserId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);


  const handlePostDeleted = (deletedPostId) => {
    // Update the posts state by filtering out the deleted post
    setPosts(posts.filter(post => post._id !== deletedPostId));
  };



    // Merge two sorted arrays (helper function for merge sort)
const merge = (left, right) => {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    // Compare dates (descending order: newest first)
    const leftDate = new Date(left[leftIndex].createdAt);
    const rightDate = new Date(right[rightIndex].createdAt);

    if (leftDate > rightDate) {
      result.push(left[leftIndex++]);
    } else {
      result.push(right[rightIndex++]);
    }
  }

  // Concatenate remaining elements
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
};

// Merge Sort (recursive)
const mergeSort = (arr) => {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
};

useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/Profile/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        navigate("/LoginXP");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch user");

      const userData = await response.json();
      setUser(userData);

      // Sort posts using custom merge sort (newest first)
      const sortedPosts = mergeSort(userData.posts || []);
      setPosts(sortedPosts);
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
      const response = await fetch(`/api/${id}/profile-image`, {
        method: "PATCH",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile image");
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
      <section className="flex h-screen w-full bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4]">
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Cover Banner */}
          <div className="mx-6 mt-6 h-28 md:h-36 bg-gradient-to-r from-[#9e4635] to-[#d0735e] relative rounded-t-2xl flex-shrink-0 shadow-sm" />

          {/* Profile Header Card */}
          <div className="mx-6 px-6 pb-6 relative -mt-10 flex flex-col md:flex-row items-center md:items-end gap-6 border-l border-r border-b border-[#edd6cc] w-[calc(100%-3rem)] bg-[#fffaf7]/40 backdrop-blur-sm rounded-b-2xl flex-shrink-0 shadow-sm">
            {/* Avatar container */}
            <div className="relative group flex-shrink-0">
              {user ? (
                <img 
                  src={user.profileImage || profile} 
                  alt="User Profile" 
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#fffaf7] shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-[#fffaf7] shadow-md animate-pulse flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-semibold">...</span>
                </div>
              )}
              <button 
                onClick={handleEditClick}
                className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-6 h-6" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            {/* User Meta info */}
            <div className="flex-1 text-center md:text-left">
              {user ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 m-0">{user.username}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <button 
                        onClick={handleEditClick}
                        className="px-3.5 py-1.5 bg-[#9e4635] text-white hover:bg-[#8f3a2c] rounded-xl font-medium text-xs border-none cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Picture
                      </button>
                      <Link 
                        to={`/achievements/${currentUserId}`}
                        className="px-3.5 py-1.5 bg-[#fffaf7] border border-[#edd6cc] text-[#9e4635] hover:bg-[#fcf5f2] rounded-xl font-medium text-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" /> Proficiencies
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-gray-800 text-left md:text-left m-0">{user.name}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-center md:justify-start gap-1 m-0">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> {user.institute}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm pl-4">Loading user details...</p>
              )}
            </div>

            {/* Stats Summary Card */}
            {user && (
              <div className="flex gap-6 bg-[#fffaf7]/80 border border-[#edd6cc] rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex-shrink-0">
                <div className="text-center min-w-12">
                  <p className="text-base font-bold text-gray-900 m-0">{posts.length}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider m-0">posts</p>
                </div>
                <div className="h-8 w-[1px] bg-[#f5e6df] self-center" />
                <div className="text-center min-w-16">
                  <p className="text-base font-bold text-gray-900 m-0">{followersCount}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider m-0">followers</p>
                </div>
                <div className="h-8 w-[1px] bg-[#f5e6df] self-center" />
                <div className="text-center min-w-16">
                  <p className="text-base font-bold text-gray-900 m-0">{followingCount}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider m-0">following</p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Bar */}
          <div className="mx-6 mt-6 flex justify-center border-b border-[#edd6cc] bg-[#fffaf7]/20 flex-shrink-0">
            <div className="px-6 py-3 border-b-2 border-[#9e4635] text-sm font-semibold text-[#9e4635]">
              Posts ({posts.length})
            </div>
          </div>

          {/* Posts Grid container */}
          <div className="mx-6 mb-6 p-4 md:p-6 bg-[#fffaf7]/30 border border-[#edd6cc] border-t-0 rounded-b-2xl flex-1">
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {posts.map(post => (
                  <PostThumbnail 
                    key={post._id}
                    post={post}
                    profileFallback={profile}
                    currentUserId={currentUserId}
                    onDelete={handlePostDeleted}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500">
                No posts yet
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}