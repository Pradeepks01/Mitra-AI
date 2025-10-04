import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiChatService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        // Replace with your actual Gemini API key
        const API_KEY = 'AIzaSyAYPwVR7EjmprgmxED9KoSPM4wZ1SQTGYQ';
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-pro",
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            }
        });
    }

    async sendMessage(message: string): Promise<string> {
        const career_context = `You are a professional career advisor and resume expert. 
    Your responses should be tailored to help with:
    - Resume writing and optimization
    - Career guidance
    - Professional development
    - Job search strategies
    - Interview preparation
    
    Always maintain a professional, helpful, and concise tone.`;

        try {
            const result = await this.model.generateContent(
                `${career_context}\n\nUser Query: ${message}`
            );
            return result.response.text();
        } catch (error) {
            console.error('Gemini AI Error:', error);
            return "I apologize, but I'm having trouble processing your request right now.";
        }
    }
}