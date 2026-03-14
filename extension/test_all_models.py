
import os
import sys
import base64
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from cnn_model import CNNModel
from llm_model import TextScorer
from gnn_model import GraphEngine
from ensemble import combine_scores

def test_models():
    print("=== Testing PhishFree Model Suite ===")
    
    # 1. Test Text (LLM)
    print("\n[1/3] Testing LLM (TextScorer)...")
    scorer = TextScorer()
    
    phish_text = "URGENT: Your account has been suspended. Click here to verify your credentials: http://fake-bank.login/verify"
    legit_text = "Hey Sahil, are we still meeting for the hackathon prep at 5 PM today? Let me know."
    
    phish_res = scorer.score(phish_text)
    legit_res = scorer.score(legit_text)
    
    print(f"  Phishing Input: '{phish_text[:50]}...'")
    print(f"  Score: {phish_res['score']:.4f}")
    
    print(f"  Legit Input: '{legit_text[:50]}...'")
    print(f"  Score: {legit_res['score']:.4f}")

    # 2. Test CNN (Visual)
    print("\n[2/3] Testing CNN (CLIP + MLP)...")
    cnn = CNNModel()
    templates_dir = "backend/templates"
    if os.path.exists(templates_dir):
        cnn.compute_brand_embeddings(templates_dir)
        
    img_path = "backend/demo_payloads/example1.png"
    
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        cnn_res = cnn.score_image_bytes(img_bytes)
        print(f"  Input: {img_path}")
        print(f"  Phish Score: {cnn_res['score']:.4f}")
        print(f"  Best Brand Match: {cnn_res.get('best_brand', 'None')}")
    else:
        print(f"  ⚠️ Skip: {img_path} not found.")

    # 3. Test GNN (Graph)
    print("\n[3/3] Testing GNN (GraphEngine)...")
    gnn = GraphEngine()
    
    # Mock some data for GNN
    edges = [("google.com", "youtube.com"), ("phish-site.net", "attacker-hub.com")]
    gnn.build_graph_from_edges(edges)
    gnn.compute_node2vec_embeddings()
    
    known_node = "google.com"
    unknown_node = "random-new-site.xyz"
    
    known_score = gnn.predict_node_score(known_node)
    unknown_score = gnn.predict_node_score(unknown_node)
    
    print(f"  Known Node ({known_node}) Score: {known_score}")
    print(f"  Unknown Node ({unknown_node}) Score: {unknown_score}")

    # 4. Test Ensemble
    print("\n=== Ensemble Result (Aggregated) ===")
    final = combine_scores(phish_res['score'], cnn_score=0.2, gnn_score=0.1)
    print(f"  Combined Risk Score: {final['score']:.4f}")
    print(f"  Label: {final['label'].upper()}")
    print(f"  Reasons: {final['reasons']}")

if __name__ == "__main__":
    test_models()
