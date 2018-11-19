
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthNumToName(monthnum) {
    return months[monthnum - 1];
}

function pieChart(id, top, start_date, end_date) {
    // var pC ={};    
    var pieDim = {
        w:400,
        h:400
    };

    pieDim.r = Math.min(pieDim.w, pieDim.h) / 3;
    var color = d3.scaleOrdinal(d3.schemeSet3);
            
    // create svg for pie chart.
    var pieGroup = d3.select(id)
        .append("svg")
        .attr("width", pieDim.w)
        .attr("height", pieDim.h)
        .attr("class", "img-responsive center-block")
        .append("g")
        .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
    
    // create function to draw the arcs of the pie slices.
    var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);
    var labelArc = d3.arc().outerRadius(pieDim.r + 5).innerRadius(pieDim.r + 5);

    var url = `/top/${top}/${start_date}/${end_date}`;

    d3.json(url).then(function(top_data) {

        top_data.forEach(function (data) {
            data.flights_total = +data.flights_total;
            data.flights_average = +data.flights_average;
        });

        // create a function to compute the pie slice angles.
        var pie = d3.pie().sort(null).value(d => d.flights_average);

        // Setup the tool tip
        var format = d3.format(",");
        var tool_tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d, i) { 
                return (`${top_data[i].city}<br>Total Flights: ${format(top_data[i].flights_total)}<br>Monthly Average: ${format(top_data[i].flights_average)}`);
            });
        pieGroup.call(tool_tip);

        var g = pieGroup.selectAll(".arc")
            .data(pie(top_data))
            .enter()
            .append("g")
            .attr("class", "arc");
    
        g.append("path")
            .attr("d", arc)
            .attr("value", function(d, i) { return top_data[i].airport; })
            .each(function(d) { this._current = d; })
            .style("fill", function(d, i) { return color(i); })
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide)
            .on("click", function () {
                var value = d3.select(this).attr("value");
                barChart.update(value, start_date, end_date);
            })
            .on("dblclick", function () {
                barChart.update("ALL");
            });
    
        g.append("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d, i) { return top_data[i].airport; });
            
    }); 
 
}

function barChart(id, airport, start_date, end_date) {
    // Define SVG area dimensions
    var svgWidth = 400;
    var svgHeight = 400;

    // Define the chart's margins as an object
    var chartMargin = {
        top: 60,
        right: 30,
        bottom: 30,
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
        .ticks(10,"s");
    var yAxis = d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(6);

    var chartGroup = d3.select(id)
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth)
        .attr("class", "img-responsive center-block")
        .append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
        
    var url = `/airports/${airport}/${start_date}/${end_date}`;

    d3.json(url).then(function(migration_data) {
        
        migration_data.forEach(function (d) {
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
                return (`${d.city}<br>Total Passengers In: ${format(d.passengers_in)}<br>Total Passengers Out: ${format(d.passengers_out)}<br>Total Migration: ${format(d.migration_total)}<br>Average Migration: ${format(d.migration)}`);
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
    barChart.update = function(airport, start_date, end_date){

        var url = `/airports/${airport}/${start_date}/${end_date}`;

        d3.json(url).then(function(migration_data) {

            // update the domain of the y-axis map to reflect change in frequencies.
            // x.domain([d3.min(migration_data, d => d.migration), d3.max(migration_data, d => d.migration)]);
            
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

pieChart("#pie", 20, 199001, 200912);
barChart("#bar", "ALL", 199001, 200912);