export default {
	title: {
		text: 'Air Quality at XXX'
	},
	legend: {
		right: -10,
		top:50,
		orient: 'vertical',
	},
	tooltip: {
		trigger: 'axis',
		// formatter: function (params) {
		// 	return `${params[0].value[0].toLocaleString()}<br>
		// 	<span style="color:red">■</span> particle density:  ${params[0].value[1]} µg/m³<br>
		// 	<span style="color:green">■</span> avg (200s) particle density:  ${Math.round(params[6].value[1])} µg/m³<br>
		// 	<span style="color:orange">■</span> humidity: ${params[1].value[1]} %<br>
		// 	<span style="color:purple">■</span> temperature: ${params[2].value[1]} °C <br>
		// 	<span style="color:blue">■</span> CO²: ${params[3].value[1]} ppm <br>
		// 	<span style="color:cyan">■</span> avg (200s) CO²: ${Math.round(params[5].value[1])} ppm <br>
		// 	<span style="color:indigo">■</span> baro: ${params[4].value[1]} hPa`;
		// },
		axisPointer: {
			animation: false
		}
	},
	xAxis: {
		type: 'time',
		splitLine: {
			show: false
		}
	},
	yAxis: [{
		type: 'value',
		boundaryGap: [0, '100%'],
		splitLine: {
			show: false
		}
	},{}],
	grid: {
		right: 190
	},
	dataZoom: [{
		type: 'inside',
		realtime: true,
		start: 92
	},
	{
		show: true,
		realtime:true
	}],
	series: [{
		name: 'pm2.5',
        sampling: 'lttb',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		color: 'hsl(0,80%,80%)',
		data: []
	},
	{
		name: 'rH',
        sampling: 'average',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
		color: 'hsl(120,30%,80%)'
	},
	{
		name: 'T',
        sampling: 'average',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        color: 'hsl(30,50%,80%)',
	},
	{
		name: 'CO2',
        sampling: 'lttb',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
		color: 'hsl(222,80%,80%)',
		yAxisIndex: 1
	},
	{
		name: 'baro',
        sampling: 'average',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
		color: 'grey',
		yAxisIndex: 1
	},
	{
		name: 'av CO2',
        sampling: 'lttb',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
		color: 'hsl(222,80%,20%)',
		yAxisIndex: 1
	},
	{
		name: 'av pm2.5',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
		color: 'hsl(0,80%,30%)',
		yAxisIndex: 0
	},
	{
		name: 'pt pm1.0',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(0,90%,80%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'pt pm2.5',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(0,80%,80%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'pt pm10',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(0,50%,80%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'pt T',
		type: 'line',
        sampling: 'average',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(30,50%,80%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'pt rH',
        sampling: 'average',
		type: 'line',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(120,30%,80%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'av pt pm1.0',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(0,90%,30%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'av pt pm2.5',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(0,80%,30%)',
        },
		yAxisIndex: 0
	},
	{
		name: 'av pt pm10',
		type: 'line',
        sampling: 'lttb',
		showSymbol: false,
		hoverAnimation: false,
		data: [],
        lineStyle: {
            type: 'dashed',
            color: 'hsl(0,50%,30%)',
        },
		yAxisIndex: 0
	}]
};
