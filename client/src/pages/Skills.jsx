import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function Search() {
  const { id } = useParams();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset previous error
        const response = await fetch(`http://localhost:3000/api/${encodeURIComponent(id)}/skills`);
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const data = await response.json();
        setSkills(data.skills || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [id]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
  
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await fetch(`http://localhost:3000/api/${id}/skills-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill: newSkill.trim() }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add skill');
      }
  
      const result = await response.json();
  
      // Update with the returned full skills array
      setSkills(result.skills || []);
      setNewSkill("");
      setIsAdding(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveSkill = async (skillToRemove) => {
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await fetch(`http://localhost:3000/api/${id}/skills/${encodeURIComponent(skillToRemove)}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove skill');
      }
  
      const result = await response.json();
  
      // Update state with latest skills from server
      setSkills(result.skills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <section>
        <main className="flex h-screen">
          {/* Left Sidebar */}
          <div className="flex flex-col w-60 h-screen overflow-hidden">
            <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8 mb-auto">ShareXP</div>
            <div>
              <Link to={`/home/${id}`} className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
                <button className="w-full text-left">Home</button>
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
          <div className="flex flex-col flex-1 p-8">
            <div className="mt-5 text-[35px] font-serif h-10 flex items-center pl-8 mb-5 w-full">
              Notable Skills and Proficiencies
            </div>

            {/* Skills List */}
            <div className="space-y-2 mb-8">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className={`${index % 2 === 0 ? 'bg-green-800' : 'bg-yellow-900'} text-[20px] w-full rounded-md p-4 flex justify-between items-center`}
                  >
                    <span>{skill}</span>
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-white !bg-gray-900 rounded-md hover:text-red-500"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No skills added yet.</p>
              )}
            </div>

            {/* Add Skill Section */}
            {!isAdding ? (
              <button 
                onClick={() => setIsAdding(true)}
                className="!bg-gray-900 hover:bg-blue-700 text-white py-2 px-4 rounded self-start"
                disabled={isLoading}
              >
                Add a skill
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter new skill"
                  className="border p-2 rounded flex-1"
                  autoFocus
                  disabled={isLoading}
                />
                <button 
                  onClick={handleAddSkill}
                  className="!bg-gray-900 hover:bg-green-700 text-white py-2 px-4 rounded"
                  disabled={!newSkill.trim() || isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewSkill("");
                  }}
                  className="!bg-gray-900 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
}