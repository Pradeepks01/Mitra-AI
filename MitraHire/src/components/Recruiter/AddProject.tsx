"use client";
import React, { useState , useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const AddProject: React.FC = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [authLoading, setAuthLoading] = useState<boolean>(true); // Authentication loading
    const router = useRouter();

     useEffect(() => {
        const verifyUser = async () => {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
    
          // Check if the user has the correct role and UID
          if (!user.uid || user.role !== "recruiter") {
            router.push("/auth/login");
            return;
          }
    
          setAuthLoading(false); // End authentication loading
        };
    
        verifyUser();
      }, [router]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user?.uid) {
            alert("User not authenticated. Please log in.");
            return;
        }

        const newProject = {
            title,
            description,
            recruiterId: user.uid,
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, "projects"), newProject);
            router.push(`/recruit/projects?recruiterId=${user.uid}&projectId=${docRef.id}`);
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project. Please try again.");
        }
    };

    if (authLoading) {
        // Display a loader during authentication
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Authenticating, please wait...</p>
          </div>
        );
      }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f7fa] to-[#e6eef5] text-[#2b4b77] font-sans">
            <div className="container mx-auto px-4 py-12 pt-[100px]">
                <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-6 text-[#2b4b77]">
                        Create New Job Project
                    </h1>

                    <form onSubmit={handleCreateProject} className="space-y-6">
                        <div>
                            <label
                                htmlFor="projectTitle"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Job Title
                            </label>
                            <input
                                type="text"
                                id="projectTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="jobDescription"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Job Description
                            </label>
                            <textarea
                                id="jobDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                placeholder="Provide a detailed description of the job requirements, responsibilities, and expectations"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-bold"
                        >
                            Create Project & Upload Resumes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProject;
