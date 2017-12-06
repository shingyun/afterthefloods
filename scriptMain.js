var screenW = $( window ).width();
    screenH = $( window ).height();

var plotW = 1250,
    plotH = 650;

var Data_begin = 1984,
    Data_end   = 2017,
    Data_rng_1 = 150,
    Data_rng_2 = 1100;
    //origin value
    // Data_rng_1 = 232,
    // Data_rng_2 = 990;

//Maximum value of measures
var MAX_COUNT = 219/2,
    MAX_DEATH = 160000/2,
    MAX_DISPLACED = 40000000/2,
    MAX_DURATION = 419*3,
    MAX_AFFECTED = 4814280*2.5;

var GEO_MAX_COUNT = 90;
    GEO_MAX_DEATH = 160000/4,
    GEO_MAX_DISPLACED = 40000000/1.5,
    GEO_MAX_DURATION = 419*3,
    GEO_MAX_AFFECTED = 4814280*3;

var selectDeath = 'death',
    selectDisplaced = 'displaced',
    selectDuration = 'duration',
    selectAffected = 'affected_area';

var causeCount = ['Heavy Rain','Torrential Rain','Tropical Cyclone','Monsoon Rain','Snowmelt','Dam or Levee Related','Rain and Snowmelt','Ice Related','Other']
    causeDeath = ['Tropical Cyclone','Other','Heavy Rain','Monsoon Rain','Torrential Rain','Dam or Levee Related','Rain and Snowmelt','Snowmelt','Ice Related']
    causeDisplaced = ['Monsoon Rain','Heavy Rain','Tropical Cyclone','Torrential Rain','Other','Dam or Levee Related','Snowmelt','Rain and Snowmelt','Ice Related']
    causeDuration = ['Heavy Rain','Monsoon Rain','Tropical Cyclone','Torrential Rain','Snowmelt','Rain and Snowmelt','Dam or Levee Related','Ice Related','Other']
    causeAffected = ['Heavy Rain','Monsoon Rain','Tropical Cyclone','Torrential Rain','Snowmelt','Rain and Snowmelt','Dam or Levee Related','Ice Related','Other']

var drawCount, drawDeath, drawDisplaced, drawDuration, drawAffected;

var bubble, scatterplot

var mouseInteraction;

var yAdjustment = 157;

var count = true;
    //'#C1AB42' '#92a6ed'  '#C5A2D7'
var mainCol = '#58A5C0', highlightCol = '#FC8B76', bgCol = '#0D1E25';
var defaultOpa = 0.35, hightlightOpa = 0.8;

d3.select('.cover')
  .attr('height',screenH)
  .attr('width',screenW);

// //Click and change views
d3.select('#point0')
  .on('click',function(){
    $('html,body').animate({
        scrollTop: $(".cover").offset().top},
        'slow');
  })

d3.select('#point1')
  .on('click',function(){
    $('html,body').animate({
        scrollTop: $(".bubble-area").offset().top},
        'slow');
  })

d3.select('#point2')
  .on('click',function(){
    $('html,body').animate({
        scrollTop: $(".flow-chart-area").offset().top},
        'slow');
  })

d3.select('#point3')
  .on('click',function(){
    $('html,body').animate({
        scrollTop: $(".map-area").offset().top},
        'slow');
  })

//Viewpoint color changes on scroll
var bubblePosition = $('.bubble-area').position().top;
var flowPosition = $('.flow-chart-area').position().top;
var mapPosition = $('.map-area').position().top;

$(function() {
   $(window).scroll(function () {
      if ($(this).scrollTop() < bubblePosition){
         d3.selectAll('.viewpoint').style('opacity',defaultOpa);
         d3.select('#point0').style('opacity',1);
      }
      if ($(this).scrollTop() > (bubblePosition -50) && $(this).scrollTop() < flowPosition) {
         d3.selectAll('.viewpoint').style('opacity',defaultOpa);
         d3.select('#point1').style('opacity',1);
      }
      if ($(this).scrollTop() > flowPosition && $(this).scrollTop() < mapPosition) {
         d3.selectAll('.viewpoint').style('opacity',defaultOpa);
         d3.select('#point2').style('opacity',1);
      }
      if ($(this).scrollTop() > mapPosition) {
         d3.selectAll('.viewpoint').style('opacity',defaultOpa);
         d3.select('#point3').style('opacity',1);
      }
   });
});


//Dropdown control
d3.selectAll('.dropdown')
  .on('mouseenter',function(){
    d3.selectAll('.dropdown-content')
      .style('display','block')
  })
  .on('click',function(){
    d3.selectAll('.dropdown-content')
      .style('display','none')
  })
  .on('mouseleave',function(){
    d3.selectAll('.dropdown-content')
      .style('display','none')
  })


//Import data and parse
d3.queue()
  .defer(d3.csv,'data/MasterListrev_1003.csv',parse) 
  .defer(d3.csv,'data/country_latlong.csv',parseGeo) 
  .defer(d3.json,'data/countries.geo.json') 
  .await(dataloaded);

