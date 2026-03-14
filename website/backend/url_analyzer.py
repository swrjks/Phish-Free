import socket
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import whois
from difflib import SequenceMatcher

# Keywords commonly used in phishing domains
HOST_KEYWORDS = [
"login",
"signin",
"verify",
"secure",
"account",
"update",
"confirm",
"password",
"wallet",
"crypto",
"bank",
"invoice"
]

# Popular brands to detect impersonation
BRANDS = [
    "paypal",
    "amazon",
    "google",
    "apple",
    "microsoft",
    "facebook",
    "instagram",
    "netflix"
]


def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()


def detect_brand_impersonation(domain):

    for brand in BRANDS:

        if brand in domain:
            continue

        if similarity(domain, brand) > 0.75:
            return brand

    return None


def analyze_url(raw_url: str):

    if not raw_url.startswith(("http://", "https://")):
        raw_url = "http://" + raw_url

    parsed = urlparse(raw_url)

    scheme = parsed.scheme.upper()
    host = parsed.hostname or ""

    path = parsed.path
    query = parsed.query

    parts = host.split(".")

    tld = "." + parts[-1] if len(parts) > 1 else ""

    domain_base = ".".join(parts[-2:]) if len(parts) >= 2 else host

    subdomains = max(0, len(parts) - 2)

    url_length = len(raw_url)

    hyphens = host.count("-")

    digits = sum(c.isdigit() for c in host)

    keywords = [k for k in HOST_KEYWORDS if k in host.lower()]

    params = parse_qs(query)
    query_param_count = len(params)

    # Resolve IP
    try:
        ip_address = socket.gethostbyname(host)
    except:
        ip_address = "Not Resolved"

   # Domain age detection
    domain_age = "Lookup Failed"
    age_days = None

    try:
        w = whois.whois(domain_base)
        created = getattr(w, "creation_date", None)

        if isinstance(created, list):
            created = created[0]

        if created:
            if isinstance(created, str):
                created = datetime.strptime(created[:10], "%Y-%m-%d")

            age_days = (datetime.now() - created).days

            if age_days < 30:
                domain_age = f"{age_days} days"
            elif age_days < 365:
                domain_age = f"{age_days//30} months"
            else:
                domain_age = f"{age_days//365} years"

    except Exception:
        domain_age = "Lookup Failed"

    # Brand impersonation detection
    brand_match = detect_brand_impersonation(domain_base)

    # Risk scoring
    score = 0
    reasons = []

    if scheme == "HTTP":
        score += 10
        reasons.append("Uses HTTP instead of HTTPS")

    if subdomains >= 2:
        score += 10
        reasons.append("Multiple subdomains detected")

    if url_length > 80:
        score += 10
        reasons.append("Very long URL")

    if hyphens >= 2:
        score += 10
        reasons.append("Multiple hyphens in domain")

    if digits >= 3:
        score += 10
        reasons.append("Suspicious digits in domain")

    if keywords:
        score += 15
        reasons.append("Suspicious keywords detected")

    if query_param_count >= 3:
        score += 5
        reasons.append("Many query parameters")

    if age_days and age_days < 30:
        score += 20
        reasons.append("Recently registered domain")

    if brand_match:
        score += 20
        reasons.append(f"Possible impersonation of {brand_match}")

    score = min(100, score)

    if not reasons:
        reasons.append("No major phishing indicators detected")

    result = {
        "url": raw_url,
        "score": score,
        "reasons": reasons,
        "aiExplanation": [
            "URL structure analyzed using heuristic signals",
            "Domain reputation inferred from registration age",
            "Brand impersonation patterns checked"
        ],
        "features": {
            "Protocol": scheme,
            "Domain": domain_base,
            "Top Level Domain": tld,
            "Subdomains": subdomains,
            "URL Length": url_length,
            "IP Address": ip_address,
            "Domain Age": domain_age,
            "Hyphens in Domain": hyphens,
            "Digits in Domain": digits,
            "Keywords Detected": len(keywords),
            "Query Parameters": query_param_count
        }
    }

    return result