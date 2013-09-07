graphjs
=======

A JavaScript library for rendering a dynamic graph of nodes.

Nodes of the graph are DOM elements - which means nodes are fully customizable. You can display text or images or interactive features such as buttons - whatever.

See live examples at graphjs.org

A simple example usage:

var data = {
	items: [
		{
			id: 1,
			content: '<h1>This is node 1</h1>'
		},
		{
			id: 2,
			content: '<h1>This is node 2</h1>'
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
