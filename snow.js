var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth,
    height = w.innerHeight|| e.clientHeight|| g.clientHeight;

// At the top of the file, after the height/width declarations
// Add window resize handler
window.addEventListener('resize', function() {
    width = w.innerWidth || e.clientWidth || g.clientWidth;
    height = w.innerHeight|| e.clientHeight|| g.clientHeight;
    
    // Update SVG dimensions
    svg.attr("height", height)
       .attr("width", width);
       
    // Recenter the text
    updateTextPosition();
});

// Add this function to get URL parameters
var getUrlParameter = function(name, defaultValue = '') {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    if (results === null) return defaultValue;
    let value = decodeURIComponent(results[1].replace(/\+/g, ' '));
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    return value;
};

// Add this function to handle text positioning
var updateTextPosition = function() {
    // Calculate font sizes based on screen width with smaller sizes for mobile
    let isMobile = width < 768;
    let mainFontSize = isMobile ? 
        Math.min(width * 0.08, 40) : 
        Math.min(width * 0.1, 100);
    
    let boxFontSize = mainFontSize * (isMobile ? 0.5 : 0.4);
    let cookieFontSize = mainFontSize * (isMobile ? 0.4 : 0.3);
    
    // Create a temporary text element to measure text width
    let tempText = svg.append('text')
        .text(message)
        .attr("font-size", mainFontSize)
        .style("font-family", "Tangerine")
        .style("opacity", 0);
    
    let textWidth = tempText.node().getComputedTextLength();
    tempText.remove();
    
    // Split text if it takes up more than 80% of screen width
    if (textWidth > width * 0.8) {
        let parts = message.split(' ');
        let firstLine = [];
        let secondLine = [];
        let currentLine = firstLine;
        
        // Distribute words between lines
        parts.forEach(word => {
            tempText = svg.append('text')
                .text((currentLine.join(' ') + ' ' + word).trim())
                .attr("font-size", mainFontSize)
                .style("font-family", "Tangerine")
                .style("opacity", 0);
            
            let newWidth = tempText.node().getComputedTextLength();
            tempText.remove();
            
            if (currentLine === firstLine && newWidth > width * 0.4) {
                currentLine = secondLine;
            }
            currentLine.push(word);
        });
        
        // Position text in the vertical center
        text.text('') // Clear existing text
            .attr("dy", height/2 - mainFontSize * 0.6) // Move up by half the line height
            .selectAll('tspan')
            .data([firstLine.join(' '), secondLine.join(' ')])
            .enter()
            .append('tspan')
            .text(d => d)
            .attr('x', width/2)
            .attr('dy', (d, i) => i === 0 ? 0 : mainFontSize * 1.2);
    } else {
        text.text(message) // Single line
            .attr("dy", height/2);
    }
    
    // Position main text (remove dy setting since we handle it above)
    text.attr("font-size", mainFontSize)
        .attr("text-anchor", "middle")
        .attr("dx", width/2);
    
    // Calculate actual text height based on whether text is split
    let textHeight = textWidth > width * 0.8 ? mainFontSize * 2 : mainFontSize;
    
    // Position box and cookie text
    if (showCookies) {
        textGroup.select(".box-text")
            .attr("font-size", boxFontSize)
            .attr("text-anchor", "middle")
            .attr("dx", width/2)
            .attr("dy", height/2 + textHeight/2 + boxFontSize);
        
        textGroup.selectAll(".cookie-text")
            .attr("font-size", cookieFontSize)
            .attr("text-anchor", "middle")
            .attr("dx", width/2)
            .attr("dy", (d, i) => height/2 + textHeight/2 + boxFontSize * 1.5 + (i + 1) * cookieFontSize);
    }
};

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

// Add this function after getUrlParameter
var toSentenceCase = function(str) {
    if (!str) return str;
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// After the text positioning function, add this helper
var getCookieNames = function() {
    let cookies = ['Apple/carrot muffins (gf)', 'Gingerbread cookies', 'Chocolate Chip cookies (gf)'];
    // Randomly select 3 unique cookies
    return cookies.sort(() => 0.5 - Math.random()).slice(0, 3);
};

// Update the text creation section
let defaultMessage = 'Happy Holidays!';
let name = toSentenceCase(getUrlParameter('name'));
let message = name ? `Happy Holidays ${name}!` : defaultMessage;

// Create a group for all text elements
let textGroup = svg.append("g")
    .attr("class", "text-group");

// Main holiday message
let text = textGroup.append('text')
    .attr("class", "main-text")
    .text(message)
    .style("font-family", "Tangerine")
    .style('fill', 'white')
    .attr('font-weight', 500)
    .attr("text-anchor", "middle");

// Add this before creating the text elements
let showCookies = getUrlParameter('show_cookies', false);

// Update the cookie-related elements creation
if (showCookies) {
    // Create box text
    textGroup.append('text')
        .attr("class", "box-text")
        .text("What is in the box?")
        .style('fill', 'white')
        .style("opacity", 0)
        .attr('font-weight', 300);

    // Add cookie names
    let cookieNames = getCookieNames();
    cookieNames.forEach((cookie, i) => {
        textGroup.append('text')
            .attr("class", "cookie-text")
            .text(cookie)
            .style('fill', 'white')
            .style("opacity", 0)
            .attr('font-weight', 100);
    });

    // Update the timeout for cookie text
    setTimeout(() => {
        textGroup.select(".box-text")
            .transition()
            .duration(2000)
            .style("opacity", 1);
        
        textGroup.selectAll(".cookie-text")
            .transition()
            .delay((d, i) => i * 500)
            .duration(2000)
            .style("opacity", 1);
    }, 10000);
}

// Initial text positioning
updateTextPosition();

var redraw = function(elapsed, overallElapsed){
    // Clean up particles that are off screen
    particles = particles.filter(function(d) {
        return d.y <= height + 10; // Keep only particles that are on screen or just slightly below
    });

    // Bind the data to the particles
    var particle = svg.selectAll("circle.particle").data(particles, function(d) { return d.key; });
    
    // Update
    particle
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("fill", function(d) {return d.color});

    // Enter
    particle.enter().append("circle")
        .attr("class", "particle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r; });
    
    // Exit - remove particles that are no longer in our dataset
    particle.exit().remove();
};

var update = function(elapsed, overallElapsed){
    for(var j=0; j<particles.length; j++){
        var particle = particles[j];
        
        particle.x = particle.x + (elapsed/1000) * particle.vx;
        particle.y = particle.y + (elapsed/1000) * particle.vy;
        
        if(particle.x < -10) { particle.x = width - 1; }
        if(particle.x > width + 10) { particle.x = 0; }
        
        // Remove the particle recreation logic - we'll let them fall off
        // and get cleaned up by the redraw function
    }
};

var doEpoch = function(){
    var dtg = new Date();
    var elapsed = dtg.getTime() - epochActual;
    let overallElapsed = dtg.getTime() - animationStartTime;

    if (overallElapsed % 50 == 0) {
        let maxParticles = Math.min(width * height / 5000, 2000); // Adjust particle count based on screen size
        if (particles.length < maxParticles) {
            addParticles(overallElapsed);
        }
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
textGroup.transition()
    .delay(90000) // Start fading 10 seconds earlier to complete at same time
    .duration(10000)
    .style("fill", "#01011d")
    .remove();

