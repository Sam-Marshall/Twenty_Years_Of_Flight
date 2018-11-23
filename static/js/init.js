
function slider() {

    var slider = createD3RangeSlider(0, 19, "#slider-container");
    slider.range(0, 19);
    var begin = 0;
    var end = 19;

    slider.onChange(newRange => {
        var newBegin = newRange.begin;
        var newEnd = newRange.end;
        if ((begin != newBegin) || (end != newEnd)) {
            var start_year = newBegin + 1990;
            var end_year = newEnd + 1990;
            begin = newBegin;
            end = newEnd;
            d3.select("#range-label")
                .text(start_year + " - " + end_year)
                .attr("start_year", start_year)
                .attr("end_year", end_year);
        }
    });
}

function button() {

    var filterButton = d3.select("#filter-btn");

    // Complete the click handler for the form
    filterButton.on("click", function() {

        // Prevent the page from refreshing
        d3.event.preventDefault();

        var start_year = d3.select("#range-label").attr("start_year");
        var end_year = d3.select("#range-label").attr("end_year");

        d3.selectAll(".start_date").text(start_year);
        d3.selectAll(".end_date").text(end_year);
        
        pieChart.update(20, start_year * 100 + 1, end_year * 100 + 12);
        barChart.update("ALL", start_year * 100 + 1, end_year * 100 + 12);
    
    });
}

slider();
button();
pieChart("#pie", 20, 199001, 200912);
barChart("#bar", "ALL", 199001, 200912);
getPaths("ORD", 199001, 200912);