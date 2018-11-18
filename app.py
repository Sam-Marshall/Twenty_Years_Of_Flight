#################################################
# Dependencies
#################################################
import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, render_template, redirect, jsonify

import pymysql
import config

pymysql.install_as_MySQLdb()

#################################################
# Database Setup
#################################################
engine = create_engine("mysql://root:" + config.SQL_password +"@localhost:3306/flights_db")
# Reflect an existing database into a new model and the tables
Base = automap_base()
Base.prepare(engine, reflect=True)

#Print names of tables in database

print(engine.table_names())

# Save reference to the table and create our session (link) from Python to the DB
Flights_cleaned = Base.classes.flights_cleaned
Airports = Base.classes.airports
Airports_month = Base.classes.airports_month
Lat_lng = Base.classes.lat_lng

session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################
@app.route('/')
def home():
    """Return the homepage."""
    return render_template("index.html")

@app.route('/airports')
def names():
    """Return a list of airports"""
    # Query all airports
    results = session.query(Airports).all()

    # Create a dictionary from the row data and append to a list of all_passengers
    all_airports = []
    for airport in results:
        airport_dict = {}
        airport_dict["airport"] = airport.airport
        airport_dict["city"] = airport.city
        airport_dict["state"] = airport.state
        airport_dict["flights_out"] = airport.flights_out
        airport_dict["flights_in"] = airport.flights_in
        airport_dict["flights_total"] = airport.flights_total
        airport_dict["passengers_out"] = airport.passengers_out
        airport_dict["passengers_in"] = airport.passengers_in
        airport_dict["passengers_total"] = airport.passengers_total
        all_airports.append(airport_dict)

    return jsonify(all_airports)

@app.route('/airport_loc/<origin_airport_code>/<start_date>/<end_date>')
def test(origin_airport_code, start_date, end_date):
    results = session.query( \
                func.sum(Flights_cleaned.flights).label('total_flights'), \
                func.sum(Flights_cleaned.passengers).label('total_passengers'), \
                func.sum(Flights_cleaned.seats).label('total_seats'), \
                func.max(Flights_cleaned.fly_month).label('end_date'), \
                func.min(Flights_cleaned.fly_month).label('start_date'), \
                Flights_cleaned.origin, \
                Flights_cleaned.destination, \
                Flights_cleaned.origin_city, \
                Flights_cleaned.destination_city, \
                Lat_lng.latitude, \
                Lat_lng.longitude \
                ) \
                .filter(Flights_cleaned.destination == Lat_lng.airport) \
                .filter(Flights_cleaned.origin == origin_airport_code) \
                .filter(Flights_cleaned.fly_month >= start_date) \
                .filter(Flights_cleaned.fly_month <= end_date) \
                .group_by(Flights_cleaned.origin, Flights_cleaned.destination, Flights_cleaned.origin_city, Flights_cleaned.destination_city) \
                .order_by(func.sum(Flights_cleaned.flights).desc()) \
                .order_by(Flights_cleaned.destination.desc()) \
                .all()
    airport_info = []
    for airport in results:
        airport_dict = {}
        airport_dict["origin_airport"] = airport.origin
        airport_dict["dest_airport"] = airport.destination
        airport_dict["origin_city"] = airport.origin_city
        airport_dict["dest_city"] = airport.destination_city
        airport_dict["end_date"] = str(airport.end_date)
        airport_dict["start_date"] = str(airport.start_date)
        airport_dict["all_flights"] = str(airport.total_flights)
        airport_dict["all_passengers"] = str(airport.total_passengers)
        airport_dict["all_seats"] = str(airport.total_seats)
        airport_dict["dest_latitude"] = str(airport.latitude)
        airport_dict["dest_longitude"] = str(airport.longitude)
        airport_info.append(airport_dict)
    return jsonify(airport_info)

if __name__ == "__main__":
    app.run(debug=True)