"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useRouter } from "next/navigation";

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<"applicant" | "recruiter">("applicant");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const collectionName = role === "applicant" ? "applicants" : "recruiters";
            await setDoc(doc(db, collectionName, user.uid), {
                name,
                email,
                role,
            });

            setError("Registration successful!");

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-[#eef4fa] to-[#dceefb] overflow-hidden">
            {/* Background Circles */}
            <div className="absolute w-[400px] h-[400px] bg-[#2f88ff] opacity-40 rounded-full blur-3xl top-20 left-20"></div>
            <div className="absolute w-[400px] h-[400px] bg-[#1a73e8] opacity-40 rounded-full blur-3xl bottom-20 right-20"></div>
            <div className="absolute w-[400px] h-[400px] bg-[purple] opacity-40 rounded-full blur-3xl bottom-10 left-40"></div>
            <div className="absolute w-[400px] h-[400px] bg-[purple] opacity-40 rounded-full blur-3xl top-10 right-40"></div>

            {/* Register Card */}
            <div className="relative z-10 w-[500px] bg-white shadow-2xl rounded-2xl px-10 py-12 my-[100px] mx-[10px]">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-[#2b4b77] mb-2">
                        Create Your Account
                    </h2>
                    <p className="text-sm text-gray-600">
                        Register to unlock personalized career insights
                    </p>
                </div>

                <form onSubmit={handleRegister}>
                    {error && (
                        <p
                            className={`mb-4 text-center ${error === "Registration successful!"
                                ? "text-green-500"
                                : "text-red-500"
                                }`}
                        >
                            {error}
                        </p>
                    )}
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-[#2b4b77] font-semibold mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-[#eef4fa] text-[#2b4b77] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2f88ff] transition"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-[#2b4b77] font-semibold mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-[#eef4fa] text-[#2b4b77] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2f88ff] transition"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-[#2b4b77] font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-[#eef4fa] text-[#2b4b77] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2f88ff] transition"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="relative mb-6">
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as "applicant" | "recruiter")}
                            className="w-full px-4 py-3 border rounded-lg bg-[#eef4fa] text-[#2b4b77] 
                   appearance-none 
                   cursor-pointer
                   pr-10
                   focus:outline-none focus:ring-2 focus:ring-[#2f88ff]
                   transition duration-300
                   font-semibold"
                            required
                        >
                            <option
                                value="applicant"
                                className="hover:bg-blue-100 transition duration-200 ease-in-out"
                            >
                                🎓 Applicant - Level Up Your Resume!
                            </option>
                            <option
                                value="recruiter"
                                className="hover:bg-blue-100 transition duration-200 ease-in-out"
                            >
                                🏢 Recruiter - Find top-tier talent!
                            </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#2b4b77]">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                                />
                            </svg>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#2f88ff] to-[#1a73e8] text-white py-3 rounded-lg shadow-md hover:opacity-90 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>
                <p className="text-sm text-[#2b4b77] mt-6 text-center">
                    Already have an account?{" "}
                    <a
                        href="/auth/login"
                        className="text-[#2f88ff] font-semibold hover:underline"
                    >
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;