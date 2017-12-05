function Bubble(){

    function exports(selection){
        
    	var data = selection.datum() || [];

    	var plot = selection.select('svg').size() ===0?
    	           selection.append('svg'):selection.select('svg');

    	plot.attr('width',screenW)
		    .attr('height',screenH-50)
		    .append('g')
		    .attr('transform','translate(50,50)');

	    //nest the data by cause and month/year
	    floodByCause = d3.nest().key(function(d){
	           if(!d.cause_1){ return ;
	           } else{ return d.cause_1;
	           } 
	        })
	        .rollup(function(d){return d.length})
	        .entries(data);

	    //remove undefined cause
	    floodByCause.splice(9,1)

	    cause = floodByCause.map(function(d){return d.key})

	    scaleX = d3.scaleBand()
	        .domain(['Monsoon Rain','Tropical Cyclone','Torrential Rain','Heavy Rain','Dam or Levee Related','Snowmelt','Rain and Snowmelt','Ice Related','Other'])
	        .range([200,700]);

      //append g for each cause
      var nodes = plot
            .selectAll('.nodes')
            .data(floodByCause)
            .enter()
            .append('g')
            .attr('class','nodes')
            .on('mouseenter',function(d){
                  d3.selectAll('.node-circle')
                    .style('fill',mainCol)
                    .style('opacity',0.35)
                  d3.select(this)
                    .select('circle')
                    .style('fill',highlightCol)
                    .style('opacity',0.8)
                  d3.select('.des-number')
                     .text(d.value)
                  d3.select('.des-cause')
                     .text(d.key)
              });

        //circle under g
 	    var circle = nodes
              .append('circle')
              .attr('class',function(d){
               var no_space = d.key.split(' ').join('')
               return no_space;
              })
              .classed('node-circle',true)
              .style('fill',function(d){
                if(d.key === 'Heavy Rain'){
                    return highlightCol
                } else {
                    return mainCol
                }
              })
              .style('opacity',0)
              .transition().duration(1500)
              .attr('r',function(d){return Math.sqrt(d.value)*2.5 })
              .style('opacity',function(d,i){
                 if(d.key === 'Heavy Rain'){
                    return 0.8
                 } else {
                    return 0.35
                 }

              })

        //labels for causes
        var text = nodes
            .append('text')
            .attr('class','node-text')
            .attr('transform','translate(0,-23)')
            .text(d => d.key)
            .style('opacity',0)
            .transition().duration(1000)
            .style('opacity',1)
            .style('fill','#c3c3c3')
            .style('text-anchor','middle')
    
        
        // force layout setting
        var charge = d3.forceManyBody().strength(120),
            forceX = d3.forceX().x(d => scaleX(d.key))
            // forceX = d3.forceX().x(plotW/2)
            forceY = d3.forceY().y(screenH/2.5)
            collide = d3.forceCollide().radius(80);

        var simulation = d3.forceSimulation(floodByCause)
            .force('charge',charge)
            .force('forceX',forceX)
            .force('forceY',forceY)
            .force('collide',collide)
            .on('tick',function(d){
            	nodes
                .attr('transform',function(d){
                	if(d.key === 'Rain and Snowmelt'){
                      return 'translate('+(d.x-40)+','+(d.y)+')'
                	} else if(d.key == 'Torrential Rain'){
                      return 'translate('+(d.x-40)+','+(d.y+30)+')'
                    } else if(d.key === 'Tropical Cyclone'){
                      return 'translate('+(d.x-40)+','+(d.y-10)+')'
                    } else if(d.key === 'Monsoon'){
                      return 'translate('+(d.x+10)+','+(d.y)+')'
                    } else if(d.key === 'Dam or Levee Related'){
                      return 'translate('+(d.x+70)+','+(d.y+30)+')'
                    } else if(d.key === 'Snowmelt'){
                      return 'translate('+(d.x+30)+','+(d.y+30)+')'
                    } else if(d.key === 'Other'){
                      return 'translate('+(d.x-50)+','+(d.y+20)+')'
                    } else{
                	  return 'translate('+d.x+','+d.y+')'
                	}
                });
            });

        //DES TEXT
        var text = plot.append('g')
            .attr('class','text-wrap')

        text.append('text')
            .attr('class','des-number')
            .attr('x',800)
            .attr('y',250)
            .text('2779');

        text.append('text')
            .attr('class','des-text')
            .attr('x',800)
            .attr('y',280)
            .text('floods from 1984-2017') 

        text.append('text')
            .attr('class','des-cause')
            .attr('x',800)
            .attr('y',310)
            .text('Heavy Rain')


    }

    return exports;

}