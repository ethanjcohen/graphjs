graph.js
=======

A JavaScript library for rendering a graph of nodes. Perfect for showing dependency diagrams or flows.

Features:
- Nodes of the graph are DOM elements - which means nodes are fully customizable
- Designed to work with jQuery
- Lines between the nodes are drawn using Raphael, which means they're cross-browser compatible
- Works in Chrome, FireFox and IE8+
- Nodes positions are calculated based on data, you won't need to hard-code x & y coordinates
- Cool start-up animation

See live examples at <a href="graphjs.org">graphjs.org</a>

A simple example usage with two nodes:
`````javascript
var data = {
	items: [
		{
			id: 1,
			content: '<h1>This is node 1</h1>'
		},
		{
			id: 2,
			content: '<h2>This is node 2</h2>'
		}
	],
	links: [
		{
			from: 1,
			to: 2
		}
	]
};

var options = {
	//node size
	itemWidth:150,
	itemHeight:35,
	
	//space between nodes
	verticalSpace:30,
	horSpace:40,
	
	//arrows between nodes
	arrowColor: '#6DA7E3'
};

var graph = new Graph(data, options);

//display using a selector, a dom element or a jquery element
graph.renderTo('#graph'); 
`````
