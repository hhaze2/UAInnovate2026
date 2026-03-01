
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.services.database.session import get_session
from app.services.database.models import LiveIntelligenceReports

router = APIRouter(prefix="/LiveIntelligenceReports", tags=["LiveIntelligenceReports"])

@router.post("/", response_model=LiveIntelligenceReports)
def create_liveIntelligenceReport(LiveIntelligenceReports: LiveIntelligenceReports, session: Session = Depends(get_session)):
    session.add(LiveIntelligenceReports)
    session.commit()
    session.refresh(LiveIntelligenceReports)
    return LiveIntelligenceReports



@router.get("/", response_model=list[LiveIntelligenceReports])
def list_LiveIntelligenceReports(session: Session = Depends(get_session)):
    return session.exec(select(LiveIntelligenceReports)).all()


@router.get("/{location}", response_model=list[LiveIntelligenceReports])
def list_LiveIntelligenceReports_filtered(location: str, session: Session = Depends(get_session)):
    return (session.query(LiveIntelligenceReports).filter(
        LiveIntelligenceReports.location == location
    ).all()
    )
