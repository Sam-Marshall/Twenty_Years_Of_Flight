function getInfoBoxes(airport_code, start_date, end_date) {
    d3.json('/airport_summary/' + airport_code + '/' + start_date + '/' + end_date, function(data) {
        var result = data[0]
        var num_months = parseInt(((end_date - start_date) / 100) * 12) + (end_date % 100) - (start_date % 100);
        d3.select('#average_flights_out').text(result['flights_out_monthly_avg'].toLocaleString('en'));
        d3.select('#num_months').text(num_months);
        d3.select('#average_distance_traveled').text(result['distance_avg'].toLocaleString('en'));
        d3.select('.city_name').text(result['origin_city']);
        d3.select('#city_pop').text(result['origin_pop'].toLocaleString('en'));
    });

    getInfoBoxes.update = function(airport_code, start_date, end_date) {
        getInfoBoxes(airport_code, start_date, end_date);
    }
}