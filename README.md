# UAInnovate2026


To set up .venv: 

cd fastapi_project
python3 -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]"


To run: 

in fastapi_project folder, run: 
uvicorn app.main:app --reload

backend is runnong on http://127.0.0.1:8000 


To add historic data, add the csv to fastapi_project/data and run the following command in the fastapi_project directory: 

python -m scripts.import_historic_stock_data --file data/filename.csv

Note that the docker environment must be running before you do this. To do that, you run the command: 

docker compose up -d