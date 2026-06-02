import React from "react";
import { Calendar, Star, Circle, Hash } from "lucide-react";

const Achievements = ({
  title = "Event Participation",
  category = "General",
  date = "Spring 2024",
  description = "Detailed description of the experience goes here...",
  tags = [],
  icon,
  colorTheme = "indigo",
}) => {
  const themes = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      accent: "from-indigo-500 to-purple-500",
      iconBg: "bg-indigo-500",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      accent: "from-rose-500 to-orange-500",
      iconBg: "bg-rose-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      accent: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      accent: "from-amber-500 to-yellow-500",
      iconBg: "bg-amber-500",
    },
    sky: {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
      accent: "from-sky-500 to-indigo-500",
      iconBg: "bg-sky-500",
    },
  };

  const theme = themes[colorTheme] || themes.indigo;

  return (
    <div className="group relative w-full max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2rem] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1">
      
      <div className={`h-2 w-full bg-gradient-to-r ${theme.accent} rounded-t-[2rem] opacity-80`} />

      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Icon + Category */}
        <div className="flex flex-col items-center gap-3">
          <div className={`${theme.iconBg} p-5 rounded-[1.5rem] text-white shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
          <div className={`px-3 py-1 ${theme.bg} ${theme.text} rounded-full text-[10px] font-black uppercase tracking-widest border ${theme.border}`}>
            {category}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase">
              <Calendar size={14} />
              {date}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900">
              {title}
            </h3>
          </div>

          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500"
                >
                  <Hash size={10} />
                  {tag.toUpperCase()}
                </div>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="flex gap-2 text-gray-300">
              <Circle size={8} fill="currentColor" />
              <Circle size={8} fill="currentColor" className="opacity-50" />
              <Circle size={8} fill="currentColor" className="opacity-25" />
            </div>

            <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase">
              <Star size={12} fill="currentColor" />
              Official
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
