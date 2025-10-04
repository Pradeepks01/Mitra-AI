"use client";
import Link from "next/link";
import React from "react";


const Footer = () => {
    return (
        <footer className="w-full bg-gradient-to-r from-[#eef4fa] to-[#fdfefe] border-t border-gray-300 py-8">
            <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                    <Link href="/" className="text-[#2b4b77] font-bold text-lg">
                        MitraHire
                    </Link>
                    <p className="text-sm text-[#6b6b6b] mt-1">
                        Empowering careers with AI-driven solutions.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Link
                        href="/about"
                        className="text-[#2b4b77] hover:text-[#2f88ff] transition duration-200"
                    >
                        About Us
                    </Link>
                    <Link
                        href="/contact"
                        className="text-[#2b4b77] hover:text-[#2f88ff] transition duration-200"
                    >
                        Contact
                    </Link>
                    <Link
                        href="/privacy"
                        className="text-[#2b4b77] hover:text-[#2f88ff] transition duration-200"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-[#2b4b77] hover:text-[#2f88ff] transition duration-200"
                    >
                        Terms of Service
                    </Link>
                </div>

                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <Link
                        href="https://x.com/PradeepKs__"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-[#eef4fa] rounded-full hover:bg-[#2f88ff] hover:text-white transition duration-200"
                        aria-label="Twitter"
                    >
                        x
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/pradeep-ks-77768732b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-[#eef4fa] rounded-full hover:bg-[#2f88ff] hover:text-white transition duration-200"
                        aria-label="LinkedIn"
                    >
                        l
                    </Link>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-[#6b6b6b]">
                &copy; {new Date().getFullYear()} MitraHire. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;


