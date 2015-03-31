// window.onload = function() {
//   cartodb.createVis('map', 'http://brianclifton.cartodb.com/api/v2/viz/e7a71802-d7e8-11e4-a3f7-0e018d66dc29/viz.json');
// };

$(window).ready(function() {
  var map = new L.Map('map', {
      center: [39.8282, -98.5795],
      zoom: 2
    });

  L.mapbox.tileLayer('bclifton.j3dc99p7', {
    accessToken: 'pk.eyJ1IjoiYmNsaWZ0b24iLCJhIjoicWNXT0Z6OCJ9.JvNO6GIbU8BZ-8LLSEwz2Q',
    attribution: 'Brian Clifton | <a href="http://cartodb.com/">CartoDB</a> | <a href="https://www.mapbox.com/">MapBox</a>'
  }).addTo(map);

  cartodb.createLayer(map, 'http://brianclifton.cartodb.com/api/v2/viz/e7a71802-d7e8-11e4-a3f7-0e018d66dc29/viz.json')
    .addTo(map)
    // .on('done', function(layer) {
    //   //do stuff
    // })
    // .on('error', function(err) {
    //   // alert("some error occurred: " + err);
    // })
    ;
  // cartodb.createVis('map', 'http://brianclifton.cartodb.com/api/v2/viz/e7a71802-d7e8-11e4-a3f7-0e018d66dc29/viz.json');

});




d3.csv('assets/property.csv', function(data){

  data = data.sort(function(a, b){
    return a.name >= b.name ? 1 : -1;
  });
  data = {items: data};

  var template_source = d3.select("#property-template").html();
  var property_template = Handlebars.compile(template_source);

  var html = property_template(data);
  d3.select('#properties-wrapper').html(html);

  d3.selectAll('.property').on('click', function(){
    var me = d3.select(this);
    var embed_url = me.attr('data-embed');
    var img = me.select('.main-image');
    var h = me.select('.inner').node().getBoundingClientRect().height;

    var iframe = me.select('.inner')
      .append('iframe')
      .attr('src', embed_url)
      .attr('width', '100%')
      .attr('height', h)
      .attr('frameborder', '0')
      .style('display', 'none');

    iframe.on('load', function(){
      iframe.style('display', 'block');
      img.remove();
    });

    me.on('click', null)

  });
});


Handlebars.registerHelper('clean_name', function(name) {
  var parts = name.split(', ');
  return parts[1] + ' ' + parts[0];
});

