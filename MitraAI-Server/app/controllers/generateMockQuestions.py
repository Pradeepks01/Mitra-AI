from flask import request, jsonify
from langchain.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client
import pdfplumber
import json
import re

# Function to extract resume content from PDF
def extract_resume_content(file):
    resume_content = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            resume_content += page.extract_text()
    return resume_content

# Function to generate mock questions based on job description and resume
def generate_mock_questions():
    try:
        # Get the job description from the form data
        job_description = request.form.get('jobDescription')
        
        # Extract resume content if a file is provided
        resume_content = ""
        file = request.files.get('file')
        if file:
            # If file is a PDF, extract the text
            if file.filename.endswith('.pdf'):
                resume_content = extract_resume_content(file)
            else:
                resume_content = "Unsupported file format."
                
        # Get the Vertex AI client
        vertex_client = get_vertex_client()
        
        # Define LangChain prompt template for generating technical and behavioral questions
        prompt_template = PromptTemplate(
            input_variables=["job_description", "resume_content"],
            template="""Based on the following job description and resume content, generate the following:

            1. only one Technical questions relevant to the job description and the candidate's experience.
            2. only one Behavioral questions to understand how the candidate has approached challenges and demonstrated skills in previous roles.

            Return the output strictly in the following JSON format:
            technical_questions: [],
            behavioral_questions: []

            Job Description: {job_description}
            Resume Content: {resume_content}

            Please ensure the JSON is correctly structured, without additional text or explanations.""",
        )

        # Format the prompt with the job description and resume content
        prompt = prompt_template.format(job_description=job_description, resume_content=resume_content)

        # Send the formatted prompt to Vertex AI to generate the questions
        response_text = vertex_client.send_prompt(prompt)
        
        # Log the raw response to inspect its structure
        # print(f"Raw Response from Vertex AI: {response_text}")

        # Use regex to extract valid JSON from the response
        json_match = re.search(r'\{.*\}', response_text.strip(), re.DOTALL)
        
        if not json_match:
            raise ValueError("Valid JSON was not found in the response.")

        # Extract the JSON string and parse it
        response_json_str = json_match.group(0)

        # Parse the response into a JSON object
        response_json = json.loads(response_json_str)
        
        print("Json Formatted : ",response_json)

        # Return the JSON response
        return jsonify(response_json), 200
    
    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500