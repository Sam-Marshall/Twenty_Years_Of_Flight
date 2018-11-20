var svgWidth = 1060;
var svgHeight = 860;

var chartMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

var svg = d3
  .select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// var parseTime = d3.timeParse("%Y%m");
console.log("Hi John! 1");

d3.json("/airports_month").then(function(data) {
    console.log("Hi John! 2");
    var xScaler = d3.scaleLinear().domain([d => d3.min(d3.values(d.fly_month)), d => d3.max(d3.values(d.fly_month))]).range([0, chartWidth]);
    var yScaler = d3.scaleLinear().domain([500, 3000]).range([chartHeight, 0]);
    var xAxis = d3.axisBottom(xScaler);
    var yAxis = d3.axisLeft(yScaler);
    
    // Might NOT use
//     var date_list = []
//     data.forEach(d => date_list.push(d.fly_month));
//     var date_list_sorted = date_list.sort();
//     var date_list_unique = d3.set(date_list_sorted).values();
//     var date_flights = [];
//     data.forEach(d => date_flights.push(d.flights_out));
//     var date_list_unique_counts = [];
//     for(var i = 0; i < date_list_unique.length; i++){
//         z = 0;
//         for(var j = 0; j < date_list.length; j++){
//             if(date_list[j] === date_list_unique[i]){
//                 z =+ 1;
//             };
//         date_list_unique_counts.push(z);
//         };
    
    var drawLine = d3
    .line()
    .x(xScaler(data.fly_month))
    .y(yScaler(data.flights_out));
    console.log(drawLine(data));
    
//     var line = d3.line()
//     .x(date_list_unique)
//     .y(date_list_unique_counts)
//     x.domain(d3.extent(date_list_unique));
//     y.domain(d3.extent(date_list_unique_counts));
    
    chartGroup.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", drawLine(data))
    .classed("line", true);
    
    
    chartGroup.append("g").attr("transform", `translate(0, ${chartHeight})`).call(xAxis);
    chartGroup.append("g").call(yAxis);
    
    chartGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (1/2) +","+(chartHeight/2)+")rotate(-90)")
    .text("Flights");

    chartGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (chartWidth/2) +","+(chartHeight + 25)+")")
    .text("Date");
    
     });


    