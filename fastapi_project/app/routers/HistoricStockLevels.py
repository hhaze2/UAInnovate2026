
from fastapi import APIRouter, Depends, Query
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


# This request takes a resource type and location and returns all historic data entries relating to that resource/location pairing
# Use rest like path parameters in the endpoint
@router.get("/{location}/{resource_type}", response_model=list[HistoricStockLevels])
def list_HistoricStockLevels_location_and_type(location: str, resource_type: str, session: Session = Depends(get_session)):
    return (session.query(HistoricStockLevels).filter(
        HistoricStockLevels.location == location,
        HistoricStockLevels.resource_type == resource_type
    ).all()
    )
@router.get("/{location}", response_model=list[HistoricStockLevels])
def list_HistoricStockLevels_filtered(location: str, session: Session = Depends(get_session)):
    return (session.query(HistoricStockLevels).filter(
        HistoricStockLevels.location == location
    ).all()
    )