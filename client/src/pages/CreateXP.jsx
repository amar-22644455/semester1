import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function CreateXP(){
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institute: "",
    password: "",
    username: "",
    mobile: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("/api/CreateXp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Signup Successful:", data);
      alert("Signup successful! Please log in.");
      navigate("/LoginXP");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Signup failed. Please try again.");
    }
  };

    return(
<>
<section className=" h-screen w-full bg-white">

    <main className="flex flex-row h-auto mt-3 ">
        
        <div className="ml-auto mr-auto mt-5 mb-5 h-auto flex flex-col gap-2 border-2 border-gray-300 p-10 rounded-[4px] bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4]">
            <p className="font-serif text-[2.5rem] text-center">ShareXP</p>
            <p className="font-serif text-base mb-5"> Create account to share your Xperience</p>
            <form onSubmit={handleSignup} className=" flex flex-col gap-2">
           
            <input 
            name="name"
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-[#9e4635]"
            
            onChange={handleChange}
            value={formData.name} 
            ></input>

            <input 
            name="email"
            type="text"
            placeholder="Institute Email"
            className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-[#9e4635]"
            
            onChange={handleChange}
            value={formData.email} 
            >
            </input>

            <input 
            name="institute"
            type="text"
            placeholder="Institute Name"
            className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-[#9e4635]"
            
            onChange={handleChange}
            value={formData.institute} 
            >
            </input>

            <input 
            name="mobile"
            type="tel"
            placeholder="Mobile Number"
            className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-[#9e4635]"
            
            onChange={handleChange}
            value={formData.mobile} 
            >
            
            </input>

            <input 
            name="username"
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-[#9e4635]"
             
            onChange={handleChange}
            value={formData.username}
            ></input>

            <input 
            name="password"
            type="text"
            placeholder="Password"
            autoComplete="new-password"
            className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-[#9e4635]"
            
            onChange={handleChange}
            value={formData.password} 
            ></input>

            <button type="submit" className="mt-1 bg-gray-200 text-black">
                Sign Up

            </button>

            </form>
            <div className="flex felx-col mt-2 ml-auto mr-auto w-full h-auto flex flex-col gap-2">
                <p className="text-center font-serif">Already a Learner?
                </p>
                <Link to="/LoginXP"><button className="bg-gray-200 w-full text-black">Log in</button></Link>

        </div>
        </div>

        

    </main>
    <footer>

    </footer>

</section>
</>

    );
}