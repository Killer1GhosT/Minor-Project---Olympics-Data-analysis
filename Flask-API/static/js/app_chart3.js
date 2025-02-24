// from data.js
var tableData = data;

var myMap = L.map("map", {
  center: [0, 0],
  zoom: 2
 });
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', { 
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  tileSize: 512,
  zoomOffset: -1,
      //id: "mapbox.streets",
  id: "mapbox/streets-v11", 
  accessToken: API_KEY
  }).addTo(myMap);


// YOUR CODE HERE!

// Get a reference to the table body
var tbody = d3.select("tbody");

// Console.log the ufo data from data.js
//console.log(data);

// use Arrow Functions to load data
data.forEach((ufoData) => {
  var row = tbody.append("tr");
  Object.entries(ufoData).forEach(([key, value]) => {
    var cell = row.append("td");
    cell.text(value);
  });
});


// Select the button
var button = d3.select("#filter-btn");

// Select the filter
var form = d3.select("#filters");

// Create event handlers 
button.on("click", runEnter);
form.on("submit",runEnter);
var currentLayers = [];
function runEnter() {
  
  if (currentLayers.length != 0) {
      currentLayers.forEach(function (layer){
         myMap.removeLayer(layer);
         console.log("testing if this is working");
         console.log(layer);
        })
    };
  currentLayers = [];

   // Prevent the page from refreshing
  //d3.event.preventDefault();

  // Select all the input elements and get the raw HTML node
  var inputElement1 = d3.select("#type");
  var inputElement2 = d3.select("#year");
  var inputElement3 = d3.select("#gold");
  //console.log(inputElement1);
  //console.log(inputElement2);
  //console.log(inputElement3);

   // Get the value property of the input element
  var inputValue1 = inputElement1.property("value") ;
  var inputValue2 = inputElement2.property("value") ;
  var inputValue3 = inputElement3.property("value") ;
  //console.log(typeof inputValue1,typeof inputValue2,inputValue3 );
  
  if (inputValue1 !== null) {

    //log input values in console
    //console.log(inputValue);
    //console.log(tableData);

    //var filteredData = tableData.filter((tableufodata => tableufodata.type === inputValue1) && (tableufodata => tableufodata.year === inputValue2) && (tableufodata => tableufodata.gold === inputValue3));
    var filteredData = tableData.filter(tableufodata => tableufodata.type === inputValue1 && tableufodata.year === inputValue2 && tableufodata.inputValue3 !== null);
    //var filteredData = tableData.filter((tableData.type === inputValue1) && (tableData.year === inputValue2) && (tableData.gold === inputValue3));
    //console.log(filteredData);

    tbody.html("")

    //create table with filtered data
    filteredData.forEach((ufoFilteredData) => {

      //console.log(ufoFilteredData);
      
      var row = tbody.append("tr");
      Object.entries(ufoFilteredData).forEach(([key, value]) => {
         var cell = row.append("td");
         cell.text(value);
        
      });
     });

     //console.log(filteredData) ;
    
    // Define a markerSize function that will give each city a different radius based on its population
    function markerSize(medal) {
      return medal * 10000;
    }
  
    // Loop through the cities array and create one marker for each city object
   for (var i = 0; i < filteredData.length; i++) {
      var location = [filteredData[i].latitude, filteredData[i].longitude];
      console.log(location);
      console.log(typeof filteredData[i].latitude)
        
        if (inputValue3 == "gold") {
          //myMap.clearLayers();
          //myMap.clear();
          currentLayers.push( L.circle(location, {
          fillOpacity: 0.75,
          color: "white",
          fillColor: "purple",
          radius: markerSize(filteredData[i].gold)
        }).bindPopup("<h1>" + filteredData[i].region + "</h1> <hr> <h3>Gold: " + filteredData[i].gold + "</h3>").addTo(myMap));
        } else if(inputValue3 == "silver") {
         
        currentLayers.push (L.circle(location, {
        fillOpacity: 0.75,
        color: "white",
        fillColor: "purple",
          radius: markerSize(filteredData[i].silver)
          }).bindPopup("<h1>" + filteredData[i].region + "</h1> <hr> <h3>Silver: " + filteredData[i].silver + "</h3>").addTo(myMap));
        } else  {
        currentLayers.push (L.circle(location, {
        fillOpacity: 0.75,
        color: "white",
        fillColor: "purple",
          radius: markerSize(filteredData[i].bronze)
          }).bindPopup("<h1>" + filteredData[i].region + "</h1> <hr> <h3>Bronze: " + filteredData[i].bronze + "</h3>").addTo(myMap));
        }
        // Setting our circle's radius equal to the output of our markerSize function
        // This will make our marker's size proportionate to its population
        
    };
    
 }
}