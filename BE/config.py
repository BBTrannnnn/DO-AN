import urllib

class Config:
    SECRET_KEY = '123456789'

    params = urllib.parse.quote_plus(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=LAPTOP-8RQ75SPH;"
        "DATABASE=DO_AN;"
        "UID=sa;"
        "PWD=123456789"
    )

    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={params}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
