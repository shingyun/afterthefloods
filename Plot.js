function Flow(){


    function exports(selection){
        
    	var data = selection.datum() || [];

    	var plot = selection.select('svg').size() ===0?
    	           selection.append('svg'):selection.select('svg');

    	plot.attr('width',screenW) //1280
		    .attr('height',screenH) // 660
		    .append('g')
		    .attr('transform','translate(50,50)');

	    //nest the data by cause and month/year
	    floodByCause = d3.nest().key(function(d){
	           if(!d.cause_1){ return ;
	           }else{ return d.cause_1;
	           } 
	        })
	        .key(function(d){
	           if(!d.began){ return ;
	            }else{
	               // return d.began
	            return d.began.getFullYear();
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
	    
	    floodByYear = d3.nest().key(function(d){
	      if(!d.began){ return ;
	            }else{
	            // return d.began
	            return d.began.getFullYear();
	            }
	    })
	    .entries(data);
	    
	    //filter out the undefined cause
	    floodByCause = floodByCause.filter(d => d.key !== 'undefined');

	    //array of causes for scale
	    cause = floodByCause.map(d => d.key);

	    //Map out year value
	    year = floodByYear.map(d => d.key);

	    year = year.filter(function(d){return d!=='undefined'}).sort();

	    //Added 0 value for missing years
	    var processedData = [];

	    cause.forEach(function(cause,i){
	       var match = floodByCause.find(function(d,i){
	         return cause == d.key;
	       })
	       year.forEach(function(year,i){
	         var matchYear = match.values.find(function(e,i){
	            return year == e.key;
	       })
	       if (!matchYear) {
	          match.values.push({
	            key: year,
	            value: 0
	          })
	       }
	       })
	       //Sort the data by year
	       match.values.sort(function(a,b){
	         return a.key-b.key;
	       })
	       processedData.push(match);
	    })
	  
	    //Set scale
	    scaleX = d3.scaleLinear()
	        .domain([Data_begin,Data_end])
	        .range([Data_rng_1,Data_rng_2]);
	        // .range([200,1000]);

	    scaleValue = d3.scaleLinear()
	        .domain([0,_meaScale])
	        .range([screenH*0.257,0]);//170

	    scaleCause = d3.scaleBand()
	        .domain(_cause)
	        .range([screenH*0.6,screenH*0.88]);//390,590

	    //Set axis
	    axisX = d3.axisBottom()
	        .scale(scaleX)
	        .ticks(34)
	        .tickValues([1985,1990,1995,2000,2005,2010,2015,2017])
	        .tickFormat(function(d){
	           var year = d.toString()
	           return year;
	        });

	    axisCause = d3.axisLeft()
	        .scale(scaleCause);

	    //Plot axis
        var xAxis = plot.select('.axis-x').size() ===0?
    	            plot.append('g').attr('class','axis-x'):plot.select('.axis-x');

        var yAxis = plot.select('.axis-y').size() ===0?
    	            plot.append('g').attr('class','axis-y'):plot.select('.axis-y');

	    xAxis.classed('axis',true)
	        .attr('transform','translate('+ screenW*0.04 +','+ screenH*0.88 +')')
	        .call(axisX);

	    yAxis.classed('axis',true)
	        .attr('transform','translate('+ screenW*0.15 +',0)')
	        .transition().duration(500)
	        .call(axisCause);
        
        //remove previous data
        d3.select('.flow-label').remove();
	    d3.selectAll('.cause_wrap').remove();
	    d3.selectAll('.number-wrap').remove();
	    d3.selectAll('.notation-wrap').remove();

        //labels
        plot.append('text').attr('class','flow-label')
                        .attr('x',screenW*0.089) //115
                        .attr('y',screenH*0.55) //365
                        .style('stroke-width','none')
                        .text('All causes');

	    //Line and area generator
	    line = d3.line()
	        .x(function(d){return scaleX(d.key)})
	        .y(function(d){return scaleValue(d.value)})
	        .curve(d3.curveCatmullRom);

	    area = d3.area()
	        .x(d => scaleX(d.key))
	        .y0(d => screenH*0.257)//170
	        .y1(d => scaleValue(d.value))
	        .curve(d3.curveCatmullRom);

	    //plot 9 gs for causes 
	    causeUpdate = plot
	        .selectAll('.cause_wrap')
	        .data(processedData, d => d.key);

	    causeEnter = causeUpdate
	        .enter()
	        .append('g')
	        .attr('class',function(d){
               var no_space = d.key.split(' ').join('')
               return no_space;
             })
	        .classed('cause_wrap',true)
	        .on('mouseenter',function(d){

                var no_space = d.key.split(' ').join('');
               
                //Show
                d3.select('.number-wrap.'+no_space)
                  .style('visibility','visible')
                  .style('opacity',0)
                  .transition().duration(1000)
                  .style('opacity',1);

                d3.selectAll('.notation-wrap.'+no_space)
                  .style('visibility','visible')
                  .style('opacity',0)
                  .style('opacity',1);
                         	
            })      
	        .on('mouseleave',function(d){
	        	var no_space = d.key.split(' ').join('');

                //Clear All
                d3.selectAll('.number-wrap.'+no_space)
                  .style('visibility','hidden');

                d3.selectAll('.notation-wrap.'+no_space)
                  .style('visibility','hidden'); 

	        });

	    causeEnter
            .merge(causeUpdate)
	        .attr('transform',d => 'translate('+ screenW*0.04 +','+ (scaleCause(d.key)-yAdjustment)+')'
	        );

	    //plot line
	    lineUpdate = causeEnter.selectAll('.line')
	        .data(function(d){return [d.values]});

	    lineEnter = lineUpdate
	        .enter()
	        .append('path')
	        .attr('class','line');
        
        lineEnter.merge(lineUpdate)
	        .attr('d',line)
	        .style('stroke-width','1px')
	        .style('stroke',mainCol)
	        .style('fill','none')
	        .style('opacity',0.8);
         
        //plot area
        areaUpdate = causeEnter.selectAll('.area')
	        .data(function(d){return [d.values]});

	    areaEnter = areaUpdate
	        .enter()
	        .append('path')
            .classed('area',true);
        
        areaEnter.merge(areaUpdate)
	        .attr('d',area)
	        .style('stroke','none')
	        .style('fill', mainCol)
	        .style('opacity',defaultOpa)
	        .on('mouseenter',function(d){
	        	// d3.selectAll('.area')
	        	//   .style('opacity',defaultOpa)
	        	//   .style('fill',mainCol);
                d3.select(this)
                  .style('opacity',hightlightOpa)
                  .style('fill',highlightCol);
	        })
	        .on('mouseleave',function(d){
	        	d3.select(this)
	        	  .style('opacity',defaultOpa)
	        	  .style('fill',mainCol);
	        });

	    //plot text
	    numberUpdate = plot.selectAll('.number-wrap')
	        .data(processedData);

	    numberEnter = numberUpdate
	        .enter()
	        .append('g')
	        .attr('class',function(d){
               var no_space = d.key.split(' ').join('')
               return no_space;
            })
            .classed('number-wrap',true)
	        .attr('transform',function(d){
            	return 'translate('+ screenW*0.04 +','+(scaleCause(d.key)-yAdjustment)+')';
            });
        
        numberEachUpdate = numberEnter.selectAll('.number-each')
            .data(function(d){return d.values});
            
        numberEachEnter = numberEachUpdate
            .enter()
            .append('text')
            .classed('number-each',true)
            .attr('transform',function(d){
            	// console.log(d);
            	// if(d.key%3==2){
             //        return 'translate(0,-50)'
            	// }
             //    if(d.key%3==0){
             //    	return 'translate(0,40)'
             //    }
             //    if(d.key%3==1){
             //    	return 'translate(0,-20)'
             //    }
                 if(d.key%2==0){
                 	return 'translate(0,-25)'
                 }
                 if(d.key%2==1){
                 	return 'translate(0, 35)'
                 }
            })
            .merge(numberUpdate)
            .attr('x',function(d){ return scaleX(d.key)})
            .attr('y',function(d){ return scaleValue(d.value)-5})
            .style('font-size','11px')
            .style('text-anchor','start')
            .text(function(d){ 
            	var f = d3.format(',')
            	return f(Math.round(d.value))
            })


        notation = plot.selectAll('.notation-wrap')
            .data(processedData)
            .enter()
            .append('g')
            .attr('class',function(d){
               var no_space = d.key.split(' ').join('')
               return no_space;
             })
            .classed('notation-wrap',true)

        //plot circle
	    circle = notation
	        .append('g')
            .classed('circle-wrap',true)
	        .attr('transform',function(d){
            	return 'translate('+ screenW*0.04 +','+(scaleCause(d.key)-yAdjustment)+')';
            });
        
        circleEach = circle.selectAll('.circle-each')
            .data(function(d){return d.values})
            .enter()
            .append('circle')
            .classed('circle-each',true)
            .attr('cx',function(d){ return scaleX(d.key)})
            .attr('cy',function(d){ return scaleValue(d.value)})
            .attr('r',2)
            .style('fill','#C8C8C8')
            .style('opacity',1)
            .style('stroke','#C8C8C8')
            .style('stroke-width',0.5);


        //Connect line
        connectline = notation
	        .append('g')
            .classed('coline-wrap',true)
	        .attr('transform',function(d){
            	return 'translate(50,'+(scaleCause(d.key)-yAdjustment)+')';
            });
        
        connectlineEach = connectline.selectAll('.connectline-each')
            .data(function(d){return d.values})
            .enter()
            .append('line')
            .classed('coline-each',true)
            .attr('x1',function(d){ return scaleX(d.key)})
            .attr('x2',function(d){ return scaleX(d.key)})
            .attr('y1',function(d){ return scaleValue(d.value)})
            .attr('y2',function(d){ return scaleValue(d.value)})
            .transition().duration(100)
            .attr('y2',function(d){ 
                // if(d.key%3==2){
                // 	return scaleValue(d.value)-50
                // }
                //   if(d.key%3==0){
                // 	return scaleValue(d.value)+25
                // }              
                //   if(d.key%3==1){
                // 	return scaleValue(d.value)-20
                // }   
                 if(d.key%2==0){
                 	return scaleValue(d.value)-25
                 }
                 if(d.key%2==1){
                 	return scaleValue(d.value)+20
                 }       	

            })
            .style('fill','#C8C8C8')
            .style('opacity',1)
            .style('stroke','#C8C8C8')
            .style('stroke-width',1)
            .style('stroke-dasharray','1,2');
        
        

        //data exit does not work for now ...
	    causeUpdate.exit().remove();
        lineUpdate.exit().remove();
	    areaUpdate.exit().remove();
	    numberUpdate.exit().remove();
        numberEachUpdate.exit().remove();


        
    }

    exports.selectMeasure = function(_mea){
        if(!arguments.length) return _measure;
    	_measure = _mea;
    	return this;
    }

    exports.measureScale = function(_sca){
    	if(!arguments.length) return _meaScale;
    	_meaScale = _sca;
    	return this;
    }

    exports.selectCause = function(_cau){
    	if(!arguments.length) return _cause;
    	_cause = _cau;
    	return this;
    }
    
    return exports;

}