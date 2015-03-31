d3.csv('property_unique.csv', function(data){

  data = {items: data}

  var template_source = d3.select("#property-template").html();
  var property_template = Handlebars.compile(template_source);

  var html = property_template(data)
  d3.select('#properties-wrapper').html(html) 
})
