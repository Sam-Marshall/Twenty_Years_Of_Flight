var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthNumToName(monthnum) {
    return months[monthnum - 1];
}

function pieChart(id, top, start_date, end_date) {

    var pieDim = {
        w: 400,
        h: 300
    };

    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2.5;
    // var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var color = ['#FFFF66', '#FFE86F', '#FFD179', '#FFB982', '#FFA28B',
        '#FF8B94', '#FF749E', '#FF5DA7', '#FF2EB9', '#FF00CC',
        '#33FF00', '#41C746', '#46B55D', '#4AA274', '#4F908B',
        '#537DA2', '#586BB9', '#5D58D1', '#6146E8', '#6633FF'
    ]

    // create svg for pie chart.
    var pieGroup = d3.select(id)
        .append("svg")
        .attr("width", pieDim.w)
        .attr("height", pieDim.h)
        .attr("class", "img-responsive center-block")
        .append("g")
        .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

    // create function to draw the arcs of the pie slices.
    var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);
    var labelArc = d3.arc().outerRadius(pieDim.r + 5).innerRadius(pieDim.r + 5);

    var url = `/top/${top}/${start_date}/${end_date}`;

    d3.json(url, function(top_data) {

        top_data.forEach(function(d) {
            d.flights_total = +d.flights_total;
            d.flights_average = +d.flights_average;
        });

        // create a function to compute the pie slice angles.
        var pie = d3.pie().sort(null).value(d => d.flights_average);

        // Setup the tool tip
        var format = d3.format(",");
        var pie_tool_tip = d3.tip()
            .attr("class", "d3-tip")
            .attr("id", "pie-tooltip")
            .offset([-8, 0])
            .html(function(d) {
                return (`${d['data'].city}<br>Total Flights: ${format(d['data'].flights_total)}<br>Monthly Average: ${format(d['data'].flights_average)}`);
            });
        pieGroup.call(pie_tool_tip);

        var g = pieGroup.selectAll(".arc")
            .data(pie(top_data))
            .enter()
            .append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .attr("value", function(d, i) { return top_data[i].airport; })
            .attr("start_date", start_date)
            .attr("end_date", end_date)
            .each(function(d) { this._current = d; })
            .style("fill", function(d, i) { return color[i]; })
            .on('mouseover', pie_tool_tip.show)
            .on('mouseout', pie_tool_tip.hide)
            .on("click", function() {
                var value = d3.select(this).attr("value");
                var start = d3.select(this).attr("start_date");
                var end = d3.select(this).attr("end_date");
                d3.select('tbody').attr('flight_dest', '');
                barChart.update(value, start, end);
                getPaths.update(value, start, end);
                getInfoBoxes.update(value, start, end);
                airportLineGraph("#origin_line", value, start, end);
            })
            // .on("dblclick", function() {
            //     var start = d3.select(this).attr("start_date");
            //     var end = d3.select(this).attr("end_date");
            //     barChart.update("ALL", start, end);
            // });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d, i) { return top_data[i].airport; });

    });

    // create function to update the bars. This will be used by pie-chart.
    pieChart.update = function(top, start_date, end_date) {

        var url = `/top/${top}/${start_date}/${end_date}`;

        d3.json(url, function(top_data) {

            top_data.forEach(function(data) {
                data.flights_total = +data.flights_total;
                data.flights_average = +data.flights_average;
            });

            // create a function to compute the pie slice angles.
            var pie = d3.pie().sort(null).value(d => d.flights_average);

            pieGroup.selectAll("path")
                .data(pie(top_data))
                .transition()
                .duration(500)
                .attr("value", function(d, i) { return top_data[i].airport; })
                .attr("start_date", start_date)
                .attr("end_date", end_date)
                .each(function(d) { this._current = d; })
                .attrTween("d", arcTween);

            pieGroup.selectAll("text")
                .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
                .text(function(d, i) { return top_data[i].airport; });

        });
    }

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) { return arc(i(t)); };
    }


}

function barChart(id, airport, start_date, end_date) {
    // Define SVG area dimensions
    var svgWidth = 400;
    var svgHeight = 300;

    // Define the chart's margins as an object
    var chartMargin = {
        top: 20,
        right: 30,
        bottom: 40,
        left: 30
    };
    // Define dimensions of the chart area
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

    var x = d3.scaleLinear()
        .range([0, chartWidth]);
    var y = d3.scaleBand()
        .range([0, chartHeight])
        .padding(0.1);

    var xAxis = d3.axisBottom(x)
        .ticks(10, "s");
    var yAxis = d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(6);

    var chartGroup = d3.select(id)
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth)
        .attr("class", "img-responsive center-block")
        .append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`)
        .attr("airport_value", airport)
        .attr("id", 'bar_chart');

    var url = `/airports/${airport}/${start_date}/${end_date}`;

    d3.json(url, function(migration_data) {

        migration_data.forEach(function(d) {
            d.migration = +d.migration;
            d.migration_total = +d.migration_total;
            d.passengers_in = +d.passengers_in;
            d.passengers_out = +d.passengers_out;
        });

        // x.domain([d3.min(migration_data, d => d.migration), d3.max(migration_data, d => d.migration)]);
        x.domain([-100000, 100000]);
        y.domain(migration_data.map(d => monthNumToName(d.month)));

        // Setup the tool tip
        var format = d3.format(",");
        var tool_tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
                return (`<b>${d.city}</b><br>Total Passengers In: ${format(d.passengers_in)}<br>Total Passengers Out: ${format(d.passengers_out)}<br>Total Migration: ${format(d.migration_total)}<br>Average Migration: ${format(d.migration)}`);
            });
        chartGroup.call(tool_tip);

        chartGroup.selectAll(".bar")
            .data(migration_data)
            .enter()
            .append("rect")
            .attr("class", function(d) { return "bar bar--" + (d.migration < 0 ? "negative" : "positive"); })
            .attr("x", function(d) { return x(Math.min(0, d.migration)); })
            .attr("y", d => y(monthNumToName(d.month)))
            .attr("width", function(d) { return Math.abs(x(d.migration) - x(0)); })
            .attr("height", y.bandwidth())
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide);

        chartGroup.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chartHeight + ")")
            .call(xAxis);

        chartGroup.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(-100000) + ",0)")
            .call(yAxis);

    });

    // create function to update the bars. This will be used by pie-chart.
    barChart.update = function(airport, start_date, end_date) {

        var url = `/airports/${airport}/${start_date}/${end_date}`;
        d3.select('#bar_chart').attr('airport_value', airport);
        d3.selectAll('.airport_name').text(airport);

        d3.json(url, function(migration_data) {

            migration_data.forEach(function(d) {
                d.migration = +d.migration;
                d.migration_total = +d.migration_total;
                d.passengers_in = +d.passengers_in;
                d.passengers_out = +d.passengers_out;
            });

            // Attach the new data to the bars.
            chartGroup.selectAll(".bar").data(migration_data);

            // transition the height and color of rectangles.
            chartGroup.selectAll("rect").transition().duration(500)
                .attr("class", function(d) { return "bar bar--" + (d.migration < 0 ? "negative" : "positive"); })
                .attr("x", function(d) { return x(Math.min(0, d.migration)); })
                .attr("width", function(d) { return Math.abs(x(d.migration) - x(0)); });
        });
    }

}