CREATE DATABASE flights_db;

USE flights_db;

CREATE TABLE flights_all (
  origin VARCHAR(3),
  destination VARCHAR(3),
  origin_city VARCHAR(30),
  destination_city VARCHAR(30),
  passengers INTEGER,
  seats INTEGER,
  flights INTEGER,
  distance INTEGER,
  fly_month INTEGER,
  origin_pop INTEGER,
  destination_pop INTEGER
);

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/flight_edges.tsv' INTO TABLE flights_all;

create table flights_cleaned as
select 
	origin,
	destination,
	origin_city,
    substring(origin_city, -2, 2) as origin_state,
    destination_city,
    substring(destination_city, -2, 2) as destination_state,
    fly_month,
    max(distance) as distance,
    max(origin_pop) as origin_pop,
    max(destination_pop) as destination_pop,
    sum(passengers) as passengers,
    sum(seats) as seats, 
    sum(flights) as flights 
from flights_all
where origin <> destination
group by origin, destination, origin_city, destination_city, origin_state, destination_state, fly_month;

create table airports as
select distinct origin as airport, origin_city as city, origin_state as state
from flights_cleaned
order by origin;


select a.*, sum(b.flights) as flights_out
from airports as a left join flights_cleaned as b
on a. airport = b.origin
group by 1, 2, 3;
