d3.csv('property_unique.csv', function(data){

  data = {items: data}

  console.log(data)

  var template_source = d3.select("#property-template").html();
  var property_template = Handlebars.compile(template_source);

  var html = property_template(data)
  d3.select('#properties-wrapper').html(html) 

  // var items = d3.select('#images')
  //   .selectAll('a')
  //   .data(data)
  //   .enter()
  //   .append('a')
  //   .attr('href', function(d) { return 'https://www.google.com/maps/search/' + d.google_address })
  //   .attr('target', '_blank')
  //
  // items
  //   .append('img')
  //   .attr('src', function(d){ return '/images/' + d.pfid + '.jpg' })
  //   .attr('title', function(d){ console.log(d.name); return d.name + ' :: ' + d.original_address + ' :: ' + d.google_address });
  //
  // items
  //   .append('div')
  //   .attr('class', 'overlay')

})
