from fastapi import FastAPI
# from config.events import on_start_up
from contextlib import asynccontextmanager

from app.services.database.session import engine
from app.services.database.models import configure


from app.routers.LiveIntelligenceReports import router as LiveIntelligenceReports_router
from app.routers.Log import router as Log_router
from app.routers.HistoricStockLevels import router as HistoricStockLevels_router
from app.routers.Form import router as Form_router
from app.routers.ML_Model import router as ML_Model_router


from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    configure(engine)
    # yield control to the application
    yield
    # Shutdown
    # (optional) close pools, flush metrics, etc.



app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(LiveIntelligenceReports_router)
app.include_router(Log_router)
app.include_router(HistoricStockLevels_router)
app.include_router(Form_router)
app.include_router(ML_Model_router)

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}