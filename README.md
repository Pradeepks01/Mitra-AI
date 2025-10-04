# 🚀 Mitra AI – Smart Resume Screening & Analytics

Mitra AI is an intelligent, end-to-end resume screening and interview pipeline platform designed to enhance and automate the hiring process using cutting-edge AI. It leverages **Next.js**, **Flask**, **LangChain**, **Firebase**, and **ElevenLabs** to deliver fast, accurate, and scalable hiring workflows.

---

## 🌟 Features

- ✅ **AI-Powered Resume Screening**  
  Uses a fine-tuned GPT-2 model and LangChain-based **multi-agent ecosystem** (7 specialized agents) for deep candidate evaluation and job-role alignment.

- 🧠 **Automated Interview Pipeline**  
  Dynamically generates personalized mock interview questions and feedback to assess candidates intelligently.

- 📊 **Smart Resume Scoring**  
  Implements **cosine similarity** and multi-agent scoring to rank resumes with precision and fairness.

- 📂 **Bulk Resume Processing with Firebase**  
  Built-in recruiter dashboard enables drag-and-drop bulk resume upload, real-time processing, and analytics.

- 🔊 **Voice Feedback via ElevenLabs API**  
  Converts AI-generated interview feedback into natural-sounding voice using ElevenLabs' TTS models.

---

## 🛠️ Tech Stack

| Layer       | Technology                               |
|-------------|-------------------------------------------|
| Frontend    | Next.js, Tailwind CSS, TypeScript         |
| Backend     | Flask, Python, LangChain, GPT-2 (HuggingFace) |
| Storage     | Firebase Storage & Firestore              |
| AI APIs     | Google Generative AI (Gemini), ElevenLabs |
| ML Models   | Fine-tuned GPT-2 for resume understanding |

---


## ⚙️ How It Works

1. **Upload Resumes (PDF)** via dashboard.
2. **Multi-Agent System** evaluates key areas:
   - Skills match
   - Job relevance
   - Experience alignment
   - Education fit
   - Soft skills inference
3. **Custom GPT-2 Model** fine-tuned on job-candidate data generates match score + comments.
4. **Interview Pipeline** generates mock questions dynamically.
5. **Recruiter Dashboard** shows all candidates, ranks, feedback, and allows audio download.

---
