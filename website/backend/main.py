from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from url_analyzer import analyze_url

app = FastAPI(title="PhishFree API")

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str


@app.get("/")
def health():
    return {"status": "PhishFree backend running"}


@app.post("/scan")
def scan(req: URLRequest):
    result = analyze_url(req.url)
    return result