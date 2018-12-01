#################################################
# Dependencies
#################################################
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, render_template, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy

import pymysql
import config

pymysql.install_as_MySQLdb()

#################################################
# Flask Setup
#################################################
app = Flask(__name__, static_url_path='/static')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#################################################
# Database Setup
#################################################
# engine = create_engine("mysql://root:" + config.SQL_password +"@localhost:3306/flights_db")
#local connection#
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root:" + config.SQL_password +"@localhost:3306/flights_db"

#heroku connection#
# app.config["SQLALCHEMY_DATABASE_URI"] = 'mysql://c9q2p7v0f6lehnoz:xbel57nc62sslz7k@r4919aobtbi97j46.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/gz2hw5w2zpkqi113'

db = SQLAlchemy(app)

# Reflect an existing database into a new model and the tables
Base = automap_base()
# Base.prepare(engine, reflect=True)
Base.prepare(db.engine, reflect=True)

#Print names of tables in database
# print(engine.table_names())

# Save reference to the table and create our session (link) from Python to the DB
Flights_cleaned = Base.classes.flights_cleaned
Airports = Base.classes.airports
Airports_month = Base.classes.airports_month
Lat_lng = Base.classes.lat_lng

# session = Session(engine)

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
    results = db.session.query(Airports.airport, Airports.city, Lat_lng.latitude, Lat_lng.longitude).filter(Airports.airport == Lat_lng.airport).all()

    # Create a dictionary from the row data and append to a list of all_passengers
    all_airports = []
    for airport in results:
        airport_dict = {}
        airport_dict["airport"] = airport.airport
        airport_dict["city"] = airport.city
        airport_dict["latitude"] = str(airport.latitude)
        airport_dict["longitude"] = str(airport.longitude)
        all_airports.append(airport_dict)

    return jsonify(all_airports)

@app.route('/airports_month/<airport>/<start_date>/<end_date>')
def months(airport, start_date, end_date):
    """Return a list of airports with their months"""
    # Query all airports
    results = db.session.query(\
                              Airports_month.airport, \
                              Airports_month.city, \
                              Airports_month.month, \
                              Airports_month.year, \
                              Airports_month.flights_total, \
                              Airports_month.fly_month) \
                              .filter(Airports_month.airport == airport) \
                              .filter(Airports_month.fly_month >= start_date) \
                              .filter(Airports_month.fly_month <= end_date) \
                              .all()

    # Create a dictionary from the row data and append to a list of all_passengers
    all_airports_month = []
    for airport in results:
        airport_dict = {}
        airport_dict["airport"] = airport.airport
        airport_dict["city"] = airport.city
        airport_dict["fly_month"] = airport.fly_month
        airport_dict["month"] = airport.month
        airport_dict["year"] = airport.year
        airport_dict["flights_total"] = airport.flights_total
        all_airports_month.append(airport_dict)
        
    data_sorted = sorted(all_airports_month, key=lambda item: item['fly_month'])
    return jsonify(data_sorted)


@app.route('/airport_loc/<origin_airport_code>/<start_date>/<end_date>')
def airport_loc(origin_airport_code, start_date, end_date):

    results = db.session.query(
        func.sum(Flights_cleaned.flights).label('total_flights'),
        func.sum(Flights_cleaned.passengers).label('total_passengers'),
        func.sum(Flights_cleaned.seats).label('total_seats'),
        func.avg(Flights_cleaned.distance).label('flight_distance'),
        func.max(Flights_cleaned.fly_month).label('end_date'),
        func.min(Flights_cleaned.fly_month).label('start_date'),
        Flights_cleaned.origin,
        Flights_cleaned.destination,
        Flights_cleaned.origin_city,
        Flights_cleaned.destination_city,
        Lat_lng.latitude.label('dest_latitude'),
        Lat_lng.longitude.label('dest_longitude')
        ) \
        .filter(Flights_cleaned.destination == Lat_lng.airport) \
        .filter(Flights_cleaned.origin == origin_airport_code) \
        .filter(Flights_cleaned.fly_month >= start_date) \
        .filter(Flights_cleaned.fly_month <= end_date) \
        .group_by(Flights_cleaned.origin, Flights_cleaned.destination, Flights_cleaned.origin_city, Flights_cleaned.destination_city) \
        .order_by(func.sum(Flights_cleaned.flights).desc()) \
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
        airport_dict["dest_latitude"] = str(airport.dest_latitude)
        airport_dict["dest_longitude"] = str(airport.dest_longitude)
        airport_dict["flight_distance"] = int(airport.flight_distance)
        airport_info.append(airport_dict)

    return jsonify(airport_info)

