var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function onRefresh(chart) {
	chart.config.data.datasets.forEach(function(dataset) {
	var scaleFactor = 100;
	if(dataset.label === 'Total Transactions') scaleFactor = 1000;
		dataset.data.push({
			x: Date.now(),
			y: Math.round(Math.random() * scaleFactor)
		});
	});
}

var color = Chart.helpers.color;
var config = {
	type: 'line',
	data: {
		datasets: [{
			label: 'High-risk Transactions',
			backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
			borderColor: chartColors.red,
			fill: false,
			lineTension: 0,
			borderDash: [8, 4],
			data: []
		}, {
			label: 'Medium-risk Transactions',
			backgroundColor: color(chartColors.orange).alpha(0.5).rgbString(),
			borderColor: chartColors.orange,
			fill: false,
			lineTension: 0,
			borderDash: [8, 4],
			data: []
		},
		{
			label: 'Total Transactions',
			backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
			borderColor: chartColors.blue,
			fill: false,
			cubicInterpolationMode: 'monotone',
			data: []
		}]
	},
	options: {
		title: {
			display: true,
			text: 'Real-time transaction volumes'
		},
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: 20000,
					refresh: 1000,
					delay: 2000,
					onRefresh: onRefresh
				}
			}],
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'value'
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false
		},
		hover: {
			mode: 'nearest',
			intersect: false
		},
		pan: {
			enabled: true,
			mode: 'x',
			rangeMax: {
				x: 4000
			},
			rangeMin: {
				x: 0
			}
		},
		zoom: {
			enabled: true,
			mode: 'x',
			rangeMax: {
				x: 20000
			},
			rangeMin: {
				x: 1000
			}
		}
	}
};

window.onload = function() {
	var ctx = document.getElementById('myChart').getContext('2d');
	window.myChart = new Chart(ctx, config);
};

document.getElementById('resetZoom').addEventListener('click', function() {
	window.myChart.resetZoom();
});