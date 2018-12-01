function getPaths(origin, start_date, end_date) {
    d3.json('/airport_lookup/' + origin, function(origin_data) {

        var origin_lat = origin_data[0].latitude;
        var origin_lng = origin_data[0].longitude;

        var myMap = L.map("map", {
            center: [origin_lat, origin_lng],
            zoom: 4
        });

        myMap.scrollWheelZoom.disable()

        L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: "pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ"
        }).addTo(myMap);

        d3.json('/airport_loc/' + origin + '/' + start_date + '/' + end_date, function(data) {
            top_20 = data.slice(0, 20);
            d3.select("#map").attr('airport_value', origin);

            var top_20_f_paths = [];
            var top_20_info = [];

            var colors = ['#FFFF66', '#FFE86F', '#FFD179', '#FFB982', '#FFA28B',
                '#FF8B94', '#FF749E', '#FF5DA7', '#FF2EB9', '#FF00CC',
                '#33FF00', '#41C746', '#46B55D', '#4AA274', '#4F908B',
                '#537DA2', '#586BB9', '#5D58D1', '#6146E8', '#6633FF'
            ]

            top_20.forEach((d, i) => {
                var data = {};
                var all_data = {};

                var lat = parseFloat(d.dest_latitude);
                var lng = parseFloat(d.dest_longitude);

                data.from = [origin_lng, origin_lat];
                data.to = [lng, lat];
                data.labels = ["", ""];
                data.color = colors[i];
                data.value = i + 1;
                top_20_f_paths.push(data);

                d.origin_lat = origin_lat;
                d.origin_lng = origin_lng;
                top_20_info.push(d);
            });
            getTable(top_20_info, colors, myMap);
            var migrationGroup = L.migrationLayer({ data: top_20_f_paths, map: myMap, maxWidth: 20 });
            migrationGroup.addTo(myMap);
        });
    });

    getPaths.update = function(origin, start_date, end_date) {
        map.remove();
        d3.select('#map_parent').html('<div id="map" style="height: 50vh; width: 100%;"></div>');
        getPaths(origin, start_date, end_date);
    }

}

function getTable(table_data, colors, myMap) {
    d3.select("#table_body").html('');
    d3.select("#table_body")
        .selectAll("tr")
        .data(table_data)
        .enter()
        .append("tr")
        .html(function(d, i) {
            return `<th scope="row">${i + 1}</th>
                    <td>${d.dest_city}</td>
                    <td>${parseInt(d.all_flights).toLocaleString('en')}</td>`;
        }).on('mouseover', function(d, i) {
            d3.select(this).style('background-color', colors[i]);
            d3.select(this).style('color', 'black');
        }).on('mouseout', function(d, i) {
            d3.select(this).style('background-color', 'rgba(30, 30, 30, .75)');
            d3.select(this).style('color', 'rgb(199, 199, 199)');
        }).on('click', function(d, i) {

            d3.select('.leaflet-marker-pane').html('');
            d3.select('tbody').attr('flight_dest', d.dest_airport);
            console.log(d);
            airportLineGraph("#dest_line", d.dest_airport, d.start_date, d.end_date);

            var airplaneIcon = L.icon({
                iconUrl: '/static/images/airplane.png',
                iconSize: [40, 70],
                popupAnchor: [0, -15]
            });

            var customOptions = {
                'maxWidth': '500',
                'className': 'custom'
            }
            console.log(d);
            var location = [parseFloat(d.dest_latitude), parseFloat(d.dest_longitude)]
            var marker = L.marker(location, { icon: airplaneIcon }).bindPopup(
                "<h6>" + d.dest_city + " (" + d.dest_airport + ")" + "</h6>" +
                `<p>Flight Distance: ${parseInt(d.flight_distance).toLocaleString('en')} miles</p>` +
                `<p>Flights: ${parseInt(d.all_flights).toLocaleString('en')}</p>` +
                `<p>Passengers: ${parseInt(d.all_passengers).toLocaleString('en')}</p>` +
                `<p>Seats: ${parseInt(d.all_seats).toLocaleString('en')}</p>`, customOptions
            ).addTo(myMap);
        });
    d3.select("#table_body").attr('flight_origin', table_data[0].origin_airport);
    d3.select("#table_body").attr('start_date', table_data[0].start_date);
    d3.select("#table_body").attr('end_date', table_data[0].end_date);
}