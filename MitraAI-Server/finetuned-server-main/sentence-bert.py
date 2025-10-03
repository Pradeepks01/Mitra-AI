from sentence_transformers import SentenceTransformer, util
import torch

# Load pre-trained Sentence-BERT model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Example resumes and job descriptions
resumes = [
    "Experienced data scientist with expertise in Python, machine learning, and AI.",
    "Software engineer skilled in Java, Spring Boot, and microservices architecture.",
    "Marketing specialist with 5 years of experience in SEO, content strategy, and social media marketing."
]

job_descriptions = [
    "Looking for a data scientist skilled in Python, machine learning, and data visualization.",
    "Seeking a backend developer proficient in Java and microservices.",
    "Hiring a marketing professional with expertise in SEO and social media campaigns."
]

# Generate embeddings for resumes and job descriptions
resume_embeddings = model.encode(resumes, convert_to_tensor=True)
jd_embeddings = model.encode(job_descriptions, convert_to_tensor=True)

# Calculate cosine similarity scores
similarity_matrix = util.pytorch_cos_sim(resume_embeddings, jd_embeddings)

# Display similarity scores
print("Similarity Scores (Rows: Resumes, Columns: Job Descriptions):\n")
print(similarity_matrix)

# Interpret the results
for i, resume in enumerate(resumes):
    print(f"\nResume {i+1}: {resume}")
    best_match_idx = torch.argmax(similarity_matrix[i]).item()
    best_match_score = similarity_matrix[i][best_match_idx].item()
    print(f"Best Match: Job Description {best_match_idx+1}: {job_descriptions[best_match_idx]}")
    print(f"Similarity Score: {best_match_score:.2f}")