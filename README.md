# air-quality-data-logger
Collect, store and web-display data from serially connected air quality data loggers.

Includes python code for the data logger wrapper (datalogger) and the web server (webserver) and js code for the web interface, which simply displays current and historic data in a echarts.js line chart. 

The data logger wrapper reads data from data logger connected via a serial interface, writes this data to a mongodb database and on a mqtt queue to push each data package to the web server. For demonstration purposes a public MQTT-Broker at no cost has been choosen, which doesnn't allow for encrypted queues. Mongodb surely is a good choice if you don't want to bother with the complexity of setting up a database. But this is at the cost of complexity or unacceptable performance, e.g. if it comes to realtime data aggregation. 

For the web server the `Flask` framework is utilized in combination with `socketio` to allow for data push. 

## Quick Start
To set up the project locally download this rep and initialize the js and python projects. You will need `python3.6+` for the python part and `nodejs10+` for the js part. To allow for modular scripting the new `module` feature of ECMA-Sript is used. Snowpack` is used as development server and build tool for the ES part.

    git clone https://github.com/phyzzxbrewery/air-quality-data-logger.git
    
To initialize the webclient for development


    cd air-quality-data-logger/webclient    
    npm init

If you would like to start the development server:

    npm start

As the data to be displayed require the web server running, you will also have to start the web server. To initialize the webserver

    cd air-quality-data-logger/webserver
    virtualenv -p python3 .env
    source .env/bin/activate
    pip install -r requirements
    
To serve the flask app in development mode you have to set some environment variables, which you can read from config.py. Start the application with

    gunicorn --worker-class eventlet -w 1 --reload app:app
    
Finally, to set up the datalogger wrapper change into the datalogger directory and repeat the first 4 steps after you have deactivated the webserver virtual environment (`deactivate`). The wrapper can than be started with

    python client.py
    
for the PCE AQD20 data logger and

    python client-plantower.py
    
for the plantower data logger resp.
Both wrappers don't recognize the correct serial interface automatically. But if you first plug the PCE logger and than the plantower logger the hard-coded connection of PCE to `/dev/ttyUSB0` and of plantower to `/dev/ttyUSB1` should fit. To automatically start the logging services you must integrate these commands into the system.d mechanism appropriatly. Instructions you will find easily in the WWW as almost all code found here is a variation of code I scraped from web tutorials.
## The data loggers
This project has been realized with a PCE AQD20 data logger and a cost efficient dust sensor build around a plantower pms5003 particle counter, found at [this shopping site](https://m.banggood.com/PM1_0-PM2_5-PM10-Detector-Module-Air-Quality-Dust-Sensor-Tester-Detector-Support-Export-Data-Monitoring-Home-Office-Car-Tools-p-1615550.html?akmClientCountry=DE&utm_design=18&utm_email=1602254740_2324&utm_source=emarsys&utm_medium=Shipoutinform190813&utm_campaign=trigger-logistics&utm_content=Gakki&sc_src=email_2671705&sc_eh=2523af32c8b7c74e1&sc_llid=24696974&sc_lid=104858042&sc_uid=ud9BBoFZXw&cur_warehouse=CZ). Unfortunately, this came without any documentation but the shopping site's product description includes a Q & A section, where some relevant hints can be found. The sensor itself is [well documented] (https://www.aqmd.gov/docs/default-source/aq-spec/resources-page/plantower-pms5003-manual_v2-3.pdf).
## Disclaimer
This is by no means stable or clean code. This is just a hack to get the the remote data visualization of serially connected data loggers running. MQTT to send and receive data has proven to be reliable so far. The same holds for a python script to connect to the serial interface and write data on `mqtt` queues. Data storage on the other side surely needs some re-thinking which also holds true for the visualization techniques. Any data processing exceeding moving averages to smooth the highly volatile CO2/particle concentration curves has not been addressed at all. 
