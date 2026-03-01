from fastapi import APIRouter, Depends, status, HTTPException, Form
from sqlmodel import Session, select
from app.services.database.session import get_session

from app.services.ml_model_service import time_to_zero

router = APIRouter(prefix="/time-to-zero", tags=["time-to-zero"])

@router.post("/", response_model=int, status_code=status.HTTP_201_CREATED)
def getTimetoZero(session: Session = Depends(get_session)):
    days = time_to_zero("Vibranium","Wakanda", session)

    return days