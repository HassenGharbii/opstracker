from flask import Flask, jsonify
import pyodbc

app = Flask(__name__)

server = 'localhost'
database = 'admin'
username = 'sa'
password = 'Admin123!'
driver = '{ODBC Driver 17 for SQL Server}'

def get_db_connection():
    conn = pyodbc.connect(
        f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    )
    return conn

@app.route('/gps_data', methods=['GET'])
def get_gps_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT TOP 10 * FROM gps_data')  # Get 10 rows for example
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    results = []
    for row in rows:
        results.append(dict(zip(columns, row)))
    conn.close()
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
