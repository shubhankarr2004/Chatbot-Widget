from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  
import pdfplumber
from dotenv import load_dotenv

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.schema import Document


load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")


app = Flask(__name__)
CORS(app)


PDF_DIR = "./documents"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

# Extract text and tables
def extract_text_and_tables(pdf_path):
    full_text = ""

    # Extract normal text using PyMuPDF
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                full_text += page.get_text() + "\n"
    except Exception as e:
        print(f"❌ Error reading text from {pdf_path}: {e}")

    # Extract tables using pdfplumber
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        clean_row = [cell.strip() if cell else "" for cell in row]
                        full_text += " - " + " | ".join(clean_row) + "\n"
    except Exception as e:
        print(f"❌ Error reading tables from {pdf_path}: {e}")

    return full_text

# Read all PDFs
print("📄 Reading PDFs and extracting content...")
all_text = ""
for filename in os.listdir(PDF_DIR):
    if filename.endswith(".pdf"):
        path = os.path.join(PDF_DIR, filename)
        print(f"🔍 Extracting from: {filename}")
        all_text += extract_text_and_tables(path) + "\n\n"

# Split into chunks
print("✂️ Chunking content...")
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)
documents = text_splitter.create_documents([all_text])

# Embedding and Vector Store
print("📦 Creating embeddings and FAISS store...")
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = FAISS.from_documents(documents, embedding_model)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# Setup Gemini via LangChain
print("🤖 Connecting to Gemini...")
llm = ChatGoogleGenerativeAI(
    model="models/gemini-1.5-flash",
    temperature=0.2,
    google_api_key=api_key
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)

# Chat API
@app.route("/chat", methods=["POST"])
def chat():
    user_query = request.json.get("message", "").strip()
    if not user_query:
        return jsonify({"reply_type": "error", "message": "❌ Empty user query."})

    try:
        result = qa_chain.invoke({"query": user_query})
        answer = result["result"].strip()

        if not answer or "sorry" in answer.lower():
            return jsonify({
                "reply_type": "error",
                "message": "⚠️ Sorry, I do not have the answer to this question, yet."
            })

        return jsonify({
            "reply_type": "gemini",
            "reply": answer
        })

    except Exception as e:
        return jsonify({
            "reply_type": "error",
            "message": f"❌ Backend error: {str(e)}"
        })

# Run server
if __name__ == "__main__":
    print("🚀 Server running at http://127.0.0.1:5000")
    app.run(debug=False)
