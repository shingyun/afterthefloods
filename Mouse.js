function Mouse(){
    
    var mouseStartX = 278,
        Data_n      = Data_end-Data_begin;

    function exports(selection){
        
    	var processedData = selection.datum() || [];

	    // //Mouse Interaction
        var mouseG = selection.append('g')
            .attr('class','mouse-over-effects');

        //remove and append the reference line again,
        //in order to keep the line on the top, valid???
        d3.select('.mouse-line').remove();
        d3.selectAll('.mouse-per-line').remove();

        mouseG.append('path') //the reference line
            .attr('class','mouse-line')
            .attr('transform','translate('+mouseStartX+',0)')
            .style('stroke','#ffffff')
            .style('stroke-width','0.3px')
            .style('opacity','0');


        var lines = document.getElementsByClassName('line');

        var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(processedData);

        // mousePerLineEnter = mousePerLine
        //     .enter()
        //     .append('g')
        //     .attr('class','mouse-per-line')
        //     .attr('transform','translate(100,0)');

        // mousePerLineEnter.append('circle')
        //     .attr('r',3.5)
        //     .attr('transform',function(d){
        //     	return 'translate('+mouseStartX+','+(scaleCause(d.key)-yAdjustment)+')';
        //     })
        //     .style('fill','orange')
        //     .style('stroke-width','1px')
        //     .style('opacity','0');
        

        /////original mouse text
        // mousePerLineEnter
        //     .append('text')
        //     .attr('class','mouse-text')
        //     .attr('transform',function(d){
        //        // console.log(d);
        //        //(mouseStartX+15)
        //     	return 'translate('+ (mouseStartX+15) +','+(scaleCause(d.key)+15)+')';
        //     });

        mouseG.append('rect')
            .attr('class','.mouse-rect')
            .attr('width', 760)
            .attr('height',600)
            .attr('transform','translate('+ mouseStartX +',0)')
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout',function(){
            	d3.select('.mouse-line')
            	  .style('opacity','0');
            	d3.selectAll('.mouse-per-line circle')
            	  .style('opacity','0');
            	d3.selectAll('.number')
            	  .style('opacity','0');
            })
            .on('mouseover',function(){
            	d3.select('.mouse-line')
                  .style('opacity', '1');
                d3.selectAll(".mouse-per-line circle")
                  .style("opacity", "0.7");
                d3.selectAll(".number")
                  .style("opacity", "0.7");
            })
            .on('mousemove', function() { // mouse moving over canvas
                var mouse = d3.mouse(this);

                d3.select(".mouse-line")
                  .attr("d", function() {
                      var d = "M" + (0+24*(Math.round((mouse[0])/24))) + "," + 550;
                      d += " " + (0+24*(Math.round((mouse[0])/24))) + "," + 0;
                      return d;
                });

		        // d3.selectAll(".mouse-per-line")
		        //   .attr("transform", function(d, i) {

		        //   	// console.log(d.values);
 
		        //     var xYear = (Data_begin+((Math.round((mouse[0])/24))+0));
          //               bisect = d3.bisector(function(d){return d.key; }).right;
          //               idx = bisect(d.values, xYear);
     
          //               // console.log('xYear',xYear);

		        //     var beginning = 0,
		        //         end = Math.floor(lines[i].getTotalLength()/24)+1,
		        //         target = null,
          //               d_mouse = (8+1*(Math.round((mouse[0])/24)));

          //               // console.log('end',end)
          //               // console.log('d_mouse',d_mouse);
		        //     while (true){
		        //       target = Math.floor((beginning + end) / 2);
		        //       // console.log('target',target)
		        //       pos = lines[i].getPointAtLength(0+24*target);
		        //       // console.log('position',pos);
          //             pos.x = Math.round(pos.x/24);
          //             // console.log('position',pos.x);

		        //       if ((target === end || target === beginning) && pos.x !== d_mouse) {
		        //           break;
		        //       }
		        //       if (pos.x > d_mouse)  end = target;
		        //       else if (pos.x < d_mouse) beginning = target;
		        //       else break; //position found
		        //     }

		        //     // d3.select(this).selectAll('text')
		        //     //   .text(scaleValue.invert(scaleValue(d.values[idx-1].value)).toFixed(0));
                      
		        //     return "translate(" + (24*(Math.round((mouse[0])/24))) + "," + pos.y +")";
		        //   });

          //         numberUpdate.merge(numberEnter)
          //           .text(function(d){
          //               return scaleValue.invert(scaleValue(d.values[idx-1].value)).toFixed(0)
          //           });

            });//mousemove

        mousePerLine.exit().remove();

    }

    //For code reference
    // exports.selectMeasure = function(_mea){
    //     if(!arguments.length) return _measure;
    // 	_measure = _mea;
    // 	return this;
    // }

    return exports;

}