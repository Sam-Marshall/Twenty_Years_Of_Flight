var airport_list = []
var colors = ["#00ff00", "#ff00ba"]

function airportLineGraph(id, airport, start_date, end_date) {

    //Needs: 1. Style Axis labels to not be black, 2. Legend, 3. Think about including tool tips and what information you would want to see, 4. Responsiveness on screen shrink (it fits the size of the screen that it was initialized on. It maintains that shape regardless of screen size change), 5. Perhaps needs vertical line drawn

    if (id == '#origin_line') {
        airport_list = [];
        d3.select('#dest_line_title').style('display', 'none');
    }

    d3.select('#line').html('');

    var svgWidth = document.getElementById('line').offsetWidth;
    var svgHeight = 400;
    var chartMargin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 70
    };

    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

    var svg = d3
        .select("#line")
        .append("svg")
        .attr("height", svgHeight + chartMargin.top + chartMargin.bottom)
        .attr("width", svgWidth + chartMargin.left + chartMargin.right);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    var xScaler = d3.scaleTime().range([0, chartWidth]);
    var yScaler = d3.scaleLinear().range([chartHeight, 0]);

    var parseTime = d3.timeParse("%Y%m");
    var drawLine = d3
        .line()
        .x(d => xScaler(d.fly_month))
        .y(d => yScaler(d.flights_total));

    var url = `/airports_month/${airport}/${start_date}/${end_date}`;

    if (id == '#dest_line') {
        d3.select('#dest_line_title').style('display', 'inline-block');
        d3.select('.dest_name').html(airport);
    }

    d3.json(url, function(data) {

        data.forEach(function(d) {
            d.fly_month = parseTime(d.fly_month);
            d.flights_total = +d.flights_total;
        });

        if (id == '#origin_line') {
            airport_list[0] = data;
            xScaler.domain([d3.min(data, d => d.fly_month), d3.max(data, d => d.fly_month)]);
            yScaler.domain([d3.min(data, d => d.flights_total), d3.max(data, d => d.flights_total)]);
        } else {
            airport_list[1] = data;
            month_mins = [
                d3.min(airport_list[0], d => d.fly_month),
                d3.min(airport_list[1], d => d.fly_month)
            ]
            month_maxs = [
                d3.max(airport_list[0], d => d.fly_month),
                d3.max(airport_list[1], d => d.fly_month)
            ]

            flight_mins = [
                d3.min(airport_list[0], d => d.flights_total),
                d3.min(airport_list[1], d => d.flights_total)
            ]
            flight_maxs = [
                d3.max(airport_list[0], d => d.flights_total),
                d3.max(airport_list[1], d => d.flights_total)
            ]

            xScaler.domain([d3.min(month_mins), d3.max(month_maxs)]);
            yScaler.domain([d3.min(flight_mins), d3.max(flight_maxs)]);
        }

        var xAxis = d3.axisBottom(xScaler);
        var yAxis = d3.axisLeft(yScaler);
        var counter = 0

        airport_list.forEach(data => {

            // var tool_tip = d3.tip()
            //     .attr("class", "d3-tip")
            //     .offset([0, 0])
            //     .html(function(data, i) {
            //         return (`${data[i].airport}<br>${data[i].city}`);
            //     });
            // chartGroup.call(tool_tip);

            chartGroup.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("class", "line")
                .attr("d", drawLine)
                .style("stroke", (d, i) => {
                    console.log('Color # ' + i);
                    return colors[counter];
                })
            // .on('mouseover', tool_tip.show)
            // .on('mouseout', tool_tip.hide)
            counter += 1;
        });

        chartGroup.append("g").attr("class", "x axis").attr("transform", `translate(0, ${chartHeight})`).call(xAxis);
        chartGroup.append("g").attr("class", "y axis").call(yAxis);

        chartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (-45) + "," + (chartHeight / 2) + ")rotate(-90)")
            .attr('class', 'line_label')
            .text("Total Flights");

        chartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (chartWidth / 2) + "," + (chartHeight + 35) + ")")
            .attr('class', 'line_label')
            .text("Date");

    });

};