import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginXP() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            const response = await fetch("http://localhost:5000/api/login", {  // Change to /auth if you renamed it
                method: "POST",
                headers: { "Content-Type": "application/json",
                 },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

             // Store token and user data in localStorage
             localStorage.setItem("token", data.token); // Store token in localStorage
             localStorage.setItem("userId", data.user.id); // Store user ID in localStorage
 
             // Redirect user to their home page
             navigate(`/Home/${data.user.id}`); // Dynamically navigate to the user's home page
        } catch (error) {
            setError(error.message);
        }
    };

   return (
  <>
    <section className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <main className="w-full flex justify-center">
        <div className="flex flex-col gap-2 border-2 border-gray-300 p-10 rounded-[4px] max-w-md w-full">
          
          <p className="font-serif text-[2.5rem] text-center">ShareXP</p>
          <p className="font-serif text-base mb-5 text-center">
            Login to share your experience
          </p>

          {error && (
            <p className="text-red-500 text-center">
              {error}
            </p>
          )}

          <form className="flex flex-col gap-2" onSubmit={handleLogin}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full
                          p-2
                          border
                          text-black
                          bg-white
                          placeholder-gray-400
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                          focus:bg-white
                          focus:text-black"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full
                        p-2
                        border
                        text-black
                        bg-white
                        placeholder-gray-400
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        focus:bg-white
                        focus:text-black"
              required
            />

            <button
              type="submit"
              className="mt-1 bg-gray-200 text-black p-2 hover:bg-gray-300 transition"
            >
              Login
            </button>
          </form>

          <div className="flex flex-col mt-2 gap-2">
            <p className="text-center font-serif">Haven't started?</p>
            <Link to="/CreateXp">
              <button className="bg-gray-200 w-full text-black p-2 hover:bg-gray-300 transition">
                Create Account
              </button>
            </Link>
          </div>

        </div>
      </main>
    </section>
  </>
);

}
