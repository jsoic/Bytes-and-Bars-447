/* The svg */
var svg_js = document.getElementById("my_dataviz");
var svg = d3.select("svg");

// Set new width and height
svg_js.setAttribute("width", $(window).width() * 0.725); 
svg_js.setAttribute("height", $(window).height() * 0.75);
width = +svg.attr("width");
height = +svg.attr("height");

/* Map and projection */
//var path = d3.geoPath();
var projection = d3.geoNaturalEarth1()
 .scale(height/2.80)
 .center([0,1])
 .translate([width/2, height/2]);

/* Color scale */
//var internetData = d3.map();
var colorScale = d3.scaleThreshold()
 .domain([0, 1000000, 10000000, 25000000, 50000000, 75000000, 100000000, 500000000]) //FIXME: Find min & max for the selected year and adjust scale based on that
 .range(d3.schemeReds[9]);


 /* Load external data and boot */
var topographicalData, countryNameData;
//TODO: Add other internet data
var valueData; //FIXME: Rename to something more helpful once other data is added

async function loadData() {
    topographicalData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    countryNameData = await d3.json("./jsonFiles/countryCodeMapper.json")
    valueData = await d3.json("./jsonFiles/internetUsageTemp.json")
    displayMap(topographicalData);
}

//TODO//FIXME: Turn this into a year slider based on years avaliable
var x = 2016;
function myFunction() {
 x = document.getElementById("myText").value;
 displayMap(topographicalData)
}


function displayMap(topoData) {

 let mouseOver = function(d) { //FIXME: Look though mouseOver and mouseLeave and clean up 
   d3.selectAll(".Country")
     .transition()
     .duration(50)
     .style("opacity", .5)
     .style("stroke", "grey")
   d3.select(this)
     .transition()
     .duration(50)
     .style("opacity", 1)
     .style("stroke", "black")
   
     //Tooltip - WIP //TODO: Implement working tool tip in correct position that just displays country name
   try{
     tip.style("opacity", 1)
     .html(countryNameData[d.id] + " " + valueData[d.id][2016])
     .style("left", (d3.event.pageX-25) + "px")
     .style("top", (d3.event.pageY-75) + "px")
   }
   catch { 
      tip.style("opacity", 1)
       .html("No data avaliable")
       .style("left", (d3.event.pageX-25) + "px")
       .style("top", (d3.event.pageY-75) + "px")
   }

 }

 let mouseLeave = function(d) {
   d3.selectAll(".Country")
     .transition()
     .duration(50)
     .style("opacity", .8)
     .style("stroke", "grey")
   d3.select(this)
     .transition()
     .duration(50)
     .style("stroke", "grey")
     
     //Tooltip - WIP
     tip.style("opacity", 0)
 }

 // Define the div for the tooltip
 var tip = d3.select("p1").append("div")
 .attr("class", "tooltip")
 .style("opacity", 0)


 // Draw the map //TODO: Clean and funtionize this code
 svg.append("g")
   .selectAll("path")
   .data(topoData.features) //sets the "d" variable to be topo.features for this function
   .enter()
   .append("path")
     // draw each country
     .attr("d", d3.geoPath()
       .projection(projection)
     )
     
     // set the color of each country
     .attr("fill", function (d) {
       try {
         d.total = valueData[d.id][x]; //Using the id from topo.features to match entry in popValueData dictonary for pop value
         return colorScale(d.total);
       }
       catch {
         //Value is set to -1 if no data is found for that country
         d.total = -1
         return "#fff"
       }
     })

     .style("stroke", "grey")
     .attr("class", function(d){ return "Country" } )
     .style("opacity", .8)
     .on("mouseover", mouseOver )
     .on("mouseleave", mouseLeave )
   }

/* Calling the function to load the data (Kicking everything off) */
loadData()