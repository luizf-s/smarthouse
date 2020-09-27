from mysql import connector


def get_db_connection():
    try:
        return connector.connect(host="server_database_1", user="root", password="password1234", database="SMARTHOUSE")
    except connector.errors.DatabaseError:
        connection =  connector.connect(host="server_database_1", user="root", password="password1234")
        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE SMARTHOUSE")
        return get_db_connection()
