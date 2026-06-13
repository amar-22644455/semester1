import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { UserSearchTrie, debounce } from "../utils/searchUtils";
import Sidebar from "../components/Sidebar";

export default function Search() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [query, setQuery] = useState("");
  const [searchTrie, setSearchTrie] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [recentUserSearches, setRecentUserSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize search trie and load users
  useEffect(() => {
    const initializeSearch = async () => {
      setIsLoading(true);
      try {
        // 1. Create new trie instance
        const trie = new UserSearchTrie();
        
        // 2. Fetch all users from backend
        const response = await fetch(`/api/all-users`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          navigate("/LoginXP");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch users");
        
        const users = await response.json();
        
        // 3. Add all users to the trie
        trie.bulkAddUsers(users);
        
        // 4. Update state
        setSearchTrie(trie);
      } catch (error) {
        console.error("Search initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSearch();

    // Load recent searches from localStorage
    const storedSearches = JSON.parse(localStorage.getItem(`recentUserSearches_${currentUserId}`)) || [];
    setRecentUserSearches(storedSearches);
  }, []);

  // Debounced search function
  const performSearch = debounce((query, trie) => {
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }
    
    if (trie) {
      const results = trie.search(query);
      setFilteredResults(results);
    }
  }, 300);

  // Update search when query changes
  useEffect(() => {
    performSearch(query, searchTrie);
  }, [query, searchTrie]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleUserClick = (user) => {
    // Update recent searches
    let searches = JSON.parse(localStorage.getItem(`recentUserSearches_${currentUserId}`)) || [];
    
    // Remove if already exists
    searches = searches.filter(u => u._id !== user._id);
    
    // Add to beginning
    searches.unshift({
      _id: user._id,
      username: user.username,
      name: user.name,
      // Add any other minimal user data you need
    });
    
    // Keep only last 10 searches
    if (searches.length > 10) searches.pop();
    localStorage.setItem(`recentUserSearches_${currentUserId}`, JSON.stringify(searches));
    setRecentUserSearches(searches);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4] text-black">
        <Sidebar />

        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl space-y-6">
            
            {/* Header */}
            <div className="text-left mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Search Users</h1>
              <p className="text-gray-500 text-sm mt-1">Find and connect with fellow learners on ShareXP.</p>
            </div>

            {/* Input Box */}
            <input
              type="text"
              placeholder="Search by name or username..."
              value={query}
              onChange={handleSearch}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9e4635] text-sm text-black bg-white/80 backdrop-blur-sm shadow-sm transition-all text-left"
            />

            {/* Search Results */}
            <div className="space-y-2">
              {filteredResults.length > 0 ? (
                filteredResults.map((user) => (
                  <Link
                    to={`/UserProfile/${user._id}`}
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 p-2.5 bg-[#fffaf7] hover:bg-[#fcf5f2] border border-[#edd6cc] rounded-xl transition-all duration-200 text-left cursor-pointer"
                  >
                    <img
                      src={user.profileImage || "https://picsum.photos/100"}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://picsum.photos/100";
                      }}
                    />
                    <div className="text-left">
                      <span className="font-semibold text-sm text-gray-900 block">{user.username}</span>
                      {user.name && (
                        <span className="text-gray-500 text-xs">{user.name}</span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                query && !isLoading && (
                  <p className="text-gray-500 text-sm text-left mt-2">No users found</p>
                )
              )}
            </div>

            {/* Recent Searches */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 mb-3 text-left">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentUserSearches.length > 0 ? (
                  recentUserSearches.map((user) => (
                    <Link
                      to={`/UserProfile/${user._id}`}
                      key={user._id}
                      onClick={() => handleUserClick(user)}
                      className="px-3 py-1.5 bg-white hover:bg-[#fcf5f2] text-gray-700 hover:text-[#9e4635] rounded-lg border border-gray-200 text-xs transition-all duration-200 font-medium cursor-pointer"
                    >
                      {user.username}
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs text-left">No recent user searches</p>
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
    
      // <section>
      //   <div className="m-2 flex w-full bg-white">
      //     {/* Left Sidebar */}
      //     <div className="flex">
      //       <div className="hidden md:flex flex-col w-30 h-screen overflow-hidden">
      //       <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">ShareXP</div>
      //       <div className="flex-1"></div>

      //       <Link to={`/home/${currentUserId}`} className="text-[20px] text-black font-serif h-10 flex items-center pl-4">
      //         <button className="w-full text-left">Home</button>
      //       </Link>
      //       <Link to={`/search/${id}`} className="text-[20px] mt-1 text-black font-serif h-10 flex items-center pl-4">
      //         <button className="w-full text-left">Search</button>
      //       </Link>
      //       <Link to={`/notification/${id}`} className="text-[20px] mt-1 text-black font-serif h-10 flex items-center pl-4">
      //         <button className="w-full text-left">Notifications</button>
      //       </Link>
      //       <Link to="/create" className="text-[20px] mt-1 text-black font-serif h-10 flex items-center pl-4">
      //         <button className="w-full text-left">Create</button>
      //       </Link>
      //       <Link to={`/profile/${id}`} className="text-[20px] mt-1 mb-10 text-black font-serif h-10 flex items-center pl-4">
      //         <button className="w-full text-left">Profile</button>
      //       </Link>
      //     </div>
      //     </div>


      //     {/* Main Content Area */}
      //     <div className="flex-1 pl-2 ">
      //       <input
      //         type="text"
      //         placeholder="Search users..."
      //         value={query}
      //         onChange={handleSearch}
      //         className="w-full p-2 mt-10 border rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      //       />

      //       {/* Search Results */}
      //       <div className="mt-4">
      //         {filteredResults.length > 0 ? (
      //           filteredResults.map((user) => (
      //             <Link
      //               to={`/UserProfile/${user._id}`}
      //               key={user._id}
      //               className="block p-2 border-b hover:bg-[#6f85e5]"
      //               onClick={() => handleUserClick(user)}
      //             >
      //               <div className="flex items-center">
      //                 {user.profilePicture && (
      //                   <img 
      //                     src={user.profilePicture} 
      //                     alt={user.username}
      //                     className="w-8 h-8 rounded-full mr-2"
      //                   />
      //                 )}
      //                 <div>
      //                   <span className="font-medium">{user.username}</span>
      //                   {user.name && (
      //                     <span className="text-gray-600 ml-2">({user.name})</span>
      //                   )}
      //                 </div>
      //               </div>
      //             </Link>
      //           ))
      //         ) : (
      //           query && !isLoading && <p className="text-gray-600 mt-2">No users found</p>
      //         )}
      //       </div>

      //       {/* Recent User Searches Section */}
      //       <div className="mt-1">
      //         <div className=" mt-2">
      //           {recentUserSearches.length > 0 ? (
      //             recentUserSearches.map((user) => (
      //               <Link
      //                 to={`/UserProfile/${user._id}`}
      //                 key={user._id}
      //                 className="block text-black text-[16px] mb-2 cursor-pointer hover:bg-[#6f85e5] rounded"
      //                 onClick={() => handleUserClick(user)}
      //               >
      //                 {user.username} ({user.name})
      //               </Link>
      //             ))
      //           ) : (
      //             <p className="text-gray-600 text-sm">No recent user searches</p>
      //           )}
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </section>
  );
}