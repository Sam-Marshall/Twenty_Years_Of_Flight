function getCapacityChart(flight_capacity) {
    d3.select('div#average_flights_capacity').html('');

    var color = 'rgba(0, 255, 0, .5)';
    var radius = 35;
    var border = 7;
    var padding = 15;
    var startPercent = 0;
    var endPercent = flight_capacity / 100;

    var twoPi = Math.PI * 2;
    var formatPercent = d3.format('.0%');
    var boxSize = (radius + padding) * 2;

    var count = Math.abs((endPercent - startPercent) / 0.01);
    var step = endPercent < startPercent ? -0.01 : 0.01;

    var arc = d3.arc()
        .startAngle(0)
        .innerRadius(radius)
        .outerRadius(radius - border);

    var parent = d3.select('div#average_flights_capacity');

    var svg = parent.append('svg')
        .attr('width', boxSize)
        .attr('height', boxSize);

    var header = parent.append('h4').text('Flight Capacity');

    var defs = svg.append('defs');

    var filter = defs.append('filter')
        .attr('id', 'blur');

    filter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '7');

    var g = svg.append('g')
        .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

    var meter = g.append('g')
        .attr('class', 'progress-meter');

    meter.append('path')
        .attr('class', 'background')
        .attr('fill', '#ccc')
        .attr('fill-opacity', 0.5)
        .attr('d', arc.endAngle(twoPi));

    var foreground = meter.append('path')
        .attr('class', 'foreground')
        .attr('fill', color)
        .attr('fill-opacity', 1)
        .attr('stroke', color)
        .attr('stroke-width', 5)
        .attr('stroke-opacity', 1)
        .attr('filter', 'url(#blur)');

    var front = meter.append('path')
        .attr('class', 'foreground')
        .attr('fill', color)
        .attr('fill-opacity', 1);

    var numberText = meter.append('text')
        .attr('fill', 'rgb(199, 199, 199)')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em');

    function updateProgress(progress) {
        foreground.attr('d', arc.endAngle(twoPi * progress));
        front.attr('d', arc.endAngle(twoPi * progress));
        numberText.text(formatPercent(progress));
    }

    var progress = startPercent;

    (function loops() {
        updateProgress(progress);

        if (count > 0) {
            count--;
            progress += step;
            setTimeout(loops, 10);
        }
    })();
}

function getInfoBoxes(airport_code, start_date, end_date) {
    d3.json('/airport_summary/' + airport_code + '/' + start_date + '/' + end_date, function(data) {
        var result = data[0];
        var flight_capacity = parseInt((result['passengers_total'] / result['seats_total']) * 100);
        getCapacityChart(flight_capacity);
        var num_months = parseInt(((end_date - start_date) / 100) * 12) + (end_date % 100) - (start_date % 100);
        var city_pop_millions = (result['origin_pop'] / 1000000).toFixed(1);
        d3.select('#num_months').text(num_months);
        d3.select('#average_distance_traveled').text(result['distance_avg'].toLocaleString('en') + ' mi');
        d3.select('.city_name').text(result['origin_city']);
        d3.select('#city_pop').text(city_pop_millions + 'M');
    });

    getInfoBoxes.update = function(airport_code, start_date, end_date) {
        getInfoBoxes(airport_code, start_date, end_date);
    }
}

function flexFont() {
    var month_parent = document.getElementById("month_parent");
    var flight_parent = document.getElementById("flight_parent");
    var pop_parent = document.getElementById("pop_parent");
    var relFontsize = month_parent.offsetWidth / 50;

    d3.select("#num_months").style('font-size', `${relFontsize}vw`);
    d3.select("#average_distance_traveled").style('font-size', `${relFontsize}vw`);
    d3.select("#city_pop").style('font-size', `${relFontsize}vw`);
};

window.onload = function(event) {
    flexFont();
};
window.onresize = function(event) {
    flexFont();
};