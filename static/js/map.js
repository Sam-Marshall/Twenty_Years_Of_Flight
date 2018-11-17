var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 5
});

myMap.scrollWheelZoom.disable()

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: "pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ"
}).addTo(myMap);

var flying = [{ "from": [-118.2705, 33.9984], "to": [-122.789336, 37.920458], "labels": ["Los Angeles", "San Francisco"], "color": "#ff3a31", "value": 25 }];

d3.json('/airports', function(data) {
    console.log(data);
});

L.migrationLayer({data: flying, map: myMap}).addTo(myMap);