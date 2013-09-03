Raphael.fn.arrow = function (x1, y1, x2, y2, color) 
{
	var angle = Math.atan2(x1-x2,y2-y1);
	var size = 6;
	angle = (angle / (2 * Math.PI)) * 360;
	
	var arrowPath = this.path("M" + x2 + " " + y2 + 
		" L" + (x2  - size) + " " + (y2  - size/2) + 
		" L" + (x2  - size)  + " " + (y2  + size/2) + 
		" L" + x2 + " " + y2 )
		.attr("fill",color)
		.attr("stroke",color)
		.rotate((90+angle),x2,y2)
		.hide();
		
	var linePath = this.path("M" + x1 + " " + y1 + " L" + x2 + " " + y2).attr("fill",color).attr("stroke",color).hide();
	return [linePath,arrowPath];
};

function log(text)
{
	try{ console.log(text); }catch(error){}
}
function logArr(array)
{
	var out = 'Array:';
	for(var i in array)
	{
		out += '\n' + array[i];
	}
	log(out);
}

var GraphNode = (function()
{
	var GN = function(data, children)
	{
		this._data = data;
		this._children = children || [];
	}
	GN.prototype.addChild = function(child)
	{
		log('adding 1 child to a list of ' + this._children.length);
		this._children.push(child);
	}
	GN.prototype.data = function(data)
	{
		if(data)
		{
			this._data = data;
			return data;
		}
			
		return this._data;
	}
	GN.prototype.children = function()
	{
		return this._children;
	}
	
	return GN;
}());

var GraphSet = (function()
{
	var GS = function()
	{
		this._itemsMap = {};
		this._roots = [];
	}
	GS.prototype.addItem = function(item)
	{
		var itemID = item.id;
		this._itemsMap[itemID] = item;
		
		log('added item to graph set: ' + item.id);
	}
	GS.prototype.getRoots = function()
	{
		return this._roots;
	}
	GS.prototype.addLink = function(link)
	{
		var fromItem = this._itemsMap[link.from];
		var toItem = this._itemsMap[link.to];
		
		log('adding link from ' + fromItem.id + ' to item ' + toItem.id);
		var childNode = new GraphNode(toItem);
			
		var parent = findFromRoots(this._roots);
		
		if(!parent)
		{
			log('did not find parent, adding root');
			
			var node = new GraphNode(fromItem, [childNode]);
			this._roots.push(node);
		}
		else
		{
			log('found parent with ' + parent.children().length + ' children');
			parent.addChild(childNode);
		}
		
		function findFromRoots(roots)
		{
			log('inside findFromRoots: ' + roots.length);
			
			if(roots == null || roots.length == 0)
				return null;
				
			for(var i in roots)
			{
				var root = roots[i];
				
				if(root.data().id == link.from)
					return root;
					
				var children = root.children();
				var item = findFromRoots(children);
				if(item)
					return item;
			}
			
			return null;
		}
	}
	
	return GS;
	
}());

