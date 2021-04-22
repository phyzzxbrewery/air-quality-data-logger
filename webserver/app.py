import os, json
from datetime import datetime, timedelta
import eventlet
from flask import Flask, render_template, Response, jsonify
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_bootstrap import Bootstrap

from model import PlantowerData, AQData, db
import utils, config

eventlet.monkey_patch()

app = Flask(__name__)
app.config.from_object(os.environ.get('APP_SETTINGS',config.BaseConfig))

db.init_app(app)

mqtt = Mqtt(app)
socketio = SocketIO(app)
bootstrap = Bootstrap(app)
reducer = utils.Reducer

@app.route('/')
def index():
	return render_template('index.html')
	
@app.route('/data')
def data():
	now = datetime.now()
	d0 = (now - timedelta(hours=12)).timestamp()*1000
#	res = AQData.reduce(d0)
#	resp = []
#	while True:
#		try:
#			o = next(res)
#		except StopIteration:
#			break
#		resp.append(dict(
#			timestamp = o['timestamp'],
#			pm25 = dict(value = o['pm25'],unit="µg/m³"),
#			co2 = dict(value = o['co2'],unit="ppm"),
#			humidity = dict(value = o['humidity'],unit = "%"),
#			temperature = dict(value = o['temperature'],unit="°C"),
#			pressure = dict(value = o['pressure'],unit="hPa")
#		))
#	return jsonify(resp)
	return Response(AQData.objects(timestamp__gt=d0).to_json(),mimetype='application/json')

@app.route('/data2')
def data2():
	now = datetime.now()
	d0 = (now - timedelta(hours=12)).timestamp()*1000
	return Response(PlantowerData.objects(timestamp__gt=d0).to_json(),mimetype='application/json')

# serve static files
@app.route('/<path:path>')
def get_static( path ):
  "Die statischen Files aus dem dist-Verzeichnis"
  return app.send_static_file( path )

@socketio.on('publish')
def handle_publish(data):
	mqtt.publish(data['topic'], data['message'])
	app.logger.info(f"published {data['message']} to {data['topic']}")
	
	
@socketio.on('connect')
def handle_connect():
	app.logger.info('A user has connected!')

#@socketio.on('subscribe')
#def handle_subscribe(data):
mqtt.subscribe('datalogger_A36D7F9ACC734')
app.logger.info("subscribed to datalogger_A36D7F9ACC734")
mqtt.subscribe('datalogger_A42DA027B201')
app.logger.info("subscribed to datalogger_A42DA027B201")


@socketio.on('unsubscribe_all')
def handle_unsubscribe_all():
	mqtt.unsubscribe_all()


@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
	data = dict(
		topic=message.topic,
		payload=json.loads(message.payload)
	)
	app.logger.info(f'MQTT: Received the message {json.loads(message.payload)}')
	socketio.emit('mqtt_message', data=data)
	app.logger.info(f'socketio: send data to topic {data.get("topic")}')
#	r = reducer.get_reducer(data.get('topic'))
#	r.put(data.get('payload'))
#	if r.averagers.get('timestamp').is_full():
#		data.update(payload = r.get_data())
#		socketio.emit('mqtt_message', data=data)
#		app.logger.info(f'socketio: send data to topic {data.get("topic")}')
#		r.reset()


@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
	pass
	# app.logger.info(f'Mosqitto {level} , {buf}')


if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=True)

