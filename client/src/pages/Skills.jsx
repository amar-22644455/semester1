import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Zap,
  Trash2,
  Plus,
  Code
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Skill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/${encodeURIComponent(id)}/skills`
        );
        if (res.status === 401) {
          navigate("/LoginXP");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch skills");
        const data = await res.json();
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
      const res = await fetch(
        `/api/${id}/skills-add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill: newSkill.trim() }),
        }
      );
      if (!res.ok) throw new Error("Failed to add skill");
      const data = await res.json();
      setSkills(data.skills || []);
      setNewSkill("");
      setIsAdding(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/${id}/skills/${encodeURIComponent(skill)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove skill");
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (error)
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <main className="flex h-screen w-full bg-white">
      
      <Sidebar />

      {/* ================= Right Content (NEW UI) ================= */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0c] text-slate-100 p-8">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Header */}
          <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9e4635]/10 border border-[#9e4635]/20 text-[#d0735e] text-sm">
            <Star className="w-4 h-4 fill-current" />
            Skill Showcase
          </div>
            <h1 className="text-4xl font-bold">
              Notable Skills & Proficiencies
            </h1>
            <p className="text-slate-400">
              A visual representation of technical strengths.
            </p>
          </section>

          {/* Skill Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 hover:border-[#d0735e]/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-[#9e4635]/20 text-[#d0735e]">
                        <Code className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold">{skill}</h3>
                    </div>

                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="mt-4 text-slate-400">
                    Practical experience and proficiency in{" "}
                    <span className="text-[#d0735e] font-semibold">{skill}</span>.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No skills added yet.</p>
            )}
          </section>

          {/* Add Skill */}
          <section className="py-10">
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-[#9e4635] hover:text-white transition-all border-none cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add a Skill
              </button>
            ) : (
              <div className="flex gap-4">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill"
                  className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white"
                  autoFocus
                />
                <button
                  onClick={handleAddSkill}
                  className="px-6 py-3 rounded-xl bg-[#9e4635] hover:bg-[#8f3a2c] text-white font-bold border-none cursor-pointer transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewSkill("");
                  }}
                  className="px-6 py-3 rounded-xl border border-white/10 text-slate-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="text-[#d0735e] flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 fill-current" />
            Skills evolve with experience
          </div>
        </div>
      </div>
    </main>
  );
}