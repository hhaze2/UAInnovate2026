
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.services.database.session import get_session
from app.services.database.models import Log

router = APIRouter(prefix="/Log", tags=["Log"])

@router.post("/", response_model=Log)
def create_Log(Log: Log, session: Session = Depends(get_session)):
    session.add(Log)
    session.commit()
    session.refresh(Log)
    return Log



@router.get("/", response_model=list[Log])
def list_Log(session: Session = Depends(get_session)):
    return session.exec(select(Log)).all()