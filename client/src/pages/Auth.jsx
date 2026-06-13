import { useState } from "react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#f7ece7] via-[#f4e3da] to-[#ecd0c4]">
      <div className="w-96 p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        <form className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded-lg"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-lg"
          />
          <button className="w-full bg-[#9e4635] hover:bg-[#8f3a2c] text-white p-2 rounded-lg border-none cursor-pointer transition-colors">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span
            className="text-[#9e4635] hover:text-[#8f3a2c] cursor-pointer ml-1"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
