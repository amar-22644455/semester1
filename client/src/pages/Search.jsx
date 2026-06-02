import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { UserSearchTrie, debounce } from "../utils/searchUtils";

export default function Search() {
  const { id } = useParams();
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
        const response = await fetch(`http://localhost:5000/api/all-users`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

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
        <div className="flex md:flex-row min-h-screen md:w-full bg-white">
  {/* Left Sidebar */}
  <div className="hidden md:flex flex-col w-60">
    <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
      ShareXP
    </div>

    <div className="flex-1" />
  <div className="space-y-3">
        <Link to={`/home/${currentUserId}`} className="text-[20px] text-black font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Home</button>
        </Link>
        <Link to={`/search/${currentUserId}`} className="text-[20px] mt-1 text-black  font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Search</button>
        </Link>
        <Link to={`/notification/${currentUserId}`} className="text-[20px] mt-1 text-black  font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Notifications</button>
        </Link>
        <Link to={`/achievements/${currentUserId}`} className="text-[20px] mt-1 text-black font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Achievements</button>
        </Link>
        <Link to={`/profile/${currentUserId}`} className="text-[20px] mt-1 mb-10 text-black font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Profile</button>
        </Link>
        </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 overflow-y-auto">
    {/* page content here */}
    <div className="flex-1 pl-2 ">
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={handleSearch}
              className="w-full p-2 mt-10 border rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Search Results */}
            <div className="mt-4">
              {filteredResults.length > 0 ? (
                filteredResults.map((user) => (
                  <Link
                    to={`/UserProfile/${user._id}`}
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className="
                      block
                      p-2
                      border-b
                      text-black
                      transition-all
                      duration-200
                      hover:bg-[#b87047]
                      hover:[&_*]:text-white

                    "
                  >
                    <div className="flex items-center">
                      {user.profilePicture && (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}

                      <div>
                        <span className="font-medium">
                          {user.username}
                        </span>

                        {user.name && (
                          <span className="ml-2 text-gray-600">
                            ({user.name})
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                query && !isLoading && (
                  <p className="text-gray-500 mt-2">No users found</p>
                )
              )}
            </div>


            {/* Recent User Searches Section */}
            <div className="mt-1">
              <div className=" mt-2">
                {recentUserSearches.length > 0 ? (
                  recentUserSearches.map((user) => (
                    <Link
                      to={`/UserProfile/${user._id}`}
                      key={user._id}
                      className="block text-white text-[16px] mb-2 cursor-pointer bg-gradient-to-br
                        from-[#9e4635]
                        to-[#d0735e]
                        transition-transform
                        transition-shadow
                        duration-200
                        ease-out
                        hover:scale-105
                        hover:shadow-[0_6px_15px_rgba(0,0,0,0.2)] rounded"
                      onClick={() => handleUserClick(user)}
                    >
                      {user.username} ({user.name})
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No recent user searches</p>
                )}
              </div>
            </div>
          </div>
  </div>

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