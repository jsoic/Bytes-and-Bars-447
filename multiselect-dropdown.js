var style = document.createElement("style");
style.setAttribute("id", "multiselect_dropdown_styles");
style.innerHTML = `
.multiselect-dropdown{
  display: inline-block;
  padding: 2px 5px 0px 5px;
  border-radius: 4px;
  border: solid 1px #ced4da;
  background-color: white;
  position: relative;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right .75rem center;
  background-size: 16px 12px;
  width: 100% !important;

}
.multiselect-dropdown span.optext, .multiselect-dropdown span.placeholder{
  margin-right:0.5em; 
  margin-bottom:2px;
  padding:1px 0; 
  border-radius: 4px; 
  display:inline-block;
}
.multiselect-dropdown span.optext{
  background-color:lightgray;
  padding:1px 0.75em; 
}
.multiselect-dropdown span.optext .optdel {
  float: right;
  margin: 0 -6px 1px 5px;
  font-size: 0.7em;
  margin-top: 2px;
  cursor: pointer;
  color: #666;
}
.multiselect-dropdown span.optext .optdel:hover { color: #c66;}
.multiselect-dropdown span.placeholder{
  color:#ced4da;
}
.multiselect-dropdown-list-wrapper{
  box-shadow: gray 0 3px 8px;
  z-index: 100;
  padding:2px;
  border-radius: 4px;
  border: solid 1px #ced4da;
  display: none;
  margin: -1px;
  position: absolute;
  top:0;
  left: 0;
  right: 0;
  background: white;
}
.multiselect-dropdown-list-wrapper .multiselect-dropdown-search{
  margin-bottom:5px;
}
.multiselect-dropdown-list{
  padding:2px;
  height: 15rem;
  overflow-y:auto;
  overflow-x: hidden;
}
.multiselect-dropdown-list::-webkit-scrollbar {
  width: 6px;
}
.multiselect-dropdown-list::-webkit-scrollbar-thumb {
  background-color: #bec4ca;
  border-radius:3px;
}

.multiselect-dropdown-list div{
  padding: 5px;
}
.multiselect-dropdown-list input{
  height: 1.15em;
  width: 1.15em;
  margin-right: 0.35em;  
}
.multiselect-dropdown-list div.checked{
}
.multiselect-dropdown-list div:hover{
  background-color: #ced4da;
}
.multiselect-dropdown span.maxselected {width:100%;}
.multiselect-dropdown-all-selector {border-bottom:solid 1px #999;}
`;
document.head.appendChild(style);

