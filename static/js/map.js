var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 4
});

myMap.scrollWheelZoom.disable()

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: "pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ"
}).addTo(myMap);

function getPaths(origin, start_date, end_date) {
    d3.json('/airport_loc/' + origin + '/' + start_date + '/' + end_date, function(data) {
        // console.log(data);

        top_20 = data.slice(0, 20);
        d3.select("#map").attr('airpot_value', origin);

        var top_20_f_paths = [];
        var colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
            '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
            '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
            '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
            '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC'
        ];

        top_20.forEach((d, i) => {
            var data = {};
            var lat = parseFloat(d.dest_latitude);
            var lng = parseFloat(d.dest_longitude);
            data.from = [-87.6298, 41.8781];
            data.to = [lng, lat];
            data.labels = ["", ""];
            data.color = colors[i];
            data.value = d.all_flights;
            top_20_f_paths.push(data);
        });
        // var migrationGroup;
        // clearLayer();
        var migrationGroup = L.migrationLayer({ data: top_20_f_paths, map: myMap });
        migrationGroup.addTo(myMap);

    });
}

// function clearLayer() {
//     myMap.removeLayer(migrationGroup);
// }