var Graph = (function()
{
	var G = function(data, options)
	{
		
		this._graphSet = new GraphSet();
		this._data = data;
		this._options = options;
		
		var items = this._data.items;
		for(var i in items)
		{
			this._graphSet.addItem(items[i]);
		}
		
		var links = this._data.links;
		for(var i in links)
		{
			this._graphSet.addLink(links[i]);
		}
	}
	G.prototype.renderTo = function(target)
	{
		var itemWidth = this._options.itemWidth || 200,
			itemHeight = this._options.itemHeight || 100,
			horSpace = this._options.horSpace || itemWidth,
			verticalSpace = this._options.verticalSpace || itemHeight/2,
			arrowColor = this._options.arrowColor || 'black',
			rootX = this._options.rootX || 0;
			
		log('\n\RENDERTO\n\n');
		
		var c = $('<div class="graph_nodes"></div>');
		
		var roots = this._graphSet.getRoots();
		
		var itemsDrawn = {};
		var itemParents = {};
		var arrows = [];
		var itemCounts = {};
		
		var graphMaxX = 0;
		var graphMaxY = 0;
		
		var startX = 0;
		var startY = 0;
		var rootY = 0;
		log('\n\about to TRAVERSE\n\n');
		traverse(roots, 0, 1);
		
		rootY = (this._options.rootY) || 
			(rootY * itemHeight + (rootY-1)*verticalSpace + itemHeight);
		
		log('\n\about to DRAWROOTS\n\n');
		drawRoots(roots, null, rootX, rootY);
		
		graphMaxX += itemWidth*2;
		graphMaxY += itemHeight*2;
		var paper = new Raphael($(c)[0],graphMaxX,graphMaxY);
		
		drawArrows();
		$(target).append(c);
		
		var animations = {};
		
		animate(roots, 0, rootY,
			function()
			{
				for(var arrow in arrows)
				{
					$(arrows[arrow][0].node).fadeIn();
					$(arrows[arrow][1].node).fadeIn();
				}
			});
			
		this.graphWidth = graphMaxX + verticalSpace;
		this.graphHeight = graphMaxY + horSpace;
		
		function drawArrows()
		{
			for(var itemID in itemsDrawn)
			{
				var endPosition = itemsDrawn[itemID].arrowEnd;
				if(endPosition != null)
				{
					var endPosMinY = endPosition.y2 - (itemHeight/2);
					var endPosMaxY = endPosition.y2 + (itemHeight/2);
					
					var startPositions = itemsDrawn[itemID].arrowStartPositionArr;
					var nArrows = startPositions.length;
					var sectionLength = itemHeight/nArrows;
					for(var aIndex=0; aIndex<nArrows; aIndex++)
					{
						var startPos = startPositions[aIndex];
						//spread out the arrow ends so they don't overlap
						var endPosY = sectionLength * (nArrows - aIndex) + endPosMinY - (sectionLength/2);
						var arrow = createArrow(startPos.x1, startPos.y1, endPosition.x2+10, endPosY, arrowColor);
						arrows.push(arrow);
						////c.append(svgArrow);
					}
				}
			}
		}
		function traverse(roots, x, y)
		{
			if(roots.length == 0)
				return [1];
			
			var widths = [];
			
			for(var i=0, n=roots.length; i<n; i++)
			{
				var nextItem = roots[i];
				var itemID = nextItem.data().id;
				
				if(itemCounts[itemID] == null)
				{
					log('init counts for item ' + itemID);
					itemCounts[itemID] = {
						x: x,
						y: 1000000,
						widths: []
					};
				}
				
				itemCounts[itemID].y = Math.min(itemCounts[itemID].y, y+i);
				itemCounts[itemID].x = Math.max(itemCounts[itemID].x, x+1);
				
				log('item: ' + itemID + ' = ' + itemCounts[itemID].x + ',' + itemCounts[itemID].y);
				
				var childrenWidths = traverse(nextItem.children(), x+1, y+i);
				
				itemCounts[itemID].widths = childrenWidths; //Math.max(itemCounts[itemID].width, childrenWidth);
				log('item widths for ' + itemID + ' is: ' + childrenWidths.length);
				logArr(itemCounts[itemID].widths);
				
				var childrenWidth = 0;
				for(var childIndex in childrenWidths)
					childrenWidth += childrenWidths[childIndex];
			
				widths.push(childrenWidth);
			}
			
			for(var widthIndex=Math.ceil(widths.length/2), widthsNum=widths.length; widthIndex<widthsNum; widthIndex++)
			{
				rootY += widths[widthIndex];
			}
			
			return widths;
		}
		function drawRoots(roots, widths, parentX, parentY)
		{
			var numRoots = roots.length;
			
			if(numRoots == 1)
			{
				var nextItem = roots[0];
				var itemID = nextItem.data().id;
				var itemContent = nextItem.data().content;
				var itemClass = nextItem.data().cls;
				
				log('-- item: ' + itemID + ' --');
				
				var offset = 0;
				
				var itemY = parentY + offset;
				var itemX = (itemCounts[itemID].x-1) * itemWidth + (itemCounts[itemID].x-1) * (horSpace) + 20;
				
				log('parentY: ' + parentY);
				if(itemsDrawn[itemID] == null)
				{
					itemsDrawn[itemID] = {
						parentY: {
							min: parentY,
							max: parentY
						},
						domItem: null,
						arrowStartPositionArr: [] //store all the positions of the arrows leading to this item
					};
				}
				else
				{
					if(itemsDrawn[itemID].parentY.min > parentY)
						itemsDrawn[itemID].parentY.min = parentY;
						
					if(itemsDrawn[itemID].parentY.max < parentY)
						itemsDrawn[itemID].parentY.max = parentY;
						
					itemsDrawn[itemID].domItem.remove();
					
					itemY = itemsDrawn[itemID].parentY.min + (itemsDrawn[itemID].parentY.max - itemsDrawn[itemID].parentY.min)/2;
					log('updated itemY: ' + itemY);
				}
					
				graphMaxX = Math.max(graphMaxX, itemX);
				graphMaxY = Math.max(graphMaxY, itemY);
				
				var domItem = $('<div x=' + itemX + ' y=' + itemY + ' class="graph_item"></div>');
				domItem.append(itemContent || '');
				domItem.addClass(itemClass || '');
				
				itemsDrawn[itemID].domItem = domItem;
				
				c.append(domItem);
				
				if(parentX > 0) //not the root
				{
					var x1 = (parentX + itemWidth);
					var y1 = (parentY + itemHeight/2);
					
					var x2 = (itemX - 15);
					var y2 = (itemY+itemHeight/2);
					
					itemsDrawn[itemID].arrowEnd = {
							x2: x2,
							y2: y2
						};
						
					//var svgArrow = createArrow(x1, y1, x2, y2, arrowColor);
					//c.append(svgArrow);
					/*
					var nArrows = itemsDrawn[itemID].arrowStartPositionArr.length;
					for(var aIndex=0; aIndex<nArrows; aIndex++)
					{
						var startPos = itemsDrawn[itemID].arrowStartPositionArr[aIndex];
						var svgArrow = createArrow(startPos.x1, startPos.y1, x2, y2, arrowColor);
						c.append(svgArrow);
					}
					*/
					itemsDrawn[itemID].arrowStartPositionArr.push({
						x1: x1,
						y1: y1
					});
						
					
				}
				
				var children = nextItem.children();
				drawRoots(children, itemCounts[itemID].widths, itemX, itemY);
			}
			else
			{
				for(var i=0, n=roots.length; i<n; i++)
				{
					var nextItem = roots[i];
					var itemID = nextItem.data().id;
					var itemContent = nextItem.data().content;
					var itemClass = nextItem.data().cls;
					
					log('-- item: ' + itemID + ' --');
					
					var isDown = i < roots.length/2;
					
					var width = 1;
					if(widths != null)
					{
						log('isDown: ' + isDown);
						if(isDown)
						{
							for(var index = 0, num=i; index<=num; index++)
							{
								log('adding to width: ' + widths[index]);
								width += widths[index];
							}
						}
						else
						{
							for(var index = i, num=widths.length; index<num; index++)
							{
								log('adding to width: ' + widths[index]);
								width += widths[index];
							}
						}
						
						width--;
					}
					
					var offset = (width*itemHeight + (width)*(verticalSpace) );
					
					if(isDown === false)
					{
						offset *= -1;
					}
					
					var itemY = parentY + offset;
					var itemX = (itemCounts[itemID].x-1) * itemWidth + (itemCounts[itemID].x-1) * (horSpace) + 20;
					
					log('drawing item ' + itemID + ' at ' + itemX + ',' + itemY);
				
					if(itemsDrawn[itemID] == null)
					{
						itemsDrawn[itemID] = {
							parentY: {
								min: parentY,
								max: parentY
							},
							domItem: null,
							arrowStartPositionArr: [] //store all the positions of the arrows leading to this item
						};
					}
					else
					{
						if(itemsDrawn[itemID].parentY.min > parentY)
							itemsDrawn[itemID].parentY.min = parentY;
							
						if(itemsDrawn[itemID].parentY.max < parentY)
							itemsDrawn[itemID].parentY.max = parentY;
							
						itemsDrawn[itemID].domItem.remove();
						
						itemY = itemsDrawn[itemID].parentY.min + (itemsDrawn[itemID].parentY.max - itemsDrawn[itemID].parentY.min)/2;
					}
					
					graphMaxX = Math.max(graphMaxX, itemX);
					graphMaxY = Math.max(graphMaxY, itemY);
				
					var domItem = $('<div x=' + itemX + ' y=' + itemY + ' class="graph_item"></div>');
					domItem.append(itemContent || '');
					domItem.addClass(itemClass || '');
					
					itemsDrawn[itemID].domItem = domItem;
					
					c.append(domItem);
					
					if(parentX > 0) //not the root
					{
						
						var x1 = (parentX + itemWidth);
						var y1 = (parentY + itemHeight/2);
						
						var x2 = (itemX - 15);
						var y2 = (itemY+itemHeight/2);
						
						itemsDrawn[itemID].arrowEnd = {
							x2: x2,
							y2: y2
						};
						/*
						var svgArrow = createArrow(x1, y1, x2, y2, arrowColor);
						c.append(svgArrow);
						
						var nArrows=itemsDrawn[itemID].arrowStartPositionArr.length;
						for(var aIndex=0; aIndex<nArrows; aIndex++)
						{
							var startPos = itemsDrawn[itemID].arrowStartPositionArr[aIndex];
							var svgArrow = createArrow(startPos.x1, startPos.y1, x2, y2, arrowColor);
							c.append(svgArrow);
						}
						*/
						itemsDrawn[itemID].arrowStartPositionArr.push({
							x1: x1,
							y1: y1
						});
					}
					
					var children = nextItem.children();
					drawRoots(children, itemCounts[itemID].widths, itemX, itemY);
				}
			}
		}
		function createArrow(x1, y1, x2, y2, arrowColor)
		{
			var arrow = paper.arrow(x1, y1, x2, y2, arrowColor);
			return arrow;
		}
		function animate(roots, startX, startY, callback)
		{
			log('\n\ANIMATE\n\n');
			
			if(roots.length == 0)
				callback();
				
			var count = roots.length;
			for(var i=0, n=roots.length; i<n; i++)
			{
				var nextItem = roots[i];
				var itemID = nextItem.data().id;
				
				if(animations[itemID] == null)
				{
					animations[itemID] = true;
					
					var item = itemsDrawn[itemID].domItem;
					log('showing item ' + itemID);
					var x = item.attr('x');
					var y = item.attr('y');
					
					item.fadeIn();
					
					item.css({top:startY + 'px',
						left:startX + 'px',
						width:itemWidth + 'px',
						height:itemHeight + 'px'
					});
					
					(function(children, x, y, callback)
					{
						item.animate(
							{
								top:y + 'px',
								left:x + 'px'
							}, 
							600, 
							function()
							{
								animate(children, x, y, callback);
							});
					}(nextItem.children(), x, y, done));
				}
				else
				{
					done();
				}
			}
			
			function done()
			{
				if((--count) == 0)
					callback();
			}
		}
	}
	
	return G;
}());
