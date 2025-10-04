"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useRouter } from "next/navigation";


const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Authenticate user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user data and role
            const applicantDoc = await getDoc(doc(db, "applicants", user.uid));
            const recruiterDoc = await getDoc(doc(db, "recruiters", user.uid));

            if (applicantDoc.exists()) {
                const userData = applicantDoc.data();
                const role = "applicant";

                // Store in localStorage
                localStorage.setItem(
                    "user",
                    JSON.stringify({ ...userData, role, uid: user.uid })
                );
                alert("Welcome Applicant!");
                // Redirect to Applicant Dashboard
            } else if (recruiterDoc.exists()) {
                const userData = recruiterDoc.data();
                const role = "recruiter";
                router.push("/recruit/dashboard");

                // Store in localStorage
                localStorage.setItem(
                    "user",
                    JSON.stringify({ ...userData, role, uid: user.uid })
                );
                
                // Redirect to Recruiter Dashboard
            } else {
                throw new Error("No role assigned. Contact support.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally{
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

            {/* Login Card */}
            <div className="relative z-10 w-[500px] bg-white shadow-2xl rounded-2xl px-10 py-12 my-[100px] mx-[10px]">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-[#2b4b77] mb-2">
                        Welcome Back!
                    </h2>
                    <p className="text-sm text-gray-600">
                        Login to access your personalized experience!
                    </p>
                </div>

                <form
                    onSubmit={handleLogin}

                >

                    {error && <p className="text-red-500">{error}</p>}
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
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border rounded-lg bg-[#eef4fa] text-[#2b4b77] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2f88ff] transition" required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#2f88ff] to-[#1a73e8] text-white py-3 rounded-lg shadow-md hover:opacity-90 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Login"}
                    </button>
                </form>
                <p className="text-sm text-[#2b4b77] mt-6 text-center">
                    Don&apos;t have an account?
                    <a
                        href="/auth/signup"
                        className="text-[#2f88ff] font-semibold hover:underline"
                    >
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
