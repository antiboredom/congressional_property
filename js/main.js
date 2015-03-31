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



var people_assets = {};

d3.csv('assets/property.csv', function(data){

  data = data.map(function(d){
    d.fullname = clean_name(d.name);
    d.address = extract_address(d.google_address);
    return d;
  })

  data = data.sort(sorters.alpha);

  data.forEach(function(d){
    if (people_assets[d.name]){
      people_assets[d.name] ++;
    } else {
      people_assets[d.name] = 1;
    }
  });

  data = {items: data};

  var template_source = d3.select("#property-template").html();
  var property_template = Handlebars.compile(template_source);

  var html = property_template(data);
  d3.select('#properties-wrapper').html(html);
  d3.selectAll('.property')
    .data(data.items)
    .on('click', function(d){
      var me = d3.select(this);
      var embed_url = d.streetview_embed;
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

  d3.select('select[name="sort"]').on('change', function(){
    d3.selectAll('.property').sort(sorters[this.value]);
  });

  d3.select('input[name="search"]').on('keyup', function(){
    var q = this.value.toLowerCase();

    d3.selectAll('.property').each(function(d){
      var name = d.fullname.toLowerCase();
      var city = d.address.city ? d.address.city.toLowerCase() : null;
      var state = d.address.state ? d.address.state.toLowerCase() : null;

      if (name.indexOf(q) > -1 || (city && city.indexOf(q) > -1) || (state && state.indexOf(q) > -1)) {
        this.style.display = 'block';
      } else {
        this.style.display = 'none';
      }
    });
  });

});

var sorters = {
  alpha: function(a, b){
    return a.name >= b.name ? 1 : -1;
  },
  quantity: function(a, b){
    var asset_count = people_assets[b.name] - people_assets[a.name];
    if (asset_count != 0) {
      return asset_count;
    } else {
      return a.name >= b.name ? 1 : -1;
    }
  }
}

Handlebars.registerHelper('clean_name', clean_name);

function clean_name(name) {
  var parts = name.split(', ');
  return parts[1] + ' ' + parts[0];
}

function extract_address(address) {
  address = address.split(', ');
  return {
    street: address[0],
    city: address[1] ? address[1] : null,
    state: address[2] ? address[2].slice(0, 2) : null,
    fullstate: address[2] && states[address[2]] ? states[address[2]] : null
  }
}
