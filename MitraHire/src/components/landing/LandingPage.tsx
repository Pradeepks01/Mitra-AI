import React from "react";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#eef4fa] text-[#2b4b77] font-sans">
            <header className="w-full h-[100vh] flex flex-col items-center justify-center text-center px-6">

                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Welcome to <span className="text-[#2f88ff]">MitraHire</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-6">
                    Your AI-powered assistant for free resume reviews and career guidance.
                </p>
                <a
                    href="/home"
                    className="px-8 py-4 bg-[#2f88ff] text-white rounded-full shadow-lg hover:bg-[#1a73e8] transition duration-200"
                >
                    Upload Your Resume
                </a>
            </header>

            <section className="py-16 bg-white rounded-t-[50px] shadow-lg -mt-10 px-6 md:px-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
                    How It Works
                </h2>
                <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-[100px] h-[100px] bg-[#a8d1fc] rounded-full flex items-center justify-center shadow-md mb-4">
                            <span className="text-2xl font-bold text-[#2b4b77]">1</span>
                        </div>
                        <h3 className="text-xl font-bold">Upload</h3>
                        <p className="text-gray-600">
                            Upload your resume in seconds for a detailed review.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-[100px] h-[100px] bg-[#ffc1c1] rounded-full flex items-center justify-center shadow-md mb-4">
                            <span className="text-2xl font-bold text-[#2b4b77]">2</span>
                        </div>
                        <h3 className="text-xl font-bold">Analyze</h3>
                        <p className="text-gray-600">
                            Our AI assistant scans your resume for improvements.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-[100px] h-[100px] bg-[#ffd17c] rounded-full flex items-center justify-center shadow-md mb-4">
                            <span className="text-2xl font-bold text-[#2b4b77]">3</span>
                        </div>
                        <h3 className="text-xl font-bold">Improve</h3>
                        <p className="text-gray-600">
                            Get actionable suggestions to stand out from the crowd.
                        </p>
                    </div>
                </div>
            </section>

            {/* Zigzag Features Section */}
            <section className="py-16 px-6 md:px-20 py-[100px]">
                <h2 className="text-5xl md:text-5xl font-bold text-center mb-[80px]">
                    Why Choose Us
                </h2>
                <div className="flex flex-col gap-12">
                    {/* Feature 1 */}
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="w-full md:w-1/2 mb-6 md:mb-0">
                            <img
                                src="/resumeReview2.jpeg"
                                alt="Detailed Report"
                                className="w-full rounded-xl shadow-lg transform hover:scale-105 transition duration-300 w-[450px] mx-auto"
                            />
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left m-[20px]">
                            <h3 className="text-2xl font-bold mb-4">Get a Detailed Report</h3>
                            <p className="text-gray-600">
                                Receive a personalized, in-depth analysis of your resume, highlighting its strengths and identifying areas for improvement. This comprehensive report provides actionable insights tailored to your career goals, ensuring your resume is ready to impress hiring managers. Additionally, the report is downloadable for easy sharing and reference.
                            </p>
                        </div>
                    </div>
                    {/* Feature 2 */}
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="w-full md:w-1/2 md:order-2 mb-6 md:mb-0">
                            <img
                                src="/resumeSugesstion.jpeg"
                                alt="ATS Score"
                                className="w-full rounded-xl shadow-lg transform hover:scale-105 transition duration-300 w-[450px] mx-auto"
                            />
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left md:order-1 m-[20px]">
                            <h3 className="text-2xl font-bold mb-4">Get Your ATS Score</h3>
                            <p className="text-gray-600">
                                Find out how your resume fares against Applicant Tracking Systems (ATS) used by leading companies. Gain insights into how effectively your resume aligns with job descriptions and learn how to optimize it for maximum visibility and impact in automated screening processes.
                            </p>
                        </div>
                    </div>
                    {/* Feature 3 */}
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="w-full md:w-1/2 mb-6 md:mb-0">
                            <img
                                src="/Ats.jpeg"
                                alt="Suggestions"
                                className="w-full rounded-xl shadow-lg transform hover:scale-105 transition duration-300 w-[450px] mx-auto"
                            />
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left m-[20px]">
                            <h3 className="text-2xl font-bold mb-4">Get Personalized Suggestions</h3>
                            <p className="text-gray-600">
                                Access tailored recommendations to refine your resume and make it stand out in a competitive job market. From formatting tips to content enhancements, our AI-powered assistant provides actionable advice to help you create a compelling resume that captures the attention of recruiters.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Explore Section */}
            <section className="py-16 bg-[#f8f9fa] px-6 md:px-20 pb-[100px]">
                <h2 className="text-3xl md:text-4xl font-bold text-center pb-[50px]">
                    Explore Resume Tips by Experts
                </h2>
                <p className="text-center text-gray-600 mb-12">
                    Get exclusive insights and advice from industry professionals to craft the perfect resume.
                </p>
                <div className="text-center">
                    <a
                        href="/explore"
                        className="inline-block px-8 py-4 bg-[#2f88ff] text-white font-bold rounded-full shadow-lg hover:bg-[#1a73e8] transition duration-200"
                    >
                        Explore More Tips
                    </a>
                </div>
            </section>


            <section
                id="upload"
                className="py-10 bg-gradient-to-r from-[#2f88ff] to-[#1a73e8] text-white text-center px-6 py-40"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Start?
                </h2>
                <p className="text-lg md:text-xl mb-6">
                    Upload your resume now and let <span className="font-bold">MitraHire</span> guide you to success.
                </p>
                <a
                    href="/auth/login"
                    className="px-8 py-4 bg-white text-[#2f88ff] rounded-full shadow-lg hover:bg-gray-100 transition duration-200"
                >
                    Get Started
                </a>
            </section>
        </div>
    );
};

export default LandingPage;
