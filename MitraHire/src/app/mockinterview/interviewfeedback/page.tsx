"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import jsPDF from "jspdf";

interface AnalysisResult {
  question: string;
  analysis: string;
}

const InterviewResultsPage: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Gemini AI Analysis Function
  const generateGeminiAnalysis = async (question: string, userAnswer: string): Promise<string> => {
    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI("AIzaSyAYPwVR7EjmprgmxED9KoSPM4wZ1SQTGYQ");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      // Simple prompt
      const prompt = `Analyze the following interview question and answer:

      
Question: ${question}
Answer: ${userAnswer}

Provide a detailed analysis in text format. with no bold for any phrases. No bullet points Just a small paragraph.`;

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      return response;
    } catch (err) {
      console.error("Gemini Analysis Error:", err);
      return "Error occurred while generating the analysis.";
    }
  };

  // PDF Generation Function
  const generatePDFReport = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const sectionSpacing = 12;
    const maxLineWidth = pageWidth - 2 * margin;

    const wrapText = (text: string, width: number): string[] => {
      return doc.splitTextToSize(text, width);
    };

    const drawHeader = () => {
      const gradientHeight = 30;

      for (let i = 0; i <= gradientHeight; i++) {
        doc.setFillColor(186, 85, 211, i / gradientHeight);
        doc.rect(0, i, pageWidth, 1, 'F');
      }

      doc.setFont('times', 'italic');
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('AI-Powered Interview Analysis Report', pageWidth / 2, 20, { align: 'center' });
    };

    const drawFooter = () => {
      const totalPages = doc.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerText = `Page ${i} of ${totalPages}`;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    };

    const applyBackground = () => {
      doc.setFillColor(255, 250, 240);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    const addSection = (title: string, items: AnalysisResult[], startY: number): number => {
      let currentY = startY;

      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.setFont('times', 'italic');
      doc.text(title, margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      items.forEach((item, index) => {
        if (currentY + sectionSpacing > pageHeight - 20) {
          doc.addPage();
          applyBackground();
          currentY = margin;
        }

        // Question
        doc.setFont('helvetica', 'bold');
        const wrappedQuestion = wrapText(`Question ${index + 1}: ${item.question}`, maxLineWidth);
        wrappedQuestion.forEach((line, qIndex) => {
          currentY += sectionSpacing / (qIndex === 0 ? 1 : 1.5);
          doc.text(line, margin, currentY);
        });

        // Analysis
        doc.setFont('helvetica', 'normal');
        const wrappedAnalysis = wrapText(item.analysis, maxLineWidth);
        wrappedAnalysis.forEach((line, aIndex) => {
          currentY += sectionSpacing / (aIndex === 0 ? 1 : 1.5);
          doc.text(line, margin, currentY);
        });

        // Add some spacing between questions
        currentY += sectionSpacing;
      });

      return currentY;
    };

    applyBackground();
    drawHeader();

    let nextY = 50;
    nextY = addSection('Interview Analysis', results, nextY);

    drawFooter();
    doc.save('Interview_Analysis_Report.pdf');
  };

  useEffect(() => {
    const fetchAndAnalyzeResults = async () => {
      try {
        if (typeof window !== "undefined") {
          const storedAnswers = localStorage.getItem("UserAnswers");

          if (storedAnswers) {
            const parsedAnswers = JSON.parse(storedAnswers);

            // Transform stored answers into analysis results
            const analysisPromises = Object.entries(parsedAnswers).map(
              async ([question, userAnswer]) => {
                const analysis = await generateGeminiAnalysis(
                  question,
                  userAnswer as string
                );
                return { question, analysis };
              }
            );

            // Wait for all analyses to complete
            const analysisResults = await Promise.all(analysisPromises);
            setResults(analysisResults);
          } else {
            setError("No interview answers found in local storage");
          }
        }
      } catch (err) {
        console.error("Error fetching interview results:", err);
        setError("Failed to fetch interview results");
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyzeResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">
          Generating AI-powered interview analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            AI-Powered Interview Analysis
          </h1>

          {results.map((result, index) => (
            <div key={index} className="mb-8 border-b pb-6">
              <h2 className="text-xl font-semibold mb-2">
                Question {index + 1}
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                <p className="font-bold mb-2">{result.question}</p>
                <pre className="whitespace-pre-wrap">{result.analysis}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={generatePDFReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Generate PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultsPage;