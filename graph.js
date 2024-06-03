export {makeGraph}
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

// Specify the size of the viewport
const width = 512;
const height = 512;

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

const container = document.getElementById("simulationContainer");

// convert a dna into a graph simulation
function makeGraph(dna) {
    let lines = dna.split("\n");
    let types = [];
    let args = [];
    for (let l of lines) {
        l = l.split(" ");
        types.push(l[1]);
        args.push(l[2]);
    }

    let edges = []
    for (let a of args) {
        a = a.slice(1,-1).split(",");
        if (a[0] !== "") {
            a = a.map(x => Number(x)); 
        }
        else {
            a = [];
        }
        edges.push(a);
    }

    let nodes = [];
        for (let [i, type] of types.entries()) {
        nodes.push({id:i, type:type});
        }
    let links = [];
    for (let [i, destlist] of edges.entries()) {
        for (let e of destlist) {
            links.push({source:i, target:e});
        }
    }

    // Create the SVG container.
    let svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

    // create simulation
    let simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

    // Add a line for each link, and a circle for each node.
    let node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", 10)
    .attr("fill", d => color(d.type.length));

    let link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(links)
    .join("line")
    .attr("stroke-width", 1);

    node.append("title")
    .text(d => d.type);
    
    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    // Add a drag behavior.
    node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

    // Append the SVG element.
    container.replaceChildren(svg.node());
}