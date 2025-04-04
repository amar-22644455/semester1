import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function Search() {
  const { id } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentUserSearches, setRecentUserSearches] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Load recent user searches from LocalStorage when component mounts
  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem("recentUserSearches")) || [];
    setRecentUserSearches(storedSearches);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query); // Update only after delay
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer); // Cleanup on each keystroke
  }, [query]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/search?query=${value}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleUserClick = (user) => {
    // Store recent user searches in LocalStorage
    let searches = JSON.parse(localStorage.getItem("recentUserSearches")) || [];
    
    // Check if user already exists in recent searches
    const existingIndex = searches.findIndex(u => u._id === user._id);
    
    if (existingIndex >= 0) {
      // Remove the existing entry to avoid duplicates
      searches.splice(existingIndex, 1);
    }
    
    // Add user to beginning of array
    searches.unshift(user);
    
    // Keep only the last 5 searches
    if (searches.length > 5) searches.pop();
    
    localStorage.setItem("recentUserSearches", JSON.stringify(searches));
    setRecentUserSearches(searches);
  };

  return (
    <>
      <section>
        <main className="m-2 flex flex-row">
          {/* Left Sidebar */}
          <div className="flex flex-col w-60 h-screen overflow-hidden">
            <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8 mb-auto">
              ShareXP
            </div>
          <div>
            <Link to={`/home/${id}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
              <button className="w-full text-left">Home</button>
            </Link>

            <Link to={`/message/${id}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
              <button className="w-full text-left">Messages</button>
            </Link>
            <Link to={`/notification/${id}`} className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
              <button className="w-full text-left">Notifications</button>
            </Link>
            <Link to="/create" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
              <button className="w-full text-left">Create</button>
            </Link>
            <Link to={`/search/${id}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
                <button className="w-full text-left">Search</button>
              </Link>
            <Link to={`/profile/${id}`} className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
              <button className="w-full text-left">Profile</button>
            </Link>
            </div>
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
              {results.length > 0 ? (
                results.map((user) => (
                  <Link
                    to={`/UserProfile/${user._id}`}
                    key={user._id}
                    className="block p-2 border-b hover:bg-gray-200"
                    onClick={() => handleUserClick(user)}
                  >
                    {user.username} ({user.name})
                  </Link>
                ))
              ) : (
                query && <p className="text-gray-500 mt-2">No users found</p>
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