function dataloaded(err, data, geo, map) {
  
    //BUBBLE CHART
    bubble = Bubble();

    d3.select('#bubble')
      .datum(data)
      .call(bubble);

    //FLOW CHART
    //first view of flow chart
    flow = Flow()
        .measureScale(MAX_COUNT)
        .selectCause(causeCount);

    d3.select('#plot1')
        .datum(data)
        .call(flow);

    //button function
    d3.select('#button0')
      .on('click',function(d){

        d3.select('#dropbtn-timeline')
          .html('Floods (count)');

        count = true;

        d3.select('.label').remove();

        drawCount = Flow()
            .measureScale(MAX_COUNT)
            .selectCause(causeCount);

        d3.select('#plot1')
          .datum(data)
          .call(drawCount);

      })


    d3.select('#button1')
      .on('click',function(d){

        d3.select('#dropbtn-timeline')
          .html('Death (people)');

        count = false;

        d3.select('.label').remove();

        drawDeath = Flow()
            .selectMeasure(selectDeath)
            .measureScale(MAX_DEATH)
            .selectCause(causeDeath);

        d3.select('#plot1')
          .datum(data)
          .call(drawDeath);

      })


    d3.select('#button2')
      .on('click',function(d){

        d3.select('#dropbtn-timeline')
          .html('Displaced (people)');

        count = false;

        d3.select('.label').remove();

        drawDisplaced = Flow()
            .selectMeasure(selectDisplaced)
            .measureScale(MAX_DISPLACED)
            .selectCause(causeDisplaced);

        d3.select('#plot1')
          .datum(data)
          .call(drawDisplaced);

      })

    d3.select('#button3')
      .on('click',function(d){

        d3.select('#dropbtn-timeline')
          .html('Duration (days)');

        count = false;

        d3.select('.label').remove();

        drawDuration = Flow()
            .selectMeasure(selectDuration)
            .measureScale(MAX_DURATION)
            .selectCause(causeDuration);

        d3.select('#plot1')
          .datum(data)
          .call(drawDuration);


      })


    d3.select('#button4')
      .on('click',function(d){

        d3.select('#dropbtn-timeline')
          .html('Affected area (sq km)');

        count = false;

        d3.selectAll('.selectedBtn')
          .classed('selectedBtn',false);;

        d3.select('#button4')
          .classed('selectedBtn',true);

        d3.select('.label').remove();

        drawAffected = Flow()
            .selectMeasure(selectAffected)
            .measureScale(MAX_AFFECTED)
            .selectCause(causeAffected);

        d3.select('#plot1')
          .datum(data)
          .call(drawAffected);

      })


///////GEO PLOT////////////
    geoplot = Geoplot()
        .geoData(geo)
        .mapData(map)
        .measureScale(GEO_MAX_COUNT);

    d3.select('#geo-plot')
        .datum(data)
        .call(geoplot);
    
    //geo-button function
    d3.select('#geo-button0')
      .on('click',function(d){

        d3.select('#dropbtn-map')
          .html('Floods (count)');

        // d3.select('.legend').remove();

        count = true;

        geoCount = Geoplot()
          .geoData(geo)
          .mapData(map)
          .measureScale(GEO_MAX_COUNT);

        d3.select('#geo-plot')
          .datum(data)
          .call(geoCount);

      })


    d3.select('#geo-button1')
      .on('click',function(d){

        d3.select('#dropbtn-map')
          .html('Death (people)');

        // d3.select('.legend').remove();

        count = false;

        geoDeath = Geoplot()
          .geoData(geo)
          .mapData(map)
          .selectMeasure(selectDeath)
          .measureScale(GEO_MAX_DEATH);

        d3.select('#geo-plot')
          .datum(data)
          .call(geoDeath);

      })


    d3.select('#geo-button2')
      .on('click',function(d){

        d3.select('#dropbtn-map')
          .html('Displaced (people)');

        // d3.select('.legend').remove();

        count = false;

        geoDisplaced = Geoplot()
          .geoData(geo)
          .mapData(map)
          .selectMeasure(selectDisplaced)
          .measureScale(GEO_MAX_DISPLACED);

        d3.select('#geo-plot')
          .datum(data)
          .call(geoDisplaced);

      })

    d3.select('#geo-button3')
      .on('click',function(d){

        d3.select('#dropbtn-map')
          .html('Duration (days)');

        // d3.select('.legend').remove();

        count = false;

        d3.select('.label').remove();

        geoDuration = Geoplot()
          .geoData(geo)
          .mapData(map)
          .selectMeasure(selectDuration)
          .measureScale(GEO_MAX_DURATION);

        d3.select('#geo-plot')
          .datum(data)
          .call(geoDuration);


      })


    d3.select('#geo-button4')
      .on('click',function(d){

        d3.select('#dropbtn-map')
          .html('Affected area (sq km)');
        
        // d3.select('.legend').remove();
        
        count = false;

        geoAffected = Geoplot()
          .geoData(geo)
          .mapData(map)
          .selectMeasure(selectAffected)
          .measureScale(GEO_MAX_AFFECTED);

        d3.select('#geo-plot')
          .datum(data)
          .call(geoAffected);

      })


}//dataloaded

function parse(d){

   return {
     id:+d['Register #'],
     country:d['Country'],
     duration:+d['Duration in Days'],
     death:+d['Dead'],
     displaced:+d['Displaced'],
     cause_1:d['Main cause 1'],
     affected_area:d['Affected sq km'],
     began:parseTime(d.Began)
   };

}

function parseTime(time){

    // return new Date(parseInt(year),parseInt(month-1),parseInt(day));
    if(!time){
      return ;
    } else{
      
      var date = time.split('-'),
        year = date[0],
        month = date[1],
        day = date[2].slice(0,1);

      return new Date(year,month-1,day);
    }
} 

function parseGeo(d){

     return {
     country:d['name'],
     lat:+d['latitude'],
     long:+d['longitude']
   };

}


