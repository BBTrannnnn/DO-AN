import urllib
import pyodbc
import mysql.connector

class Config:
    SECRET_KEY = '123456789'

    params = urllib.parse.quote_plus(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ANHBAHUNG;"
        "DATABASE=DO_AN;"
        "UID=sa;"
        "PWD=123456789"
    )

    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={params}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    MYSQL_USER = 'root'
    MYSQL_PASSWORD = '123456'
    MYSQL_HOST = 'localhost'
    MYSQL_DB = 'do_an'
    MYSQL_URI = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

    # Khai báo bind 2 DB cho SQLAlchemy
    SQLALCHEMY_BINDS = {
        'sqlserver': SQLALCHEMY_DATABASE_URI,
        'mysql': MYSQL_URI
    }


    

    