$.ajaxSetup({
   async: false
 });
//Make a CoronaVirus Map
L.mapbox.accessToken =
  "pk.eyJ1IjoieGlhb3h1YW40ODg5IiwiYSI6ImNrMmlnMDJpYjFnbzczaG4wNGdiZXF0YWEifQ.wDARKYAVDanfkwJ8Fj7wNA";
var map = L.mapbox.map("map", "mapbox.streets").setView([38.8,-77.3], 10.7);
map.removeControl(map.zoomControl);
var poi_layer = new L.markerClusterGroup();
var zip_layer = new L.markerClusterGroup(); 
var heat;
var group = new L.featureGroup();
var markerGroup = new L.featureGroup();
// add a marker in the given location
var MyIcon = L.Icon.extend({
  options: {
    shadowUrl:
    "https://dl.dropboxusercontent.com/s/6mlhoque8s8daoj/marker-shadow.png",
    iconSize: [50, 50],
    shadowSize: [51, 37],
    iconAnchor: [16, 50],
    shadowAnchor: [15, 40],
    popupAnchor: [-3, -50]
  }
});
//MarkerClusterGroup that collects all GeoJSON objects
var month_array = [];
// constructing the query
var querystem =
    "https://xiaoxuan4889.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM crime_point_clean";
var query = querystem;
$.getJSON(query, function(data) {
  parse(data);
  //Heatmap
  locations = data.features.map(function(feature) {
    return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
  });
  
  heat = L.heatLayer(locations);
  //Crime clusters
  jsonlayer(data);
  //Brush
  setBrush(data);
  });

//Cluster layer
function jsonlayer(data){
  geojsonlayer = L.geoJson(data, {
    // add popup with info to each geosjon feature
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h2> Crime type: " + feature.properties.crime_type + "</h2>");
    },
    //style the point marker
    pointToLayer: function(feature, latlng) {
      var marker;
      
      if (feature.properties.crime_type == "Arrest") {
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/i76q6y49bnkxddh/Arrest.jpg?dl=0"
          })
        });
      } 
      else if (feature.properties.crime_type == "Arson") {
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/mw6nnzutg49tujv/Fire.jpg?dl=0"
          })
        });
      } 
      else if (feature.properties.crime_type == "Assault") {
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/1eiqsngfn0u47ly/Assault.jpg?dl=0"
          })
        });
      } 
      else if (feature.properties.crime_type == "Burglary") {
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/6h4en6mfjgn1b1v/Burglary.jpg?dl=0"
          })
        });
      } 
      else if (feature.properties.crime_type == "Robbery") {
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/4h9dpgf7z9z2t3i/Robbery.jpg?dl=0"
          })
        });
      } 
      else if (feature.properties.crime_type == "Shooting") {
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/vhadd4t6m0v0c9o/Shooting.jpg?dl=0"
          })
        });
      } 
      else if (feature.properties.crime_type == "Theft"){
        marker = L.marker(latlng, {
          icon: new MyIcon({
            iconUrl:
            "https://dl.dropboxusercontent.com/s/e3dopn1l6f8tsy8/Theft.jpg?dl=0"
          })
        });
      } 
      else marker = L.marker(latlng);
      return marker;
    }
  }).addTo(poi_layer);
  }


//Set timeline 
function parse(data) {
  // wrangle data into format Leaflet.timeline expects
  // earthquake data only has a time, so we'll use that as a "start"
  // and the "end" will be that + some value based on magnitude
  data.features.forEach(function(item) {
    var time = item.properties.date;
    var time_parsed = time.match(/\d{4}\-\d{2}\-\d{2}\T\d{2}\:\d{2}\:\d{2}/);
    var date = new Date(time_parsed);
    item.properties.date = date; //date.getTime();
  });
}

