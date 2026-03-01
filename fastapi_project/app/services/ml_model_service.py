# imports
from app.config import VALID_LOCATIONS, VALID_RESOURCE_TYPES
from app.routers.HistoricStockLevels import list_HistoricStockLevels_location_and_type
from fastapi import APIRouter, Depends, status, HTTPException, Form
from sqlmodel import Session, select
from app.services.database.session import get_session

import polars as pl

def time_to_zero(resource_type: str, location: str, session: Session = Depends(get_session)):
    if resource_type not in VALID_RESOURCE_TYPES:
        print("Not valid resource type")
        return 
    if location not in VALID_LOCATIONS:
        print("Not valid location")
        return
    
    data = list_HistoricStockLevels_location_and_type(
        location=location,
        resource_type=resource_type,
        session=session
        )
    print(type(data))

    df = pl.from_dicts(data)

    # print(df.shape)
    # print(df.head())

    df = df.sort(pl.col('timestamp'),descending=True).head(20)

    

    # print(df)

    # return days for time to zero and potentially the date that the potential exhaustion data occurs
    # its just days i think even though i wont be given a clear answer
    days = 1
    return days


