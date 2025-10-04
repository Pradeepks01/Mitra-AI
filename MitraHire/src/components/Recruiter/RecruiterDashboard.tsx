"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { listAll, ref, deleteObject } from "firebase/storage";
import {
    LogOut,
    Plus,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    XCircle
} from "lucide-react";

interface Project {
    id: string;
    title: string;
    description: string;
}

const RecruiterDashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyUserAndFetchProjects = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (!user.uid || user.role !== "recruiter") {
                router.push("/auth/login");
                return;
            }

            try {
                const q = query(
                    collection(db, "projects"),
                    where("recruiterId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const projectList: Project[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Project[];
                setProjects(projectList);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        verifyUserAndFetchProjects();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    const handleCardClick = (projectId: string) => {
        setExpandedProjectId(projectId === expandedProjectId ? null : projectId);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
    };

    const deleteAssociatedResumes = async (recruiterId: string, projectId: string) => {
        const storagePath = `recruiter/${recruiterId}/${projectId}`;
        const folderRef = ref(storage, storagePath);

        try {
            const result = await listAll(folderRef);
            const deletePromises = result.items.map((itemRef) => deleteObject(itemRef));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error deleting associated resumes:", error);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                await deleteAssociatedResumes(user.uid, projectId);
                await deleteDoc(doc(db, "projects", projectId));
                setProjects(projects.filter((project) => project.id !== projectId));
                alert("Project and associated resumes deleted successfully.");
            } catch (error) {
                console.error("Error deleting project:", error);
                alert("Failed to delete the project.");
            }
        }
    };

    const handleViewMore = (projectId: string) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const recruiterId = user.uid;
        router.push(`/recruit/projects?recruiterId=${recruiterId}&projectId=${projectId}`);
    };

    const handleSaveEdit = async () => {
        if (editingProject) {
            try {
                await updateDoc(doc(db, "projects", editingProject.id), {
                    title: editingProject.title,
                    description: editingProject.description,
                });
                setProjects((prev) =>
                    prev.map((project) =>
                        project.id === editingProject.id ? editingProject : project
                    )
                );
                alert("Project updated successfully.");
                setEditingProject(null);
            } catch (error) {
                console.error("Error updating project:", error);
                alert("Failed to update the project.");
            }
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Authenticating, please wait...</p>
      </div>
        );
    }



    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e3ebf3] text-[#1a365d] font-sans ">
            <header className="bg-gradient-to-br from-[#2f88ff] to-[#1a73e8] text-white py-6 shadow-lg pt-[150px] pb-[50px]">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
                        <p className="text-sm text-blue-100 mt-1">Manage your recruitment projects</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1a365d]">My Projects</h2>
                    <button
                        onClick={() => router.push("/recruit/projects/new")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>


                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className={`
                    bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 
                    overflow-hidden border border-gray-200 group
                    ${expandedProjectId === project.id ? "scale-[1.02]" : ""}
                `}
                            >
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => handleCardClick(project.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">
                                                Project #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                                            </div>
                                            <h3 className="font-bold text-[#1a365d] text-xl leading-tight">
                                                {project.title}
                                            </h3>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                                                Active
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                        {project.description}
                                    </p>
                                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                                        <span className="text-xs text-gray-400">
                                            Created: {new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {expandedProjectId === project.id && (
                                    <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleViewMore(project.id)}
                                                className="btn-icon bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
                                                title="View More"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(project)}
                                                className="btn-icon bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="btn-icon bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white rounded-xl shadow-lg p-12 border border-gray-100">
                        <p className="text-gray-500 mb-4">No projects found</p>
                        <button
                            onClick={() => router.push("/recruit/projects/new")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center mx-auto gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Project
                        </button>
                    </div>
                )}


                {editingProject && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        Edit Project {projects.findIndex(p => p.id === editingProject.id) + 1}
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-1">
                                        Update your project details
                                    </p>
                                </div>
                                <div className="text-white text-opacity-70">
                                    Project ID: {editingProject.id.slice(0, 8)}...
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label
                                        htmlFor="project-title"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Project Title
                                    </label>
                                    <input
                                        id="project-title"
                                        type="text"
                                        value={editingProject.title}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                        placeholder="Enter project title"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="project-description"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Project Description
                                    </label>
                                    <textarea
                                        id="project-description"
                                        value={editingProject.description}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                        placeholder="Describe your project"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-between space-x-4 mt-6">
                                    <button
                                        onClick={() => setEditingProject(null)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5 text-gray-500" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RecruiterDashboard;