import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, UserPlus } from 'lucide-react';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';


export default function NotificationComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage on component mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUser({ _id: userId }); // Create an object with _id property
    }
  }, []);

  // Initialize socket when currentUser is available
  useEffect(() => {
    if (!currentUser?._id) return;

    const newSocket = io({
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Join user's personal room
    newSocket.emit('join', `user_${currentUser._id}`);

    // Handle new notifications
    newSocket.on('new_notification', (notification) => {
      addNotificationToUI(notification);
      showBrowserNotification(notification);
    });

    // Handle reconnection
    newSocket.on('connect', async () => {
      fetchAllNotifications();
    });

    setSocket(newSocket);

    // Initial fetch of notifications
    fetchAllNotifications();

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser?._id]);

  const fetchAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/all');
      if (response.status === 401) {
        navigate("/LoginXP");
        return;
      }
      const data = await response.json();
  
      const allNotifications = Array.isArray(data) ? data : [];
      const unreadNotifications = allNotifications.filter(n => !n.read);
      
      setNotifications(allNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const addNotificationToUI = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    playNotificationSound();
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const showBrowserNotification = (notification) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(
        `New ${notification.type}`,
        {
          body: getNotificationMessage(notification),
          icon: notification.sender?.avatar
        }
      );
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(
            `New ${notification.type}`,
            {
              body: getNotificationMessage(notification),
              icon: notification.sender?.avatar
            }
          );
        }
      });
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'follow':
        return <span className=''>`${notification.sender?.username} followed you!`;</span>
      case 'like':
        return `${notification.sender?.username} liked your post`;
      case 'comment':
        return `${notification.sender?.username} commented on your post`;
      default:
        return 'You have a new notification';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/mark-read/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update locally without refetching
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (!currentUser) {
    return <div>Please log in to view notifications</div>;
  }

  return (
    <>
      <section className="flex h-screen w-full bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4]">
        <Sidebar />


        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <div className="notification-container">
            <div className="notification-header">
              <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
  Notifications --
  {unreadCount > 0 && (
    <span className="unread-badge ml-1">{unreadCount}</span>
  )}
</div>

            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="flex justify-center mt-10 text-gray-600">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                      key={notification._id} 
                        className={`
                          transition-colors duration-200 ease-in-out
                          ${!notification.read ? 'bg-[#fcf5f2] border-l-4 border-[#9e4635]' : 'bg-[#fffaf7]'}
                          hover:bg-[#f2ddd0] cursor-pointer text-black
                        `}
                      onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    {/* '/default-avatar.png' */}
                      <div className="flex items-start p-4">
                          <img 
                              src={notification.sender?.profileImage || '/default-avatar.png' } 
                              alt={notification.sender?.username} 
                              className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                  <p className="font-medium text-black truncate">
                                      {notification.sender?.username || 'Unknown user'}
                                  </p>
                                  <span className="text-xs text-gray-600 whitespace-nowrap ml-2">
                                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1">
                                  {notification.type === 'like' && (
                                      <ThumbsUp className="w-4 h-4 text-[#9e4635]" />
                                  )}
                                  {notification.type === 'comment' && (
                                      <MessageCircle className="w-4 h-4 text-[#9e4635]" />
                                  )}
                                  {notification.type === 'follow' && (
                                      <UserPlus className="w-4 h-4 text-[#9e4635]" />
                                  )}
                                  <p className="text-sm text-gray-600 truncate">
                                      {getNotificationMessage(notification)}
                                  </p>
                              </div>
                              {notification.type !== 'follow' && notification?.post?.media?.url && (
                                  <div className="mt-2">
                                      <img
                                          src={notification?.post?.media?.url}
                                          className="w-16 h-16 rounded-md object-cover border border-gray-300"
                                          alt="Post media"
                                      />
                                  </div>
                              )}
                              {!notification.read && (
                                  <div className="mt-2 w-2 h-2 rounded-full bg-[#9e4635]"></div>
                              )}
                          </div>
                      </div>
                  </div>
              ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}