import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail
} from "lucide-react";

import { useState, useEffect } from "react";

export default function PostCard({ post }) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post?.comments || []);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [postOwner, setPostOwner] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!post?._id || !userId || !token) return;

      try {
        const userRes = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
        }

        const likeRes = await fetch(`http://localhost:5000/api/${post._id}/like-status?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (likeRes.ok) {
          const likeData = await likeRes.json();
          setIsLiked(likeData.isLiked);
          if (likeData.likeCount !== undefined) {
            setLikeCount(likeData.likeCount);
          }
        }

        if (post?.userId) {
          const ownerId = typeof post.userId === "object" ? post.userId._id : post.userId;
          const ownerRes = await fetch(`http://localhost:5000/api/users/${ownerId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          if (ownerRes.ok) {
            const ownerData = await ownerRes.json();
            setPostOwner(ownerData);
          }
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchInitialData();
  }, [post?._id, post?.userId]);

  const handlePostAction = async (actionType, data = {}) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: post._id,
          actionType,
          ...data
        })
      });

      if (!response.ok) throw new Error("Action failed");
      return await response.json();
    } catch (err) {
      console.error("Post action error:", err);
      return null;
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;
    const prevLiked = isLiked;
    const prevCount = likeCount;

    const newLiked = !prevLiked;
    setIsLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);

    const action = newLiked ? "like" : "unlike";

    const result = await handlePostAction(action, { recipientId: post.userId });
    if (!result) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    } else {
      if (result.updatedLikeCount !== undefined) setLikeCount(result.updatedLikeCount);
      if (result.isLiked !== undefined) setIsLiked(result.isLiked);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const result = await handlePostAction("comment", {
      commentText: comment,
      recipientId: post.userId
    });

    if (result?.comment) {
      setComments(prev => [...prev, result.comment]);
      setComment("");
      setShowCommentInput(false);
    }
  };

  const handleShare = (platform) => {
    setShowShareMenu(false);
    const postUrl = `http://localhost:5000/posts/${post._id}`;
    const text = `Check out this post: ${post.text}`;

    const urlEncoded = encodeURIComponent(postUrl);
    const textEncoded = encodeURIComponent(text);

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}`,
      twitter: `https://twitter.com/intent/tweet?text=${textEncoded}&url=${urlEncoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`,
      whatsapp: `https://wa.me/?text=${textEncoded}%20${urlEncoded}`,
      email: `mailto:?subject=Check out this post&body=${textEncoded}%0A%0A${urlEncoded}`
    };

    if (platform === "instagram") {
      alert("Instagram sharing is not supported via web.");
    } else if (shareLinks[platform]) {
      window.open(shareLinks[platform], "_blank");
    } else if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        text,
        url: postUrl
      }).catch(err => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(postUrl).then(() => alert("Link copied to clipboard!"));
    }
  };

  if (!post) return null;

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <CardContent className="p-6">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={postOwner?.profileImage?.startsWith("http")
              ? postOwner.profileImage
              : `http://localhost:5000${postOwner?.profileImage || ""}`}
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover border-2 border-[#2dd4bf]"
          />
          <div>
            <h4 className="text-black font-semibold text-lg">{post?.username || "User"}</h4>
            <span className="text-gray-600 text-sm">{new Date(post.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-black text-base leading-relaxed mb-4">{post?.text}</p>

        {/* Media */}
        {post?.media && (
          post.media.fileType === "image" ? (
            <img
              src={`http://localhost:5000${post.media.url}`}
              alt="Post Media"
              className="w-full rounded-lg object-cover mb-4"
            />
          ) : post.media.fileType === "video" ? (
            <video controls className="w-full rounded-lg max-h-80 object-cover mb-4">
              <source src={`http://localhost:5000${post.media.url}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <a
              href={`http://localhost:5000${post.media.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2dd4bf] underline mb-4 block"
            >
              View Document
            </a>
          )
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-[#6f85e5] ${
              isLiked ? 'text-red-500' : 'text-gray-600 hover:text-[#6f85e5]'
            }`}
            onClick={handleLike}
          >
            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-[#6f85e5] hover:bg-[#6f85e5] transition-all"
            onClick={() => {
              setShowCommentInput(!showCommentInput);
              setShowComments(true);
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{comments.length}</span>
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-[#6f85e5] hover:bg-[#6f85e5] transition-all"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>

            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg p-3 z-10 flex gap-3 shadow-lg">
                <Facebook onClick={() => handleShare("facebook")} className="text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
                <Twitter onClick={() => handleShare("twitter")} className="text-blue-400 cursor-pointer hover:scale-110 transition-transform" />
                <Instagram onClick={() => handleShare("instagram")} className="text-pink-500 cursor-pointer hover:scale-110 transition-transform" />
                <Linkedin onClick={() => handleShare("linkedin")} className="text-blue-700 cursor-pointer hover:scale-110 transition-transform" />
                <Mail onClick={() => handleShare("email")} className="text-gray-300 cursor-pointer hover:scale-110 transition-transform" />
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf] transition-all"
            />
            <button
              type="submit"
              className="bg-[#14b8a6] hover:bg-[#2dd4bf] text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-4">
            <button
              className="text-gray-600 text-sm flex items-center gap-1 hover:text-[#6f85e5] transition-colors mb-3"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </button>

            {showComments && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 items-start">
                    <img
                      src={
                        comment.userId?.profileImage
                          ? comment.userId.profileImage.startsWith("http")
                            ? comment.userId.profileImage
                            : `http://localhost:5000${comment.userId.profileImage}`
                          : ""
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-semibold text-black">{comment.username}</h4>
                        <span className="text-xs text-gray-600">
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
