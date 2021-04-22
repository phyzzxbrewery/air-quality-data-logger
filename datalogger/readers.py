import io, json
from datetime import datetime
import serial


class DataLogger:

	def __init__( self, tty ):
		self._uart = serial.Serial( tty )
		self.START = '\x02'
		self.STOP = b'\r'
		self.INIT = self.START
		self.has_started_logging = False
		
	def _check_validity(self, word ):
		"Should be subclassed"
		if not word:
			raise ValueError('Did not receive any data. Does the data logger send data?')
		if not self.has_start_byte(word):
			raise ValueError('Has no start Byte. Truncated dataset?')
		return True
	
	def _matches_init_condition(self, word):
		"""
		To catch the first line of a dataset.
		Should be subclassed if required.
		"""
		return self.has_start_byte(word)

	def _has_started_logging(self, word):
		if self.has_started_logging:
			return True
		elif self._matches_init_condition(word):
			self.has_started_logging = True
			return True
		return False

	def flush_input(self):
		self._uart.flushInput()
		
	def parse_word(self, word ):
		"Must be subclassed if required"
		return word

	def has_start_byte(self,word):
		return word[0]==self.START
		
	def readline(self):
		c = b''
		j = b''
		while c != self.STOP:
			c = self._uart.read(1)
			j += c
		#print(j.decode('ascii'))
		return j.decode('ascii')

	def readlines(self, number_of_lines = 1):
		"""
		Generator in case a complete dataset is formed by multiple lines
		"""
		n = 0
		while n < number_of_lines:
			w = self.readline()
			if self._has_started_logging(w):
				n+=1
				yield w
			else:
				continue
		

class PCEAQD20(DataLogger):
	UNITS = ['H0','04','02','78','19','80','01','91','G4']
	MEASURING_TYPES = ['pm25','humidity','temperature','co2','pressure']
	
	def __init__(self, tty):
		super().__init__(tty)
		#self._uart.timeout = 10
		self.INIT = '1'

	def _check_validity(self, word):
		super()._check_validity(word)
		#if not len(word)==16:
			#raise ValueError(f"Not enough bytes to unpack. Expected 16 but got {len(word)}")
		if not word[1]=='4' or not int(word[2]) in range(1,6) or not word[3:5] in self.UNITS:
			raise ValueError(f'Data string {word} contains invalid characters!')
		return True

	def _matches_init_condition(self,word):
		return super()._matches_init_condition(word) and word[2] == self.INIT
		
	def parse_word(self, w): 
		self._check_validity(w)
		t = w[2] 
		t = self.MEASURING_TYPES[int(t)-1] 
		u = w[3:5] 
		if u=='H0': 
			unit = 'µg/m³' 
		elif u=='04': 
			unit = '%' 
		elif u == '01': 
			unit = '°C' 
		elif u == 'G4': 
			unit = 'ppm' 
		elif u ==  '91': 
			unit = 'hPa' 
		else: 
			unit = u 
		s = w[5] 
		sign = 1 if s == '0' else -1 
		d = w[6] 
		div = sign*10**int(d) 
		val = int(w[7:15])/div 
		return {t:dict(value=val,unit=unit)} 

class Plantower(DataLogger):
	"""
	Unfortunately the interface of the underlying
	sensor is completely undocumented. But the 
	product comes with software that allows
	for guessing some parameters. Sending of data
	("readymade" json strings) must be triggered by 
	the client. The sensor itself is well documented.
	"""

	def __init__(self,tty):
		super().__init__(tty)
		self.START = '{'
		self.STOP = b'}'
		self._uart.baudrate = 115200
		self._uart.timeout = 1
		
	def start_sending(self):
		return self._uart.write(b'{"fun":"05","flag":"1"}')

	def stop_sending(self):
		return self._uart.write(b'{"fun":"05","flag":"0"}')
		
	def get_config(self):
		self._uart.write(b'{"fun":"80"}')
		return self.readline()
		
	def _check_validity(self, j):
		try:
			super()._check_validity(j)
		except ValueError:
			raise ValueError('Not a json string')
		return True
	
	def parse_word(self,j):
		self._check_validity(j)
		d = json.loads(j)
		if len(d) != 16:
			raise ValueError('Not a complete dataset')
		res = dict(
		    cpm25 = float(d['cpm2.5']),
		    cpm10 = float(d['cpm1.0']),
			cpm100 = float(d['cpm10']),
#		    apm25 = float(d['apm2.5']),
#		    apm10 = float(d['apm1.0']),
#			apm100 = float(d['apm10']),
			aqi = int(d['aqi']),
			temperature = float(d.pop('t')),
			humidity = float(d.pop('r'))
		)
		return res
			

