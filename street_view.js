var fs = require('fs');
var utils = require('utils');


var start = 'https://www.google.com/maps/place/';
var locations = []

var lines = fs.read('missing_images.txt').split('\n');

lines.forEach(function(l){
  parts = l.split('::::')
  if (fs.exists('casper_images/' + parts[0] + '.jpg') !== true) {
    item = {id: parts[0], address: parts[1]}
    locations.push(item)
  }
})


var already_parsed = []
var lines = fs.read('embed_codes.txt').split('\n');

lines.forEach(function(l){
  parts = l.split('::::')
  already_parsed.push(parts[0])
})

var addresses = []
var lines = fs.read('addresses.txt').split('\n');

lines.forEach(function(l){
  parts = l.split('::::')
  item = {id: parts[0], address: parts[1]}
  if (already_parsed.indexOf(item.id) == -1) {
    addresses.push(item)
  }
})

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var casper = require('casper').create({
  pageSettings: {
    javascriptEnabled: true,
    loadImages:  true,         // The WebPage instance used by Casper will
    loadPlugins: false,         // use these settings
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36'
  },
  viewportSize: { width: 1000, height: 1000 },
  verbose: true
});

casper.start().then(function(){
  getURLS(0);
})


function getURLS(num) {
  var url, embedURL;

  casper.open(start + addresses[num].address, function() {
  });

  casper.wait(2000, function(){
    if (casper.exists('.cards-explore-imagery-spacing button.imagery-entry-point-crop')) {
      casper.click('.cards-explore-imagery-spacing button.imagery-entry-point-crop');
    } else {
      casper.click('.widget-minimap-shim-button')
    }
  })

  casper.wait(6000, function(){
    url = this.getCurrentUrl();
    casper.click('.widget-gear-settings-icon')
  });

  casper.wait(500, function(){
    casper.evaluate(function(){
      document.querySelector('li[jsaction="gear.share-and-embed"]').click()
    })
  });

  casper.wait(500, function(){
    casper.evaluate(function(){
      document.querySelector('.widget-share-tab:nth-child(2n)').click()
    })
    // casper.click('.widget-share-tab:nth-child(2n)')
  })

  casper.wait(500, function(){
    embedURL = casper.evaluate(function(){
      return document.querySelector('input[name="embedHtml"]').value;
    })
    casper.echo(addresses[num].id + '::::' + url + '::::' + embedURL)
  });

  if (num < addresses.length - 1) {
    casper.wait(randInt(1500, 3000), function(){
      getURLS(num+1)
    })
  }

}

function getPages(num) {
  var filename = 'casper_images/' + locations[num].id + '.jpg';

  casper.open(start + locations[num].address, function() {
      casper.echo(this.getTitle());
  });

  casper.waitUntilVisible('#searchbox_form', function(){
      casper.echo(filename + ': ' + num + '/' + locations.length)
      // casper.echo('found omnibox')
  })

  casper.thenClick('.widget-zoom-in')
  casper.thenClick('.widget-zoom-in')

  casper.wait(2000, function(){
    if (casper.exists('.cards-explore-imagery-spacing button.imagery-entry-point-crop')) {
      casper.click('.cards-explore-imagery-spacing button.imagery-entry-point-crop');
    } else {
      casper.click('.widget-minimap-shim-button')
      // if (num < locations.length) {
      //   casper.wait(randInt(1500, 3000), function(){
      //     getPages(num + 1)
      //   })
      // }
    }
  })

  casper.wait(4000, function(){
    casper.evaluate(function(){
      document.querySelector('#titlecard').style.display = 'none';
      document.querySelector('.app-viewcard-strip').style.display = 'none';
      document.querySelector('#fineprint').style.display = 'none';
      document.querySelector('#omnibox').style.display = 'none';
      document.querySelector('#cards').style.display = 'none';
      document.querySelector('#gb').style.display = 'none';
    })
    casper.capture(filename);
  })
  
  if (num < locations.length) {
    casper.wait(randInt(1500, 3000), function(){
      getPages(num+1)
    })
  }
}

casper.run()

