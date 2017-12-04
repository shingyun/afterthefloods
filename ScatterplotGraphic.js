function ScatterplotGraphic(){
    
    var MAX_COUNT = 2800 //2779

    function exports(selection){
        
    	var data = selection.datum() || [];

      plot = selection
        .append('svg')
        .attr('width',200)
        .attr('height',500)
        .append('g')
        .attr('transform','translate(40,10)');
      
      scaleX = d3.scaleLinear()
        .domain([0,MAX_COUNT])
        .range([10,130])

      scaleY = d3.scaleLinear()
        .domain([0,_measure])
        .range([430,10]);

      axisX = d3.axisBottom()
        .tickValues([0,MAX_COUNT])
        .scale(scaleX);

      axisY = d3
        .axisLeft()
        .tickValues([0,_measure])
        .scale(scaleY);

      var charge = d3.forceManyBody().strength(0),
          forceX = d3.forceX().x(d => { console.log(d);return scaleX(d.count_total)})
          forceY = d3.forceY().y(d => { console.log(d); return scaleY(d[_yValue])})
          collide = d3.forceCollide().radius(6);


      circle = plot.selectAll('circle')
          .data(data)

      //circle stroke
      circle.enter()
          .append('circle')
          .attr('class',function(d){
            var no_space = d.cause.split(' ').join('')
            return 'stroke '+no_space;
          })
          .attr('cx',d => scaleX(d.count_total))
          // .attr('cx',55)
          .attr('cy',d => scaleY(d[_yValue]))
          // .attr('r',d => scaleX(d.count_total))
          .attr('r',5)
          .style('stroke','#58A5C0')
          .style('fill','none');

      //Filled Circle
      circle.enter()
          .append('circle')
          .attr('class',function(d){
            var no_space = d.cause.split(' ').join('')
            return no_space;
          })
          .classed('filled',true)
          .attr('cx',d => scaleX(d.count_total))
          // .attr('cx',55)
          .attr('cy',d => scaleY(d[_yValue]))
          // .attr('r',d => scaleX(d.count_total))
          .attr('r',5)
          .style('fill','#58A5C0')
          .style('opacity',0.3)
          .on('mouseenter',function(d){

          })
          .on('click',function(d){

            var no_space = d.cause.split(' ').join('')

            d3.select('.scatters')
             .selectAll('.filled')
             .style('fill','#58A5C0')
             .style('stroke','none')
             .style('opacity',0.3);

            d3.selectAll('.button-cause')
              .classed('selectedBtn-cause',false)

            d3.selectAll('.filled.'+no_space)
              // .style('fill','#C39076')
              .style('opacity',1)
              .style('opacity',1)
              .style('stroke','#D2E6F0')
              .style('stroke-width',5)

            d3.selectAll('.buttons-cause')
              .select('.'+no_space)
              .classed('selectedBtn-cause',true)

          });

      // if(!simulation){

      // var simulation = d3.forceSimulation(data)
      //     .force('charge',charge)
      //     .force('forceX',forceX)
      //     .force('forceY',forceY)
      //     // .force('collide',collide)
      //     .on('tick',function(d){
      //       console.log(d);
      //         // circle.attr('cx',d.x)
      //         //       .attr('cy',d.y)
      //     });

      // }



      //axis X
      plot.append('g')
          .attr('class','scatter-axis scatter-axisX')
          .attr('transform','translate(0,460)')
          .call(axisX);
      
      //axis Y
      plot.append('g')
          .attr('class','scatter-axis scatter-axisY')
          .attr('transform','translate(0,0)')
          .call(axisY)
            .selectAll('text')
            // .attr('transform','translate(-15,-12.5)rotate(-90)');


    }

    exports.scatterMeasure = function(_mea){
        if(!arguments.length) return _measure;
    	_measure = _mea;
    	return this;
    }

    exports.yValue = function(_y){
        if(!arguments.length) return _yValue;
      _yValue = _y;
      return this;
    }
    
    return exports;

}