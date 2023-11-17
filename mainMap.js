/* The svg */
var svg_js = document.getElementById("my_dataviz");
var svg = d3.select("svg");

// Set new width and height
svg_js.setAttribute("width", $(window).width() * 0.725); 
svg_js.setAttribute("height", $(window).height() * 0.75);
width = +svg.attr("width");
height = +svg.attr("height");

/* Map and projection */
var projection = d3.geoNaturalEarth1()
 .scale(height/2.80)
 .center([0,1])
 .translate([width/2, height/2]);

/* Color scale */
var colorScale = d3.scaleThreshold()
 .domain([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
 .range(d3.schemeReds[9]);


 /* Load external data and boot */
var topographicalData, countryNameData;
//FIXME: Add other internet data in side bars
var internetUsageByCountry, populationByCountry;
var selectedYear = 2016;

async function loadData() {
    topographicalData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    countryNameData = await d3.json("./jsonFiles/countryCodeMapper.json")
    populationByCountry = await d3.json("./jsonFiles/countryPopulation.json")
    internetUsageByCountry = await d3.json("./jsonFiles/internetUsageTemp.json")
    displayMap(topographicalData, selectedYear);
}


//Get references to data placeholders
var yearPlaceHolder = document.getElementById("placeholder_Year");
var countryPlaceHolder = document.getElementById("placeholder_Country");
var populationPlaceHolder = document.getElementById("placeholder_Population");
var numUsersPlaceHolder = document.getElementById("placeholder_NumInternetUsers");


/* Year slider */
var minYear = 2000;
var maxYear = 2016;
function setupSlider() {
    var usableYears = []
    for(i = minYear; i < maxYear+1; i++) {usableYears.push(i);}

    var yearList = document.getElementById("yearList");
    for (year of usableYears) {
        var node = document.createElement("option");
        node.innerHTML = year;
        yearList.appendChild(node);
    }
    
    var slider = document.getElementById("yearSlider");
    slider.setAttribute("min", minYear);
    slider.setAttribute("max", maxYear);
    slider.setAttribute("value", selectedYear);

    document.getElementById("sliderWrapper").style.setProperty("--min", minYear);
    document.getElementById("sliderWrapper").style.setProperty("--max", maxYear);
}

function changeYear() {   
    var newYear = document.getElementById("yearSlider").value;
    if(newYear != selectedYear) {
        selectedYear = newYear;
        svg.selectAll("*").remove();
        displayMap(topographicalData, newYear);
    }   
}


/* Mouse movement over the map */
//Hover variables
var transitionDuration = 50;
var defaultOpacity = 1;
var selectedOpacity = 1;
var backgroundOpacity = 0.6;

// Define the tooltip
var tooltipJS = document.getElementById('tooltip');
var tooltip = d3.select("#tooltip")
.attr("class", "tooltip")
.style("opacity", 0)



//Tracking mouse position
var placeTooltip = function(e) {
    tooltipJS.style.top = (e.clientY + 20) + 'px';
    tooltipJS.style.left = (e.clientX + 20) + 'px';
}

let mouseOver = function(d) {
    document.getElementById("my_dataviz").addEventListener('mousemove', placeTooltip);
    document.getElementById("my_dataviz").style.cursor = "pointer";
    
    d3.selectAll(".Country")
        .transition()
        .duration(transitionDuration)
        .style("opacity", backgroundOpacity)
        .style("stroke", "grey")
    d3.select(this)
        .transition()
        .duration(transitionDuration)
        .style("opacity", selectedOpacity)
        .style("stroke", "black")
    
    tooltip.style("opacity", 1)
    countryNameData[d.id] == undefined ? countryPlaceHolder.innerHTML = "No data avaliable" : countryPlaceHolder.innerHTML = countryNameData[d.id]
    //countryNameData[d.id] == undefined ? tooltip.html("No data avaliable") : tooltip.html(countryNameData[d.id]) - old tooltip
     
}

let mouseLeave = function(d) {
    document.getElementById("my_dataviz").removeEventListener('mousemove', placeTooltip);
    document.getElementById("my_dataviz").style.cursor = "default";

    d3.selectAll(".Country")
        .transition()
        .duration(transitionDuration)
        .style("opacity", defaultOpacity)
    d3.select(this)
        .transition()
        .duration(transitionDuration)
        .style("stroke", "grey")
        .style("opacity", defaultOpacity)
        
    tooltip.style("opacity", 0)
}

function displayMap(topoData, year) {
    yearPlaceHolder.innerHTML = year;
    // Draw the map
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
            d.total = internetUsageByCountry[d.id][year]/populationByCountry[d.id][year]; //Using the id from topo.features to match entry in popValueData dictonary for pop value
            if (!isNaN(d.total)) {return colorScale(d.total);}
            return "#fff"
        }
        catch {
            return "#fff" //White is returned if no data is found for that country
        }
        })

        .style("stroke", "grey")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", defaultOpacity)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
}


/* Calling the function to load the data (Kicking everything off) */
setupSlider()
loadData()