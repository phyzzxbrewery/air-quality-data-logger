import queue, logging
logger = logging.getLogger('app')

class MovingAverage:
	s = 0
	
	def __init__(self,n=30):
		self.q = queue.Queue()
		self.q.maxsize = n

	def next(self,val):
		"""
		processes the next value and returns the average value.
		If the Queue is full, subtract the first value to have a 
		moving average on maxsize values.
		"""
		if self.q.full():
			self.s -= self.q.get()
		if val and isinstance(val,(int,float)):
			self.q.put(val)	
			self.s += val
			return round(self.s/self.q.qsize())
		return None
		
	def is_full(self):
		return self.q.full()
		
class Reducer:
	dataset = {}
	interval = 30
	_reducers = {}
	
	@classmethod
	def get_reducer(cls, type):
		"Lazily initialize a Reducer"
		if not cls._reducers.get(type):
			cls._reducers[type] = cls(type)
		return cls._reducers[type]
		
	def __init__(self,name,interval=30):
		self.name = name
		self.interval = interval
		self.averagers = {}
		logger.debug(f"Initialized reducer for topic {self.name}")
		
	def put(self,obj):
		"""
		Lazily initialize an Averager for each measurement in obj 
		and process each value, i.e. feed them to the
		avergers and update the averages container with the current avarage values
		"""
		logger.debug(f"Going to process {obj}")
		if not self.averagers:
			for key in obj.keys():
				logger.debug(f"Initializing averager for key {key}")
				self.averagers.update({ key:MovingAverage( self.interval ) })
		for key in obj.keys():
			if isinstance(obj.get(key,0),(int,float)):
				val = self.averagers[key].next(obj.get(key,0))
				self.dataset.update({key:val})
			else:
				val = self.averagers[key].next(obj.get(key).get('value',0))
				obj[key].update(value=val)
				self.dataset.update({key:obj[key]})
	
	def get_data(self):
		"Returns the averaged data obj"
		return self.dataset
		
	def reset(self):
		self.dataset = {}
		self.averagers = {}
