import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import CreateXP from "./pages/CreateXP";
import LoginXP from "./pages/LoginXP";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import Message from "./pages/Message";
import Notification from "./pages/Notification";

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
        <Route path="/Message/:id" element={<Message/>} />
        <Route path="/Notification/:id" element={<Notification/>} />
      </Routes>
    </Router>
  );
}
