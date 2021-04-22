import {io} from 'socket.io-client';
import * as echarts from 'echarts/core';
import {TitleComponent,TooltipComponent,GridComponent,DataZoomComponent,LegendComponent} from 'echarts/components';
import {LineChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import {getAverager, updateSeriesData, fillData, fillData2} from './helpers';
import option from './options-chart1'

echarts.use(
    [TitleComponent, TooltipComponent, GridComponent, LineChart, DataZoomComponent, CanvasRenderer, LegendComponent]
);

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var data = [] // the data to be displayed
for(let i=0;i<15;i++){data.push([])}
fetch('/data').then(r => r.json()).then(j => {
	let buffer = [[],[],[],[],[],[],[]]
	j.forEach(ds => {
	   [ds.pm25.value,ds.humidity.value,ds.temperature.value,ds.co2.value,ds.pressure.value,getAverager('co2').next(ds.co2.value),getAverager('pm25').next(ds.pm25.value)]
	   .forEach( (value,i) => buffer[i].push([new Date(ds.timestamp),value]) )
	})
	/* data already contains some actual values which must be appended to the historic ones to have a time-sorted series */
	let newData = []
	buffer.forEach((dataset,i) => newData.push(dataset.concat(data[i])))
	for(let i=0;i<7;i++) {data[i] = newData[i]} 
	updateSeriesData(myChart,data)
})

fetch('/data2').then(r => r.json()).then(j => {
	let buffer = [[],[],[],[],[],[],[],[]]
	j.forEach(ds => {
	   [ds.cpm10,ds.cpm25,ds.cpm100,ds.temperature,ds.humidity,getAverager('cpm10').next(ds.cpm10),getAverager('cpm25').next(ds.cpm25),getAverager('cpm100').next(ds.cpm100)]
	   .forEach( (value,i) => buffer[i].push([new Date(ds.timestamp),value]) )
	})
	/* data already contains some actual values which must be appended to the historic ones to have a time-sorted series */
	let newData = []
	buffer.forEach((dataset,i) => newData.push(dataset.concat(data[i+6])))
	for(let i=0;i<8;i++) {data[i+7] = newData[i]} 
	updateSeriesData(myChart,data)
})

const socket = io();

socket.on('connect', function() {
	 socket.emit('subscribe', {topic: 'datalogger'});
	 console.log('Connected!')
});

socket.on('mqtt_message', function(msg) {
	if(msg.topic == 'datalogger_A36D7F9ACC734') {
		[
			msg.payload.pm25.value,
			msg.payload.humidity.value,
			msg.payload.temperature.value,
			msg.payload.co2.value,
			msg.payload.pressure.value,
			getAverager('co2').next(msg.payload.co2.value),
			getAverager('pm25').next(msg.payload.pm25.value)
		].forEach((value,i) => {
			console.log(`Got value ${value}`)
			data[i].push([new Date(msg.payload.timestamp),value])
		})
		console.log(data)
		fillData(msg.payload)
		updateSeriesData(myChart,data)
	} else {
		['cpm10','cpm25','cpm100','temperature','humidity']
		.forEach((value,i) => {
			console.log(`Got value vor ${value}: ${msg.payload[value]}`)
			data[i+7].push([new Date(msg.payload.timestamp),msg.payload[value]])
			if(i<3){
				data[i+12].push([new Date(msg.payload.timestamp),getAverager(value).next(msg.payload[value])])
			}
		})
		console.log(data)
		fillData2(msg.payload)
		updateSeriesData(myChart,data)
	}
})

socket.on('disconnect',function(){
	 console.log('Disconnected!');
	//  socket.reconnect();

});

option && myChart.setOption(option);