@app.route('/top/<n>/<start_date>/<end_date>')
def top(n, start_date, end_date):
    results = db.session.query(
        Airports_month.airport,
        Airports_month.city,
        func.sum(Airports_month.flights_total).label('flights_total'),
        func.max(Airports_month.fly_month).label('end_date'),
        func.min(Airports_month.fly_month).label('start_date')) \
        .filter(Airports_month.fly_month >= start_date) \
        .filter(Airports_month.fly_month <= end_date) \
        .group_by(Airports_month.airport, Airports_month.city) \
        .order_by(func.sum(Airports_month.flights_total).desc()).all()

    results_top = results[:int(n)]
    top_airports = []
    num_months = (((int(end_date) // 100) - (int(start_date) // 100)) * 12) + (int(end_date) % 100) - (int(start_date) % 100) + 1

    for result in results_top:
        top_dict = {}
        top_dict["airport"] = result.airport
        top_dict["city"] = result.city
        top_dict["start_date"] = result.start_date
        top_dict["end_date"] = result.end_date
        top_dict["flights_total"] = int(result.flights_total)
        top_dict["flights_average"] = int(result.flights_total / num_months)
        top_airports.append(top_dict)

    return jsonify(top_airports)

@app.route('/airports/<airport>/<start_date>/<end_date>')
def airports(airport, start_date, end_date):
    results = db.session.query(
        Airports_month.airport,
        Airports_month.city,
        Airports_month.month,
        func.sum(Airports_month.passengers_in).label('passengers_in'),
        func.sum(Airports_month.passengers_out).label('passengers_out'),
        func.max(Airports_month.fly_month).label('end_date'),
        func.min(Airports_month.fly_month).label('start_date')) \
        .filter(Airports_month.fly_month >= start_date) \
        .filter(Airports_month.fly_month <= end_date) \
        .filter(Airports_month.airport == airport) \
        .group_by(Airports_month.airport, Airports_month.city, Airports_month.month) \
        .order_by(Airports_month.month).all()

    airport_data = []
    for result in results:
        num_years = (int(result.end_date) // 100) - (int(result.start_date) // 100) + 1
        airport_dict = {}
        airport_dict["airport"] = result.airport
        airport_dict["city"] = result.city
        airport_dict["month"] = int(result.month)
        airport_dict["start_date"] = int(result.start_date)
        airport_dict["end_date"] = int(result.end_date)
        airport_dict["passengers_in"] = int(result.passengers_in)
        airport_dict["passengers_out"] = int(result.passengers_out)
        airport_dict["migration_total"] = int(result.passengers_in - result.passengers_out)
        airport_dict["migration"] = int((result.passengers_in - result.passengers_out) / num_years)
        airport_data.append(airport_dict)

    return jsonify(airport_data)

@app.route('/airports/ALL/<start_date>/<end_date>')
def airports_all(start_date, end_date):
    results = db.session.query(
        Airports_month.month,
        func.sum(Airports_month.passengers_in).label('passengers_in'),
        func.sum(Airports_month.passengers_out).label('passengers_out'),
        func.max(Airports_month.fly_month).label('end_date'),
        func.min(Airports_month.fly_month).label('start_date')) \
        .filter(Airports_month.fly_month >= start_date) \
        .filter(Airports_month.fly_month <= end_date) \
        .group_by(Airports_month.month) \
        .order_by(Airports_month.month).all()

    airport_all_data = []
    for result in results:
        num_years = (int(result.end_date) // 100) - (int(result.start_date) // 100) + 1
        airport_dict = {}
        airport_dict["airport"] = "ALL"
        airport_dict["city"] = "ALL"
        airport_dict["month"] = int(result.month)
        airport_dict["start_date"] = int(result.start_date)
        airport_dict["end_date"] = int(result.end_date)
        airport_dict["passengers_in"] = int(result.passengers_in)
        airport_dict["passengers_out"] = int(result.passengers_out)
        airport_dict["migration_total"] = int(result.passengers_in - result.passengers_out)
        airport_dict["migration"] = int((result.passengers_in - result.passengers_out) / num_years)
        airport_all_data.append(airport_dict)

    return jsonify(airport_all_data)

@app.route('/airport_lookup/<airport_code>')
def airport_loc_lookup(airport_code):
    results = db.session.query(Lat_lng).filter(Lat_lng.airport == airport_code).all()
    information = []
    for result in results:
        airport_dict = {}
        airport_dict['airport'] = result.airport
        airport_dict['latitude'] = str(result.latitude)
        airport_dict['longitude'] = str(result.longitude)
        information.append(airport_dict)
    return jsonify(information)

@app.route('/airport_summary/<airport_code>/<start_date>/<end_date>')
def airport_summary(airport_code, start_date, end_date):
    results = db.session.query(
        Flights_cleaned.origin, 
        Flights_cleaned.origin_city, 
        func.max(Flights_cleaned.fly_month).label('end_date'),
        func.min(Flights_cleaned.fly_month).label('start_date'),
        func.sum(Flights_cleaned.distance * Flights_cleaned.flights).label('total_distance'),
        func.avg(Flights_cleaned.origin_pop).label('avg_origin_pop'),
        func.sum(Flights_cleaned.flights).label('total_flights'),
        func.sum(Flights_cleaned.passengers).label('total_passengers'),
        func.sum(Flights_cleaned.seats).label('total_seats'),
        )\
        .filter(Flights_cleaned.origin == airport_code)\
        .filter(Flights_cleaned.fly_month >= start_date) \
        .filter(Flights_cleaned.fly_month <= end_date) \
        .group_by(
            Flights_cleaned.origin, 
            Flights_cleaned.origin_city
        ).all()

    information = []
    for result in results:
        airport_dict = {}
        airport_dict['airport'] = result.origin
        airport_dict['origin_city'] = result.origin_city
        airport_dict['date_end'] = result.end_date
        airport_dict['date_start'] = result.start_date
        airport_dict['distance_total'] = int(result.total_distance)
        airport_dict['distance_avg'] = int(int(result.total_distance) / int(result.total_flights))
        airport_dict['origin_pop'] = int(result.avg_origin_pop)
        airport_dict['flights_out_total'] = int(result.total_flights)
        airport_dict['flights_out_monthly_avg'] = int(int(result.total_flights) / ((int(result.end_date - result.start_date) / 100) * 12))
        airport_dict['passengers_total'] = int(result.total_passengers)
        airport_dict['seats_total'] = int(result.total_seats)
        information.append(airport_dict)
    return jsonify(information)

if __name__ == "__main__":
    app.run(debug=True)