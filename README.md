# 🛡️ PhishFree — Real-Time Phishing Detection

**PhishFree** is a real-time phishing detection ecosystem designed to protect users from malicious websites automatically.

🎯 **HackNocturne Hackathon Project**
Built to tackle real-world web security threats using AI-based analysis and heuristics.
**Deployed Version**: [https://phishfree.vercel.app/](https://phishfree.vercel.app/)

---

## 📖 Problem

Phishing attacks remain one of the most common and effective methods for stealing sensitive information, including passwords, credit card numbers, and personal data.

* Modern phishing sites often **mimic popular brands** perfectly, making it difficult for users to identify threats.
* Current browser protections are often **reactive**, **slow**, or **provide vague alerts**, leaving users exposed.
* Users frequently **ignore warnings** due to confusing interfaces or false positives.

There is a need for a **proactive, real-time solution** that is seamless, intuitive, and accurate for every user.

---

## 💡 Solution

PhishFree provides a **full-stack phishing detection ecosystem** that automatically protects users:

1. **Browser Extension**: Captures webpage content, scripts, and screenshots silently in the background.
2. **AI-Powered Backend**:

   * **Text Analysis**: Detects hidden forms, unusual links, and phishing patterns.
   * **Visual Analysis**: Compares page screenshots with legitimate brand visuals to detect impersonation.
   * **Domain & Network Analysis**: Checks WHOIS data, certificate validity, domain age, and suspicious network patterns.
3. **Real-Time Alerts**: Displays clear, actionable warnings in the browser when a site is risky.
4. **Logging & Transparency**: Keeps track of flagged sites for review and auditing.

This system ensures that users are **never tricked by phishing attacks** while maintaining a seamless browsing experience.

---

## 🛠️ System Architecture

![System Architecture](images/system_arch.jepg)

**Flow Overview**:

* **User Browser** → PhishFree Extension → **Backend AI + Heuristics** → Returns risk score → Extension shows alerts.
* Real-time processing ensures minimal delay and maximum safety.

---

## ⚙️ Installation & Setup

### 1️⃣ Download the Extension & Backend

* Backend ZIP release: [Download here](https://github.com/swrjks/Phish-Free-extension-backend/releases/tag/v1.0.0)
* Unzip it anywhere on your computer.

### 2️⃣ Install Backend Dependencies

```bash
cd backend
python -m venv venv
# Activate virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux / Mac
pip install -r requirements.txt
```

### 3️⃣ Run the Backend

```bash
cd backend
python app.py
```

### 4️⃣ Load the Extension

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **"Load unpacked"** and select the `extension/` folder.

*Now your browser is protected with PhishFree!* 🛡️

---

## 🎥 Demo Videos

| [Video 1](https://youtu.be/sZh2fSZO5uM)                                                         | [Video 2](https://youtu.be/oj7oEATNhpg)                                                         |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| <a href="https://youtu.be/sZh2fSZO5uM"><img src="images/video1_thumbnail.jpg" width="300"/></a> | <a href="https://youtu.be/oj7oEATNhpg"><img src="images/video2_thumbnail.jpg" width="300"/></a> |

---

## 👥 Team Members

1. **Member 1** – Role / Contribution
2. **Member 2** – Role / Contribution
3. **Member 3** – Role / Contribution
4. **Member 4** – Role / Contribution

---

This version is now **user-friendly**, visually structured, and includes placeholders for images, videos, team members, and the deployed site link.

If you want, I can **also create the Markdown code for the video thumbnails so it displays properly on GitHub** with clickable images.

Do you want me to do that next?
