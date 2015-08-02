(function() {
var height,
  width,
  globe,
  projection,
  path,
  mapScale;

var legend = [1,2,3,4,7,8,9,12];
var legendText = "<br/><p class=' '><em><strong>Entrants to the 2014 Awards, by country covered.</strong><br/><small>Double click, scroll, or pinch in/out to zoom.</em></small><br/></p>";

var getMapDimensions = function(){
    width = jQuery('.col-md-8').width();
    height = width / 1.5;
    mapScale = 7;
};


getMapDimensions();

var setup = function(w,h) {
  
  globe = d3.select("section#globe-container")
    .append("svg")
    .attr("id", "globe")
    .style("width", w + 'px')
    .style("height", h + 'px');
  
    
  projection = d3.geo.mercator()
    .scale(w/mapScale)
    .translate([w/2, h/1.5]) // center the projection
    .precision(1);
  
  path = d3.geo.path()
    .projection(projection);
  
  /* create a globe */
  globe.append("path")
    .datum({type: "Sphere"})
    .attr("class", "water")
    .attr("d", path);
  
  var ul = d3.select("#globe-container")
    .append("ul")
    .classed("legend",true)
    .classed("pull-right",true);
  
  var li = ul.selectAll("li")
    .data(legend)
    .enter()
    .append("li")
    .attr("class", function(d){return "legend-" + d ;})
    .text(function(d){
      return d;
    });
    
  jQuery("#globe-container").append(legendText);
  
};

setup(width,height);

/* load and display data */
queue()
  .defer(d3.json, "globe/countries.json") /* topjson */
  .defer(d3.csv, "globe/nominees.csv") /* nominees*/
  .await(countries);



function countries(error, worldTopo, nominees){

  console.log(countriesData);

  /* populate nominee list */
  
  function textReturn(){
    return nominees[name].nominee;
  }


  var countriesData = topojson.feature(worldTopo, worldTopo.objects.countries).features;

  for(var i = 0, geo = countriesData; i < geo.length; i++){
  
    for(var x = 0; x < nominees.length; x++){
    
      if(nominees[x].country ==  geo[i].properties.name){
    
        geo[i].properties.cls = "hasNominee";

        geo[i].properties.count = nominees[x].count;

      }
    }
  }
      
  
  console.log(countriesData);
  var world = globe.selectAll("path.land")
    .data(countriesData)
    .enter().append("path")
    .attr("class", function(d){
      var cls = "country " + d.properties.cls + "-" + d.properties.count;
      return cls;
    })
    .attr("d", path)
    .on("mouseover", function(d){
          var coordinates = d3.mouse(this);
        
          d3.select(this).style("opacity",1);
          d3.select("#tooltip")
          .style({
              "left": coordinates[0]  + "px",
              "top": coordinates[1] + "px"
            })
            .classed("hidden",false)
            .select("#number").append("text")
            .text(function(){
              if(d.properties.count > 1){
                return d.properties.name + ", " + d.properties.count + " stories";
              }
              else if(d.properties.count == 1){
                return d.properties.name + ", " + d.properties.count + " story";
              }
              else{
                return d.properties.name;
              }
            });

    })
    .on("mouseout",function(d){
      d3.select(this).style("opacity",0.8);
      d3.select("#tooltip").classed("hidden",true).select("text").remove();
    });
  
  
  
  
  globe.call(
      d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 9])
        .on("zoom", zooming));
  
  function zooming() {
    world.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    globe.selectAll(".country").style("stroke-width", 0.2 / d3.event.scale + "px");
    
  }

}



d3.select(window).on('resize', resize);

function resize(globe) {
  
  getMapDimensions();
  

  projection
    .scale(width/7)
    .translate([width/2, height/1.5]) // center the projection
    .precision(0.1);
  
  path = d3.geo.path().projection(projection);
  
  // resize the SVG containing the globe
  d3.select("#globe")
    .style("height", height + "px")
    .style("width", width + "px");
  
  d3.select(".water").attr('d', path);
  d3.selectAll(".country").attr('d', path);
}





})();

