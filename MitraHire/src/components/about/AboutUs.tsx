import React from "react";

const AboutUs: React.FC = () => {
    return (
        <div className="about-us-container bg-gray-50 text-gray-800 pb-[100px]">
            {/* Header Section */}
            <header className="relative bg-gradient-to-br from-[#2f88ff] to-[#1a73e8] text-white pt-[200px] pb-[100px]">
                <div className="relative z-10 text-left max-w-5xl mx-auto px-6">
                    <h1 className="text-6xl font-extrabold tracking-tight">About Us</h1>
                    <p className="text-2xl mt-4 max-w-2xl">
                        Driving innovation and empowering careers with cutting-edge AI solutions.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 md:px-12 py-12">
                {/* Mission Section */}
                <section className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">Our Mission</h2>
                    <p className="text-lg">
                        Empower individuals with cutting-edge tools to elevate their professional journeys and achieve success.
                    </p>
                    <img
                        src="/poster3.jpeg"
                        alt="Our Mission"
                        className="mt-6 w-full max-w-lg mx-auto rounded-lg shadow-md"
                    />
                </section>

                {/* What We Do Section */}
                <section className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">What We Do</h2>
                    <p className="text-lg">
                        MitraHire uses AI to analyze and enhance your resume, ensuring it stands out to recruiters. Our platform provides actionable insights for improving content, structure, and ATS compatibility. We offer personalized career guidance to help you advance in your job search. With our tools, you’ll be better equipped to succeed in a competitive job market.
                    </p>
                </section>

                {/* Why Choose Us Section */}
                <section className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="font-bold text-xl">AI-Driven Insights</h3>
                            <p className="text-gray-600">
                                Precise, actionable recommendations powered by advanced algorithms.
                            </p>
                        </div>
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="font-bold text-xl">User-Friendly Platform</h3>
                            <p className="text-gray-600">
                                Seamless and intuitive experience designed for all users.
                            </p>
                        </div>
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="font-bold text-xl">Tailored Guidance</h3>
                            <p className="text-gray-600">
                                Industry-specific advice to ensure your professional success.
                            </p>
                        </div>
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="font-bold text-xl">Holistic Approach</h3>
                            <p className="text-gray-600">
                                Comprehensive evaluation for impactful career development.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="mt-12">
                    <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
                        Ready to transform your career?
                    </h3>
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-600 transition duration-300">
                        Get Started
                    </button>
                </section>
            </main>
        </div>
    );
};

export default AboutUs;
