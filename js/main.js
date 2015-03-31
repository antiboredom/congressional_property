d3.csv('property.csv', function(data){

  data = {items: data}

  var template_source = d3.select("#property-template").html();
  var property_template = Handlebars.compile(template_source);

  var html = property_template(data)
  d3.select('#properties-wrapper').html(html)

  d3.selectAll('.property').on('click', function(){
    var me = d3.select(this);
    var embed_url = me.attr('data-embed');
    var img = me.select('.main-image');
    var h = this.getBoundingClientRect().height;

    var iframe = me
      .append('iframe')
      .attr('src', embed_url)
      .attr('width', '100%')
      .attr('height', h)
      .attr('frameborder', '0')
      .style('display', 'none')

    iframe.on('load', function(){
      iframe.style('display', 'block')
      img.remove()
    })

  })
})
