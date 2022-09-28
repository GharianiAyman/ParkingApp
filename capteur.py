#!/usr/bin/python

# MIT License
# 
# Copyright (c) 2017 John Bryan Moore
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import time
import VL53L0X
import asyncio
import websockets
import requests
import json

async def test(selected):
    async with websockets.connect('ws://192.168.110.124:3333') as websocket:
        selected["type"] = "in"
        await websocket.send(json.dumps(selected))
        response = await websocket.recv()
        #print(response)

# Create a VL53L0X object
tof = VL53L0X.VL53L0X()
# Start ranging
tof.start_ranging(VL53L0X.VL53L0X_BETTER_ACCURACY_MODE)


timing = tof.get_timing()
if (timing < 20000):
    timing = 20000
print ("--------------------Timing %d ms" % (timing/1000))
API_ENDPOINT = "http://192.168.110.124:3000/Parking/get_capteur"
r = requests.post(url = API_ENDPOINT)
parkings = r.json()["parking"]; 

for parking in parkings:
    if ( parking["title"] == "parking 1" ):
        selected = parking

print(f"--------------------- ")

#asyncio.get_event_loop().run_until_complete(test(selected))
present=0

while(1):
    distance = tof.get_distance()
    if ((distance > 0) & (distance < 100) & (present == 0 ) ):
        print ("%d cm" % ((distance/10)))
        asyncio.get_event_loop().run_until_complete(test(selected))
        time.sleep(timing/1000000.00)
        r = requests.post(url = API_ENDPOINT)
        parkings = r.json()["parking"]; 
        for parking in parkings:
            if ( parking["title"] == "parking 1" ):
                selected = parking
        present = 1
    if( distance >100 ):
        present=0


    time.sleep(timing/1000000.00)

