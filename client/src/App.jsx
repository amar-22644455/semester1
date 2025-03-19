import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import CreateXP from "./pages/CreateXP";
import LoginXP from "./pages/LoginXP";
import Search from "./pages/Search";

export default function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/CreateXP" element={<CreateXP />} />
        <Route path="/LoginXP" element={<LoginXP />} />
        <Route path="/Search" element={<Search />} />
      </Routes>
    </Router>
  );
}
