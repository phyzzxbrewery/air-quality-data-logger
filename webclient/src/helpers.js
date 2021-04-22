class MovingAverage {
	/* 
		Für den laufenden Mittelwert
	*/
	constructor(number, qsize = 150) {
		this.q = number ? [number] : []
		this.movingAverage = number ? number : 0
		this.qsize = qsize
	}
	next(number){
		/* 
			Liefert anfangs die erreichbaren Mittelwerte und schneidet 
			nach Erreichen die jeweils ersten Werte ab. 
		*/
		if ( this.q.length >= this.qsize) {
			let first = this.q.shift()
			this.movingAverage -= first
		}
		number = !isNaN(number)? number : 0
		// console.log(`Adding ${number} to ${this.movingAverage}, q size is ${this.q.length}`)
		this.q.push(number)
		this.movingAverage += number
		return this.movingAverage/this.q.length
	}
}
const averagers = {}
export function getAverager(name) {
	if(!averagers[name]) {
		averagers[name] = new MovingAverage()
	}
	return averagers[name]
}
export function updateSeriesData(chart,data) {
	if (!data) { 
		console.error('data is undefined')	
		return
	}
    chart.setOption({
		series: data.map( values => { return {data: values} } )
	})
}
const screens = document.querySelector('main ul').children
export function fillData(data) {
	screens[0].querySelector('p').innerHTML = `${data.pm25.value} ${data.pm25.unit}`
	screens[1].querySelector('p').innerHTML = `${data.humidity.value} %`
	screens[2].querySelector('p').innerHTML = `${data.temperature.value} ${data.temperature.unit}`
	screens[3].querySelector('p').innerHTML = `${data.co2.value} ${data.co2.unit}`
	screens[4].querySelector('p').innerHTML = `${data.pressure.value} ${data.pressure.unit}`
}
const screens2 = document.querySelector('.plantower ul').children
export function fillData2(data) {
	screens2[0].querySelector('p').innerHTML = `${data.cpm25} µg/m³`
	screens2[1].querySelector('p').innerHTML = `${data.humidity} %`
	screens2[2].querySelector('p').innerHTML = `${data.temperature} °C`
	screens2[3].querySelector('p').innerHTML = `${data.cpm10} µg/m³`
	screens2[4].querySelector('p').innerHTML = `${data.cpm100} µg/m³`
}