function MultiselectDropdown(options) {
  var config = {
    search: true,
    height: "15rem",
    placeholder: "select",
    txtSelected: "selected",
    txtAll: "All",
    txtRemove: "Remove",
    txtSearch: "search",
    ...options,
  };
  function newEl(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs !== undefined)
      Object.keys(attrs).forEach((k) => {
        if (k === "class") {
          Array.isArray(attrs[k])
            ? attrs[k].forEach((o) => (o !== "" ? e.classList.add(o) : 0))
            : attrs[k] !== ""
            ? e.classList.add(attrs[k])
            : 0;
        } else if (k === "style") {
          Object.keys(attrs[k]).forEach((ks) => {
            e.style[ks] = attrs[k][ks];
          });
        } else if (k === "text") {
          attrs[k] === "" ? (e.innerHTML = "&nbsp;") : (e.innerText = attrs[k]);
        } else e[k] = attrs[k];
      });
    return e;
  }

  document.querySelectorAll("select[multiple]").forEach((el, k) => {
    var div = newEl("div", {
      class: "multiselect-dropdown",
      style: {
        width: config.style?.width ?? el.clientWidth + "px",
        padding: config.style?.padding ?? "",
      },
    });
    el.style.display = "none";
    el.parentNode.insertBefore(div, el.nextSibling);
    var listWrap = newEl("div", { class: "multiselect-dropdown-list-wrapper" });
    var list = newEl("div", {
      class: "multiselect-dropdown-list",
      style: { height: config.height },
    });
    var search = newEl("input", {
      class: ["multiselect-dropdown-search"].concat([
        config.searchInput?.class ?? "form-control",
      ]),
      style: {
        width: "100%",
        display:
          el.attributes["multiselect-search"]?.value === "true"
            ? "block"
            : "none",
      },
      placeholder: config.txtSearch,
    });
    listWrap.appendChild(search);
    div.appendChild(listWrap);
    listWrap.appendChild(list);

    el.loadOptions = () => {
      list.innerHTML = "";

      if (el.attributes["multiselect-select-all"]?.value == "true") {
        var op = newEl("div", { class: "multiselect-dropdown-all-selector" });
        var ic = newEl("input", { type: "checkbox" });
        op.appendChild(ic);
        op.appendChild(newEl("label", { text: config.txtAll }));

        op.addEventListener("click", () => {
          op.classList.toggle("checked");
          op.querySelector("input").checked =
            !op.querySelector("input").checked;

          var ch = op.querySelector("input").checked;
          list
            .querySelectorAll(
              ":scope > div:not(.multiselect-dropdown-all-selector)"
            )
            .forEach((i) => {
              if (i.style.display !== "none") {
                i.querySelector("input").checked = ch;
                i.optEl.selected = ch;
              }
            });

          el.dispatchEvent(new Event("change"));
        });
        ic.addEventListener("click", (ev) => {
          ic.checked = !ic.checked;
        });
        el.addEventListener("change", (ev) => {
          let itms = Array.from(
            list.querySelectorAll(
              ":scope > div:not(.multiselect-dropdown-all-selector)"
            )
          ).filter((e) => e.style.display !== "none");
          let existsNotSelected = itms.find(
            (i) => !i.querySelector("input").checked
          );
          if (ic.checked && existsNotSelected) ic.checked = false;
          else if (ic.checked == false && existsNotSelected === undefined)
            ic.checked = true;
        });

        list.appendChild(op);
      }

      Array.from(el.options).map((o) => {
        var op = newEl("div", { class: o.selected ? "checked" : "", optEl: o });
        var ic = newEl("input", { type: "checkbox", checked: o.selected });
        op.appendChild(ic);
        op.appendChild(newEl("label", { text: o.text }));

        op.addEventListener("click", () => {
          op.classList.toggle("checked");
          op.querySelector("input").checked =
            !op.querySelector("input").checked;
          op.optEl.selected = !!!op.optEl.selected;
          el.dispatchEvent(new Event("change"));
        });
        ic.addEventListener("click", (ev) => {
          ic.checked = !ic.checked;
        });
        o.listitemEl = op;
        list.appendChild(op);
      });
      div.listEl = listWrap;

      div.refresh = () => {
        div
          .querySelectorAll("span.optext, span.placeholder")
          .forEach((t) => div.removeChild(t));
        var sels = Array.from(el.selectedOptions);
        if (
          sels.length > (el.attributes["multiselect-max-items"]?.value ?? 5)
        ) {
          div.appendChild(
            newEl("span", {
              class: ["optext", "maxselected"],
              text: sels.length + " " + config.txtSelected,
            })
          );
        } else {
          sels.map((x) => {
            var c = newEl("span", {
              class: "optext",
              text: x.text,
              srcOption: x,
            });
            if (el.attributes["multiselect-hide-x"]?.value !== "true")
              c.appendChild(
                newEl("span", {
                  class: "optdel",
                  text: "🗙",
                  title: config.txtRemove,
                  onclick: (ev) => {
                    c.srcOption.listitemEl.dispatchEvent(new Event("click"));
                    div.refresh();
                    ev.stopPropagation();
                  },
                })
              );

            div.appendChild(c);
          });
        }
        if (0 == el.selectedOptions.length)
          div.appendChild(
            newEl("span", {
              class: "placeholder",
              text: el.attributes["placeholder"]?.value ?? config.placeholder,
            })
          );
      };
      div.refresh();
    };
    el.loadOptions();

    search.addEventListener("input", () => {
      list
        .querySelectorAll(":scope div:not(.multiselect-dropdown-all-selector)")
        .forEach((d) => {
          var txt = d.querySelector("label").innerText.toUpperCase();
          d.style.display = txt.includes(search.value.toUpperCase())
            ? "block"
            : "none";
        });
    });

    div.addEventListener("click", () => {
      div.listEl.style.display = "block";
      search.focus();
      search.select();
    });

    document.addEventListener("click", function (event) {
      if (!div.contains(event.target)) {
        listWrap.style.display = "none";
        div.refresh();
      }
    });
  });
}

