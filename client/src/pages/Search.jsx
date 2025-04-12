import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { UserSearchTrie, debounce } from "../utils/searchUtils";

export default function Search() {
  const { id } = useParams();
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
        const response = await fetch(`http://localhost:3000/api/all-users`, {
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
    const storedSearches = JSON.parse(localStorage.getItem("recentUserSearches")) || [];
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
    let searches = JSON.parse(localStorage.getItem("recentUserSearches")) || [];
    
    // Remove if already exists
    searches = searches.filter(u => u._id !== user._id);
    
    // Add to beginning
    searches.unshift({
      _id: user._id,
      username: user.username,
      name: user.name,
      // Add any other minimal user data you need
    });
    
    // Keep only last 5 searches
    if (searches.length > 5) searches.pop();
    
    localStorage.setItem("recentUserSearches", JSON.stringify(searches));
    setRecentUserSearches(searches);
  };

  return (
    <>
      <section>
        <main className="m-2 flex flex-row">
          {/* Left Sidebar */}
          <div className="hidden md:flex flex-col w-60 h-screen overflow-hidden">
        <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">ShareXP</div>
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

          {/* Main Content Area */}
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
                    className="block p-2 border-b hover:bg-gray-200"
                    onClick={() => handleUserClick(user)}
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
                        <span className="font-medium">{user.username}</span>
                        {user.name && (
                          <span className="text-gray-600 ml-2">({user.name})</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                query && !isLoading && <p className="text-gray-500 mt-2">No users found</p>
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
                      className="block text-white text-[16px] mb-2 cursor-pointer hover:bg-gray-700 rounded"
                      onClick={() => handleUserClick(user)}
                    >
                      {user.username} ({user.name})
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent user searches</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
}