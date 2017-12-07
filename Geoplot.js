function Geoplot(){

	var causeOrder =
    ['Heavy Rain','Torrential Rain','Tropical Cyclone','Monsoon Rain','Snowmelt','Dam or Levee Related','Rain and Snowmelt','Ice Related','Other']

    var legendData = [{
    	'cause': 'Heavy Rain',
    	'value': 65
    },{
    	'cause': 'Torrential Rain',
    	'value': 75
    },{
    	'cause': 'Tropical Cyclone',
    	'value': 85
    },{
     	'cause': 'Monsoon Rain',
    	'value': 75	
    },{
      	'cause': 'Snowmelt',
    	'value': 60 
    },{
       	'cause': 'Dam or Levee Related',
    	'value': 100   	
    },{
        'cause': 'Rain and Snowmelt',
    	'value': 95     	
    },{
        'cause': 'Ice Related',
    	'value': 60      	
    },{
        'cause': 'Other',
    	'value': 45     	
    }]

    var causeLength = causeOrder.length

    var _geoData, _mapData, map, scaleX, scaleY;

    var projection = d3.geoNaturalEarth1();

    var mapPath = d3.geoPath()
        .projection(projection);

    var R_MAX = 60, R_MAX_LEGEND = 140;

    var k = 1;

    function exports(selection){
        
    	var data = selection.datum() || [];

    	var plot = selection.select('svg').size() ===0?
    	           selection.append('svg').attr('width',screenW)
		                                  .attr('height',screenH)
		                                  .append('g')
		                                  .attr('transform','translate(50,50)'):
		                                  selection.select('svg').select('g');

    	// projection
		projection.fitExtent([[0,0],[plotW,plotH]],_mapData)
	        .scale(210);

	    data = data.filter(function(d){return d.country && d.cause_1})

	    //nest the data by cause and month/year
	    floodByCountry = d3.nest().key(function(d){
	           if(!d.country){ return ;
	           }else{ return d.country;
	           } 
	        })
	        .key(function(d){
	           if(!d.cause_1){
	             return ;
	            }else{
	             return d.cause_1;
	            }
	        })
	        .rollup(function(d){
	        	if(count){
                   return d.length;
	        	} else {
	        	  return d3.sum(d, function(d){
	        		return d[_measure]})
	        	}
	        })
	        .entries(data);

	    //array of causes for scale
	    country = floodByCountry.map(d => d.key)

        //Re-structure the data for radial chart
 	    var processedData = [];

	    country.forEach(function(country,i){
	       
	       var match = floodByCountry.find(function(d,i){
	         return country == d.key;
	       })
	       
	       causeOrder.forEach(function(cause,i){
	       var matchCause = match.values.find(function(e,i){
	            return cause == e.key;
	       })

	       if (!matchCause) {
	          match.values.push({
	            key: cause,
	            value: 0
	          })
	         }
	       })

	       // //Sort the data by customized order
	       match.values.sort(function(a,b){
	         return causeOrder.indexOf(a.key) - causeOrder.indexOf(b.key)
	       })
	       processedData.push(match);
	    })	   	    

        //Create lat long struction for projection
        var geoArray = [];

        _geoData.forEach(function(d){
                 country = d.country,
                 lat = d.lat,
                 long = d.long;
             var location = [];
             location.push(long, lat);
             geoArray.push({
             	'country': country,
             	'location': location
             });
        })

 	    map = d3.map(geoArray, function(d){return d.country})

        //The wrapper include map and rose chart
        var wrapper = plot.select('.wrapper').size() ===0?
                plot.append('g').attr('class','wrapper'):plot.select('.wrapper');


        //Only plot the map one time
    	var mapPlot = wrapper.select('.mapData').size() ===0?
    	           wrapper.append('g').attr('class','mapData'):plot.select('.mapData')

        //Plot the map
	    mapPlot
	       .selectAll('.countries')
	       .data(_mapData.features)
	       .enter()
           .append('path')
           .attr('class','countries')
           .attr('d',mapPath)
	       .style('fill','black')
	       .style('stroke-width','1px')
	       .style('stroke',bgCol)
	       .style('opacity',0.3);

        //Remove the geo plot and paste again later
        d3.select('.setMap').remove();
        d3.select('.geo-label').remove();
	    d3.selectAll('.allCountries').remove();

        //Plot the g by country geographically
	    countryUpdate = wrapper
	        .append('g')
	        .attr('class','allCountries')
	        .selectAll('.country')
	        .data(floodByCountry);

	    countryEnter = countryUpdate
	        .enter()
	        .append('g')
	        .attr('transform','translate(0,0)')
	        .attr('class','country')
	        .attr('id',function(d){return d.key})
	        .on('mouseenter',function(d){
                var f = d3.format(',')
                
                //Tooltip
                d3.select('.tooltip').style('visibility','visible');

	        	d3.select('.tooltip')
                   .append('p')
                   .attr('id','tooltip-country')
                   .html(d.key);

                tooltip = d3.select('.tooltip')
                    .selectAll('.tooltip-cause')
                    .data(d.values);

                tooltipEnter = tooltip
                    .enter()
                    .append('p')
                    .attr('class','tooltip-cause')
                    .html(function(d){
                        return d.key + ': ' + f(Math.round(d.value));
                    })
                
                //Hight causes of a country
                d3.select(this)
                  .selectAll('.segment')
                  .style('fill',highlightCol)
                  .style('stroke',highlightCol)
                  .style('opacity',hightlightOpa);

	        })
            .on('mouseleave',function(d){
                 d3.select('.tooltip').style('visibility','hidden');
                 d3.select('#tooltip-country').remove();
                 d3.selectAll('.tooltip-cause').remove();   
                 
                 d3.select(this)
                   .selectAll('.segment')
                   .style('fill',mainCol)
                   .style('stroke',mainCol)
                   .style('opacity',defaultOpa)

            })

        countryEnter.merge(countryUpdate)
	        .attr('transform',function(d){
	        	if(!map.get(d.key)){
	        		return 'translate(-500,-500)'
	        	} else{
	        		return 'translate('+ projection(map.get(d.key).location)[0] +','+projection(map.get(d.key).location)[1]+')';
	        	}
	        })

     //    //Radial Scale
        var arc = d3.arc()
            .startAngle(function(d,i) { return (i * 2 * Math.PI) / 9; })
            .endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / 9; })
            .innerRadius(0)
            // .outerRadius(function(d){ return scaleY(d.value)});

	    scaleX = d3.scaleBand()
	        .domain(cause)
	        .range([0,Math.PI*2])

	    scaleY = d3.scaleLinear()
	        .domain([0,_meaScale]).range([0,R_MAX]);

        
        radialBarUpdate = countryEnter.selectAll('.segment')
            .data(function(d){return d.values})

        radialBarEnter = radialBarUpdate
            .enter()
            .append('path')
            .attr('class',function(d){
               var no_space = d.key.split(' ').join('')
               return no_space;
             })
            .classed('segment',true)
            .attr('transform','translate(0,0)')
            .each(function(d) { d.outerRadius = 0; })
            .style('fill', mainCol)
            .style('stroke-width','0px')
            .style('opacity',0.35)

        radialBarEnter.merge(radialBarUpdate)
            .attr('d', arc)
            .transition().duration(1000)
            .attrTween('d', function(d,index) {
              var i = d3.interpolate(d.outerRadius, scaleY(d.value));
              return function(t) { d.outerRadius = i(t); return arc(d,index); };
            })
        
        // countryUpdate.exit().remove();
        radialBarUpdate.exit().remove();
       
        //Interaction of segment
        countryEnter.selectAll('.segment')
            .on('mouseenter',function(d){

                d3.select(this).style('stroke-width',2/k)
                  .style('stroke','white')

            	// d3.select(this).style('opacity',hightlightOpa)
            	var no_space = d.key.split(' ').join('')
             //    d3.select('.allCountries')
            	//   .selectAll('.segment.'+no_space)
             //      .style('opacity',hightlightOpa)
             //      .style('fill', highlightCol)
             //      .style('stroke',highlightCol);
            	d3.selectAll('.legend')
            	  .selectAll('.seg-legend.'+no_space)
            	  .style('opacity',hightlightOpa)
            	  .style('fill', highlightCol)
                  .style('stroke','white')
                  .style('stroke-width',1.5);
            })
            .on('mouseleave',function(d){

                d3.select(this).style('stroke-width','0px')
                  .style('stroke','none');

            	// d3.select(this).style('opacity',0.2);
                //Hight all cause
            	// d3.selectAll('.segment')
            	//   .style('opacity',0.2)                  
            	//   .style('fill', mainCol)
             //      .style('stroke',mainCol);
            	d3.selectAll('.seg-legend').style('opacity',0.2)
            	  .style('fill', mainCol)
                  .style('stroke',mainCol)
                  .style('stroke-width',0.5)

            })

       
        //Plot the interactive legend
        scaleLegend = d3.scaleLinear()
	        .domain([0,100]).range([0,R_MAX_LEGEND]);

        var arcLegend = d3.arc()
            .startAngle(function(d,i) { return (i * 2 * Math.PI) / causeLength; })
            .endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / causeLength; })
            .innerRadius(0)
            .outerRadius(function(d){ return scaleLegend(d.value)});

    	var legendPlot = plot.select('.legend').size() ===0?
    	           plot.append('g')
    	               .attr('class','legend')
    	               .attr('transform','translate(140,380)')
    	               .selectAll('.seg-legend')
                       .data(legendData):
    	               plot.selectAll('.seg-legend');

        legendPlot
            .enter()
            .append('path')
            .attr('class',function(d){
               var no_space = d.cause.split(' ').join('')
               return no_space;
            })
            .classed('seg-legend',true)
            .attr('d',arcLegend)
            .style('fill', mainCol)
            .style('stroke-width','0.5px')
            .style('stroke',mainCol)
            .style('opacity','0.2')
            .on('mouseenter',function(d){

            	d3.select(this).style('opacity',hightlightOpa)
            	  .style('fill',highlightCol)
            	  .style('stroke',highlightCol)
                
                var no_space = d.cause.split(' ').join('')
            	d3.select('.allCountries')
            	  .selectAll('.segment.'+no_space)
                  .style('opacity',hightlightOpa)
                  .style('fill',highlightCol)
                  .style('stroke',highlightCol);

            })
            .on('mouseleave',function(d){

            	d3.select(this).style('opacity','0.2')
            	  .style('fill',mainCol)
            	  .style('stroke',mainCol);

            	d3.selectAll('.segment').style('opacity',defaultOpa)
            	  .style('fill',mainCol)
            	  .style('stroke',mainCol);
            });

        
        //Reset the map text
            plot.append('text')
                .attr('class','setMap')
                .attr('x',5)
                .attr('y',230)
                .style('stroke-width','none')
                .text('Reset the map'); 

        //Labels on Legend   
        //labels
        plot.append('text')
            .attr('class','geo-label')
            .attr('x',5)
            .attr('y',300)
            .style('stroke-width','none')
            .text('Hover a cause');
                 
        var labelRadius = R_MAX * 1.025;
        
        var labelPlot = plot.select('.labels').size() ===0?
    	    plot.append('g')
                .attr('class','labels')
                .attr('transform','translate(140,380)rotate(-65)')
                .selectAll('.seg-label')
                .data(legendData):
    	        plot.selectAll('.seg-label');


    	labelPlot.enter()
    	    .append('text')
    	    .attr('class',function(d){
               var no_space = d.cause.split(' ').join('')
               return no_space;
            })
            .classed('seg-label',true)
    	    .attr('transform',function(d,i){
    	    	if(i===0){
                   return 'translate(30,0)rotate(' + ((i * 12.5 * Math.PI)) + ')';
    	    	} else if(i===1){
    	    	   return 'translate(20,20)rotate(' + ((i * 12.5 * Math.PI)) + ')';
    	    	} else if(i===2){
    	    	   return 'translate(3,30)rotate(' + ((i * 12.5 * Math.PI)) + ')';
    	    	} else if(i===3){
                   return 'translate(-16,25)rotate(' + ((i * 12.5 * Math.PI)) + ')';
    	    	} else if(i===4){
    	    	   return 'translate(-25,6)rotate(' + ((i * 12.5 * Math.PI)) + ')';
    	    	} else if(i===5){
                   return 'translate(-130,-35)rotate(' + ((i * 12.5 * Math.PI)+180) + ')';
    	    	} else if(i===6){
    	    	   return 'translate(-75,-100)rotate(' + ((i * 12.5 * Math.PI)+180) + ')';
    	    	} else if(i===7){
    	    	   return 'translate(5,-80)rotate(' + ((i * 12.5 * Math.PI)+180) + ')';
    	    	} else{
    	    	return 'translate(37,-40)rotate(' + ((i * 12.5 * Math.PI)+180) + ')';
    	        }
    	    })
    	    .text(function(d){ return d.cause})
    	    .style('font-size','11px')
    	    .style('fill','#c8c8c8')
            .on('mouseenter',function(d){

                var no_space = d.cause.split(' ').join('')

                d3.select('.legend')
                  .selectAll('.seg-legend.'+no_space)
                  .style('opacity',hightlightOpa)
                  .style('fill',highlightCol)
                  .style('stroke',highlightCol);

            	d3.select('.allCountries')
            	  .selectAll('.segment.'+no_space)
                  .style('opacity',hightlightOpa)
                  .style('fill',highlightCol)
                  .style('stroke',highlightCol);

            })
            .on('mouseleave',function(d){

                d3.selectAll('.seg-legend')
                  .style('opacity','0.2')
            	  .style('fill',mainCol)
            	  .style('stroke',mainCol);

            	d3.selectAll('.segment')
            	  .style('opacity',defaultOpa)
            	  .style('fill',mainCol)
            	  .style('stroke',mainCol);
            });

            //ZOOM
            d3.select('.wrapper').call(d3.zoom().on('zoom',function(){
                d3.select('.wrapper').attr("transform", d3.event.transform)
                d3.select('.setMap').style('fill',highlightCol);
                k = d3.zoomTransform(this).k;
            }))
            
            //Reset the map
            d3.select('.setMap').on('click',function(){
                d3.select('.wrapper').attr("transform", 'translate(0,0)')
                d3.select('.setMap').style('fill','#C8C8C8');
            })

    }

    exports.selectMeasure = function(_mea){
    	if(!arguments.length) return _measure;
    	_measure = _mea;
    	return this;
    }

    exports.geoData = function(_geo){
        if(!arguments.length) return _geoData;
    	_geoData = _geo;
    	return this;
    }

    exports.mapData = function(_map){
    	if(!arguments.length) return _mapData;
    	_mapData = _map;
    	return this;
    }

    exports.measureScale = function(_sca){
    	if(!arguments.length) return _meaScale;
    	_meaScale = _sca;
    	return this;
    }
    
    return exports;

}