"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { uploadResume } from "../firebase/firebaseFunctions";
import Image from "next/image";
import { FileUp, CheckCircle2, AlertTriangle } from "lucide-react";

const RecruiterUpload: React.FC = () => {
  const searchParams = useSearchParams();
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  useEffect(() => {
    const recruiterIdParam = searchParams.get("recruiterId");
    const projectIdParam = searchParams.get("projectId");

    setRecruiterId(recruiterIdParam);
    setProjectId(projectIdParam);
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!recruiterId || !projectId) {
      alert("Recruiter ID or Project ID not found in the URL.");
      return;
    }

    if (!file || !applicantName) {
      alert("Please provide an applicant name and select a file.");
      return;
    }

    setUploadStatus("Uploading...");

    try {
      const url = await uploadResume(recruiterId, projectId, file, applicantName);
      setUploadStatus("Upload successful!");
      setDownloadURL(url);
      setFile(null);
      setApplicantName("");
    } catch (error) {
      setUploadStatus("Error during upload. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e3ebf3] flex items-center justify-center p-4">
      <div className="w-full max-w-[80%] bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transform transition-all hover:scale-[1.02] hover:shadow-3xl duration-300">
        <div className="p-8 text-center">
          <div className="mb-6">
            <FileUp
              className="mx-auto text-blue-600 w-16 h-16 mb-4 opacity-80"
              strokeWidth={1.5}
            />
            <h1 className="text-3xl font-semibold text-[#1a365d] mb-3">
              Resume Upload
            </h1>
            <p className="text-gray-500 text-sm">
              Upload applicant resumes securely and efficiently
            </p>
          </div>

          {recruiterId && projectId ? (
            <div className="space-y-4">
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Applicant Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 placeholder-gray-400"
              />

              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  id="file-upload"
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full block px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition duration-300"
                >
                  {file
                    ? `Selected: ${file.name}`
                    : "Click to select PDF"}
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || !applicantName}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileUp className="w-5 h-5" />
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="text-yellow-600 w-6 h-6" />
              <p className="text-yellow-800 text-sm">
                Recruiter ID or Project ID is missing from the URL.
              </p>
            </div>
          )}

          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center justify-center gap-2 ${uploadStatus.includes("successful")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
              }`}>
              {uploadStatus.includes("successful") ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {uploadStatus}
            </div>
          )}

          {downloadURL && (
            <a
              href={downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline transition duration-300"
            >
              View Uploaded File
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterUpload;