const API_KEY = "pk.eyJ1IjoiYmthcHNhbGlzIiwiYSI6ImNrMzg2OTZnMzA0bTMzaW5yMWhyb2hxN3AifQ.LCoY1nACfyPGDfOOP7C5hg";

// Adding tile layer
var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {	
attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
minZoom: 1,
maxZoom: 6,
id: "mapbox/light-v10", 
accessToken: API_KEY
});

// Creating map object
var map = L.map("map", {
    center: [33.589886, -7.603869],
    zoom: 2,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    minZoom: 1,
    maxZoom: 6,
});

satelliteMap.addTo(map);

var country_geojson = "../static/assets/data/countries.geojson";

var legend;

function updateMap() {
    d3.event.preventDefault();

    map.eachLayer(function (layer) {
        map.removeLayer(layer)
    }); 

    if(legend) {
        map.removeControl(legend)
    }
        
    // Grabbing our GeoJSON data..
    d3.json(country_geojson).then(function(all_countries) {

        L.geoJson(all_countries, {
            style: function(feature) {
              return {
                color: "#0570b0",
                weight: 1,
                fillColor: "white"
              };
            }
        }).addTo(map);

        var selected_sport = d3.select("#sport").property("value");
        
        d3.json("../static/assets/data/sport_medals.json").then(function(data){
            // console.log(data)
            var top_countries = data.filter(d => d.sport === selected_sport)
                                .slice(0, 10)
            // console.log(one_sport)

            var country_list = [];
            var total_medal_list = [];
            var medal_dict = {}

            top_countries.forEach(function(country_obj) {
            country_list.push(country_obj.country);
            total_medal_list.push(country_obj.medals);
            medal_dict[country_obj.country] = country_obj.medals
            })

            var selected_countries = all_countries.features.filter(function(geojson_obj){
                country_name = geojson_obj.properties.ADMIN
                return country_list.includes(country_name)
            })

            selected_countries.forEach(function(country_obj){
                country_obj.properties["Medals"] = medal_dict[country_obj.properties.ADMIN]
            })

            // console.log(selected_countries)

            var selected_countries_geojson = {}
            selected_countries_geojson.type = "FeatureCollection";
            selected_countries_geojson.features = selected_countries;

            // Creating a GeoJSON layer with the filtered data
            var choroplethLayer = L.choropleth(selected_countries_geojson, {
                valueProperty: 'Medals',
                scale: ['#c994c7','#df65b0','#e7298a','#ce1256','#91003f'],
                steps: 5,
                mode: 'q',
                // Style each feature (in this case a country)
                style: {
                    color: '#0570b0', // border color
                    weight: 2,
                    fillOpacity: 0.9
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(`<h4><strong>Country: ${feature.properties.ADMIN}
                        <br> Sport: ${selected_sport} 
                        <br> Medals: ${feature.properties.Medals}</strong></h4>`)
                }
            })
            choroplethLayer.addTo(map);

            legend = L.control({ position: 'bottomright' })
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend')
                var limits = choroplethLayer.options.limits
                var colors = choroplethLayer.options.colors
                var labels = []

                // Add min & max
                div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
                        <div class="max">' + limits[limits.length - 1] + '</div></div>'

                limits.forEach(function (limit, index) {
                labels.push('<li style="background-color: ' + colors[index] + '"></li>')
                })

                div.innerHTML += '<ul>' + labels.join('') + '</ul>'
                return div
            }

            legend.addTo(map)
        });
    });
}
    
d3.select("#filter-btn").on("click", updateMap);



// Second chart on page (Using chart.js library)



function updateBarChart() {
    d3.event.preventDefault();

    var selected_country = d3.select("#country_name").property("value");
        
    d3.json("../static/assets/data/sport_medals.json").then(function(data){

        // console.log(data);

        var top_sports = data.filter(d => d.country === selected_country)
                            .sort((a,b) => b.medals - a.medals)
                            .slice(0, 10)

        // console.log(top_sports);

        myLabels = top_sports.map(function(country_obj) {
            return country_obj.sport
        });

        myData = top_sports.map(function(country_obj) {
            return country_obj.medals
        });

        console.log(myLabels)
        console.log("ME")
        console.log(myData)
        renderBarChart(myLabels, myData)

    })

}

function renderBarChart(myLabels, myData) {
    // clear canvas if exists
    d3.select("#bar_chart_new").html("");
    // Append canvas tag
    d3.select("#bar_chart_new").html('<canvas id="myChart"></canvas>');

    var ctx = document.getElementById('myChart');
    var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: myLabels,
        datasets: [{
            label: '# of Medals',
            data: myData,
            backgroundColor: ["#67001f", "#980043", "#ce1256", "#e7298a",
                                "#df65b0", "#c994c7", "#c994c7", "#c994c7",
                                "#c994c7", "#c994c7"],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
}


d3.select("#filter-btn-country").on("click", updateBarChart);
