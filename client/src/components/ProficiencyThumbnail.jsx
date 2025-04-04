import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function ProficiencyThumbnail({ user, isCurrentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [proficiencies, setProficiencies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "Beginner",
    experience: "0 years"
  });

  // Load proficiencies from user data
  useEffect(() => {
    if (user?.proficiencies) {
      setProficiencies(user.proficiencies);
    }
  }, [user]);

  const parseExperience = (expStr) => {
    if (!expStr) return 0;
    if (expStr.includes('year')) return parseFloat(expStr);
    if (expStr.includes('month')) return parseFloat(expStr) / 12;
    return 0;
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error("Skill name cannot be empty");
      return;
    }

    setProficiencies([...proficiencies, { ...newSkill, _id: Date.now().toString() }]);
    setNewSkill({
      name: "",
      level: "Beginner",
      experience: "0 years"
    });
    
    // In a real app, you would call your API here
    // await saveProficiencies([...proficiencies, newSkill]);
    toast.success("Skill added!");
  };

  const handleUpdateSkill = () => {
    const updated = proficiencies.map(skill => 
      skill._id === editingId ? { ...skill, ...newSkill } : skill
    );
    
    setProficiencies(updated);
    setEditingId(null);
    setNewSkill({
      name: "",
      level: "Beginner",
      experience: "0 years"
    });
    
    // await saveProficiencies(updated);
    toast.success("Skill updated!");
  };

  const handleDeleteSkill = (id) => {
    const updated = proficiencies.filter(skill => skill._id !== id);
    setProficiencies(updated);
    
    // await saveProficiencies(updated);
    toast.success("Skill removed!");
  };

  const startEditing = (skill) => {
    setEditingId(skill._id);
    setNewSkill({
      name: skill.name,
      level: skill.level,
      experience: skill.experience
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewSkill({
      name: "",
      level: "Beginner",
      experience: "0 years"
    });
  };

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 500 
      }
    },
    exit: { opacity: 0, scale: 0.8 }
  };

  const skillItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link 
          to="" 
          className="text-[15px] w-full text-left text-white font-serif flex items-center ml-5"
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}
        >
          Proficiency
        </Link>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif text-white">
                  {user?.name}'s Proficiencies
                  {isCurrentUser && <span className="text-sm text-gray-400 ml-2">(Your Skills)</span>}
                </h2>
                <motion.button 
                  onClick={() => {
                    setShowModal(false);
                    cancelEditing();
                  }}
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              
              {/* Add/Edit Form (only for current user) */}
              {isCurrentUser && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-serif text-white mb-3">
                    {editingId ? "Edit Skill" : "Add New Skill"}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Skill name"
                      className="w-full p-2 rounded bg-gray-600 text-white"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    />
                    <select
                      className="w-full p-2 rounded bg-gray-600 text-white"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <div className="flex items-center">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-16 p-2 rounded bg-gray-600 text-white"
                        value={parseInt(newSkill.experience) || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewSkill({
                            ...newSkill,
                            experience: val ? `${val} years` : "0 years"
                          });
                        }}
                      />
                      <span className="ml-2 text-white">years</span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      {editingId && (
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 bg-gray-600 text-white rounded"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={editingId ? handleUpdateSkill : handleAddSkill}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        {editingId ? "Update" : "Add"} Skill
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {proficiencies.length > 0 ? (
                  proficiencies.map((skill, index) => {
                    const yearsExp = parseExperience(skill.experience);
                    const widthPercentage = Math.min(
                      yearsExp * (skill.level === "Advanced" ? 30 : 
                                skill.level === "Intermediate" ? 20 : 10), 
                      90
                    );
                    
                    return (
                      <motion.div 
                        key={skill._id}
                        custom={index}
                        variants={skillItemVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-gray-700 rounded-lg p-4 relative"
                      >
                        {isCurrentUser && !editingId && (
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              onClick={() => startEditing(skill)}
                              className="text-gray-300 hover:text-blue-400 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill._id)}
                              className="text-gray-300 hover:text-red-400 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <h3 className="font-serif text-lg text-white">{skill.name}</h3>
                          <span className="text-sm text-gray-300">{skill.level}</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                            <motion.div 
                              className="bg-blue-500 h-2 rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPercentage}%` }}
                              transition={{ 
                                duration: 0.5 + yearsExp * 0.3,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {skill.experience} experience • {widthPercentage.toFixed(0)}% proficiency
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    {isCurrentUser ? "Add your first skill!" : "No skills listed yet"}
                  </div>
                )}
              </div>

              <motion.div 
                className="mt-6 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={() => {
                    setShowModal(false);
                    cancelEditing();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-serif rounded hover:bg-blue-700 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
  
}