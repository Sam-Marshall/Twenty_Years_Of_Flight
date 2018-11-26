function airportLineGraph(id, airport, start_date, end_date){
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
        
        //Making sure our values are what we expect
        data.forEach(function (d) {
            d.fly_month = parseTime(d.fly_month);
            d.flights_out = +d.flights_total;
        });
        xScaler.domain(d3.extent(data, d => d.fly_month));
        yScaler.domain(d3.extent(data, d => d.flights_total));
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
        .attr("transform", "translate("+ (-45) +","+(chartHeight/2)+")rotate(-90)")
        .text("Flights");

        chartGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (chartWidth/2) +","+(chartHeight + 35)+")")
        .text("Date");

         });
};
    
airportLineGraph.update = function(airport, start_date, end_date){

    var url = `/airports_month/${airport}/${start_date}/${end_date}`;


    //Importing updated data
    d3.json(url, function(updatedData) {
        
        //Making sure our values are what we expect
        data.forEach(function (d) {
            d.fly_month = parseTime(d.fly_month);
            d.flights_out = +d.flights_total;
        });

        //Appropriate Scaling
        xScaler.domain(d3.extent(data, d => d.fly_month));
        yScaler.domain(d3.extent(data, d => d.flights_total));
        var xAxis = d3.axisBottom(xScaler);
        var yAxis = d3.axisLeft(yScaler);

        //Changing the graph and line
        var svg = d3.select("body").transition();
        svg.select("line").datum(updatedData).duration(750).attr("d", drawLine);
        svg.select(".x.axis").duration(750).call(xAxis);
        svg.select(".y.axis").duration(750).call(yAxis);

        });
};

airportLineGraph("#line", "ABE", 199001, 200912);