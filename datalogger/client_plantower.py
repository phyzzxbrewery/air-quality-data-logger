#!/usr/bin/python
# -*- coding: utf-8 -*-
import random
import time, json
from datetime import datetime

from paho.mqtt import client as mqtt_client
import readers
from model import PlantowerData
import * from config_plantower

def connect_mqtt():
	def on_connect(client, userdata, flags, rc):
		if rc == 0:
			print("Connected to MQTT Broker!")
		else:
			print("Failed to connect, return code %d\n", rc)

	client = mqtt_client.Client(client_id)
	# client.username_pw_set(username, password)
	client.on_connect = on_connect
	client.connect(broker, port)
	return client


def publish(client):
	uart = readers.Plantower(serial_interface)
	uart.start_sending()
	uart.flush_input()
	while True:
		msg = dict(timestamp=round(datetime.now().timestamp()*1000))
		try:
			msg.update(uart.parse_word(uart.readline()))
		except ValueError as e:
			print(e)
			continue
		ds = PlantowerData(**msg)
		ds.save()
		result = client.publish(topic, json.dumps(msg))
		# result: [0, 1]
		status = result[0]
		if status == 0:
			print(msg)
			print(f"Send msg to topic {topic}")
		else:
			print("Failed to send message to topic {topic}")

def run():
	client = connect_mqtt()
	client.loop_start()
	publish(client)


if __name__ == '__main__':
	run()

