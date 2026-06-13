import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import profile from "@/assets/profile.jpg";

export default function Landing() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatAnimationDelayed = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4] text-gray-900 font-sans selection:bg-[#9e4635] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Premium Transparent Header */}
      <header className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif font-black text-2xl tracking-tight text-[#9e4635] group-hover:text-[#8f3a2c] transition-colors duration-200">
              ShareXP
            </span>
          </Link>
          {/* Right side is intentionally empty as requested */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 relative max-w-7xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
        {/* Hero Text */}
        <motion.div
          className="flex-1 text-center lg:text-left z-10"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 bg-[#9e4635]/10 border border-[#9e4635]/20 px-3.5 py-1 rounded-full text-xs font-semibold text-[#9e4635] mb-6">
            ✨ Elevating the Academic Journey
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-gray-950 leading-tight tracking-tight max-w-lg mx-auto lg:mx-0">
            Where Student <br />
            <span className="text-[#9e4635] bg-gradient-to-r from-[#9e4635] to-[#c16451] bg-clip-text text-transparent">
              Experiences
            </span> <br />
            Connect.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
            ShareXP is a private, specialized network designed for institute members to document academic milestones, review course curriculums, share interview insights, and track professional growth together.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
            <Link to="/LoginXP" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto text-base py-3.5 px-8 bg-[#9e4635] hover:bg-[#8f3a2c] shadow-lg shadow-[#9e4635]/20 rounded-xl transition-all duration-300 transform hover:scale-[1.02]">
                Login / Sign Up
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <div className="flex-1 w-full flex justify-center items-center relative min-h-[400px]">
          {/* Decorative glowing backdrops */}
          <div className="absolute w-72 h-72 rounded-full bg-[#9e4635]/10 blur-3xl -top-10 -left-10 -z-10" />
          <div className="absolute w-72 h-72 rounded-full bg-[#d0735e]/15 blur-3xl -bottom-10 -right-10 -z-10" />

          {/* Floating Main Mockup Card */}
          <motion.div
            className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl p-5 z-20"
            variants={floatAnimation}
            animate="animate"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={profile}
                alt="Profile Thumbnail"
                className="w-10 h-10 rounded-full object-cover border border-[#ecd0c4]"
              />
              <div>
                <h4 className="font-semibold text-sm text-gray-950">Amar Kumar</h4>
                <p className="text-xs text-gray-500">Mathematics and Computing</p>

              </div>
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-[#9e4635]/10 text-[#9e4635] font-medium">
                Interview Prep
              </span>
            </div>

            <p className="text-sm text-gray-800 leading-relaxed font-normal">
              Just cleared the internship interview! The coding round heavily featured DFS/BFS traversals and system design for a key-value store. I've uploaded my prep notes to the document center. 🚀
            </p>

            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">#microsoft</span>
              <span className="text-xs text-gray-500 font-medium">#internship</span>
              <span className="text-xs text-gray-500 font-medium">#computerscience</span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f5e6df] flex justify-between text-xs text-gray-500">
              <span>❤️ 24 Likes</span>
              <span>💬 7 Comments</span>
            </div>
          </motion.div>

          {/* Floating Accent Card: Achievement Badges */}
          <motion.div
            className="absolute -bottom-6 -left-4 sm:left-4 w-52 bg-white/80 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg p-4 z-30 hidden sm:block"
            variants={floatAnimationDelayed}
            animate="animate"
          >
            <h5 className="font-semibold text-xs text-gray-900 mb-2.5">🏆 Verify Achievements</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🥇</span>
                <span className="text-xs font-medium text-gray-700">Dean's List 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-medium text-gray-700">Hackathon Winner</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Accent Badge: Skills */}
          <motion.div
            className="absolute -top-6 -right-4 w-44 bg-white/80 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg p-3 z-30 flex items-center gap-2.5 animate-bounce-slow"
            variants={floatAnimation}
            animate="animate"
          >
            <span className="text-lg">💡</span>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">React Specialist</p>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div className="w-4/5 h-full bg-[#9e4635] rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Decorative clean spacing bottom */}
      <div className="h-12 w-full bg-transparent" />
    </div>
  );
}
