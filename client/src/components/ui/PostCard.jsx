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
        const userRes = await fetch(`http://localhost:3000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
        }

        const likeRes = await fetch(`http://localhost:3000/api/${post._id}/like-status?userId=${userId}`, {
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
          const ownerRes = await fetch(`http://localhost:3000/api/users/${ownerId}`, {
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
      const response = await fetch('http://localhost:3000/api/actions', {
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
    const postUrl = `http://localhost:3000/posts/${post._id}`;
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
    <Card className="p-4 shadow-md rounded-2xl bg-black w-full text-white">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img
            src={postOwner?.profileImage?.startsWith("http")
              ? postOwner.profileImage
              : `http://localhost:3000${postOwner?.profileImage || ""}`}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="text-lg font-semibold">{post?.username || "User"}</h4>
            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <p className="text-gray-300">{post?.text}</p>

        {post?.media && (
          post.media.fileType === "image" ? (
            <img
              src={`http://localhost:3000${post.media.url}`}
              alt="Post Media"
              className="rounded-xl object-cover"
            />
          ) : post.media.fileType === "video" ? (
            <video controls className="rounded-xl max-h-80 object-cover">
              <source src={`http://localhost:3000${post.media.url}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <a
              href={`http://localhost:3000${post.media.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View Document
            </a>
          )
        )}

        <div className="flex justify-around items-center border-t border-gray-800 pt-3 mt-2 flex-wrap gap-2">
          <Button
            variant="ghost"
            className={`flex items-center gap-2 flex-1 justify-center ${isLiked ? '!text-blue-500 font-bold' : 'text-gray-400'}`}
            onClick={handleLike}
          >
            <ThumbsUp className="w-5 h-5" />
            <span>Like</span>
            <span className="text-sm text-gray-400">({likeCount})</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 flex-1 justify-center text-gray-400"
            onClick={() => {
              setShowCommentInput(!showCommentInput);
              setShowComments(true);
            }}
          >
            <MessageCircle className="w-5 h-5 text-green-500" />
            Comment
          </Button>

          <div className="relative flex-1">
            <Button
              variant="ghost"
              className="flex items-center gap-2 justify-center text-gray-400 w-full"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="w-5 h-5 text-yellow-500" />
              Share
            </Button>

            {showShareMenu && (
              <div className="absolute top-full mt-2 left-0 bg-gray-900 rounded-lg p-3 z-10 flex gap-3 shadow-lg">
                <Facebook onClick={() => handleShare("facebook")} className="text-blue-600 cursor-pointer" />
                <Twitter onClick={() => handleShare("twitter")} className="text-blue-400 cursor-pointer" />
                <Instagram onClick={() => handleShare("instagram")} className="text-pink-500 cursor-pointer" />
                <Linkedin onClick={() => handleShare("linkedin")} className="text-blue-700 cursor-pointer" />
                <Mail onClick={() => handleShare("email")} className="text-gray-300 cursor-pointer" />
              </div>
            )}
          </div>
        </div>

        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="mt-2 flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-green-500 hover:bg-gray-800"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        )}

        {comments.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              className="text-gray-400 text-sm flex items-center gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </Button>

            {showComments && (
              <div className="mt-2 space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2 items-start">
                    <img
                      src={
                        comment.userId?.profileImage
                          ? comment.userId.profileImage.startsWith("http")
                            ? comment.userId.profileImage
                            : `http://localhost:3000${comment.userId.profileImage}`
                          : ""
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold">{comment.username}</h4>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
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