window.addEventListener("load", () => {
  MultiselectDropdown(window.MultiselectDropdownOptions);
});

/////////GET CHARTS TO WORK///////////
// function updateChart() {
   
//   // Get selected data set and countries
//   const selectedDataSet = document.getElementById("field1").value;
//   const selectedCountries = Array.from(
//     document.getElementById("field2").selectedOptions
//   ).map((option) => option.value);
//   console.log(selectedDataSet[0])
//   try {
//     const chartData = getChartData(selectedDataSet[0], selectedCountries);
    
//     drawLineChart(chartData);
//   } catch (error) {
//     console.error("Error updating chart:", error);
//   }
// }

// function getChartData(dataSet, countries) {
   
//   // Fetch or calculate data based on selected data set and countries
//   // This is a placeholder, you'll need to implement this based on your data source
//   const dataFileMap = {
//     "1": "averageYearsOfSchool.json",
//     "2": "childMortalityRate.json",
//     "3": "cross-country-literacy-rates.json",
//     "4": "GDPpercaptia.json",
//     "5": "happinessIndex.json",
//     "6": "humanDevelopmentIndex.json",
//     "7": "life-expectancy-undp.json",
//     "8": "share-of-population-in-extreme-poverty.json",
//     "9": "unemployment-rate.json",
//     "10": "voterPercent.json",
//   };
//   const dataFileName = dataFileMap[dataSet];
//   if (!dataFileName) {
//     console.error("Invalid dataset selected");
//     return;
//   }
//   // Construct the file path
//   const filePath = "./jsonFiles/" + dataFileName;
//   return fetchData(filePath).then((data) => {
//     // Filter or process the data based on selected countries
//     // Return the processed data
//     return processDataForCountries(data, countries);
//   });
// }

// function fetchData(filePath) { 
//   return fetch(filePath)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .catch((error) => {
//       console.error(
//         "There has been a problem with your fetch operation:",
//         error
//       );
//     });
// }
// function processDataForCountries(data, countries) {
//   let processedData = [];

//   // Loop through each country in the countries array
//   countries.forEach((countryCode) => {
//     // Check if the country code exists in the data
//     if (data[countryCode]) {
//       // Extract the year-value pairs for the country
//       let countryData = data[countryCode];

//       // Transform the data into a format suitable for a line chart
//       // For example, an array of objects with 'year' and 'value' properties
//       let formattedData = Object.keys(countryData).map((year) => {
//         return {
//           year: year,
//           value: countryData[year],
//           country: countryCode, // Optionally include country code
//         };
//       });

//       // Combine the data from this country with the overall processed data
//       processedData = processedData.concat(formattedData);
//     }
//   });
//   return processedData;
// }
// function drawLineChart(data) {
//   console.log("drawLineChart called", data);
//   // Convert year strings to numbers
//   data.forEach(d => {
//       d.year = +d.year; // Convert string to number
//   });

//   // Set the dimensions and margins of the graph
//   const margin = { top: 10, right: 30, bottom: 30, left: 60 },
//       width = 460 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

//   // Append the svg object to the body of the page
//   const svg = d3.select("#visualization-container")
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//   // Set the x-axis to range from 2000 to 2016
//   const x = d3.scaleLinear()
//       .domain([2000, 2016])
//       .range([0, width]);
//   svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x));

//   // Add Y axis
//   const y = d3.scaleLinear()
//       .domain([0, d3.max(data, d => +d.value)])
//       .range([height, 0]);
//   svg.append("g")
//       .call(d3.axisLeft(y));