//Set brush
function setBrush(data) {
  var container = d3.select("#brush");

  var margin = {
    top: 10,
    right: 10,
    bottom: 20,
    left: 10
  },
      width = container.node().offsetWidth,
      height = 80 - margin.top - margin.bottom;

  var x = d3
  .scaleTime()
  .domain(
    d3.extent(data.features, function(d) {
      return d.properties.date;
    })
  )
  .rangeRound([0, width]);

  var svg = container
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g") // https://github.com/d3/d3-time-format
    .attr("class", "axis axis--grid")
    .attr("transform", "translate(0," + height + ")")
    .call(
    d3
    .axisBottom(x)
    .ticks(d3.timeMonth, 1)
    .tickSize(-height)
    .tickFormat(function() {
      return null;
    })
  )
    .selectAll(".tick")
    .classed("tick--minor", function(d) {
    return d.getMonth();
  });
  svg
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(
    d3
    .axisBottom(x)
    .ticks(d3.year)
    .tickPadding(0)
  )
    .attr("text-anchor", null)
    .selectAll("text")
    .attr("x", 6);

  var brush = d3
  .brushX()
  .extent([[0, 0], [width, height]])
  .on("brush end", brushend);

  svg
    .append("g")
    .attr("class", "brush")
    .call(brush);

  function brushend() {
    
    var s = d3.event.selection;
    var filter;
    // If the user has selected no brush area, share everything.
    if (s == null) {
      filter = function() {
        return true;
      };
    } else {
      var d0 = s.map(x.invert);
      // Otherwise, restrict features to only things in the brush extent.
      filter = function(feature) {
        return (
          feature.properties.date > +d0[0] &&
          feature.properties.date < +d0[1]
        );
      };
    }
    var data_filtered = data.features.filter(filter);
    
    
    
    

    if (document.getElementById("clusterLayers").checked == true){
      //Remove old one
      try {
        poi_layer.removeLayer(geojsonlayer);
        map.removeLayer(heat);

      } catch { };
      //Crime clusters
      jsonlayer(data_filtered);

    }
    else if (document.getElementById("heatLayers").checked == true){
      //Remove old one
      try {
        poi_layer.removeLayer(geojsonlayer);
        map.removeLayer(heat);

      } catch { };

      //Heatmap
      locations = data_filtered.map(function(feature) {
        return [
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0],
          1
        ];
      });
      heat = L.heatLayer(locations).addTo(map);
    }

  }
}

//Dectect radio buttoms status dynamically
$('input[type=radio][name=viz-toggle]').change(function() {
    if (this.value == '1') {
      try {
        map.removeLayer(poi_layer);
        map.removeLayer(heat);
        map.removeLayer(zip_layer);
        map.removeControl(legend);
      } catch { };
      map.addLayer(poi_layer);
}
    else if (this.value == '2') {
      try {
        map.removeLayer(poi_layer);
        map.removeLayer(heat);
        map.removeLayer(zip_layer);
        map.removeControl(legend);
      } catch { };  
      map.addLayer(heat);
    }
    else if (this.value == '3') {
      try {
        map.removeLayer(poi_layer);
        map.removeLayer(heat);
        map.removeLayer(zip_layer);
        map.removeControl(legend);
      } catch { };  
      map.addLayer(zip_layer);
      legend.addTo(map);
    }

});

//Choropleth
var queryc =
    "https://xiaoxuan4889.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM zipcity";

$.getJSON(queryc, function(data) {
  geojsonc = L.geoJson(data, {
    // add popup with info to each geosjon feature
    style: style, //style neighborhood polygons
    onEachFeature: onEachFeature //attached popup behavior
  }).addTo(zip_layer);
});

function getColor(d) {
  return d > 3000
    ? "#800026"
  : d > 2000
    ? "#BD0026"
  : d > 1000
    ? "#E31A1C"
  : d > 500
    ? "#FC4E2A"
  : d > 300
    ? "#FD8D3C"
  : d > 100 ? "#FEB24C" : d > 0 ? "#FED976" : "#FFEDA0";
}
function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.join_count)
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: layer.bindPopup("<h2> Crime Counts by Counties:<br>" + feature.properties.zipcity + ": " + feature.properties.join_count + "</p>")
  });
}

//Choropleth legend
var legend = L.control({
  position: "bottomright"
});

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 100, 300, 500, 1000, 2000, 3000],
    labels = [],
    from,
    to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' +
        getColor(from + 1) +
        '"></i> ' +
        from +
        (to ? "&ndash;" + to : "+")
    );
  }
  div.innerHTML = labels.join("<br>");
  return div;
};








//Geosearch Control
var GeoSearchControl = window.GeoSearch.GeoSearchControl;
var OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider;

var provider = new OpenStreetMapProvider();

var searchControl = new GeoSearchControl({
  ref: "searchControl",
  showMarker: false,  
  provider: provider,
});

map.addControl(searchControl);


