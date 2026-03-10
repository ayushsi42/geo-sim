import os
from src.world_model.llm_client import LLMClient
from src.world_model.prediction_models import WorldModelPrediction

def test_llm_connection():
    client = LLMClient()
    assert client.api_key is not None, "API Key missing in environment"
    
    # We shouldn't actually trigger real OpenAI calls in unit tests to avoid billing 
    # unless specifically running integration tests. We will just check existence.
    assert client.client is not None, "OpenAI SDK failed to wrap the Key"
