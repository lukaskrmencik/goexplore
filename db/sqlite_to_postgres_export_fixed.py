# -*- coding: utf-8 -*-
import sqlite3
import psycopg2
from psycopg2.extras import execute_batch

# === KONFIGURACE ===
SQLITE_DB_PATH = "/var/www/goexplore/db/camps_cz.db"  # cesta k SQLite
POSTGRES = {
    "dbname": "goexplore",
    "user": "postgres",
    "password": "Sumec184",
    "host": "localhost",
    "port": 5432
}
SCHEMA = "camps"
EXPORT_SQL_PATH = "/var/www/goexplore/db/postgres_migration.sql"

# === 1?? Připojení k SQLite ===
sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
sqlite_cur = sqlite_conn.cursor()

# === 2?? Připojení k Postgres ===
pg_conn = psycopg2.connect(**POSTGRES)
pg_conn.autocommit = True
pg_cur = pg_conn.cursor()

# === 3?? Aktivace PostGIS ===
pg_cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

# === 4?? Vytvoření schématu ===
pg_cur.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA};")

# === 5?? Definice tabulek (PostgreSQL kompatibilní) ===
TABLES = {
    "camps": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.camps (
            id SERIAL PRIMARY KEY,
            url TEXT UNIQUE,
            name TEXT,
            image_url TEXT,
            lat DOUBLE PRECISION,
            lon DOUBLE PRECISION,
            operating_time_month_from INTEGER,
            operating_time_day_from INTEGER,
            operating_time_month_to INTEGER,
            operating_time_day_to INTEGER,
            web TEXT,
            review TEXT,
            review_count INTEGER,
            price_list_url TEXT,
            accept_cards BOOLEAN,
            timestamp TEXT,
            geom GEOGRAPHY(Point, 4326)
        );
    """,
    "equipment": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.equipment (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            timestamp TEXT
        );
    """,
    "camps_equipment": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.camps_equipment (
            id SERIAL PRIMARY KEY,
            camp_id INTEGER,
            equipment_id INTEGER,
            timestamp TEXT,
            UNIQUE(camp_id, equipment_id)
        );
    """,
    "services": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.services (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            timestamp TEXT
        );
    """,
    "camps_services": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.camps_services (
            id SERIAL PRIMARY KEY,
            camp_id INTEGER,
            service_id INTEGER,
            timestamp TEXT,
            UNIQUE(camp_id, service_id)
        );
    """,
    "accommodation_types": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.accommodation_types (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            timestamp TEXT
        );
    """,
    "camp_accommodation_types": f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.camp_accommodation_types (
            id SERIAL PRIMARY KEY,
            camp_id INTEGER,
            accommodation_type_id INTEGER,
            timestamp TEXT,
            UNIQUE(camp_id, accommodation_type_id)
        );
    """
}

# === 6?? Vytvoření tabulek v Postgresu ===
for tname, tdef in TABLES.items():
    pg_cur.execute(tdef)
print("? Tabulky vytvořeny.")

# === 7?? Přenos dat z SQLite do Postgresu ===

def transfer_table(table, columns):
    sqlite_cur.execute(f"SELECT {', '.join(columns)} FROM {table}")
    rows = sqlite_cur.fetchall()
    if not rows:
        print(f"?? {table}: žádná data")
        return

    placeholders = ", ".join(["%s"] * len(columns))
    cols_pg = ", ".join(columns)
    query = f"INSERT INTO {SCHEMA}.{table} ({cols_pg}) VALUES ({placeholders}) ON CONFLICT DO NOTHING;"
    execute_batch(pg_cur, query, rows)
    print(f"? {table}: přeneseno {len(rows)} řádků")

transfer_table("equipment", ["id", "name", "timestamp"])
transfer_table("services", ["id", "name", "timestamp"])
transfer_table("accommodation_types", ["id", "name", "timestamp"])
transfer_table("camps", [
    "id", "url", "name", "image_url", "lat", "lon",
    "operating_time_month_from", "operating_time_day_from",
    "operating_time_month_to", "operating_time_day_to",
    "web", "review", "review_count", "price_list_url",
    "accept_cards", "timestamp"
])
transfer_table("camps_equipment", ["id", "camp_id", "equipment_id", "timestamp"])
transfer_table("camps_services", ["id", "camp_id", "service_id", "timestamp"])
transfer_table("camp_accommodation_types", ["id", "camp_id", "accommodation_type_id", "timestamp"])

# === 8?? Geom z lat/lon ===
pg_cur.execute(f"""
UPDATE {SCHEMA}.camps
SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
WHERE lat IS NOT NULL AND lon IS NOT NULL;
""")
print("?? Souřadnice převedeny na PostGIS geom.")

# === 9?? Export celé DB do .sql ===
print("?? Exportuji SQL dump...")
pg_cur.execute(f"SET search_path TO {SCHEMA};")

with open(EXPORT_SQL_PATH, "w", encoding="utf-8") as f:
    f.write(f"-- PostgreSQL migration dump\n-- Schema: {SCHEMA}\n\n")
    f.write("CREATE EXTENSION IF NOT EXISTS postgis;\n")
    f.write(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA};\n\n")

    for name, definition in TABLES.items():
        f.write(definition + "\n")

    for table in TABLES.keys():
        pg_cur.execute(f"SELECT * FROM {SCHEMA}.{table}")
        rows = pg_cur.fetchall()
        if not rows:
            continue
        columns = [desc[0] for desc in pg_cur.description]
        for r in rows:
            values = []
            for v in r:
                if v is None:
                    values.append("NULL")
                elif isinstance(v, str):
                    values.append("'" + v.replace("'", "''") + "'")
                elif isinstance(v, bool):
                    values.append("TRUE" if v else "FALSE")
                else:
                    values.append(str(v))
            f.write(f"INSERT INTO {SCHEMA}.{table} ({', '.join(columns)}) VALUES ({', '.join(values)});\n")

    f.write(f"""
-- Update geom
UPDATE {SCHEMA}.camps
SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
WHERE lat IS NOT NULL AND lon IS NOT NULL;
""")

print(f"? SQL dump uložen do: {EXPORT_SQL_PATH}")

# === ?? Uzavření spojení ===
sqlite_cur.close()
sqlite_conn.close()
pg_cur.close()
pg_conn.close()

print("? Všechno hotovo!")
