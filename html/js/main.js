window.onload = function() {
  var map = new L.Map('map', {
      center: [39.8282, -98.5795],
      zoom: 2
    });

  L.mapbox.tileLayer('bclifton.9f0ca136', {
      accessToken: 'pk.eyJ1IjoiYmNsaWZ0b24iLCJhIjoicWNXT0Z6OCJ9.JvNO6GIbU8BZ-8LLSEwz2Q',
      attribution: "<a href='https://www.mapbox.com/about/maps/' target='_blank'>&copy; Mapbox &copy; OpenStreetMap</a> <a class='mapbox-improve-map' href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a>"
    })
    .addTo(map);

  var sublayerOptions = {
          sql: "SELECT * FROM property_unique_carto",
          cartocss: "#null{"+
            "marker-fill-opacity: 0.9;"+
            "marker-line-color: #FFF;"+
            "marker-line-width: 1.5;"+
            "marker-line-opacity: 0;"+
            "marker-placement: point;"+
            "marker-type: ellipse;"+
            "marker-width: 6;"+
            "marker-fill: #e6842a;"+
            "marker-opacity: 0.75;"+
            "marker-allow-overlap: true;"+
          "}"
    };

  cartodb.createLayer(map, 'http://brianclifton.cartodb.com/api/v2/viz/0aac4b22-d881-11e4-843e-0e0c41326911/viz.json')
    .addTo(map)
    .on('done', function(layer){
      var sublayer = layer.getSubLayer(0);
      sublayer.set(sublayerOptions);
      sublayers.push(sublayer);

      sublayer.on('featureClick', function(e, latlng, pos, data) {
        // console.log('data:', data);
      });     
    })
    .on('error', function(err) {
        console.log(err);
    });    
};

var sublayers = [];

var LayerActions = {
  selection: function(cids){
    var c = cids.join("','");
    var query = "SELECT * FROM property_unique_carto WHERE cid IN ('" + c + "')";
    sublayers[0].setSQL(query);
    return true;
  },
  all: function(){
    sublayers[0].setSQL("SELECT * FROM property_unique_carto");
  }
};


var people_assets = {};

var sorters = {
  alpha: function(a, b){
    return a.name >= b.name ? 1 : -1;
  },
  quantity: function(a, b){
    var asset_count = people_assets[b.name] - people_assets[a.name];
    if (asset_count !== 0) {
      return asset_count;
    } else {
      return a.name >= b.name ? 1 : -1;
    }
  }
};

function clean_name(name) {
  var parts = name.split(', ');
  return parts[1] + ' ' + parts[0];
}

function extract_address(address) {
  address = address.split(', ');
  var street = address[0];
  var city = address[1] ? address[1] : null;
  var state = address[2] ? address[2].slice(0, 2) : null;
  var fullstate = state && states[state] ? states[state] : null;

  return {
    street: street,
    city: city,
    state: state,
    fullstate: fullstate
  };
}

d3.csv('assets/property.csv', function(data){

  data = data.map(function(d){
    d.fullname = clean_name(d.name);
    d.address = extract_address(d.google_address);
    return d;
  });

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

      me.on('click', null);

    });

  d3.select('select[name="sort"]').on('change', function(){
    d3.selectAll('.property').sort(sorters[this.value]);
  });

  d3.select('input[name="search"]').on('keyup', function(){
    var q = this.value.toLowerCase();

    if (q.length < 1) {
      LayerActions.all();
    }    
    
    var cids = {};

    d3.selectAll('.property').each(function(d){
      var name = d.fullname.toLowerCase();
      var city = d.address.city ? d.address.city.toLowerCase() : null;
      var state = d.address.fullstate ? d.address.fullstate.toLowerCase() : null;
      
      if (name.indexOf(q) > -1 || (city && city.indexOf(q) > -1) || (state && state.indexOf(q) > -1)) {
        cids[d.cid.toUpperCase()] = null;
        this.style.display = 'block';
      } else {
        this.style.display = 'none';
      }
    });

    if (q.length >= 1) {
      LayerActions.selection(Object.keys(cids));
    }    
  });

});



function select(d){
  d3.selectAll('.property').each(function(d){
    var name = d.fullname.toLowerCase();
    var city = d.address.city ? d.address.city.toLowerCase() : null;
    var state = d.address.fullstate ? d.address.fullstate.toLowerCase() : null;

    if (d.id) {
      this.style.display = 'block';
    } else {
      this.style.display = 'none';
    }
  });
}
