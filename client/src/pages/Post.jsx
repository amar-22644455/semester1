import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, MessageSquare, Share2, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import profile from "@/assets/profile.jpg";

export default function Post() {
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post;
  const [postOwner, setPostOwner] = useState(null);

  useEffect(() => {
    const fetchPostOwner = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${post.userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setPostOwner(userData);
        }
      } catch (error) {
        console.error('Error fetching post owner:', error);
      }
    };

    if (post?.userId && !postOwner) {
      fetchPostOwner();
    }
  }, [post?._id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/delete/${post._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      toast.success("Post deleted successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const getMediaUrl = () => {
    if (!post?.media?.url) return profile;
    if (post.media.url.startsWith("http")) return post.media.url;
    return `http://localhost:3000${post.media.url}`;
  };

  const getProfileImageUrl = () => {
    if (!postOwner?.profileImage) return profile;
    if (postOwner.profileImage.startsWith("http")) return postOwner.profileImage;
    return `http://localhost:3000${postOwner.profileImage}`;
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Post not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar */}
      <div className="flex flex-col w-60 h-screen overflow-hidden border-r border-gray-800">
        <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
          ShareXP
        </div>

        <div className="flex-1"></div>

        <Link to={`/home/${currentUserId}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Home</button>
        </Link>
        <Link to={`/search/${currentUserId}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Search</button>
        </Link>
        <Link to={`/notification/${currentUserId}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Notifications</button>
        </Link>
        <Link to="/create" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Create</button>
        </Link>
        <Link to={`/profile/${currentUserId}`} className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Profile</button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with back button */}
        <div className="flex items-center p-4 border-b border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif">Post</h1>
        </div>

        {/* Post Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* User Info */}
          <div className="flex items-center mb-4">
            <img
              src={getProfileImageUrl()}
              alt="Profile"
              className="w-10 h-10 rounded-full mr-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profile;
              }}
            />
            <div>
              <Link to={`/profile/${postOwner?._id}`} className="font-medium hover:underline">
                {postOwner?.username || "User"}
              </Link>
              <p className="text-gray-400 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
            </div>

            {postOwner?._id === currentUserId && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="ml-auto p-1 rounded-full hover:bg-gray-800"
              >
                <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>

          {/* Post Media */}
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={getMediaUrl()}
              alt="Post content"
              className="w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profile;
              }}
            />
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-4 mb-4">
            <button className="flex items-center gap-1 hover:text-red-500">
              <Heart className="w-6 h-6" />
              <span>{post.likes?.length || 0}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500">
              <MessageSquare className="w-6 h-6" />
              <span>{post.comments?.length || 0}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500">
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* Post Caption */}
          <div className="mb-6">
            <p className="whitespace-pre-line">{post.text}</p>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-800 pt-4">
            <h2 className="text-lg font-medium mb-4">Comments</h2>
            {post.comments?.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map(comment => (
                  <div key={comment._id} className="flex">
                    <img
                      src={comment.userId?.profileImage 
                        ? comment.userId.profileImage.startsWith('http') 
                          ? comment.userId.profileImage 
                          : `http://localhost:3000${comment.userId.profileImage}`
                        : null} 
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <Link to={`/profile/${comment.userId._id}`} className="font-medium hover:underline">
                          {comment.userId.username}
                        </Link>
                        <p className="mt-1">{comment.text}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No comments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
