function airportLineGraph(){
    //Creating the canvas
    var svgWidth = 1000;
    var svgHeight = 500;

    var chartMargin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 90
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
    .y(d => yScaler(d.flights_out));





    //Importing data
    d3.json("/airports_month", function(data) {
        data.forEach(function (d) {
            d.fly_month = parseTime(d.fly_month);
            d.flights_out = +d.flights_out;
        });
        xScaler.domain(d3.extent(data, d => d.fly_month));
        yScaler.domain(d3.extent(data, d => d.flights_out));
        var xAxis = d3.axisBottom(xScaler);
        var yAxis = d3.axisLeft(yScaler);

        //Adding in the line itself
        chartGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("d", drawLine)

        //Adding in the axes
        chartGroup.append("g").attr("transform", `translate(0, ${chartHeight})`).call(xAxis);
        chartGroup.append("g").call(yAxis);

        //Adding in labels for the axes
        chartGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (1/2) +","+(chartHeight/2)+")rotate(-90)")
        .text("Flights");

        chartGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (chartWidth/2) +","+(chartHeight + 26)+")")
        .text("Date");

         });
};

