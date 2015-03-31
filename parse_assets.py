# -*- coding: utf-8 -*-

import csv
import sys
import re
import urllib
import os
import time
import requests
from pprint import pprint

# category ids: http://www.opensecrets.org/downloads/crp/CRP_Categories.txt
# fields: http://www.opensecrets.org/resources/datadictionary/Data%20Dictionary%20pfd_assets.htm


def geocode(address):
    url = 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDO8PsWMpUOWUVCxRh2m1TikEKj2ztuTOk&address=' + urllib.quote_plus(address)
    r = requests.get(url)
    result = r.json()
    return result

def parse_assets():
    pattern = re.compile(r'^\d{1,50}\s\w')

    writer = csv.writer(sys.stdout)
    writer.writerow(['pfid', 'cid', 'name', 'code', 'original_address', 'google_address', 'lat', 'lng'])

    with open('cids.csv', 'r') as f:
        reader = csv.reader(f)
        names = {r[0] : r[1] for r in reader}

    assets = set()

    with open('assets.txt', 'r') as f:
        reader = csv.reader(f, quotechar='|')
        for row in reader:
            pfid = row[0]
            cid = row[2]
            original_description = row[7]
            asset = row[8].replace('/', ', ')
            code = row[10]
            value = row[19]
            location = row[17]
            if re.search(pattern, asset) and asset not in assets and 'acre' not in asset.lower() and len(asset.split(' ')) > 4:
                assets.add(asset)
                geo = geocode(asset)['results']
                if len(geo) < 1:
                    continue
                geo = geo[0]
                # pprint(geo)
                lat = geo['geometry']['location']['lat']
                lng = geo['geometry']['location']['lng']
                address = geo['formatted_address']
                # address = ap.parse_address(asset)
                # print asset# + ' ::: ' + row[7] + ' ::: ' + location + ' ::: ' + row[20]
                # print address
                writer.writerow([pfid, cid, names[cid].encode('utf-8'), code, original_description.encode('utf-8'), address.encode('utf-8'), lat, lng])
                time.sleep(.1)

# parse_assets()

# with open('semi_good_addresses.csv', 'r') as f:
#     reader = csv.reader(f)
#     people = set([r[1] for r in reader])
#     print len(people)

def get_images():
    with open('property.csv', 'r') as f:
        reader = csv.reader(f)

        for row in reader:
            url = 'https://maps.googleapis.com/maps/api/streetview?key=AIzaSyDO8PsWMpUOWUVCxRh2m1TikEKj2ztuTOk&size=640x640&location=' + row[5]
            filename = 'images/' + row[0] + '.jpg'
            if os.path.exists(filename) is False:
                print 'downloading: ' + url
                urllib.urlretrieve(url, filename)
                time.sleep(1)

def make_csv():
    writer = csv.writer(sys.stdout)
    writer.writerow(['pid', 'cid', 'cat', 'address', 'location', 'name'])

    with open('cids.csv', 'r') as f:
        reader = csv.reader(f)
        names = {r[0] : r[1] for r in reader}

    with open('semi_good_addresses.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            filename = 'images/' + row[0] + '.jpg'
            if os.path.exists(filename) and os.path.getsize(filename) > 10000:
                writer.writerow(row + [names[row[1]]])



def remove_duplicates():
    addresses = set()
    writer = csv.writer(sys.stdout)

    with open('property.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[5] not in addresses:
                addresses.add(row[5])
                writer.writerow(row)



def missing_images():
    writer = csv.writer(sys.stdout)

    with open('property_unique.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            fname = 'images/' + row[0] + '.jpg'
            if os.path.exists(fname) and os.path.getsize(fname) < 10000:
                writer.writerow(row)


def missing_images2():
    with open('property_unique.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            fname = 'images/' + row[0] + '.jpg'
            if os.path.exists(fname) and os.path.getsize(fname) < 10000:
                print row[0] + '::::' + row[5]


def addresses():
    with open('property_unique.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            print row[0] + '::::' + row[5]

addresses()

# remove_duplicates()

# make_csv()

# get_images()
