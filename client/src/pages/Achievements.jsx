import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Trophy, Music, Cpu, Palette } from "lucide-react";

import Achievement from "../components/ui/Achievements";
import Sidebar from "../components/Sidebar";

const categoryIcon = {
  Technical: <Cpu size={32} />,
  Cultural: <Music size={32} />,
  Sports: <Trophy size={32} />,
  Academic: <Palette size={32} />,
};

const categoryTheme = {
  Technical: "indigo",
  Cultural: "rose",
  Sports: "emerald",
  Academic: "amber",
};

export default function Achievements() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const isOwner = currentUserId === id;

  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Technical",
    date: "",
    description: "",
    tags: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch(
          `/api/${id}/achievements`
        );
        if (res.status === 401) {
          navigate("/LoginXP");
          return;
        }
        const data = await res.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error(err);
        setAchievements([]);
      }
    };

    fetchAchievements();
  }, [id]);

  /* ================= FILTER ================= */
  const filtered =
    activeTab === "all"
      ? achievements
      : achievements.filter(
          a => a.category.toLowerCase() === activeTab
        );

  /* ================= DELETE ================= */
  const handleDelete = async (achievementId) => {
    if (!isOwner) return;
    if (!confirm("Delete this achievement?")) return;

    await fetch(
      `/api/achievements/${achievementId}`,
      {
        method: "DELETE",
      }
    );

    setAchievements(prev =>
      prev.filter(a => a._id !== achievementId)
    );
  };

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!isOwner) return;

    const payload = {
      title: form.title,
      category: form.category,
      date: form.date,
      description: form.description,
      tags: form.tags.split(",").map(t => t.trim()),
    };

    const res = await fetch(
      `/api/${id}/achievements`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) return;

    const data = await res.json();

    setAchievements(prev => [data, ...prev]);
    setShowModal(false);
    setForm({
      title: "",
      category: "Technical",
      date: "",
      description: "",
      tags: "",
    });
  };

  return (
    <main className="flex h-screen w-full bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4]">
      <Sidebar />

      {/* ================= MAIN ================= */}
      <section className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {["All", "technical", "cultural", "sports", "academic", "Add Achievements"].map(
              tab =>
                tab === "Add Achievements" && !isOwner ? null : (
                  tab === "Add Achievements" ? (
                    <button
                      key={tab}
                      onClick={() => setShowModal(true)}
                      className="px-5 py-2 flex-1 bg-[#9e4635] hover:bg-[#8f3a2c] text-white rounded-xl font-semibold border-none cursor-pointer transition-colors"
                    >
                      + Add Achievement
                    </button>
                  ) : (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`px-4 py-2 rounded-lg capitalize border-none cursor-pointer transition-colors ${
                        activeTab === tab.toLowerCase()
                          ? "bg-[#9e4635] text-white"
                          : "text-gray-500 bg-transparent hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )
            )}
          </div>

          {/* Cards */}
          <div className="space-y-10">
            {filtered.map(a => (
              <div key={a._id} className="relative">
                {isOwner && (
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold"
                  >
                    Delete
                  </button>
                )}

                <Achievement
                  title={a.title}
                  category={a.category}
                  date={a.date}
                  description={a.description}
                  tags={a.tags}
                  icon={categoryIcon[a.category]}
                  colorTheme={categoryTheme[a.category]}
                />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-gray-500">No achievements added yet.</p>
          )}
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {showModal && isOwner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="bg-[#fffaf7] rounded-2xl w-full max-w-lg p-6 space-y-4"
          >
            <h2 className="text-2xl font-bold">Add Achievement</h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border p-3 rounded-xl"
            />

            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border p-3 rounded-xl"
            >
              <option>Technical</option>
              <option>Cultural</option>
              <option>Sports</option>
              <option>Academic</option>
            </select>

            <input
              placeholder="Date (e.g. Aug 2024)"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border p-3 rounded-xl"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border p-3 rounded-xl h-28"
            />

            <input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full border p-3 rounded-xl"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#9e4635] hover:bg-[#8f3a2c] text-white rounded-xl border-none cursor-pointer transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
