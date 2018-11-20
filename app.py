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

# Save reference to the table and create our session (link) from Python to the DB
Airports = Base.classes.airports
Airports_month = Base.classes.airports_month
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

@app.route('/airports_month')
def months():
    """Return a list of airports with their months"""
    # Query all airports
    results = db.session.query(Airports_month).all()

    # Create a dictionary from the row data and append to a list of all_passengers
    all_airports_month = []
    for airport in results:
        airport_dict = {}
        airport_dict["airport"] = airport.airport
        airport_dict["fly_month"] = airport.fly_month
        airport_dict["month"] = airport.month
        airport_dict["year"] = airport.year
        airport_dict["flights_in"] = airport.flights_in
        airport_dict["flights_out"] = airport.flights_out
        airport_dict["flights_total"] = airport.flights_total
        all_airports_month.append(airport_dict)

    return jsonify(all_airports_month)



if __name__ == "__main__":
    app.run(debug=True)