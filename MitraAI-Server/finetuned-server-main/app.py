from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class ResumeEvaluator:
    def __init__(self, model_name="pradeepks/gpt2-finetuned"):
        try:
            # Load the fine-tuned model and tokenizer directly from Hugging Face model hub
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        except OSError:
            print("Could not load tokenizer from Hugging Face, falling back to base GPT2 tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained("gpt2")
            
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        try:
            # Load the fine-tuned model from Hugging Face model hub
            self.model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)
        except OSError:
            raise ValueError(f"Could not load model from {model_name}")
        
        self.model.eval()
        
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

    def calculate_perplexity(self, input_text):
        try:
            encodings = self.tokenizer(input_text, return_tensors="pt", truncation=True, 
                                     max_length=512, padding=True)
            
            input_ids = encodings.input_ids.to(self.device)
            attention_mask = encodings.attention_mask.to(self.device)
            
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask, 
                                   labels=input_ids)
                loss = outputs.loss
                
            return torch.exp(loss).item()
        except Exception as e:
            print(f"Error calculating perplexity: {str(e)}")
            return float('inf')

    def evaluate_resume(self, resume_text, job_description):
        input_text = f"Resume: {resume_text}\nJob Description: {job_description}"
        perplexity = self.calculate_perplexity(input_text)
        max_perplexity = 1000
        score = max(0, min(100, 100 * (1 - np.log(perplexity) / np.log(max_perplexity))))
        
        if score >= 80:
            feedback = "Excellent match! The resume strongly aligns with the job requirements."
        elif score >= 60:
            feedback = "Good match. The resume contains many relevant qualifications."
        elif score >= 40:
            feedback = "Moderate match. Consider highlighting more relevant skills and experiences."
        else:
            feedback = "Low match. The resume might need significant adjustments to better match this role."
        
        return {
            "match_score": round(score, 2),
            "perplexity": round(perplexity, 2),
            "feedback": feedback,
            "timestamp": datetime.now().isoformat()
        }

# Initialize the evaluator
evaluator = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": evaluator is not None
    })

@app.route('/evaluate', methods=['POST'])
def evaluate_resume():
    """Endpoint to evaluate a resume against a job description"""
    try:
        data = request.get_json()
        
        if not data or 'resume' not in data or 'job_description' not in data:
            return jsonify({
                "error": "Missing required fields: 'resume' and 'job_description'"
            }), 400
            
        resume_text = data['resume']
        job_description = data['job_description']
        
        if not resume_text or not job_description:
            return jsonify({
                "error": "Resume and job description cannot be empty"
            }), 400
        
        result = evaluator.evaluate_resume(resume_text, job_description)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

def start_server(model_name="pradeepks/gpt2-finetuned", port=5001):
    """Initialize the model and start the Flask server"""
    global evaluator
    try:
        print("Loading model...")
        evaluator = ResumeEvaluator(model_name)
        print("Model loaded successfully!")
        
        # Start the Flask server
        app.run(host='0.0.0.0', port=port)
    except Exception as e:
        print(f"Error starting server: {str(e)}")

if __name__ == "__main__":
    start_server()