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

var parseTime = d3.timeParse("%Y%m");

// $('#example').dataTable( {
//   "columns": [
//     { 0: "Origin_Airport_Code" },
//     { 1: "Destination_Airport_Code" },
//     { 2: "Origin_City" },
//     { 3: "Destination_City" },
//     { 4: "Passengers" },
//     { 5: "Seats" },
//     { 6: "Flights" },
//     { 7: "Distance" },
//     { 8: "Date_(yyyymm)_of_Flight" },
//     { 9: "Origin_Pop" },
//     { 10: "Destination_Pop" },
//   ]
// } );

d3.tsv("../data/JHD_flight_edges.tsv").then(function(data) {
    console.log("Hi John! 3");
    data.forEach(function(d) {
        console.log(d[8]);
        d["8"] = +d["8"];
        d["8"] = parseTime(d["8"]);
     });
    
    
    var xScaler = d3.scaleLinear().domain([d => d3.min(d3.values(d["8"])), d => d3.max(d3.values(d["8"]))]).range([0, chartWidth]);
    var yScaler = d3.scaleLinear().domain([500, 3000]).range([chartHeight, 0]);
    var xAxis = d3.axisBottom(xScaler);
    var yAxis = d3.axisLeft(yScaler);
    
    var date_list = data.forEach(d => d["8"]);
    var date_list_sorted = date_list.sort();
    var date_list_unique = d3.set(date_list_sorted).values();
    var date_list_unique_counts = [];
    for(var i = 0; i < date_list_unique.length; i++){
        z = 0;
        for(var j = 0; j < date_list.length; j++){
            if(date_list[j] === date_list_unique[i]){
                z =+ 1;
            };
        date_list_unique_counts.push(z);
        };
    
    var drawLine = d3
    .line()
    .x(xTimeScale(date_list_unique))
    .y(yLinearScale(date_list_unique_counts));
    
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
    .attr("d", drawLine)
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
    
    }});


    