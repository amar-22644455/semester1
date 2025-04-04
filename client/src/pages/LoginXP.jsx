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
            const response = await fetch("http://localhost:3000/api/login", {  // Change to /auth if you renamed it
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
            <section className="h-screen">
                <main className="flex flex-row h-auto mt-3">
                    <div className="ml-auto mr-auto mt-5 mb-5 h-auto flex flex-col gap-2 border-2 border-gray-500 p-10 rounded-[4px]">
                        <p className="font-serif text-[2.5rem] text-center">ShareXP</p>
                        <p className="font-serif text-base mb-5">Login to share your experience</p>

                        {error && <p className="text-red-500">{error}</p>}

                        <form className="flex flex-col gap-2" onSubmit={handleLogin}>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <button type="submit" className="mt-1 !bg-gray-900 text-white p-2">
                                Login
                            </button>
                        </form>

                        <div className="flex flex-col mt-2 ml-auto mr-auto w-full h-auto gap-2">
                            <p className="text-center font-serif">Haven't Started?</p>
                            <Link to="/CreateXp">
                                <button className="!bg-gray-900 w-full text-white p-2">Create Account</button>
                            </Link>
                        </div>
                    </div>
                </main>
            </section>
        </>
    );
}
