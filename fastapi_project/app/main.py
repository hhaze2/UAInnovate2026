from fastapi import FastAPI
# from config.events import on_start_up
from contextlib import asynccontextmanager

from app.services.database.session import engine
from app.services.database.models import configure


from app.routers.LiveIntelligenceReports import router as LiveIntelligenceReports_router
from app.routers.Log import router as Log_router
from app.routers.HistoricStockLevels import router as HistoricStockLevels_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    configure(engine)
    # yield control to the application
    yield
    # Shutdown
    # (optional) close pools, flush metrics, etc.



app = FastAPI(lifespan=lifespan)

app.include_router(LiveIntelligenceReports_router)
app.include_router(Log_router)
app.include_router(HistoricStockLevels_router)

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}