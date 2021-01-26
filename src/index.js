import {
    select,
    scaleLinear,
    max,
    min,
    extent,
    scaleBand,
    axisLeft,
    axisBottom,
    histogram
} from 'd3';
import d3Tip from "d3-tip";
import _ from "underscore";
import './styles.css'

const svg = select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const render = (data) => {
// margin related code
    const margin = { top: 30, left: 100,
        right: 20, bottom: 70};
    const innerHeight =
        height - margin.top - margin.bottom;
    const innerWidth =
        width - margin.left - margin.right;
    const attrLabelMap = {
        'Category' : 'level',
        'Market Value' : 'value',
        'Weekly Wages' : 'wage',
        'Finishing' : 'finishing',
        'Crossing' : 'crossing',
        'Acceleration' : 'acceleration',
        'Shooting' : 'longShots',
        'Passing' : 'longPassing',
        'Dribbling' : 'dribbling',
        'International Fame' : 'international_reputation',
        'Work Rate (Attacking/Defensive)' : 'work_rate',
        'Nationality' : 'nationality',
        'Age' : 'age',
        'Skill' : 'skill_moves',
        'Position' : 'position'
    };

// using d3-tip library for interactively displaying text on mouseover of bar
    var tip = d3Tip().attr('class', 'd3-tip').offset([-10, 0])
        .html(function(d) {
            return " <span style='color:darkorange'>" + d + "</span>";
        });

// appending a group element to svg canvas
    const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);

// adding a visualization Title
    g.append('text')
        .attr('y', -10).attr('x', innerWidth/2 - 150)
        .text('FIFA 19 PLAYER ATTRIBUTES');

// call updatebars with barchart arguments
    const makeBarChart = (visColumn) => {
        const barData = data.map(d=>d[visColumn]);
        const freqMap = {};
        const disData = new Set(barData);
        disData.forEach(distEle => {freqMap[distEle] = barData.filter(dupEle => dupEle === distEle).length});
        updateBars(Object.values(freqMap), Object.keys(freqMap),true, '', visColumn);
    };

// update bars and axes
    const updateBars = (
        yData, // y axis array
        xData, // x axis arr
        isBar = true,
        xscaleDomain = '',
        visColumn = '') => {

// delete old axes if any
        g.selectAll('.yAxis, .xAxis').remove();

// define scales
        const yScale = scaleLinear()
            .domain([0, max(yData)]) // pass y-array
            .range([innerHeight, 0]);

        var xScale = scaleBand()
            .domain(xData)  // pass x array
            .range([0, innerWidth])
            .padding(0.10);

        if(!isBar){
            console.log('xData', xData);
            xScale = scaleLinear()
                .domain(xscaleDomain).nice()
                .range([0, innerWidth]);
        }
        const barWidth = d => {
            if(isBar){
                return xScale.bandwidth();
            }else{
                return Math
                    .max(0, xScale(xData[d].x1) - xScale(xData[d].x0) - 1);
            }
        };

        const barXattr = d => {
            if(isBar){
                return xScale(xData[d]);
            }else{
                return (xScale(xData[d].x0) + 1);
            }
        };

// making Axis and customizing it
        const yAxis = axisLeft(yScale);
        const xAxis = axisBottom(xScale);

        const yAxisG = g.append('g').attr('class','yAxis').call(yAxis);
        const xAxisG = g.append('g').attr('class','xAxis').call(xAxis)
            .attr('transform', `translate(0,${innerHeight})`);

        xAxisG.selectAll('.tick line').remove();
        xAxisG.append('text')
            .attr('y',40)
            .attr('x',innerWidth/2 - 50)
            .attr('fill','black')
            .attr('class','label')
            .text((_.invert(attrLabelMap)[visColumn]));
        yAxisG.append('text')
            .attr('y',-30)
            .attr('x',-innerHeight/2 + 130)
            .attr('fill','black')
            .attr('class','label')
            .text('Number of Players')
            .attr('transform', 'rotate(-90)')
            // .tickSize('-innerWidth');

        if(visColumn === 'nationality'){
        xAxisG.select('.label').remove()
        xAxisG.selectAll(".tick text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)" );
        }

        // adding bars for new data
        var bars = g.selectAll('rect').data(yData) // y-array
        bars.enter()
            .append('rect')
            .attr('x', (d,i) => barXattr(i))
            .attr('y', d => yScale(d))
            .attr('width', (d,i) => barWidth(i))
            .attr('height', d =>innerHeight - yScale(d))
            .attr('fill', "steelblue")
            .call(tip)
            .on('mouseover', function(d) {
                const selection = select(this);
                selection
                    .attr('fill','orange')
                    .attr('stroke', 'orange')
                    .attr('stroke-width', 20);
                tip.show(d, this)
            })
            .on("mouseout", function(d) {
                const selection = select(this);
                selection
                    .transition()
                    .duration(250)
                    .attr('fill','steelblue')
                    .attr('stroke',"")
                tip.hide(d, this)
                }
            );

        // update bars
        bars.transition().duration(250)
            .attr('y',d => yScale(d))
            .attr('height', d => innerHeight - yScale(d))
            .attr('x', (d,i) => barXattr(i))
            .attr('width', (d,i) => barWidth(i));

        //remove old bars
        bars.exit().remove()

    };
    // end of update bars

    makeBarChart('level');

    const chartMap = {
        'histogram' : ['age', 'value', 'wage', 'finishing', 'crossing', 'acceleration', 'longShots', 'longPassing', 'dribbling'],
        'barchart' : ['nationality']
    };

    const dropdownChange = () => {
        const visColumn = attrLabelMap[document.getElementById('dd-id').value];
        const yData = data.map(d=>d[visColumn]);
        if(chartMap['histogram'].includes(visColumn)){
            var x = scaleLinear()
                .domain(extent(yData)).nice()
                .range([0, innerWidth]);
            var histBins = histogram()
                .domain(x.domain())
                .thresholds(x.ticks(10))(yData);
            const histYData = histBins.map(hb => hb.length);
            updateBars( histYData, histBins, false, extent(yData), visColumn);
        }else{
            makeBarChart(visColumn);
        }
    };

    const dropdown =
        select("#dd-container")
            .insert('select', 'svg')
            .on('change', dropdownChange)
            .attr('id', 'dd-id');

    const options = Object.keys(attrLabelMap);
    dropdown.selectAll('option')
        .data(options)
        .enter().append('option')
        .attr('value', d => {return d})
        .text(d => {return d});

}; // end of render

const data = require('./data.json');
console.log('data', data);
render(data);