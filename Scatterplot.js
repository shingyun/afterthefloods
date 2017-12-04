function ScatterplotData(){

    var MAX_DEATH_TOTAL = 304500, //303965
        MAX_DISPLACED_TOTAL = 321797000, //321796452
        MAX_DURATION_TOTAL = 31700, //31604
        MAX_AFFECTED_TOTAL = 292322000;//292321759

    var scatterDeath;

    function exports(selection){
        
    	var data = selection.datum() || [];

      data = data.slice(0,4521);

      //nest the data by cause and month/year
      floodByCause = d3.nest().key(function(d){
             if(!d.cause_1){ return ;
             } else{ return d.cause_1;
             } 
          })
          .entries(data);
      
      //remove undefined cause
      floodByCause.splice(9,1);

      var cause = floodByCause.map(d => d.key);

      var structuredData = [];

      floodByCause.forEach(function(d){

          var cause = d.key, 
              count = d.values.length, 
              death = 0, 
              displaced = 0, 
              duration = 0, 
              affected = 0;
          
          //Add up all flood, should do average? or median?
          d.values.forEach(function(e){
              death = death + e.death;
              duration = duration + e.duration;
              displaced = displaced + e.displaced;
              affected = affected + Number(e.affected_area);
              
          })

          structuredData.push({
            'cause': cause,
            'count_total':count/count,
            'death_total':death/count,
            'displaced_total': displaced/count,
            'duration_total': duration/count,
            'affected_total': Math.round(affected)/count
          })
      })//floodByCause.map

      console.log(structuredData);

      //Scatter plot for Death
      scatterDeath = ScatterplotGraphic()
        .scatterMeasure(MAX_DEATH_TOTAL)
        .yValue('death_total');

      d3.select('#scatter1')
        .datum(structuredData)
        .call(scatterDeath)

      //Scatter plot for Displaced
      scatterDisplaced = ScatterplotGraphic()
        .scatterMeasure(MAX_DISPLACED_TOTAL)
        .yValue('displaced_total');

      d3.select('#scatter2')
        .datum(structuredData)
        .call(scatterDisplaced)

      //Scatter plot for Duration
      scatterDuration = ScatterplotGraphic()
        .scatterMeasure(MAX_DURATION_TOTAL)
        .yValue('duration_total')

      d3.select('#scatter3')
        .datum(structuredData)
        .call(scatterDuration)

      //Scatter plot for affted area
      scatterAffected = ScatterplotGraphic()
        .scatterMeasure(MAX_AFFECTED_TOTAL)
        .yValue('affected_total')

      d3.select('#scatter4')
        .datum(structuredData)
        .call(scatterAffected)


      //////Buttons//////
      d3.select('.buttons-cause')
        .selectAll('div')
        .data(structuredData)
        .enter()
        .append('div')
        .attr('class',function(d){
            var no_space = d.cause.split(' ').join('')
            return no_space;
        })
        .classed('button-cause',true)
        .html(d => d.cause)
        .on('mouseenter',function(d){
            
        })
        .on('click',function(d){

           d3.selectAll('.selectedBtn-cause')
             .classed('selectedBtn-cause',false)

           d3.select(this)
             .classed('selectedBtn-cause',true)

           d3.select('.scatters')
             .selectAll('.filled')
             // .attr('r',5)
             .style('fill','#58A5C0')
             .style('opacity',0.3)
             .style('stroke','none');

           var no_space = d.cause.split(' ').join('')

           d3.select('.scatters')
             .selectAll('.filled.'+no_space)
             // .attr('r',10)
             // .style('fill','#C39076')
             .style('opacity',1)
             .style('stroke','#D2E6F0')
             .style('stroke-width',5)
        })




    }

    
    return exports;

}