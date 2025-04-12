import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Trash2, Share2, Heart, MessageSquare, Share } from "lucide-react";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const PostThumbnail = ({ post, profileFallback, currentUserId, onDelete, onShare }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      onDelete(post._id);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Check out this post!',
          text: 'Here’s something interesting I found on ShareXP!',
          url: postUrl,
        })
        .then(() => toast.success('Post shared successfully!'))
        .catch((err) => {
          if (err.name !== 'AbortError') {
            toast.error('Failed to share the post');
          }
        });
    } else {
      navigator.clipboard.writeText(postUrl)
        .then(() => toast.success('Post link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link'));
    }

    setIsMenuOpen(false);
    if (onShare) onShare(post._id);
  };

  const handleViewPost = () => {
    navigate(`/post/${post._id}`, { state: { post } });
    setIsMenuOpen(false);
  };

  const getMediaUrl = () => {
    if (!post.media?.url) return profileFallback;
    if (post.media.url.startsWith('http')) return post.media.url;
    return `http://localhost:3000${post.media.url}`;
  };

  return (
    <div 
      className="aspect-square relative group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className={`absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white z-10 hover:bg-opacity-70 transition-all ${
          isHovered || isMenuOpen ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
        aria-label="Post options"
        disabled={isDeleting}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <img 
        src={getMediaUrl()} 
        alt="Post media" 
        className={`w-full h-full object-cover transition-all duration-300 ${
          isHovered ? "opacity-20" : "opacity-100"
        }`}
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = profileFallback;
        }}
      />

      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 z-10">
          <button 
            className="flex items-center text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPost();
            }}
            aria-label="View post"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          {post.userId === currentUserId && (
            <button 
              className="flex items-center text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              aria-label="Delete post"
              disabled={isDeleting}
            >
              <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
          )}
          
          <button 
            title="Share"
            className="flex items-center text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            aria-label="Share post"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute right-2 top-8 mt-1 w-40 bg-gray-800 rounded-md shadow-lg z-20 border border-gray-600"
        >
          <div className="py-1">
            <button 
              className="flex items-center w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                handleViewPost();
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Post
            </button>
            
            {post.userId === currentUserId && (
              <button 
                className="flex items-center w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                <Trash2 className={`w-4 h-4 mr-2 ${isDeleting ? 'animate-pulse' : ''}`} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            
            <button 
              className="flex items-center w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>
      )}

      <div className={`absolute bottom-2 left-2 flex items-center gap-3 text-white text-sm ${
        isHovered ? "opacity-100" : "opacity-0"
      } group-hover:opacity-100 transition-opacity duration-200`}>
        <span className="flex items-center bg-black bg-opacity-50 px-2 py-1 rounded-full">
          <Heart className="w-3 h-3 mr-1" />
          {post.likeCount || post.likes?.length || 0}
        </span>
        <span className="flex items-center bg-black bg-opacity-50 px-2 py-1 rounded-full">
          <MessageSquare className="w-3 h-3 mr-1" />
          {post.commentCount || post.comments?.length || 0}
        </span>
      </div>
    </div>
  );
};

export default PostThumbnail;
