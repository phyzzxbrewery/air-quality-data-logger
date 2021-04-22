#from mongoengine.errors import OperationError
from flask_mongoengine import MongoEngine
from mongoengine import connect

connect(host = os.environ.get('DATABASE_URL'))
# prepare database
db = MongoEngine()

class AQData(db.Document):
	timestamp = db.IntField()
	pm25 = db.DictField()
	humidity = db.DictField()
	temperature = db.DictField()
	co2 = db.DictField()
	pressure = db.DictField()
	
class PlantowerData(db.Document):
	timestamp = db.IntField()
	aqi = db.IntField()
	humidity = db.FloatField()
	temperature = db.FloatField()
	cpm25 = db.FloatField()
	cpm10 = db.FloatField()
	cpm100 = db.FloatField()
	apm25 = db.FloatField()
	apm10 = db.FloatField()
	apm100 = db.FloatField()

