create database flights_db;

use flights_db;

create table flights_all (
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

load data local infile '/Users/stacymarshall/Desktop/flight_edges.tsv' into table flights_all;

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

alter table flights_cleaned modify passengers INTEGER;
alter table flights_cleaned modify seats INTEGER;
alter table flights_cleaned modify flights INTEGER;
alter table flights_cleaned add column id int(10) primary key auto_increment;

create table airports_month as
select
	a.airport,
    a.city,
    a.state,
	a.fly_month,
    a.fly_month div 100 as year,
    a.fly_month mod 100 as month,
	a.flights_out,
    b.flights_in,
    (a.flights_out + b.flights_in) as flights_total,
    a.passengers_out,
    b.passengers_in,
    (a.passengers_out + b.passengers_in) as passengers_total,
    (b.passengers_in - a.passengers_out) as migration
from (
	select origin as airport, origin_city as city, origin_state as state, fly_month, sum(flights) as flights_out, sum(passengers) as passengers_out
	from flights_cleaned
	group by 1, 2, 3, 4
) as a inner join (
	select destination as airport, destination_city as city, destination_state as state, fly_month, sum(flights) as flights_in, sum(passengers) as passengers_in
	from flights_cleaned
	group by 1, 2, 3, 4
) as b
on a.airport = b.airport and a.fly_month = b.fly_month
order by airport, fly_month;

alter table airports_month add column id int(10) primary key auto_increment;

alter table airports_month modify flights_out INTEGER;
alter table airports_month modify flights_in INTEGER;
alter table airports_month modify flights_total INTEGER;
alter table airports_month modify passengers_out INTEGER;
alter table airports_month modify passengers_in INTEGER;
alter table airports_month modify passengers_total INTEGER;
alter table airports_month modify migration INTEGER;

create table airports as
select
	airport,
    city,
    state,
	sum(flights_out) as flights_out,
    sum(flights_in) as flights_in,
    sum(flights_total) as flights_total,
    sum(passengers_out) as passengers_out,
    sum(passengers_in) as passengers_in,
    sum(passengers_total) as passengers_total
from airports_month
group by 1, 2, 3;

alter table airports
add primary key(airport);

alter table airports modify flights_out INTEGER;
alter table airports modify flights_in INTEGER;
alter table airports modify flights_total INTEGER;
alter table airports modify passengers_out INTEGER;
alter table airports modify passengers_in INTEGER;
alter table airports modify passengers_total INTEGER;

create table lat_lng(
	airport VARCHAR(3),
	latitude DECIMAL(10,7),
	longitude DECIMAL (10,7)
);

-- import  lat_lng_min.csv file using import wizrd

alter table lat_lng
add primary key(airport);