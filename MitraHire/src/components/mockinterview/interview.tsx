"use client"

import React, { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Camera, Mic, MicOff, StopCircle, PlayCircle, Check, X } from 'lucide-react';
import { log } from 'node:console';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
    var webkitSpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
    interimResults: boolean;
    continuous: boolean;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onend: (() => void) | null;
    onerror: ((event: Event) => void) | null;
    start(): void;
    stop(): void;
}

const Interview: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [transcript, setTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [questions, setQuestions] = useState<{ behavioral_questions: string[]; technical_questions: string[] } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // Changed to -1 to indicate interview hasn't started
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);

    const router = useRouter();

    const handleNextQuestion = async () => {
        if (!questions) return;

        const allQuestions = [...questions.behavioral_questions, ...questions.technical_questions];
        const currentQuestion = allQuestions[currentQuestionIndex];

        // Check if there's an answer (transcript)
        if (!transcript.trim()) {
            // Show error or alert
            alert("Please provide an answer before moving to the next question.");
            return;
        }

        // Save the current answer using the transcript
        setUserAnswers((prev) => ({ ...prev, [currentQuestion]: transcript }));

        // Clear the current answer and transcript
        setCurrentAnswer('');
        setTranscript('');

        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            // Play the next question
            fetchAndPlayAudio(`Next question: ${allQuestions[currentQuestionIndex + 1]}`);
        } else {
            setIsInterviewComplete(true);
        }
    };

    const startInterview = () => {
        setIsInterviewStarted(true);
        setCurrentQuestionIndex(0);
        // Play initial greeting and first question
        if (questions) {
            const allQuestions = [...questions.behavioral_questions, ...questions.technical_questions];
            fetchAndPlayAudio(`Let's begin with the first question: ${allQuestions[0]}`);
        }
    };

    // Save the last answer
    const allQuestions = [...(questions?.behavioral_questions || []), ...(questions?.technical_questions || [])];
    const currentQuestion = allQuestions[currentQuestionIndex];

    const updatedAnswers = { ...userAnswers, [currentQuestion]: transcript };

    const endInterview = async () => {
        // Check if there's an answer (transcript) for the current question
        localStorage.setItem('UserAnswers', JSON.stringify(updatedAnswers));
        if (!transcript.trim()) {
            alert("Please provide an answer before ending the interview.");
            return;
        }


        // Prepare data for backend
        const feedbackData = {
            userName: userName || "Anonymous",
            answers: updatedAnswers,
        };


        // Send data to the backend
        try {
            const response = await fetch('http://127.0.0.1:5001/api/interviewfeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData),
            });

            if (response.ok) {
                const feedbackResponse = await response.json(); // Expected format: { summary: string, feedback: string }
                const { summary, feedback } = feedbackResponse;
                console.log("Summary : " + summary);
                console.log("FeedBack : " + feedback);

                // Store summary and feedback in local storage
                localStorage.setItem('interviewSummary', summary);
                localStorage.setItem('UserAnswers', JSON.stringify(updatedAnswers));
                localStorage.setItem('interviewFeedback', feedback);

                // // Update Firestore database
                // if (userData?.uid) {
                //     const userDocRef = doc(db, "applicants", userData.uid);
                //     // Check if the user document exists and update it
                //     const userDoc = await getDoc(userDocRef);
                //     if (userDoc.exists()) {
                //         await updateDoc(userDocRef, {
                //             questions: updatedAnswers,
                //             interviewSummary: summary,
                //             interviewFeedback: feedback,
                //             lastUpdated: new Date(), // example additional field
                //         });
                //     } else {
                //         alert("User document not found in database.");
                //     }
                // }

                fetchAndPlayAudio("Thank you for completing the interview. Your responses and feedback have been saved.");

                if (summary && feedback) {
                    router.push("/mockinterview/interviewfeedback");
                } else {
                    alert('Summary and Feedback Not recived')
                }
            } else {
                alert("There was an error submitting your responses. Please try again.");
            }
        } catch (error) {
            console.error("Error sending feedback:", error);
            alert("Unable to send feedback. Please try again later.");
        }

        setIsInterviewComplete(true);
    };

    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userData = user ? JSON.parse(user) : null;
    const userName = userData?.name;
    console.log(userName);


    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Error accessing camera");
        }
    };

    const initializeSpeechRecognition = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.interimResults = true;
                recognition.continuous = true;

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const result = event.results[event.results.length - 1][0].transcript;
                    setTranscript(result);
                };

                recognition.onend = () => setIsRecording(false);
                recognition.onerror = (event: Event) => console.error("Speech recognition error:", event);

                recognitionRef.current = recognition;
            } else {
                console.error("SpeechRecognition API not supported.");
                setError("SpeechRecognition API not supported");
            }
        } catch (err) {
            console.error("Error initializing speech recognition:", err);
            setError("Error initializing speech recognition");
        }
    };

    const startRecording = () => {
        try {
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsRecording(true);
            }
        } catch (err) {
            console.error("Error starting speech recognition:", err);
            setError("Error starting speech recognition");
        }
    };

    const stopRecording = () => {
        try {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                setIsRecording(false);
            }
        } catch (err) {
            console.error("Error stopping speech recognition:", err);
            setError("Error stopping speech recognition");
        }
    };

    const generateAiResponse = async () => {

    };

    const fetchAndPlayAudio = async (text: string) => {
        try {
            const voiceId = 'cgSgspJ2msm6clMCkdW9';
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
            const apiKey = 'sk_5bcd751ebc64ba0cadd28e20a6e759774e10141b75676d2b';

            const data = { text, voice_settings: { stability: 0.1, similarity_boost: 0.3 } };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
                body: JSON.stringify(data),
            });

            if (response.body) {
                const reader = response.body.getReader();
                const audioContext = new (window.AudioContext || window.AudioContext)();
                const audioBufferQueue: AudioBuffer[] = [];
                let isPlaying = false;
                let isFirstPlayback = true;
                const MIN_BUFFERED_CHUNKS = 5;

                const processChunk = async () => {
                    const { done, value } = await reader.read();
                    if (done) return;

                    try {
                        const audioBuffer = await audioContext.decodeAudioData(value.buffer);
                        audioBufferQueue.push(audioBuffer);

                        if (isFirstPlayback && audioBufferQueue.length >= MIN_BUFFERED_CHUNKS && !isPlaying) {
                            isFirstPlayback = false;
                            playNextChunk();
                        } else if (!isPlaying) {
                            playNextChunk();
                        }
                    } catch (err) {
                        console.error("Error decoding audio chunk:", err);
                    }

                    processChunk();
                };

                const playNextChunk = () => {
                    if (audioBufferQueue.length === 0) {
                        isPlaying = false;
                        return;
                    }

                    isPlaying = true;
                    const nextBuffer = audioBufferQueue.shift()!;
                    const chunkSource = audioContext.createBufferSource();
                    chunkSource.buffer = nextBuffer;
                    chunkSource.connect(audioContext.destination);
                    chunkSource.onended = () => {
                        isPlaying = false;
                        playNextChunk();
                    };
                    chunkSource.start();
                };

                processChunk();
            }
        } catch (err) {
            console.error("Error fetching or playing audio:", err);
            setError("Error fetching or playing audio");
        }
    };
    const isInitializedRef = useRef(false);
    useEffect(() => {

        if (isInitializedRef.current) return; // Prevent repeated execution

        isInitializedRef.current = true;

        initializeSpeechRecognition();
        startVideoStream();

        // Fetch and play a greeting message
        if (userName) {
            fetchAndPlayAudio(`Hello ${userName}, welcome to the Interview and we will start it in few seconds`);
        } else {
            fetchAndPlayAudio(`Hello , welcome to the Interview and we will start it in few seconds`);
        }

        const mockQuestions = localStorage.getItem("mockQuestions");
        if (mockQuestions) {
            setQuestions(JSON.parse(mockQuestions));
        } else {
            alert("No questions found. Please ensure questions are loaded.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);


    return (
        <div className="min-h-screen bg-blue-50 flex flex-col">
            <div className="container mx-auto px-4 py-6 flex-grow flex flex-col pt-[100px]">
                <div className="grid md:grid-cols-2 gap-6 flex-grow">
                    {/* Video Section - Full Height */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                        <div className="flex-grow relative w-full">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            {error && (
                                <div className="absolute inset-0 bg-red-100 flex items-center justify-center text-red-600 p-4">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Transcript Overlay */}
                        <div className="bg-black bg-opacity-60 text-white p-4 text-center">
                            <div className="max-h-24 overflow-y-auto">
                                {transcript || "Waiting for your response..."}
                            </div>
                        </div>
                    </div>

                    {/* Interview Control Section */}
                    <div className="flex flex-col space-y-6">
                        {/* Question Display with Progress */}
                        <div className="bg-white rounded-xl shadow-lg p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-blue-800">
                                    {!isInterviewStarted
                                        ? "Interview Preparation"
                                        : isInterviewComplete
                                            ? "Interview Completed"
                                            : "Current Question"}
                                </h2>
                                {questions && (
                                    <div className="text-sm text-gray-500">
                                        {currentQuestionIndex + 1} / {questions.behavioral_questions.length + questions.technical_questions.length}
                                    </div>
                                )}
                            </div>

                            {isInterviewStarted && questions && currentQuestionIndex >= 0 && (
                                <p className="text-lg text-gray-700 flex-grow">
                                    {[...questions.behavioral_questions, ...questions.technical_questions][currentQuestionIndex]}
                                </p>
                            )}

                            {!isInterviewStarted && (
                                <div className="flex-grow flex items-center justify-center text-center">
                                    <p className="text-gray-500">
                                        Prepare for a comprehensive interview experience.
                                        Click "Start Interview" to begin your professional assessment.
                                    </p>
                                </div>
                            )}

                            {isInterviewComplete && (
                                <div className="flex-grow flex flex-col items-center justify-center text-center">
                                    <Check className="text-green-600 w-16 h-16 mb-4" />
                                    <p className="text-green-600 font-medium">
                                        Thank you for completing the interview.
                                        Your responses have been recorded and will be reviewed.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-12 flex justify-center items-center">
                            <div className="relative w-40 h-40">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-600 
            rounded-full animate-pulse opacity-70"></div>

                                <div className="absolute inset-0 flex justify-center items-center">
                                    <div className="absolute w-full h-full bg-blue-400/30 rounded-full 
                animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                    <div className="absolute w-3/4 h-3/4 bg-blue-400/20 rounded-full 
                animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_200ms]"></div>
                                </div>

                                <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-blue-300 to-blue-600 
            rounded-full flex justify-center items-center 
            shadow-lg transform transition-all hover:scale-105">
                                    <span className="text-white text-2xl font-bold tracking-wider ">
                                        Mitra AI
                                    </span>


                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Control Buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                    {!isInterviewStarted && !isInterviewComplete && (
                        <button
                            onClick={startInterview}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg 
                            hover:bg-blue-700 transition-colors 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            flex items-center"
                        >
                            <PlayCircle className="mr-2" /> Start Interview
                        </button>
                    )}

                    {isInterviewStarted && !isInterviewComplete && currentQuestionIndex < (questions ? [...questions.behavioral_questions, ...questions.technical_questions].length - 1 : 0) && (
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3 bg-blue-500 text-white rounded-lg 
                            hover:bg-blue-600 transition-colors
                            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                            flex items-center"
                        >
                            <Check className="mr-2" /> Next Question
                        </button>
                    )}

                    {isInterviewStarted && !isInterviewComplete && currentQuestionIndex === (questions ? [...questions.behavioral_questions, ...questions.technical_questions].length - 1 : 0) && (
                        <button
                            onClick={endInterview}
                            className="px-8 py-3 bg-red-500 text-white rounded-lg 
                            hover:bg-red-600 transition-colors
                            focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
                            flex items-center"
                        >
                            <X className="mr-2" /> End Interview
                        </button>
                    )}

                    <button
                        onClick={startRecording}
                        disabled={isRecording || !isInterviewStarted || isInterviewComplete}
                        className={`px-8 py-3 rounded-lg transition-colors flex items-center
                        ${isRecording || !isInterviewStarted || isInterviewComplete
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                        <Mic className="mr-2" />
                        {isRecording ? 'Recording...' : 'Start Recording'}
                    </button>

                    <button
                        onClick={stopRecording}
                        disabled={!isRecording || !isInterviewStarted || isInterviewComplete}
                        className={`px-8 py-3 rounded-lg transition-colors flex items-center
                        ${!isRecording || !isInterviewStarted || isInterviewComplete
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        <MicOff className="mr-2" /> Stop Recording
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Interview;
