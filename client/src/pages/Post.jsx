import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import PostCard from "@/components/ui/PostCard";
import Sidebar from "@/components/Sidebar";

export default function Post() {
  const { id: postId } = useParams();
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear location.state from browser history so stale post data
    // is never shown after logout or when the URL is pasted directly.
    window.history.replaceState({}, document.title);

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/post-view/${postId}`);
        if (response.status === 401) {
          navigate("/LoginXP", { replace: true });
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDeleteSuccess = () => {
    toast.success("Post deleted successfully");
    navigate(-1);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4] text-black">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with back button */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-[#fffaf7]">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 mr-4 text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif font-bold text-black">Post</h1>
        </div>

        {/* Scrollable Post View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar flex justify-center">
          <div className="w-full max-w-2xl">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-600">Loading post...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center">{error}</div>
            ) : post ? (
              <PostCard post={post} onDelete={handleDeleteSuccess} />
            ) : (
              <div className="text-center p-8 text-gray-600">Post not found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
