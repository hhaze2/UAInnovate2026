
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.services.database.session import get_session
from app.services.database.models import HistoricStockLevels

router = APIRouter(prefix="/HistoricStockLevels", tags=["HistoricStockLevels"])

@router.post("/", response_model=HistoricStockLevels)
def create_HistoricStockLevels(HistoricStockLevels: HistoricStockLevels, session: Session = Depends(get_session)):
    session.add(HistoricStockLevels)
    session.commit()
    session.refresh(HistoricStockLevels)
    return HistoricStockLevels



@router.get("/", response_model=list[HistoricStockLevels])
def list_HistoricStockLevels(session: Session = Depends(get_session)):
    return session.exec(select(HistoricStockLevels)).all()

# @router.get("/", response_model=list[HistoricStockLevels])
# def list_HistoricStockLevels(session: Session = Depends(get_session)):
#     return session.exec(select(HistoricStockLevels)).all()