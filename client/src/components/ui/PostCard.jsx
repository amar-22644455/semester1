import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Send, ChevronDown, ChevronUp, Facebook, Instagram, Twitter, Linkedin, Mail } from "lucide-react";

import { useState, useEffect, useRef } from "react";

export default function PostCard({ post }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post?.comments || []);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [postOwner, setPostOwner] = useState(null);

  if (!post) return null;


  const checkLikeStatus = async (userId, postId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/${postId}/like-status?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        // Optional: Update like count if needed
        if (data.likeCount !== undefined) {
          setLikeCount(data.likeCount);
        }
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

    useEffect(() => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Fetch complete user data
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

        fetchCurrentUser();
        checkLikeStatus(userId, post._id);
      }

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


    const handlePostAction = async (actionType, data = {}) => {
      if (!currentUser) {
        console.error('User not logged in');
        return null;
      }
  
      try {
        const response = await fetch('http://localhost:3000/api/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            postId: post._id,
            actionType,
           
            ...data
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to perform action');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error performing action:', error);
        return null;
      }
    };



    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (comment.trim() && currentUser) {
        const result = await handlePostAction('comment', { 
          commentText: comment,
          recipientId: post.userId // Assuming post has userId of the creator
        });
        
        if (result && result.comment) {
          // Use the comment data returned from the server
          setComments([...comments, result.comment]);
          setComment("");
          setShowCommentInput(false);
        }
      }
    };


  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setShowCommentInput(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;
  
    console.log('Before click - isLiked:', isLiked, 'likeCount:', likeCount);
  
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    setLikeCount(newLikeStatus ? likeCount + 1 : likeCount - 1);
  
    console.log('After optimistic update - isLiked:', newLikeStatus, 'likeCount:', newLikeStatus ? likeCount + 1 : likeCount - 1);
  
    const action = newLikeStatus ? 'like' : 'unlike';
  
    try {
      const result = await handlePostAction(action, {
        recipientId: post.userId
      });
      console.log('API result:', result);
  
      if (result) {
        if (result.updatedLikeCount !== undefined) {
          setLikeCount(result.updatedLikeCount);
        }
        if (result.isLiked !== undefined) {
          setIsLiked(result.isLiked);
        }
      } else {
        throw new Error('No result from server');
      }
    } catch (error) {
      console.error('Error handling like action:', error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      console.log('Reverted - isLiked:', previousLiked, 'likeCount:', previousCount);
    }
  };

  const handleShare = (platform) => {
    setShowShareMenu(false);
    const postUrl = `http://localhost:3000/posts/${post.id}`; // Replace with your actual post URL
    const text = `Check out this post: ${post.text}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, this would open the app
        window.open('instagram://', '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Check out this post')}&body=${encodeURIComponent(text + '\n\n' + postUrl)}`, '_blank');
        break;
      default:
        // Default share using Web Share API if available
        if (navigator.share) {
          navigator.share({
            title: 'Check out this post',
            text: text,
            url: postUrl,
          }).catch(err => console.log('Error sharing:', err));
        } else {
          // Fallback for browsers that don't support Web Share API
          navigator.clipboard.writeText(postUrl).then(() => {
            alert('Link copied to clipboard!');
          });
        }
    }
  };

  return (
    <Card className="p-4 shadow-md rounded-1xl bg-black w-full text-white relative">
      <CardContent className="flex flex-col gap-4">
        {/* Profile and User Info with Menu Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
            src={postOwner?.profileImage 
              ? postOwner.profileImage.startsWith('http') 
                ? postOwner.profileImage 
                : `http://localhost:3000${postOwner.profileImage}`
              : null} 
              alt="Profile"
              className="h-10 w-10 w-auto rounded-full object-cover"
            />
            <div>
              <h4 className="text-lg font-semibold">{post?.username || "User"}</h4>
              <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-gray-800"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowShareMenu(true);
                    }}
                  >
                    Share
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
                    Delete
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
                    Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <p className="text-gray-300">{post?.text || "Hello"}</p>

        {/* Post Media */}
        {post?.media ? (
          post.media.fileType === "image" ? (
            <img
              src={`http://localhost:3000${post.media.url}`}
              alt="Post Image"
              className="h-auto w-auto rounded-xl object-cover"
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
        ) : null}

        {/* Like and Comment Count */}
        {(likeCount > 0 || comments.length > 0) && (
          <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-800 pt-2">
            {likeCount > 0 && (
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 text-blue-500" />
                <span className="ml-1">{likeCount}</span>
              </div>
            )}
            {comments.length > 0 && (
              <div>
                <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-around items-center border-t border-gray-800 pt-3 mt-2 flex-wrap gap-2">
  <Button 
    variant="ghost" 
    className={`flex items-center gap-2 flex-1 justify-center ${isLiked ? '!text-blue-500 !font-bold' : '!text-gray-400'}`}
    onClick={handleLike}
  >
    <ThumbsUp className="w-5 h-5" />
    Like
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
  <Button 
    variant="ghost" 
    className="flex items-center gap-2 flex-1 justify-center text-gray-400"
    onClick={() => setShowShareMenu(!showShareMenu)}
  >
    <Share2 className="w-5 h-5 text-yellow-500" />
    Share
  </Button>
</div>


        {/* Comment Input Section */}
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

        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              className="text-gray-400 text-sm flex items-center gap-1"
              onClick={toggleComments}
            >
              {showComments ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </Button>

            {showComments && (
              <div className="mt-2 space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2 items-start">
                    <img
                      src={comment.userId?.profileImage 
                        ? comment.userId.profileImage.startsWith('http') 
                          ? comment.userId.profileImage 
                          : `http://localhost:3000${comment.userId.profileImage}`
                        : null} 
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold">{comment.username}</h4>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleTimeString()}</span>
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