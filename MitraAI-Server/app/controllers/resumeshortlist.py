import requests
import tempfile
import pdfplumber
import re
import json  # For JSON parsing
from flask import request, jsonify
from langchain.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client

# Function to download PDF from a URL
def download_pdf(url):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Raise an error for bad status
        return response.content
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return None

# Function to extract resume content from PDF bytes
def extract_resume_content_from_bytes(pdf_bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf.flush()
            with pdfplumber.open(temp_pdf.name) as pdf:
                resume_content = ""
                for page in pdf.pages:
                    resume_content += page.extract_text()
        return resume_content.strip()
    except Exception as e:
        print(f"Error extracting content from PDF: {e}")
        return ""

def resumeshortlist():
    try:
        # Get the Vertex AI client
        vertex_client = get_vertex_client()

        # Extract request data
        data = request.get_json()
        count = data.get('count')
        resumes = data.get('resumes', [])

        if not resumes or count <= 0:
            return jsonify({'error': "Invalid input: No resumes or invalid count."}), 400

        scored_resumes = []

        for resume in resumes:
            name = resume.get("name")
            url = resume.get("resumeURL")  # Assuming the URL is provided

            if not name or not url:
                continue  # Skip invalid entries

            # Download the resume content from the URL
            pdf_bytes = download_pdf(url)

            if not pdf_bytes:
                continue  # Skip if the file couldn't be downloaded

            # Extract resume content
            content = extract_resume_content_from_bytes(pdf_bytes)

            if not content:
                continue  # Skip if no content could be extracted

            # Updated professional prompt for ATS score
            task = f"""
            You are a strict and specialized ATS (Applicant Tracking System) evaluator. 
            Analyze the provided resume content internally, considering factors such as structure, formatting, keyword optimization, and overall quality. 

            Resume content:
            {content}

            Instructions:
            1. Evaluate the resume internally without providing any analysis or explanation.
            2. Respond with the ATS score as a numerical value only in the following exact JSON format:
            {{
                "score": <ATS_SCORE>
            }}
            3. Replace <ATS_SCORE> with the numerical value of the score (an integer between 0 and 100).
            4. Do not include any other text, explanation, or information beyond the JSON.
            """


            prompt_template = PromptTemplate(
                input_variables=["task"],
                template="Please perform the following task: {task}",
            )
            prompt = prompt_template.format(task=task)

            # Send the prompt to Vertex AI and get the response
            response_text = vertex_client.send_prompt(prompt)

            # Print the AI response for debugging
            print(f"AI Response for {name}: {response_text.strip()}")

            # Regex to extract only the JSON portion of the response
            try:
                match = re.search(r'(\{.*\})', response_text.strip(), re.DOTALL) # Match JSON structure
                if match:
                    json_response = match.group(1)
                    # Safely parse the JSON response
                    parsed_response = json.loads(json_response)  # Use json.loads() instead of eval()
                    if isinstance(parsed_response, dict) and 'score' in parsed_response:
                        print(f"Successfully converted to JSON: {parsed_response}")
                        score = parsed_response['score']  # Get score if valid
                    else:
                        print(f"Invalid JSON structure: {json_response}")
                        score = 0  # Default score if JSON structure is invalid
                else:
                    print("No valid JSON response found.")
                    score = 0  # Default score if no JSON match found
            except Exception as e:
                print(f"Error extracting score from response: {e}")
                score = 0  # Default score if there's an error

            scored_resumes.append({
                "name": name,
                "resumeUrl": url,
                "score": score
            })

        # Sort resumes by score in descending order and shortlist top `count`
        shortlisted_resumes = sorted(scored_resumes, key=lambda x: x['score'], reverse=True)[:count]

        # Print the shortlisted resumes and their scores for debugging
        print("Shortlisted Resumes:")
        for resume in shortlisted_resumes:
            print(f"Name: {resume['name']}, Score: {resume['score']}")

        # Return the shortlisted resumes
        return jsonify({'shortlisted': shortlisted_resumes}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500