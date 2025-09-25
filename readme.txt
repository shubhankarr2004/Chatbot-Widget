# 📚 PDF-Aware Chatbot Widget

An interactive web-based chatbot widget powered by **LangChain**, **FAISS**, and **Google Gemini**.  
It can extract information from multiple PDFs (including text and tables) and answer user queries contextually with high accuracy.

---

## ✨ Features
- 📄 Extracts **text + tables** from multiple PDF documents using **PyMuPDF** and **pdfplumber**
- 🧠 Creates embeddings with **HuggingFace (MiniLM)** and stores them in a **FAISS vector database**
- 🔍 Contextual retrieval of relevant chunks for accurate answers
- 🤖 Conversational responses powered by **Gemini 1.5 Flash**
- 💬 Floating **chat widget** with:
  - Typing animation
  - Assist bubble (`"How may I assist you?"`)
  - Sound notifications on replies
  - Markdown + table rendering
- 🛡️ Error handling and graceful fallbacks

---

## 🗂️ Project Structure
```
.
├── documents/          # Folder containing all PDF files
├── app.py              # Flask backend with LangChain + Gemini integration
├── templates/          # (Optional) For Flask templating
├── static/
│   ├── style.css       # Chat widget styles
│   ├── script.js       # Chat widget logic
│   └── airbot.png      # Bot avatar
├── ping.mp3            # Notification sound
└── README.md           # Project documentation
```

---

## ⚡ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pdf-chatbot-widget.git
cd pdf-chatbot-widget
```

### 2. Create Virtual Environment & Install Dependencies
```bash
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate    # On Windows

pip install -r requirements.txt
```

Dependencies include:
- Flask
- Flask-CORS
- PyMuPDF (`fitz`)
- pdfplumber
- langchain
- langchain-community
- langchain-huggingface
- langchain-google-genai
- faiss-cpu
- python-dotenv

### 3. Set Up Environment Variables
Create a `.env` file in the project root and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

### 4. Add PDF Files
Place all your `.pdf` files inside the `documents/` folder.

### 5. Run the Flask Server
```bash
python app.py
```
Server runs at: [http://127.0.0.1:5000](http://127.0.0.1:5000)

### 6. Open the Widget
Open `index.html` in your browser.  
Click on the floating chat icon to start chatting with the bot.

---

## 🖼️ Demo Preview
![Chatbot Screenshot](demo-screenshot.png)

---

## 🚀 Future Improvements
- Persistent FAISS index to avoid re-processing on restart
- Dark mode toggle for the widget
- Deployable version (Docker / Render / Railway)
- Multi-user chat history

---

## 📜 License
This project is licensed under the MIT License – feel free to use and modify.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 👨‍💻 Author
Developed by Shubhankar Singh✨
LinkedIn: www.linkedin.com/in/shubhankarr
GitHub: https://github.com/shubhankarr2004
