import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar (Fixed) */}
      <div className="flex flex-col w-60 h-screen border-r border-gray-400 overflow-hidden">
        <div className="mt-10 text-[25px] font-serif h-10 flex items-center pl-8">
          ShareXP
        </div>


        <div className="flex-1"></div> {/* Pushes buttons to bottom */}

        <Link to="." className="text-[20px] text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Home</button>
        </Link>
        <Link to="/Search" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Search</button>
        </Link>
        <Link to="/your-route" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Message</button>
        </Link>
        <Link to="/your-route" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Notification</button>
        </Link>
        <Link to="" className="text-[20px] mt-1 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Create</button>
        </Link>
        <Link to="/Profile" className="text-[20px] mt-1 mb-10 text-white font-serif h-10 flex items-center pl-4">
          <button className="w-full text-left">Profile</button>
        </Link>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
        <h3 className="text-4xl font-bold text-white">Welcome to Student Community</h3>
        <p className="text-gray-400 mt-2">A place to share skills, experiences, and semester reports.</p>

        {/* Dummy content to test scrolling */}
        <div className="mt-10 space-y-10">
          {Array.from({ length: 20 }).map((_, index) => (
            <p key={index} className="text-gray-300">
              This is some sample content to test scrolling. Line {index + 1}.
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-55 ml-auto h-screen overflow-hidden">
      <p className="text-[15px] mt-5 text-white font-serif h-5 flex items-center pl-4">
          <p className="w-full text-left">Amar Kumar</p>
        </p>
      <p className="text-[15px] mt-2 text-white font-serif h-5 flex items-center pl-4">
          <Link to="/Profile " className="text-left">amar_151174</Link>
          <Link to="/LoginXp" className="ml-5">Logout</Link>
        </p>
        
      </div>
    </div>
  );
}