//Marker Pulse
const animatedCircleIcon = {
      icon: L.divIcon({
       className: "css-icon",
       html: '<div class="gps_ring"></div>',
       iconSize: [18, 18]
    })
 };

//Geosearch, add marker, display charts
var cir1;
var cir2;
var cir3;

var ptsWithin;
var D1 = [];
var D2 = [];
var D3 = [];
var D4 = [];
var D5 = [];
var D6 = [];
var sum1;
var sum2;
var sum3;
const arrSum = arr => arr.reduce((a,b) => a + b, 0);
var point_name;
var info = L.control({
  position: "bottomleft"
});
map.on('geosearch/showlocation', function(e) {
  try {
    markerGroup.clearLayers();
  } catch { };
  var geo_marker;
  $("#lat").val(e.location.y);
  $("#lng").val(e.location.x);  
  var loc = [e.location.y,e.location.x]
  geo_marker = L.marker(loc).addTo(markerGroup);
  geo_marker.bindPopup(e.location.label);
  point_name = e.location.label.split(',')[0];
  //Dynamic chart info
  geo_marker.on('click', function(e){
    var latlng = map.mouseEventToLatLng(e.originalEvent);
    dist(latlng.lat,latlng.lng);
    bar(latlng.lat,latlng.lng);
    CHART();
    text(info, point_name, sum1, sum2, sum3);
  });
  L.marker(loc, animatedCircleIcon).addTo(markerGroup);
  map.addLayer(markerGroup);

  searchControl.getContainer().onclick = e => {
    try {
      group.clearLayers();
    } catch { };
    cir1 = L.circle(loc, 2000, {
      color: "black",
      fillColor: "black",
      fillOpacity: 0.1}).addTo(group);
    cir2 = L.circle(loc, 6000, {
      color: "blue",
      fillColor: "blue",
      fillOpacity: 0.1}).addTo(group);
    cir3 = L.circle(loc, 10000, {
      color: "red",
      fillColor: "red",
      fillOpacity: 0.1}).addTo(group);
    map.addLayer(group);
    map.setZoom(12);    
  };
});



// Statistics for line chart
function dist(lat,lng){
  var exe;
  var i;
  var count1;
  var count2;
  var count3;
  var query2;
  D1.length = 0;
  D2.length = 0;
  D3.length = 0;
  for (i = 1; i <= 11; i++) {
    count1 = 0;
    count2 = 0;
    count3 = 0;
    query2 = querystem + " Where month_c = " + i
    $.getJSON(query2, function(data) {
      data.features.forEach(function(item) {  
        if (calcCrow(item.geometry.coordinates[1], item.geometry.coordinates[0], lat, lng) <= 3){
          count1++;};
      });  
      D1.push(count1);
      sum1 = arrSum(D1)
    });
    $.getJSON(query2, function(data) {
      data.features.forEach(function(item) {  
        if (calcCrow(item.geometry.coordinates[1], item.geometry.coordinates[0], lat, lng) <= 6){
          count2++;};
      });  
      D2.push(count2);
      sum2 = arrSum(D2)
    });
    $.getJSON(query2, function(data) {
      data.features.forEach(function(item) {  
        if (calcCrow(item.geometry.coordinates[1], item.geometry.coordinates[0], lat, lng) <= 10){
          count3++;};
      });  
      D3.push(count3);
      sum3 = arrSum(D3)
    });
  };
}
  

// Statistics for bar chart
function bar(lat,lng){
  var exe;
  var i;
  var count4;
  var count5;
  var count6;
  var query3;
  D4.length = 0;
  D5.length = 0;
  D6.length = 0;
  for (i = 1; i <= 7; i++) {
    count4 = 0;
    count5 = 0;
    count6 = 0;
    query3 = querystem + " Where crime_c = " + i
    $.getJSON(query3, function(data) {
      data.features.forEach(function(item) {  
        if (calcCrow(item.geometry.coordinates[1], item.geometry.coordinates[0], lat, lng) <= 3){
          count4++;};
      });  
      D4.push(count4);
    });
    $.getJSON(query3, function(data) {
      data.features.forEach(function(item) {  
        if (calcCrow(item.geometry.coordinates[1], item.geometry.coordinates[0], lat, lng) <= 6){
          count5++;};
      });  
      D5.push(count5);
    });
    $.getJSON(query3, function(data) {
      data.features.forEach(function(item) {  
        if (calcCrow(item.geometry.coordinates[1], item.geometry.coordinates[0], lat, lng) <= 10){
          count6++;};
      });  
      D6.push(count6);
    });
  };
}


