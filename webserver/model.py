#from mongoengine.errors import OperationError
from flask_mongoengine import MongoEngine
from mongoengine import queryset_manager
from datetime import datetime

# prepare database
db = MongoEngine()

class AQData(db.Document):
	timestamp = db.IntField()
	pm25 = db.DictField()
	humidity = db.DictField()
	temperature = db.DictField()
	co2 = db.DictField()
	pressure = db.DictField()

	@queryset_manager
	def reduce(cls,qs,d0,d1=None):
		if not d1:
			d1 = datetime.now().timestamp()*1000
		qs = qs.filter(timestamp__gt=d0).filter(timestamp__lte=d1)
		boundaries = [d0+e*60000 for e in range(int(d1-d0)//60000)]
		boundaries.append(d1)
		pipeline = [
		 {'$bucket': {
		   'groupBy': "$timestamp",
		   'boundaries': boundaries,
		   'default': 'other',
		   'output': {
		       'timestamp':{'$avg':'$timestamp'},
		       'pm25': {'$avg':'$pm25.value'},
		       'co2': {'$avg':'$co2.value'},
		       'humidity': {'$avg':'$humidity.value'},
		       'temperature': {'$avg':'$temperature.value'},
		       'pressure': {'$avg':'$pressure.value'},
		    }}
		 }]
		return qs.aggregate(pipeline)
		
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
	
	@queryset_manager
	def reduce(cls,qs,d0,d1=None):
		if not d1:
			d1 = datetime.now().timestamp()*1000
		qs = qs.filter(timestamp__gt=d0).filter(timestamp__lte=d1)
		boundaries = [d0+e*60000 for e in range(int(d1-d0)//60000)]
		boundaries.append(d1)
		pipeline = [
		 {'$bucket': {
		   'groupBy': "$timestamp",
		   'boundaries': boundaries,
		   'default': 'other',
		   'output': {
		       'timestamp':{'$avg':'$timestamp'},
		       'cpm10': {'$avg':'$cpm10.value'},
		       'cpm25': {'$avg':'$cpm25.value'},
		       'cpm100': {'$avg':'$cpm100.value'},
		       'humidity': {'$avg':'$humidity.value'},
		       'temperature': {'$avg':'$temperature.value'},
		    }}
		 }]
		return qs.aggregate(pipeline)

