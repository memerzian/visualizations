var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth,
    height = w.innerHeight|| e.clientHeight|| g.clientHeight;

// Basic control variables
var numParticles = 3;
var epochTarget = 15;
var epochActual = 0;
var counter = 0;

var getVX = function(){
    // Returns a number from -25 to -1 or 1 to 25
    return ((Math.random() > 0.5)? -1 : 1) * ((Math.random() * 20) + 1);
};

var getVY = function(){
    // Returns a number from 15-75
    return ((Math.random() * 75) + 15);
};

var addParticles = function(overallElapsed){
    var color = overallElapsed > 50000 ? d3.interpolateRainbow(Math.random()) : "white";
    for(var i=0; i<numParticles; i++){
        particles.push({
            x: Math.floor(Math.random() * width),
            y: 0,
            r: (Math.random() * 3) + .5,
            key: counter++,
            vx: getVX(),
            vy: getVY(),
            color: color
        });
    }
}

var particles = [];

var svg = d3.select("body").append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g");

let text = svg.append('text')
    .text('Happy Birthday Mom!')
    .attr("font-size", 100)
    .style("font-family", "Tangerine")
    .attr("dx", width/2 - 300)
    .attr("dy", height/2)
    .style('fill', 'white')
    .attr('font-weight', 500)

var redraw = function(elapsed, overallElapsed){
    // Bind the data to the particles
    var particle = svg.selectAll("circle.particle").data(particles, function(d) { return d.key; } );

    console.log(overallElapsed)
    
    // Update
    particle
        .attr("cx", function(d) { return d.x; } )
        .attr("cy", function(d) { return d.y; } )
        .attr("fill", function(d) {return d.color});

    // Enter
    particle.enter().append("circle")
        .attr("class", "particle")
        .attr("cx", function(d) { return d.x; } )
        .attr("cy", function(d) { return d.y; } )
        .attr("r", function(d) { return d.r; });
    
    particle.exit().remove();
};

var update = function(elapsed, overallElapsed){
    for(var j=0; j<particles.length; j++){
        var particle = particles[j];
        
        particle.x = particle.x + (elapsed/1000) * particle.vx;
        particle.y = particle.y + (elapsed/1000) * particle.vy;
        
        if(particle.x < -10) { particle.x = width - 1; }
        if(particle.x > width + 10) { particle.x = 0; }

        // Particle is done, so recreate it
        if(particle.y > height - 1) { 
            particle.x = Math.floor(Math.random() * width);
            particle.y = 0;
            particle.key = counter++;
            particle.vx = getVX();
            particle.vy = getVY();
        }
    }
};

var doEpoch = function(){
    var dtg = new Date();
    var elapsed = dtg.getTime() - epochActual;
    let overallElapsed = dtg.getTime() - animationStartTime;

    if (overallElapsed % 50 == 0 && particles.length < 2000) {
        addParticles(overallElapsed);
    }

    update(elapsed, overallElapsed);
    redraw(elapsed, overallElapsed);

    epochActual = dtg.getTime();
    window.setTimeout(doEpoch, epochTarget);
};

var dtg = new Date();
epochActual = dtg.getTime();
animationStartTime = dtg.getTime();
doEpoch();
text.transition()
    .duration(100000)
    .style("fill", "#01011d")
    .remove();

