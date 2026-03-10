from fastapi import APIRouter, HTTPException
from src.api.schemas import SimulateRequest, PolicyReport
from src.simulator.rollout_engine import RolloutEngine
from src.simulator.models import ProposedAction
from src.state.state_store import StateStore
from src.api.report_generator import ReportGenerator

router = APIRouter(prefix="/simulate", tags=["simulate"])

# Reusable singletons
store = StateStore()
engine = RolloutEngine()
generator = ReportGenerator()

@router.post("/", response_model=PolicyReport)
def run_simulation(req: SimulateRequest):
    current_state = store.load_current_state()
    if not current_state:
        # Abort if state is fundamentally uninitialized in Redis
        raise HTTPException(status_code=500, detail="GlobalState not initialized in Redis.")

    action = ProposedAction(
        actor=req.actor,
        action_type=req.action_type,
        target=req.target
    )

    tree = engine.rollout(
        initial_state=current_state,
        initial_action=action,
        depth=req.simulation_depth
    )

    query = f"Simulating {req.actor} taking action: {req.action_type} against {req.target}"
    report = generator.generate(query, action, tree, current_state)

    return report
