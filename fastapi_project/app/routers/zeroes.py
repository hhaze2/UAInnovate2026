from fastapi import APIRouter, Depends
from sqlmodel import Session, text, select
from app.services.database.session import get_session  # your dependency that yields Session
from app.services.database.models import HistoricStockLevels

router = APIRouter()

# from app.services.ml_model_service import time_to_zero

router = APIRouter(prefix="/getZeroes", tags=["getZeroes"])

@router.get("/", response_model=list[HistoricStockLevels])
def getCurrentZeroes(session: Session = Depends(get_session)):
    
    stmt = text("""
        WITH latest AS (
            SELECT DISTINCT ON (location, resource_type)
                id, location, resource_type, timestamp, stock_level
            FROM HistoricStockLevels
            ORDER BY location, resource_type, timestamp DESC, id DESC
        )
        SELECT id, location, resource_type, timestamp, stock_level
        FROM latest
        WHERE stock_level = 0
        ORDER BY location, resource_type

    """)

    rows = session.exec(stmt).mappings().all()

    
    return [HistoricStockLevels(**dict(r)) for r in rows]


    # return hours