//Distance calculation
function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}
// Converts numeric degrees to radians
function toRad(Value) 
{
  return Value * Math.PI / 180;
}


//Chart config
Chart.defaults.global = {
  // Boolean - Whether to animate the chart
  animation: true,
  // Number - Number of animation steps
  animationSteps: 60,
  //  easeOutElastic, easeInCubic]
  animationEasing: "easeOutBack",
  // Boolean - If we should show the scale at all
  showScale: true,
  // Boolean - If we want to override with a hard coded scale
  scaleOverride: false,
  // ** Required if scaleOverride is true **
  // Number - The number of steps in a hard coded scale
  scaleSteps: null,
  // Number - The value jump in the hard coded scale
  scaleStepWidth: null,
  // Number - The scale starting value
  scaleStartValue: null,
  // String - Colour of the scale line
  scaleLineColor: "rgba(0,0,0,.1)",
  // Number - Pixel width of the scale line
  scaleLineWidth: 1,
  // Boolean - Whether to show labels on the scale
  scaleShowLabels: true,
  // Interpolated JS string - can access value
  scaleLabel: "<%=value%>",
  // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
  scaleIntegersOnly: true,
  // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
  scaleBeginAtZero: false,
  // String - Scale label font declaration for the scale label
  scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  // Number - Scale label font size in pixels
  scaleFontSize: 17,
  // String - Scale label font weight style
  scaleFontStyle: "normal",
  // String - Scale label font colour
  scaleFontColor: "#666",
  // Boolean - whether or not the chart should be responsive and resize when the browser does.
  responsive: true,
  // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
  maintainAspectRatio: true,
  // Boolean - Determines whether to draw tooltips on the canvas or not
  showTooltips: true,
  // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
  customTooltips: false,
  // Array - Array of string names to attach tooltip events
  tooltipEvents: ["mousemove", "touchstart", "touchmove"],
  // String - Tooltip background colour
  tooltipFillColor: "rgba(0,0,0,0.8)",
  // String - Tooltip label font declaration for the scale label
  tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  // Number - Tooltip label font size in pixels
  tooltipFontSize: 17,
  // String - Tooltip font weight style
  tooltipFontStyle: "normal",
  // String - Tooltip label font colour
  tooltipFontColor: "#fff",
  // String - Tooltip title font declaration for the scale label
  tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  // Number - Tooltip title font size in pixels
  tooltipTitleFontSize: 17,
  // String - Tooltip title font weight style
  tooltipTitleFontStyle: "bold",
  // String - Tooltip title font colour
  tooltipTitleFontColor: "#fff",
  // Number - pixel width of padding around tooltip text
  tooltipYPadding: 6,
  // Number - pixel width of padding around tooltip text
  tooltipXPadding: 6,
  // Number - Size of the caret on the tooltip
  tooltipCaretSize: 8,
  // Number - Pixel radius of the tooltip border
  tooltipCornerRadius: 6,
  // Number - Pixel offset from point x to tooltip edge
  tooltipXOffset: 10,
  // String - Template string for single tooltips
  tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
  // String - Template string for multiple tooltips
  multiTooltipTemplate: "<%= value %>",
  // Function - Will fire on animation progression.
  onAnimationProgress: function() {},
  // Function - Will fire on animation completion.
  onAnimationComplete: function() {}
};



