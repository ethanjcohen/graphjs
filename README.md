graph.js
=======

A JavaScript library for rendering a graph of nodes. Perfect for showing dependency or flow diagrams.
<p>
<img src="http://graphjs.org/screens/example2.png" />
</p>
Features:
- Nodes of the graph are DOM elements, meaning that nodes are fully customizable with HTML/CSS/JavaScript
- Designed to work with jQuery
- Works in Chrome, FireFox and IE8+ (at least)
- Node positions are calculated based on data, you won't need to hard-code x & y coordinates
- Cool start-up animation

See live examples at <a href="http://graphjs.org">graphjs.org</a>

<h3>A simple example</h3>
<img src="http://graphjs.org/screens/example3.png" />
`````javascript
var data = {
	items: [
		{
			id: 1,
			content: 'This is node 1'
		},
		{
			id: 2,
			content: 'This is node 2'
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
