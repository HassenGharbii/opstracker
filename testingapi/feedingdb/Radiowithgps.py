import pyodbc
import csv
import os
import time

# === Configuration ===
server = 'localhost'
database = 'admin'
username = 'sa'
password = 'Admin123!'
driver = '{ODBC Driver 17 for SQL Server}'
csv_file_name = '/home/hassen/opstracker/testingapi/feedingdb/RadiowithGPS.csv'  # Adjust the exact file name here
delimiter = ';'  # Adjust if your CSV uses ',' or other

# Get path of CSV file relative to script location
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_file = os.path.join(script_dir, csv_file_name)

def create_admin_database():
    # Connect with autocommit for CREATE DATABASE
    conn = pyodbc.connect(
        f'DRIVER={driver};SERVER={server};DATABASE=master;UID={username};PWD={password}',
        autocommit=True
    )
    cursor = conn.cursor()
    cursor.execute("""
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'admin')
    BEGIN
        CREATE DATABASE admin;
    END
    """)
    conn.close()

def insert_csv_data():
    conn = pyodbc.connect(
        f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    )
    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute('''
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='gps_data' AND xtype='U')
    CREATE TABLE gps_data (
        uid NVARCHAR(100),
        dt DATETIME,
        latitude FLOAT,
        longitude FLOAT,
        speed FLOAT,
        radius FLOAT,
        rssi FLOAT NULL,
        actualForever BIT,
        userName NVARCHAR(100),
        NetworkType INT
    )
    ''')
    conn.commit()

    with open(csv_file, newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=delimiter)

        # Print headers to verify they match your CSV
        print("CSV Headers detected:", reader.fieldnames)

        for row in reader:
            # Access columns safely and normalize keys
            # Adjust these keys if your CSV headers differ in case/spaces
            uid = row.get('uid') or row.get('UID') or row.get('Uid')
            dt = row.get('dt') or row.get('DT') or row.get('DateTime')
            latitude_str = row.get('latitude') or row.get('Latitude')
            longitude_str = row.get('longitude') or row.get('Longitude')
            speed_str = row.get('speed') or row.get('Speed')
            radius_str = row.get('radius') or row.get('Radius')
            rssi_str = row.get('rssi') or row.get('RSSI')
            actualForever_str = row.get('actualForever') or row.get('ActualForever') or '0'
            userName = row.get('userName') or row.get('UserName') or ''
            networkType_str = row.get('NetworkType') or row.get('Networktype') or '0'

            # Convert to proper types (handle commas in floats)
            latitude = float(latitude_str.replace(',', '.')) if latitude_str else None
            longitude = float(longitude_str.replace(',', '.')) if longitude_str else None
            speed = float(speed_str.replace(',', '.')) if speed_str else None
            radius = float(radius_str.replace(',', '.')) if radius_str else None

            rssi = None
            if rssi_str and rssi_str.upper() != 'NULL':
                rssi = float(rssi_str.replace(',', '.'))

            actualForever = int(actualForever_str)
            networkType = int(networkType_str)

            # Insert row
            cursor.execute('''
                INSERT INTO gps_data (uid, dt, latitude, longitude, speed, radius, rssi, actualForever, userName, NetworkType)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                uid,
                dt,
                latitude,
                longitude,
                speed,
                radius,
                rssi,
                actualForever,
                userName,
                networkType
            ))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    print("Waiting 15 seconds for SQL Server to be ready...")
    time.sleep(15)

    print("Creating database if not exists...")
    create_admin_database()

    print("Inserting CSV data...")
    insert_csv_data()

    print("✅ Data inserted successfully.")
