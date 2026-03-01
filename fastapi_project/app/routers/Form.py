from fastapi import APIRouter, Depends, status, HTTPException, Body
from sqlmodel import Session, select
from app.services.database.session import get_session
from app.services.database.models import LiveIntelligenceReports, Log
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.services.redaction_helper import redactPII
from app.services.llm_service import get_LLM_data

from app.config import VALID_LOCATIONS, VALID_RESOURCE_TYPES

from app.routers.LiveIntelligenceReports import create_liveIntelligenceReport
from app.routers.Log import create_Log

import json

router = APIRouter(prefix="/Form", tags=["Form"])


class IntelCreate(BaseModel):
    heroName: str = Field(..., min_length=1)
    phoneNumber: str | None = None
    report: str = Field(..., min_length=1)
    priority: str  # e.g., "Routine" | "High" | "Avengers-Level Threat"
    timestamp: datetime



@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def handle_form(
    # payload: Optional[dict] = None,
    # payload: str,
    payload: IntelCreate = Body(...),
    # payload: str = Form(),
    # hero_alias: str,
    # secure_contact: str,
    # raw_text: str,
    # timestamp: datetime,
    # priority: str,
    session: Session = Depends(get_session)
    ):

    if payload == None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Missing body. Submit a JSON payload "
            ),
        )
    
    # extract data from the json payload

    # hero_alias = (json.loads(payload))["heroName"]
    # secure_contact = json.loads(payload)["phoneNumber"]
    # raw_text = json.loads(payload)["report"]
    # priority = json.loads(payload)["priority"]
    # timestamp = json.loads(payload)["timestamp"]
    hero_alias = payload.heroName
    secure_contact = payload.phoneNumber
    raw_text = payload.report
    priority = payload.priority
    timestamp = payload.timestamp


    # hugging face
    # Take in form data

    # pass hero_alias and secure_contact and raw_text to redactpii
    text_object = {
        "hero_alias": hero_alias,
        "secure_contact": secure_contact,
        "raw_text": raw_text
    }

    # redactpii returns just the redacted raw_text

    redacted_text = redactPII(text_object=text_object)

    # make a log to show the redacted text

    log = Log(
        log=redacted_text
    )

    # in the future, would be best to create a shared service layer to avoid calling endpoints directly
    create_Log(log, session)

    #pass redacted_text to the LLM model

    # get a json object back
    # {"resource": "", "quantity":"", "urgency":"", "location":""}
    print(redacted_text)

    # returns mock_data for now
    LLM_data = get_LLM_data(redacted_text)

    # FIXME: CHECK IF NONE INSTEAD
    if not("location" in LLM_data):
        LLM_data["location"] = "Unknown"
    elif not(LLM_data["location"] in VALID_LOCATIONS):
        LLM_data["location"] = "Unknown("+LLM_data["location"]+")"
    
    if not("resource" in LLM_data):
        LLM_data["resource"] = "Unknown"
    elif not(LLM_data["resource"] in VALID_RESOURCE_TYPES):
        LLM_data["resource"] = "Unknown("+LLM_data["resource"]+")"

    if not("quantity" in LLM_data):
        LLM_data["quantity"] = "Unknown"

    # for now, just take the priority sent in, the llm could try to come up with a priority in future

    # Build the live intelligence report (field report)
    report = LiveIntelligenceReports(
        timestamp=timestamp,
        location=LLM_data["location"],
        resource_type=LLM_data["resource"],
        stock_level=LLM_data["quantity"]
        #add urgency here
    )

    # add the report to the database
    # in the future, would be best to create a shared service layer to avoid calling endpoints directly
    create_liveIntelligenceReport(report, session)

    # if there's not a success raise some kind of error? idk
    # return create_liveIntelligenceReport(report, session)
    return {"test": "success"}