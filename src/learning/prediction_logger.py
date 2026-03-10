import logging
import json
from pathlib import Path
from datetime import datetime
from src.world_model.prediction_models import WorldModelPrediction
from src.simulator.models import ProposedAction

logger = logging.getLogger(__name__)

class PredictionLogger:
    """Logs LLM World Model Predictions for later backtesting in the Learning Loop."""
    def __init__(self, log_dir: Path = None):
        if not log_dir:
            log_dir = Path(__file__).parent.parent.parent / "data" / "predictions"
        self.log_dir = log_dir
        if not self.log_dir.exists():
            self.log_dir.mkdir(parents=True, exist_ok=True)
            
    def log_prediction(self, prediction: WorldModelPrediction, state_id: str):
        filename = f"pred_{prediction.action}_{datetime.utcnow().timestamp()}.json"
        filepath = self.log_dir / filename
        data = {
            "state_id": state_id,
            "prediction": prediction.model_dump(),
            "timestamp": datetime.utcnow().isoformat()
        }
        with open(filepath, "w") as f:
            f.write(json.dumps(data, indent=2))
        logger.info(f"Logged prediction to {filepath}")