// BEGIN LINE CHART ============================================
var lineGraphData = {
    labels: ["January", "February", "March", "April", "May", "June", "July", 'August', 'September', 'October', 'November'],
  datasets: [{
    label: "My First Line",
    fillColor: "rgb(8,8,8, 0.2)",
    strokeColor: "#131215",
    pointColor: "#131215",
    pointStrokeColor: "#131215",
    pointHighlightFill: "#131215",
    pointHighlightStroke: "#131215",
    data: D1
  }, {
    label: "My Second Line",
    fillColor: "rgb(54, 162, 235, 0.2)",
    strokeColor: "rgb(54, 162, 235)",
    pointColor: "rgb(54, 162, 235)",
    pointStrokeColor: "rgb(54, 162, 235)",
    pointHighlightFill: "#ccc",
    pointHighlightStroke: "rgba(22,160,133,1)",
    data: D2
  },{
    label: "My Third Line",
    fillColor: "rgb(255, 99, 132, 0.2)",
    strokeColor: "rgb(255, 99, 132)",
    pointColor: "rgb(255, 99, 132)",
    pointStrokeColor: "rgb(255, 99, 132)",
    pointHighlightFill: "#ccc",
    pointHighlightStroke: "rgba(22,160,133,1)",
    data: D3
  }]
};
var lineGraphOptions = {
  ///Boolean - Whether grid lines are shown across the chart
  scaleShowGridLines: true,
  //String - Colour of the grid lines
  scaleGridLineColor: "rgba(0,0,0,.05)",
  //Number - Width of the grid lines
  scaleGridLineWidth: 1,
  //Boolean - Whether to show horizontal lines (except X axis)
  scaleShowHorizontalLines: true,
  //Boolean - Whether to show vertical lines (except Y axis)
  scaleShowVerticalLines: true,
  //Boolean - Whether the line is curved between points
  bezierCurve: true,
  //Number - Tension of the bezier curve between points
  bezierCurveTension: 0.4,
  //Boolean - Whether to show a dot for each point
  pointDot: true,
  //Number - Radius of each point dot in pixels
  pointDotRadius: 4,
  //Number - Pixel width of point dot stroke
  pointDotStrokeWidth: 1,
  //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
  pointHitDetectionRadius: 20,
  //Boolean - Whether to show a stroke for datasets
  datasetStroke: true,
  //Number - Pixel width of dataset stroke
  datasetStrokeWidth: 2,
  //Boolean - Whether to fill the dataset with a colour
  datasetFill: true,
  //String - A legend template
  legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
};



// BEGIN Bar CHART ============================================
var barData = {
  
  labels: ["Arrest", "Arson", "Assault", "Burglary", "Robbery", "Shooting", "Theft"],
  datasets: [{
    label: "My First Bar",
    fillColor: "rgb(8,8,8)",
    strokeColor: "#131215",
    highlightFill: "#131215",
    highlightStroke: "#131215",
    data: D4
  }, {
    label: "My Second Bar",
    fillColor: "rgb(54, 162, 235)",
    strokeColor: "rgb(54, 162, 235)",
    highlightFill: "#ccc",
    highlightStroke: "rgba(22,160,133,1)",
    data: D5
  }, {
    label: "My Third Bar",
    fillColor: "rgb(255, 99, 132)",
    strokeColor: "rgb(255, 99, 132)",
    highlightFill: "#ccc",
    highlightStroke: "rgba(22,160,133,1)",
    data: D6
  }
            ]
};
var barOptions = {
  //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
  scaleBeginAtZero: true,

  //Boolean - Whether grid lines are shown across the chart
  scaleShowGridLines: true,

  //String - Colour of the grid lines
  scaleGridLineColor: "rgba(0,0,0,.05)",

  //Number - Width of the grid lines
  scaleGridLineWidth: 1,

  //Boolean - Whether to show horizontal lines (except X axis)
  scaleShowHorizontalLines: true,

  //Boolean - Whether to show vertical lines (except Y axis)
  scaleShowVerticalLines: true,

  //Boolean - If there is a stroke on each bar
  barShowStroke: true,

  //Number - Pixel width of the bar stroke
  barStrokeWidth: 2,

  //Number - Spacing between each of the X value sets
  barValueSpacing: 5,

  //Number - Spacing between data sets within X values
  barDatasetSpacing: 1,

  //String - A legend template
  legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

};

//display chart
function CHART(){
  var lineCtx = document.getElementById("myGraph").getContext("2d");
  var myLineChart = new Chart(lineCtx).Line(lineGraphData, lineGraphOptions);
  var barCtx = document.getElementById("myBarGraph").getContext("2d");
  var myBarChart = new Chart(barCtx).Bar(barData, barOptions);
}

//Text
function text(info, point, arr1, arr2, arr3){
  info.onAdd = function(map) {
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
  };

  info.update = function() {
    this._div.innerHTML =
      "<h6><b>" + point + "<b><br>" + "Crime events within 3 km: " + 
      arr1 + '<b><br>' + "Crime events within 6 km: " + 
      arr2 + '<b><br>' + "Crime events within 10 km: " + 
      arr3
  };
  info.addTo(map);

}



