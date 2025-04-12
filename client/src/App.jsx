import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import CreateXP from "./pages/CreateXP";
import LoginXP from "./pages/LoginXP";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import Skills from "./pages/Skills";
import Notification from "./pages/Notification";
import Post from "./pages/Post";

export default function App() {
  return (
    <Router>
      
      <Routes>  
        <Route path="/Home/:id" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/CreateXP" element={<CreateXP />} />
        <Route path="/LoginXP" element={<LoginXP />} />
        <Route path="/search/:id" element={<Search />} />
        <Route path="/UserProfile/:id" element={<UserProfile/>} />
        <Route path="/skills/:id" element={<Skills/>} />
        <Route path="/Notification/:id" element={<Notification/>} />
        <Route path="/post/:id" element={<Post/>} />
      </Routes>
    </Router>
  );
}
