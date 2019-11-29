import * as d3 from 'd3'
import loadJson from '../components/load-json'
import { $ } from './util'

const wrapperEl = $('.gv-chart-wrapper')

const isMobile = window.matchMedia('(max-width: 739px)').matches

const margin = {top: 20, right: 20, bottom: 20, left: 20}

let width = wrapperEl.getBoundingClientRect().width;

const height = isMobile ? window.innerHeight*0.5 : Math.min(500, Math.max(window.innerHeight*0.75 - 100, 350))

const parseTime = d3.timeParse("%d-%m-%Y")

const format = d3.timeFormat('%Y')

let line;
let points;
let xaxis;
let yaxis;

let x = d3.scaleTime().range([0, width]);

let y = d3.scaleLinear().range([height - margin.top, 0]);

let lineLab = d3.line()
.x(d => x(d.date))
.y(d => y(d.lab))
//.curve(d3.curveMonotoneX);

let lineCon = d3.line()
.x(d => x(d.date))
.y(d => y(d.con))

let svg = d3.select(".gv-chart-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height)

loadJson('https://interactive.guim.co.uk/docsdata-test/1eN4k1bGeHC8v9z4nQsIVZKJ4l-u7Qy3gbDUCy9CzrHY.json')
.then(popularity => {

	let data = popularity.sheets.calcs2019.map(entry =>
		{
			const year = +entry.date.split('/')[2]
			const month = +entry.date.split('/')[1] -1;
			const day = +entry.date.split('/')[0]

			const date = new Date(year , month, day);

			return ({ date: date, lab: +entry.lab, rawlab: +entry.rawlab, con: +entry.con, rawcon: +entry.rawcon })
		})

	data.sort((a,b) => (a.date> b.date) ? 1 : ((b.date > a.date) ? -1 : 0));
	
	x.domain([parseTime(1 + '-' + 5	 + '-' + 2017), parseTime(31 + '-' + 12 + '-' + 2019)]);
	y.domain([0, d3.max(data, d => d.rawlab) + 1 ]);

	yaxis = svg.append("g")
	.attr("class", "y axis")
	.attr("text-anchor", "start")
	.call(d3.axisLeft(y)
		.ticks(6)
		.tickSizeInner(-width)
	)
	.selectAll("text")
    .style("text-anchor", "start")
    .attr('x', 3)
    .attr('y', -10);

    xaxis = svg.append("g")
	.attr("transform", "translate(0," + (height - margin.top) + ")")
	.attr("class", "x axis")
	.call(
			d3.axisBottom(x)
			/*.tickFormat(format)
			.ticks(d3.timeYear)
			.tickSize(0, 0)
			.tickSizeInner(5)
			.tickPadding(5)*/
		);

	points = svg.append('g').selectAll('circle')
	.data(data)
	.enter()
	.append('circle')
	.attr('class', 'point')
	.attr('cx', d => x(d.date))
	.attr('cy', d => y(d.rawlab))
	.attr('r', 2.5)
	.style('fill', 'red')
	.style('opacity', .3)

	points = svg.append('g').selectAll('circle')
	.data(data)
	.enter()
	.append('circle')
	.attr('class', 'point')
	.attr('cx', d => x(d.date))
	.attr('cy', d => y(d.rawcon))
	.attr('r', 2.5)
	.style('fill', 'blue')
	.style('opacity', .3)

	line = svg.append("path")
	.data([data])
	.attr("class", "line")
	.attr("d", lineLab)
	.style('fill', 'none')
	.style('stroke', 'red')

	line = svg.append("path")
	.data([data])
	.attr("class", "line")
	.attr("d", lineCon)
	.style('fill', 'none')
	.style('stroke', 'blue')

})

window.onresize = (e) => { 
	width = wrapperEl.getBoundingClientRect().width

	svg.attr('width', width)

	x.range([0, width]);

	line
	.attr("d", lineLab);

	points
	.attr('cx', d => x(d.date))
	.attr('cy', d => y(d.rawlab));

	xaxis
	.call(d3.axisBottom(x));
} 


