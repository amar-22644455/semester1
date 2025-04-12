import { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import io from 'socket.io-client';


export default function NotificationComponent() {
  const { id } = useParams();
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

    const newSocket = io("http://localhost:3000", {
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
      const response = await fetch('http://localhost:3000/api/notifications/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
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
      await fetch(`http://localhost:3000/api/notifications/mark-read/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      <section className="flex h-screen">
        {/* Left Sidebar */}
        <div className="flex flex-col w-60 h-screen overflow-hidden">
          <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
            ShareXP
          </div>
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
        <div className="flex flex-col flex-1">
          <div className="notification-container">
            <div className="notification-header">
              <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
                Notification  {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </div>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="flex justify-center mt-10 text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                      key={notification._id} 
                      className={`
                          transition-colors duration-200 ease-in-out
                          ${!notification.read ? 'bg-gray-900 border-l-4 border-blue-500' : 'bg-black'}
                          hover:bg-gray-800 cursor-pointer text-white
                      `}
                      onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    {/* '/default-avatar.png' */}
                      <div className="flex items-start p-4">
                          <img 
                              src={notification.sender?.profileImage 
                                                ? notification.sender?.profileImage.startsWith('http') 
                                                  ? notification.sender.profileImage 
                                                  : `http://localhost:3000${notification.sender?.profileImage}`
                                                : '/default-avatar.png' } 
                              alt={notification.sender?.username} 
                              className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                  <p className="font-medium text-white truncate">
                                      {notification.sender?.username || 'Unknown user'}
                                  </p>
                                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                              </div>
                              <div className="mt-1 flex">
                                  {notification.type === 'like' && (
                                      <span className="mr-1">👍</span>
                                  )}
                                  {notification.type === 'comment' && (
                                      <span className="mr-1">💬</span>
                                  )}
                                  {notification.type === 'follow' && (
                                      <span className="mr-1">👤</span>
                                  )}
                                  <p className="text-sm text-gray-300 truncate">
                                      {getNotificationMessage(notification)}
                                  </p>
                              </div>
                              {notification.type !== 'follow' && `http://localhost:3000${notification?.post?.media?.url}` && (
                                  <div className="mt-2">
                                      <img
                                          src={`http://localhost:3000${notification?.post?.media?.url}`}
                                          className="w-16 h-16 rounded-md object-cover border border-gray-700"
                                          alt="Post media"
                                      />
                                  </div>
                              )}
                              {!notification.read && (
                                  <div className="mt-2 w-2 h-2 rounded-full bg-blue-500"></div>
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