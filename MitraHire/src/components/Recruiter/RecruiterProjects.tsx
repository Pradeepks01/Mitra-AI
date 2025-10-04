"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // For accessing URL parameters
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import RecruiterUpload from "./RecruiterUpload";
import { log } from "node:console";
import { X } from "lucide-react"; // Importing Lucide's 'X' icon for the close button.



type ProjectsTab = "upload" | "analytics" | "acceptResumes" | "shortlistResumes";

interface Candidate {
  name: string;
  score: number;
  resumeUrl: string;
  summary?: string; // Optional, since it might not be preloaded
}

interface ShortlistedCandidatesProps {
  aiShortlisted: Candidate[];
  fetchCandidateSummary: (id: string) => Promise<string>;
}


const RecruiterProjects: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProjectsTab>("analytics");
  const [applicants, setApplicants] = useState<
    { name: string; resumeURL: string }[]
  >([]);
  const [shortlisted, setShortlisted] = useState<
    { name: string; resumeURL: string }[]
  >([]);
  const [shortlistCount, setShortlistCount] = useState<number>(0);
  const [aiShortlisted, setAIShortlisted] = useState<
    { name: string; resumeUrl: string; score: number; }[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);



  const [totalResumes, setTotalResumes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [authLoading, setAuthLoading] = useState<boolean>(true); // Authentication loading
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>("");


  useEffect(() => {
    // Extract projectId from the search params or set manually
    const id = searchParams?.get("projectId");
    if (id) {
      setProjectId(id);
      fetchJobDescription(id);
    }
  }, [searchParams]);

  const fetchJobDescription = async (id: string) => {
    try {
      const docRef = doc(db, "projects", id); // Reference to the specific project document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(data.description);
        setJobDescription(data.description || "No description available");
      } else {
        console.log("No such document!");
        setJobDescription("Project not found");
      }
    } catch (error) {
      console.error("Error fetching job description:", error);
      setJobDescription("Failed to fetch job description.");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    // Retrieve recruiterId and projectId from the URL
    const recruiterIdParam = searchParams.get("recruiterId");
    const projectIdParam = searchParams.get("projectId");
    setRecruiterId(recruiterIdParam);
    setProjectId(projectIdParam);
  }, [searchParams]);

  useEffect(() => {
    // Fetch resumes from Firebase
    const fetchResumes = async () => {
      if (!recruiterId || !projectId) return;

      setLoading(true); // Start loading

      const resumesRef = collection(
        db,
        "recruiters",
        recruiterId,
        "projects",
        projectId,
        "resumes"
      );

      try {
        const querySnapshot = await getDocs(resumesRef);
        const resumes = querySnapshot.docs.map((doc) => ({
          name: doc.data().applicantName,
          resumeURL: doc.data().downloadURL,
        }));
        setApplicants(resumes);
        setTotalResumes(resumes.length);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchResumes();
  }, [recruiterId, projectId]);

  const tabs = [
    { id: "upload", label: "Upload", icon: "upload" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "acceptResumes", label: "Accept Resumes via Link", icon: "link" },
    { id: "shortlistResumes", label: "Shortlist Resumes", icon: "star" },
  ];


  const generateLink = () => {
    if (recruiterId && projectId) {
      const link = `https://resume-upload-nine.vercel.app/?recruiterId=${recruiterId}&projectId=${projectId}`;
      setGeneratedLink(link);
    } else {
      alert("Recruiter ID and Project ID are not available.");
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



  const handleShowSummary = async (candidate: Candidate) => {
    try {
      // Fetch the summary from the backend
      const response = await fetch(`http://127.0.0.1:5001/api/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeUrl: candidate.resumeUrl,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary from backend");
      }

      const data = await response.json();
      const summary = data.summary || "No summary available.";

      setSelectedCandidate({ ...candidate, summary });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching candidate summary:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleShortlistAI = async () => {
    if (shortlistCount <= 0) {
      alert("Please enter a valid number of applicants to shortlist.");
      return;
    }

    if (!applicants || applicants.length === 0) {
      alert("No resumes available to shortlist.");
      return;
    }

    if (!jobDescription) {
      alert("Job Description Not Found")
    }

    try {
      const response = await fetch("http://127.0.0.1:5001/api/resumeshortlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count: shortlistCount,
          resumes: applicants, // Sending all resume data
          jobdescription: jobDescription
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shortlisted resumes.");
      }

      const data = await response.json();
      console.log(data.shortlisted);
      setAIShortlisted(data.shortlisted); // Assuming the response is an array of { name, resumeURL ,score }
    } catch (error) {
      console.error("Error shortlisting resumes:", error);
      alert("An error occurred while shortlisting resumes.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7fa] to-[#e6eef5] text-[#2b4b77] font-sans">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#2f88ff] to-[#1a73e8] text-white py-12 pt-[150px] pb-[70px]">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Recruiting Projects
          </h1>
          <p className="text-lg md:text-xl max-w-2xl">
            Manage, upload, and analyze your recruitment projects
          </p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="container mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProjectsTab)}
              className={`px-4 py-3 flex items-center gap-2 border-b-2 ${activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                } transition-all duration-300`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Upload Tab */}
        {activeTab === "upload" && <RecruiterUpload />}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#2b4b77] mb-6">
              Resume Analytics
            </h2>
            {loading ? (
              // Loading Indicator
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                <p className="ml-4 text-gray-500">
                  Loading data, please wait...
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      Total Resumes
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalResumes}
                    </p>
                  </div>
                </div>

                {/* Resumes Table */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Applicants
                  </h3>
                  <table className="w-full border-collapse bg-white shadow-lg rounded-lg">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="text-left px-4 py-2 font-medium">
                          Name
                        </th>
                        <th className="text-left px-4 py-2 font-medium">
                          Resume Link
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.length > 0 ? (
                        applicants.map((applicant, index) => (
                          <tr
                            key={index}
                            className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                              }`}
                          >
                            <td className="px-4 py-2">{applicant.name}</td>
                            <td className="px-4 py-2">
                              <a
                                href={applicant.resumeURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                View Resume
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="text-center px-4 py-4 text-gray-600"
                          >
                            No resumes uploaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Accept Resumes via Link Tab */}
        {activeTab === "acceptResumes" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#2b4b77] mb-6">
              Accept Resumes via Link
            </h2>
            <button
              onClick={generateLink}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Generate Link
            </button>
            {generatedLink && (
              <div className="mt-4">
                <p className="text-gray-700">
                  Share this link to accept resumes:
                </p>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {generatedLink}
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === "shortlistResumes" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="mb-6">
              <label htmlFor="shortlistCount" className="block text-gray-700 font-medium mb-2">
                Number of Applicants to Shortlist:
              </label>
              <input
                type="number"
                id="shortlistCount"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number"
                value={shortlistCount}
                onChange={(e) => setShortlistCount(Number(e.target.value))}
              />
              <button
                onClick={handleShortlistAI}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
              >
                Shortlist Using AI
              </button>
            </div>

            <h2 className="text-2xl font-bold text-[#2b4b77] mb-6">Shortlist Resumes</h2>
            <table className="w-full border-collapse bg-white shadow-lg rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Resume Link</th>
                  <th className="text-left px-4 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length > 0 ? (
                  applicants.map((applicant, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
                    >
                      <td className="px-4 py-2">{applicant.name}</td>
                      <td className="px-4 py-2">
                        <a
                          href={applicant.resumeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View Resume
                        </a>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => {
                            if (shortlisted.some((s) => s.resumeURL === applicant.resumeURL)) {
                              // If already shortlisted, remove it
                              setShortlisted((prev) =>
                                prev.filter((s) => s.resumeURL !== applicant.resumeURL)
                              );
                            } else {
                              // Otherwise, add to shortlisted
                              setShortlisted((prev) => [...prev, applicant]);
                            }
                          }}
                          className={`${shortlisted.some((s) => s.resumeURL === applicant.resumeURL)
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                            } text-white px-4 py-2 rounded-lg transition-all duration-300`}
                        >
                          {shortlisted.some((s) => s.resumeURL === applicant.resumeURL)
                            ? "Remove Shortlisted"
                            : "Shortlist"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center px-4 py-4 text-gray-600">
                      No resumes uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Display shortlisted resumes */}
            {shortlisted.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Shortlisted Candidates From Recruiter
                </h3>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-800">Name</th>
                      <th className="px-4 py-2 text-left text-gray-800">Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlisted.map((candidate, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{candidate.name}</td>
                        <td className="px-4 py-2">
                          <a
                            href={candidate.resumeURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            View Resume
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aiShortlisted.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  AI-Shortlisted Candidates
                </h3>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-800">Name</th>
                      <th className="px-4 py-2 text-left text-gray-800">Resume Score</th>
                      <th className="px-4 py-2 text-left text-gray-800">Resume</th>
                      <th className="px-4 py-2 text-left text-gray-800">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiShortlisted.map((candidate, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{candidate.name}</td>
                        <td className="px-4 py-2">{candidate.score}</td>
                        <td className="px-4 py-2">
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            View Resume
                          </a>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleShowSummary(candidate)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                          >
                            View Summary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal for showing candidate summary */}
            {selectedCandidate && isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h4 className="text-lg font-semibold">
                      {selectedCandidate.name}'s Summary
                    </h4>
                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div>
                    <p className="text-gray-700">{selectedCandidate.summary}</p>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-4 text-right">
                    <button
                      onClick={handleCloseModal}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        )}
      </main>
    </div>
  );
};

export default RecruiterProjects;

