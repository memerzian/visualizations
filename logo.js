let center_x = window.innerWidth/3;
let center_y = window.innerHeight/2;

let jsonCircles = [];

let semiCircles = [
    {startingAngle: -90, radius: 200, startingCircleRadius: 4, color: "#79C18F"},
    {startingAngle: 90, radius: 200, startingCircleRadius: 4, color: "#43496A"},
    {startingAngle: 90, radius: 100, startingCircleRadius: 2, color: "#43496A"},
    {startingAngle: -90, radius: 300, startingCircleRadius: 5, color: "#79C18F"},
]

// Fibonacci style radius sizes
let radiiSize = [1, 1, 2, 3, 5, 8, 5, 3, 2, 1, 1]

let smallCircleCount = 11

// Build the initial coordinates
semiCircles.forEach((semiCircle) => {
    for (let j = 0; j < smallCircleCount; j++) {
        angle = (180/(smallCircleCount - 1)) * j + semiCircle.startingAngle;
        if (j == 0) {
            angle = angle + 5;
        }
        if (j == (smallCircleCount - 1)) {
            angle = angle - 5;
        }
        let xPosition = center_x + semiCircle.radius * Math.cos(angle * Math.PI/180);
        let yPosition = center_y + semiCircle.radius * Math.sin(angle * Math.PI/180);
        jsonCircles.push({
            id: j,
            angle: angle,
            x_axis: xPosition,
            y_axis: yPosition,
            radius: radiiSize[j] * semiCircle.startingCircleRadius,
            semiCircleRadius: semiCircle.radius,
            color: semiCircle.color
        })
    };
});

let svgContainer = d3.select("body")
                        .append("svg")
                        .attr("width", 2000)
                        .attr("height", 2000)
                        .on("click", (d) => moveCircles());

let circles = svgContainer.selectAll("circle")
                            .data(jsonCircles)
                            .enter()
                            .append("circle")
                                .attr("cx", (d) => d.x_axis)
                                .attr("cy", (d) => d.y_axis)
                                .attr("r", (d) => d.radius)
                                .style("fill", (d) => d.color)
                                .style("stroke", (d) => d.color)
                                .style("stroke-width", 3 );

let text = svgContainer.append('text')
                        .text('')
                        .attr("font-size", 50)
                        .style("font-family", "Roboto")
                        .attr("dx", center_x + 50)
                        .attr("dy", center_y + 15)
                        .style('fill', 'white')
                        .attr('font-weight', 800)

getColor = (initialColor, percent) => {
    // Change the colors for the circles if they are green
    if (initialColor !== '#79C18F') {
        return initialColor;
    }
    return d3.interpolateLab(initialColor, '#00fe02')(percent);
}

moveCircles = async () => {
    let numberOfFrames = 145;
    let changeInAngleDegrees = 6;
    for (let i = 0; i < numberOfFrames; i++) {
        await circles
            .interrupt()
            .transition()
            .duration(32)
            .attr("cx", (d) => {
                let radius = d.semiCircleRadius - i * 2.5;
                if (radius <= 0) {
                    radius = 0;
                }
                return center_x + radius * Math.cos((d.angle - (i * changeInAngleDegrees)) * Math.PI/180)
            })
            .attr("cy", (d) => {
                let radius = d.semiCircleRadius - i * 2.5;
                if (radius <= 0) {
                    radius = 0;
                }
                return center_y + radius * Math.sin((d.angle - (i * changeInAngleDegrees)) * Math.PI/180)
            })
            .attr("r", (d) => d.radius)
            .style("fill", (d) => { 
                return getColor(d.color, i/numberOfFrames);
            })
            .style('stroke', (d) => getColor(d.color, i/numberOfFrames))
            .end();
            
    }

    let titleText = 'First Resonance: The Next Chapter';
    let blankSpaces = ' '.repeat(14);
    let fullText = titleText + blankSpaces;
    for (let t in fullText) {
        t = parseInt(t);
        await text
            .interrupt()
            .transition()
            .duration(fullText[t] == ' ' ? 300 : 50)
            .text(t % 2 == 0 ? fullText.slice(0, t) : fullText.slice(0, t) + '_')
            .style('fill', 'black')
            .end();
    }
}
