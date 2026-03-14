# 🛡️ PhishFree — Real-Time AI/ML-Based Phishing Detection

**PhishFree** is an advanced, real-time phishing detection and prevention ecosystem originally engineered to stop sophisticated web-based threats seamlessly.

🎯 **Built for HackNocturne Hackathon!**  
This project is our official submission for the HackNocturne hackathon, designed to tackle real-world cybersecurity threats with bleeding-edge AI and blockchain integrity.

---

## 📖 What PhishFree Does

PhishFree combines a sleek **Chrome Extension** with a powerful **Multi-Modal AI Backend** to protect users as they browse the deep expanses of the internet.

When a user visits a webpage, PhishFree operates in the background to automatically analyze the site:
1. **The Extension** scrapes HTML content, scripts, and captures a live screenshot of the webpage silently in the background.
2. **The Backend** receives this data and unleashes three distinct AI models operating in an ensemble:
   - **Text Model (RoBERTa)**: Analyzes the page's structural text, intent, and hidden forms.
   - **Vision Model (CNN/ResNet)**: Visually compares the screenshot against known legitimate brands (like Google, PayPal, Microsoft) to detect brand impersonation.
   - **Graph Model (GNN)**: Maps malicious network patterns, domain clusters, and link relationships.
3. **Advanced Threat Scanners**: Checks WHOIS data, certificate authorities, domain age, and specific high-risk fingerprints (e.g., piracy, proxies).
4. **Actionable Alerts**: If the site is dangerous, the extension instantly slides down a beautiful, minimalist warning bar directly inside the webpage, explicitly explaining the risk dynamically without confusing the user.
5. **Decentralized Auditing**: Logs of all flagged malicious sites are anchored directly to the **Ethereum Web3 Blockchain** to ensure tamper-proof historical tracking.
6. **Detailed Dashboard**: Every event is tracked on a beautiful interactive Admin Dashboard complete with charts, log deletion functionalities, and CSV exports.

---

## 🛠️ Tech Stack & Architecture Versions

We strictly utilized modern, robust frameworks and strict package versions to ensure stability.

### 🌐 Frontend (Extension & Dashboard)
- **Extension Engine**: Chrome Manifest V3
- **Frontend Logic**: Vanilla JavaScript (ES6+), HTML5, Vanilla CSS3 (Custom Glassmorphism minimal UI)
- **Data Visualization**: Chart.js

### ⚙️ Backend (Python 3)
- **Framework**: `Flask==3.0.3` with `Flask-Cors==4.0.1`
- **Server**: `gunicorn==22.0.0`
- **Data Processing**: `numpy==1.26.4`, `pandas==2.2.2`

### 🧠 Artificial Intelligence / ML
- **Deep Learning Frame**: `torch>=2.2.2`, `torchvision>=0.17.2`
- **NLP / Transformers**: `transformers==4.41.2`, `sentence-transformers==3.0.1`
- **Graph Neural Nets**: `torch-geometric>=2.5.3`
- **Machine Learning Utilities**: `scikit-learn==1.5.2`, `lightgbm==4.3.0`
- **AI Acceleration**: `accelerate==0.30.1`

### 🔗 Blockchain / Web3
- **Ethereum Integration**: `web3==6.18.0`
- **Account & Hex Encoding**: `eth-account==0.9.0`, `hexbytes==0.3.1`

### 🌍 Domain Intelligence & Networking
- **Requests & Security**: `requests==2.32.3`, `urllib3>=2.2.1`, `certifi>=2024.2.2`
- **WHOIS & DNS**: `python-whois==0.8.0`, `dnspython==2.6.1`, `idna>=3.7`
- **URL parsing**: `tldextract==5.1.2`

---

## ⚙️ Installation & Setup

### 🧩 Step 1 — Clone the Repository
```bash
git clone https://github.com/Sahil-Scripts/Phish-Free.git
cd Phish-Free
```

### 🧱 Step 2 — Create Virtual Environment
```bash
python -m venv venv
# Activate
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux / Mac
```

### 📦 Step 3 — Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

---

## 🚀 Running the Project

1. **Start the AI Backend**:
   ```bash
   cd backend
   python app.py
   ```
2. **Access the Admin Dashboard**: 
   Open your browser and navigate to: `http://localhost:5000/static/dashboard.html`
3. **Load the Smart Browser Extension**:
   - Go to `chrome://extensions/` in Chrome/Brave/Edge.
   - Enable **Developer mode** in the top right.
   - Click **"Load unpacked"** and select the `extension/` folder located inside the cloned repository.

*Happy safe browsing!* 🛡️
