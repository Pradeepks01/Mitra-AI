"use client"
import Image from 'next/image';
import { useState } from 'react';
import { InterviewPreparation } from './InterviewPrep';
import { useRouter } from "next/navigation";

const Mockinterview = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleFileUpload = () => {
        if (selectedFile) {
            setUploadStatus("Upload Complete");
        } else {
            setUploadStatus("Please select a file.");
        }
    };

    const handlePreparationClick = async () => {
        await InterviewPreparation(
            jobDescription,
            selectedFile,
            setResponseMessage
        );

        if (!responseMessage?.includes("Error")) {
            router.push("/mockinterview/start-interview");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eef4fa] to-[#d6e4f3] text-[#2b4b77] font-sans">
            <header className="relative bg-gradient-to-br from-[#2f88ff] to-[#1a73e8] text-white pt-[120px] pb-[80px]">
                <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                        Ace Your Next Interview with Mitra AI
                    </h1>
                    <p className="text-lg sm:text-2xl mt-4 max-w-3xl mx-auto">
                        Prepare confidently with tailored insights, resume analysis, and mock interview guidance.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-20">
                <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto py-14">
                    <h2 className="text-3xl font-bold text-center mb-6">Upload Your New Updated Resume</h2>
                    <p className="text-gray-600 text-center mb-8">
                        Supported formats: <span className="font-bold">PDF</span>. Maximum size: <span className="font-bold">5MB</span>.
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#3b82f6] rounded-lg p-6 cursor-pointer bg-[#f8f9fa] hover:bg-[#eef4fa] transition py-10"
                        >
                            {selectedFile ? (
                                <>
                                    <span className="text-lg font-semibold text-[#2b4b77]">{selectedFile.name}</span>
                                    <span className="text-sm text-gray-500">Click to replace file</span>
                                </>
                            ) : (
                                <>
                                    <Image
                                        src="/upload.svg"
                                        alt="Upload Icon"
                                        width={48}
                                        height={48}
                                        className="text-[#2f88ff]"
                                    />
                                    <span className="mt-2 text-gray-600">
                                        Drag and drop your file here or click to browse
                                    </span>
                                </>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf"
                            />
                        </label>
                        <button
                            onClick={handleFileUpload}
                            className="w-full max-w-xs px-6 py-3 bg-[#3b82f6] text-white font-bold rounded-lg shadow-md hover:bg-[#2563eb] transition duration-200"
                        >
                            Upload File
                        </button>
                        {uploadStatus && (
                            <p className={`mt-4 font-medium ${uploadStatus.includes('Complete') ? 'text-green-600' : 'text-red-600'}`}>
                                {uploadStatus}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto py-14 mt-10">
                    <h2 className="text-3xl font-bold text-center mb-6">Job Description</h2>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        className="w-full h-40 border border-gray-300 rounded-lg p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    ></textarea>
                    <button
                        onClick={handlePreparationClick}
                        className="mt-6 w-full max-w-xs px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition duration-200 mx-auto block"
                    >
                        Prepare for Interview
                    </button>
                    {responseMessage && (
                        <div className={`mt-6 text-center font-semibold ${responseMessage.includes("Error") ? 'text-red-500' : 'text-green-600'}`}>
                            {responseMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Mockinterview;
