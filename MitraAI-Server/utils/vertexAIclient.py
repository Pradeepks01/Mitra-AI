import os
import json
from google.oauth2 import service_account
from langchain_google_vertexai import VertexAI
from flask import current_app

class VertexAIClient:
    def __init__(self, model_name: str, credentials):
        """Initialize Vertex AI client using LangChain Google VertexAI."""
        self.model_name = model_name
        self.llm = VertexAI(model_name=self.model_name, credentials=credentials)

    def send_prompt(self, prompt: str) -> str:
        """Send a prompt to the Vertex AI model and return the response."""
        try:
            response = self.llm.invoke(prompt)
            return response
        except Exception as e:
            raise RuntimeError(f"Error communicating with Vertex AI: {str(e)}")

def init_vertex_ai(app, model_name: str, credentials):
    """Initialize the Vertex AI client and store it in the Flask app context."""
    try:
        app.config['VERTEX_CLIENT'] = VertexAIClient(model_name, credentials)
        print("Vertex AI client initialized and stored in app context.")
    except Exception as e:
        print(f"Error during Vertex AI client initialization: {str(e)}")
        raise e

def get_vertex_client():
    """Retrieve the Vertex AI client from the Flask app context."""
    client = current_app.config.get('VERTEX_CLIENT')
    if not client:
        raise RuntimeError("Vertex AI client is not initialized in app context.")
    return client

def start_vertex(app):
    service_account_path = "./gcp_cred.json"

    # Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = service_account_path

    # Load credentials from the service account key file
    credentials = service_account.Credentials.from_service_account_file(service_account_path)

    with open(service_account_path, 'r') as file:
        credentials_data = json.load(file)

    # Print the details (e.g., project_id and client_email)
    print("Project ID:", credentials_data.get('project_id'))
    print("Client Email:", credentials_data.get('client_email'))

    # Initialize the Vertex AI client and store it in the app context
    init_vertex_ai(app, "gemini-pro", credentials)