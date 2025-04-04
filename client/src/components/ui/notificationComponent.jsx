// components/NotificationItem.jsx
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, UserPlus } from 'lucide-react';

const NotificationItem = ({ notification }) => {
  const getNotificationContent = () => {
    const senderName = notification.sender?.username || 'Someone';
    const institute = notification.sender?.institute ? `from ${notification.sender.institute}` : '';

    switch (notification.type) {
      case 'like':
        return (
          <>
            <div className="p-2 rounded-full bg-black text-white-600">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">{senderName}</p>
              <p className="text-white-600">liked your post from {institute}</p>
              {notification.post?.media?.url && (
                <div className="mt-2">
                  <img 
                    src={notification.post.media.url} 
                    className="w-16 h-16 rounded-md object-cover border"
                    alt="Post media"
                  />
                </div>
              )}
            </div>
          </>
        );

      case 'comment':
        return (
          <>
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{senderName}</p>
              <p className="text-gray-600">commented on your post {institute}</p>
              {notification.commentText && (
                <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
                  "{notification.commentText}"
                </p>
              )}
              {notification.post?.media?.url && (
                <div className="mt-2">
                  <img 
                    src={notification.post.media.url} 
                    className="w-16 h-16 rounded-md object-cover border"
                    alt="Post media"
                  />
                </div>
              )}
            </div>
          </>
        );

      case 'follow':
        return (
          <>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{senderName}</p>
              <p className="text-gray-600">started following you {institute}</p>
              <Link 
                to={`/profile/${notification.sender?._id}`}
                className="mt-2 inline-block text-sm text-blue-600 hover:underline"
              >
                View profile
              </Link>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="p-2 rounded-full bg-gray-100 text-gray-600">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">New activity</p>
              <p className="text-gray-600">You have a new notification</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`flex items-start p-4 gap-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
      {notification.sender?.profileImage ? (
        <img 
          src={notification.sender.profileImage} 
          alt={notification.sender.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-400" />
        </div>
      )}
      
      {getNotificationContent()}
      
      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default NotificationItem;