//   // Group the data by country
//   const sumstat = d3.group(data, d => d.country);

//   // color palette
//   const color = d3.scaleOrdinal()
//       .domain(Array.from(sumstat.keys()))
//       .range(d3.schemeCategory10);

//   // Draw the line
//   sumstat.forEach((values, key) => {
//       svg.append("path")
//           .datum(values)
//           .attr("fill", "none")
//           .attr("stroke", color(key))
//           .attr("stroke-width", 1.5)
//           .attr("d", d3.line()
//               .x(d => x(d.year))
//               .y(d => y(d.value))
//           );
//   });
// }


// // Update the chart when the selection changes 
// console.log(document.getElementById("field1"))
// console.log(document.getElementById("field2"))
// document.getElementById("field1").addEventListener("change", updateChart);
// document.getElementById("field2").addEventListener("change", updateChart);

// // Initial chart update
// updateChart();

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////


//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////


async function updateAndDrawChart() {
  // Define your data file mapping
  const dataFileMap = {
    "1": "averageYearsOfSchool.json",
    "2": "childMortalityRate.json",
    "3": "cross-country-literacy-rates.json",
    "4": "GDPpercaptia.json",
    "5": "happinessIndex.json",
    "6": "humanDevelopmentIndex.json",
    "7": "life-expectancy-undp.json",
    "8": "share-of-population-in-extreme-poverty.json",
    "9": "unemployment-rate.json",
    "10": "voterPercent.json",
  };

  // Get selected data set and countries
  const selectedDataSet = document.getElementById("field1").value;
  const selectedCountries = Array.from(document.getElementById("field2").selectedOptions).map(option => option.value);

  // Fetch data
  try {
      const dataFileName = dataFileMap[selectedDataSet];
      if (!dataFileName) {
          throw new Error("Invalid dataset selected");
      }
      const filePath = "./jsonFiles/" + dataFileName;
      const response = await fetch(filePath);
      if (!response.ok) {
          throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Process data
      let processedData = processData(data, selectedCountries);

      // Draw chart
      drawChart(processedData);
  } catch (error) {
      console.error("Error in updateAndDrawChart:", error);
  }
}

function processData(data, countries) {
  let processedData = [];

  // Loop through each country in the countries array
  countries.forEach((countryCode) => {
    // Check if the country code exists in the data
    if (data[countryCode]) {
      // Extract the year-value pairs for the country
      let countryData = data[countryCode];

      // Transform the data into a format suitable for a line chart
      // For example, an array of objects with 'year' and 'value' properties
      let formattedData = Object.keys(countryData).map((year) => {
        return {
          year: year,
          value: countryData[year],
          country: countryCode, // Optionally include country code
        };
      });

      // Combine the data from this country with the overall processed data
      processedData = processedData.concat(formattedData);
    }
  });
  return processedData;
}

function drawChart(data) {
  console.log("drawLineChart called", data);
  // Convert year strings to numbers
  data.forEach(d => {
      d.year = +d.year; // Convert string to number
  });

  // Set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  const svg = d3.select("#visualization-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set the x-axis to range from 2000 to 2016
  const x = d3.scaleLinear()
      .domain([2000, 2016])
      .range([0, width]);
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.value)])
      .range([height, 0]);
  svg.append("g")
      .call(d3.axisLeft(y));

  // Group the data by country
  const sumstat = d3.group(data, d => d.country);

  // color palette
  const color = d3.scaleOrdinal()
      .domain(Array.from(sumstat.keys()))
      .range(d3.schemeCategory10);

  // Draw the line
  sumstat.forEach((values, key) => {
      svg.append("path")
          .datum(values)
          .attr("fill", "none")
          .attr("stroke", color(key))
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
              .x(d => x(d.year))
              .y(d => y(d.value))
          );
  });
}

// Event listeners
document.getElementById("field1").addEventListener("change", updateAndDrawChart);
document.getElementById("field2").addEventListener("change", updateAndDrawChart);

// Initial chart update
updateAndDrawChart();
