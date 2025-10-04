import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Adjust the import to your Firebase config

export const InterviewPreparation = async (
    jobDescription: string,
    selectedFile: File | null,
    setResponseMessage: React.Dispatch<React.SetStateAction<string | null>>
) => {
    if (!jobDescription) {
        setResponseMessage("Please enter a job description.");
        return;
    }

    setResponseMessage('Analysing resume and Job Description and Generating Mock Interview.....!');  // Reset previous messages

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);

    // If a file is selected, append it to the form data
    if (selectedFile) {
        formData.append("file", selectedFile);
    }

    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userData = user ? JSON.parse(user) : null;
    if (!userData) {
        setResponseMessage("No user data found in localStorage.");
        return;
    }

    try {
        // Send the job description (and file) to the backend
        const response = await fetch("http://127.0.0.1:5001/api/generatemockquestions", {
            method: "POST",
            body: formData,  // No need to set Content-Type manually
        });

        if (response.ok) {
            const data = await response.json();
            setResponseMessage("Interview preparation successful!");

            // Store the questions in localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("mockQuestions", JSON.stringify(data));
            }

            // Update Firestore document with the new data
            const userDocRef = doc(db, "applicants", userData.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, {
                    questions: data,
                    lastUpdated: new Date(), // example additional field
                });
            }
        } else {
            const errorData = await response.json();
            setResponseMessage(errorData.message || "An error occurred.");
        }
    } catch (error) {
        setResponseMessage("Error: Failed to connect to server.");
    }
};
