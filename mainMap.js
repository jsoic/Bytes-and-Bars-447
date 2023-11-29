/* The map svg */
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
//Setting up color scale
var colorScale = d3.scaleThreshold()
 .domain([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
 .range(d3.schemeReds[9]);

//Filing static color key
document.getElementById("colorError").style.backgroundColor = "#fff"
document.getElementById("color0").style.backgroundColor = colorScale(.05);
document.getElementById("color0").style.backgroundColor = colorScale(.05);
document.getElementById("color1").style.backgroundColor = colorScale(.1);
document.getElementById("color2").style.backgroundColor = colorScale(.2);
document.getElementById("color3").style.backgroundColor = colorScale(.3);
document.getElementById("color4").style.backgroundColor = colorScale(.4);
document.getElementById("color5").style.backgroundColor = colorScale(.5);
document.getElementById("color6").style.backgroundColor = colorScale(.6);
document.getElementById("color7").style.backgroundColor = colorScale(.7);
document.getElementById("color8").style.backgroundColor = colorScale(.8);


/* Load external data and boot */
var topographicalData, countryNameData;
var internetUsageByCountry, populationByCountry;
var selectedYear = 2016;

async function loadData() {
    topographicalData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    countryNameData = await d3.json("./jsonFiles/countryCodeMapper.json")
    populationByCountry = await d3.json("./jsonFiles/countryPopulation.json")
    internetUsageByCountry = await d3.json("./jsonFiles/internetUsageTemp.json")
    displayMap(topographicalData, selectedYear);
}


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

        //Clean up data display
        countryPlaceHolder.innerHTML = "";
        populationPlaceHolder.innerHTML = "";
        numUsersPlaceHolder.innerHTML = "";
        percentPopPlaceHolder.innerHTML = "";

        //Update Map
        displayMap(topographicalData, newYear);
    }   

}


/* Mouse movement over the map */
//Hover variables
var transitionDuration = 50;
var defaultOpacity = 1;
var selectedOpacity = 1;
var backgroundOpacity = 0.6;

//Get references to data placeholders for side bar
var yearPlaceHolder = document.getElementById("placeholder_Year");
var countryPlaceHolder = document.getElementById("placeholder_Country");
var populationPlaceHolder = document.getElementById("placeholder_Population");
var numUsersPlaceHolder = document.getElementById("placeholder_NumInternetUsers");
var percentPopPlaceHolder = document.getElementById("placeholder_NumPercentPop");

//Tracking mouse position
let mouseOver = function(d) {
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
    
    //Need to check and ensure data for each display is in the corresponding data sets
    
    if(countryNameData[d.id] == undefined) {
        countryPlaceHolder.innerHTML = "No data";
        populationPlaceHolder.innerHTML = "No data";
        numUsersPlaceHolder.innerHTML = "No data";
        percentPopPlaceHolder.innerHTML = "No data";
    }
    else {
        countryPlaceHolder.innerHTML = countryNameData[d.id];
        populationPlaceHolder.innerHTML = (populationByCountry[d.id][selectedYear] == undefined) ? "No data" : populationByCountry[d.id][selectedYear].toLocaleString('en-US');
        numUsersPlaceHolder.innerHTML = (internetUsageByCountry[d.id][selectedYear] == undefined) ? "No data" : internetUsageByCountry[d.id][selectedYear].toLocaleString('en-US');
        percentPopPlaceHolder.innerHTML = (internetUsageByCountry[d.id][selectedYear] == undefined ||  populationByCountry[d.id][selectedYear] == undefined) ? "No data" : (internetUsageByCountry[d.id][selectedYear]/populationByCountry[d.id][selectedYear]).toLocaleString('en-US', {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

let mouseLeave = function(d) {
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
}

let clickCountry = function(d) {
    if (countryNameData[d.id] != undefined) {
        window.location.href = "popup.html?country=" + d.id + "&year=" + selectedYear;
    }
}

/* Main map display function */
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
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("click", clickCountry);
}


/* Calling the function to load the data (Kicking everything off) */
setupSlider()
loadData()