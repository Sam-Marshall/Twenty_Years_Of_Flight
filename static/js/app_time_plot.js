var airports_list = [];
var airports_list_list = [];

function airportLineGraph(id, airport, start_date, end_date) {
    //Creating the canvas
    var svgWidth = 600;
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
        .select("body")
        .append("svg")
        .attr("height", svgHeight + chartMargin.top + chartMargin.bottom)
        .attr("width", svgWidth + chartMargin.left + chartMargin.right);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    //To convert numbers of the for yyyymm into dates
    var parseTime = d3.timeParse("%Y%m");

    //To scale graph and points onto our canvas
    var xScaler = d3.scaleTime().range([0, chartWidth]);
    var yScaler = d3.scaleLinear().range([chartHeight, 0]);

    //To draw the line on the graph
    var drawLine = d3
        .line()
        .x(d => xScaler(d.fly_month))
        .y(d => yScaler(d.flights_total));

    var url = `/airports_month/${airport}/${start_date}/${end_date}`;



    //Importing data
    d3.json(url, function(data) {
        console.log(data);
        //Making sure our values are what we expect
        data.forEach(function(d) {
            d.fly_month = parseTime(d.fly_month);
            d.flights_total = +d.flights_total;
        });

        airports_list.push(data);
        airports_list_list.push(data);
        console.log(airports_list);
        console.log(airports_list_list);

        //         xScaler.domain(d3.extent(data, d => d.fly_month));
        //         yScaler.domain(d3.extent(data, d => d.flights_total));
        xScaler.domain([d3.min(airports_list[0], d => d.fly_month), d3.max(airports_list[0], d => d.fly_month)]);
        yScaler.domain([d3.min(airports_list[0], d => d.flights_total), d3.max(airports_list[0], d => d.flights_total)]);
        var xAxis = d3.axisBottom(xScaler);
        var yAxis = d3.axisLeft(yScaler);

        //Setting up tool_tip
        var tool_tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d, i) {
                return (`${d[0].airport}<br>${d[0].city}`);
            });
        chartGroup.call(tool_tip);

        //Adding in the line itself
        chartGroup.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("class", "line")
            .attr("d", drawLine)
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide)

        //Adding in the axes
        chartGroup.append("g").attr("class", "x axis").attr("transform", `translate(0, ${chartHeight})`).call(xAxis);
        chartGroup.append("g").attr("class", "y axis").call(yAxis);

        //Adding in labels for the axes
        chartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (-45) + "," + (chartHeight / 2) + ")rotate(-90)")
            .text("Flights");

        chartGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (chartWidth / 2) + "," + (chartHeight + 35) + ")")
            .text("Date");

    });


    airportLineGraph.update = function(airport, start_date, end_date) {

        var url = `/airports_month/${airport}/${start_date}/${end_date}`;

        //Using code from earlier
        var svgWidth = 600;
        var svgHeight = 400;
        var chartMargin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 70
        };
        var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
        var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
        var parseTime = d3.timeParse("%Y%m");
        var xScaler = d3.scaleTime().range([0, chartWidth]);
        var yScaler = d3.scaleLinear().range([chartHeight, 0]);
        var drawLine = d3
            .line()
            .x(d => xScaler(d.fly_month))
            .y(d => yScaler(d.flights_total));
        d3.selectAll("path.line").remove();

        //Importing updated data
        d3.json(url, function(updatedData) {

            updatedData.forEach(function(d) {
                d.fly_month = parseTime(d.fly_month);
                d.flights_total = +d.flights_total;
            });

            Array.prototype.push.apply(airports_list[0], updatedData);

            //Making sure our values are what we expect
            airports_list.forEach(function(data) {
                data.forEach(function(d) {
                    d.flights_total = +d.flights_total;
                });
            });

            console.log(airports_list[0]);
            airports_list_list.push(updatedData);

            //Appropriate Scaling
            //             xScaler.domain(d3.extent(airports_list[0], d => d.fly_month));
            //             yScaler.domain(d3.extent(airports_list[0], d => d.flights_total));
            xScaler.domain([d3.min(airports_list[0], d => d.fly_month), d3.max(airports_list[0], d => d.fly_month)]);
            yScaler.domain([d3.min(airports_list[0], d => d.flights_total), d3.max(airports_list[0], d => d.flights_total)]);
            var xAxis = d3.axisBottom(xScaler);
            var yAxis = d3.axisLeft(yScaler);

            //Setting up tool_tip
            var tool_tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-8, 0])
                .html(function(d, i) {
                    return (`${d[0].airport}<br>${d[0].city}`);
                });
            chartGroup.call(tool_tip);
            var svg = d3.select("body").transition();
            //             svg.select("line").datum(d).duration(750).attr("d", drawLine);
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);

            airports_list_list.forEach(function(d) {
                //Changing the graph and line
                chartGroup.append("path")
                    .datum(d)
                    .attr("fill", "none")
                    .attr("class", "line")
                    .attr("d", drawLine)
                    .on('mouseover', tool_tip.show)
                    .on('mouseout', tool_tip.hide)
            });

        });
    };
};

function deleteLines() {
    d3.selectAll("path.line").remove();
    airports_list[0] = [];
    airports_list_list = [];
};

airportLineGraph("#line", "ORD", 199001, 200912);