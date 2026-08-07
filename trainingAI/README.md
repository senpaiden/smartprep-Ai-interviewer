# Training & RAG Datasets

This folder (`trainingAI/`) is intended for uploading PDFs, datasets, company profiles, and other documents.
These documents will be processed and embedded using your local AIs (like Ollama, Llama, Qwen, DeepSeek, etc.) or external APIs (Gemini, Codex, OpenAI) for Retrieval-Augmented Generation (RAG) and Agent context.

## Suggested Structure

- `resumes/` - Accepted/Rejected resumes for training the ATS scorer.
- `company_profiles/` - Company handbooks, job descriptions, and guidelines.
- `interview_qs/` - HR, Behavioral, and Technical question banks.
- `english_eval/` - Grammar and communication assessment datasets.

**Note:** As per the Master Plan, avoid laptop fine-tuning. Instead, we will feed these documents into a Vector Database (like FAISS/ChromaDB) and use agents to retrieve and process them on the fly.
