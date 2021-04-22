import os
class BaseConfig:
	SECRET = 'secret'
	TEMPLATES_AUTO_RELOAD = True
	MQTT_BROKER_URL = 'broker.hivemq.com'
	MQTT_BROKER_PORT = 1883
	MQTT_USERNAME = ''
	MQTT_PASSWORD = ''
	MQTT_KEEPALIVE = 5
	MQTT_TLS_ENABLED = False
	MONGODB_SETTINGS = dict(
		db = os.getenv('DATABASE_NAME','logger'),
		host = os.getenv('DATABASE_URL','mongodb://localhost/logger')
	)
	DEBUG = True
# Parameters for SSL enabled
# MQTT_BROKER_PORT = 8883
# MQTT_TLS_ENABLED = True
# MQTT_TLS_INSECURE = True
# MQTT_TLS_CA_CERTS = 'ca.crt'

class ProductionConfig(BaseConfig):
	DEBUG = False