/**
 * DataBox of topo for personal project
 *
 * @param {any} name
 * @returns
 * @author ilex
 */

const Util = require('./util');
const _container = require('./container');
const _link = require('./link');
const _node = require('./_node');
const Layout = require('./layout');
const offset = require('./offset');
const Link = _link.Link;
const Container = _container.Container;
const Node = _node.Node;

function DataBox(name, canvas) {
  this.name = name;
  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.messageBus = new Util.MessageBus();
  this.image = new Image();
  this.image.src = './assets/img/bg/topo-bg4.png';
  this.init();
}

DataBox.prototype.init = function() {
  this.ctx.shadowBlur = 5;
  this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
  this.ctx.shadowOffsetX = 3;
  this.ctx.shadowOffsetY = 6;

  this.startDragMouseX = 0;
  this.startDragMouseY = 0;
  this.offset = offset(this.canvas);
  this.isRangeSelectable = true;

  this.elements = [];
  this.containers = [];
  this.links = [];
  this.nodes = [];
  this.elementMap = {};
  this.selectedElements = [];

  let box = this;
  this.canvas.onmousedown = function(event) {
    box.isMousedown = true;
    box.mousedown(event);
  };
  this.canvas.onmousemove = function(event) {
    box.mousemove(event);
  };
  this.canvas.onmouseup = function(event) {
    box.isMousedown = false;
    box.mouseup(event);
  };
  try { // IE !!
    window.addEventListener('keydown', function(e) {
      box.keydown(e);
    }, true);
    window.addEventListener('keyup', function(e) {
      box.keyup(e);
    }, true);
  } catch (e) {console.log(e);}

  setTimeout(function() {
    box.updateView();
  }, 300);
};

DataBox.prototype.getElementByXY = function(x, y) {
  let e = null;
  for (let i = this.nodes.length - 1; i >= 0; i--) {
    let node = this.nodes[i];
    if (x > node.x && x < node.x + node.width && y > node.y && y < node.y + node.height) {
      e = node;
      break;
    }
  }
  if (!e) {
    for (let i = this.containers.length - 1; i >= 0; i--) {
      let group = this.containers[i];
      if (x > group.x && x < group.x + group.width && y > group.y && y < group.y + group.height) {
        e = group;
        break;
      }
    }
  }
  return e;
};

DataBox.prototype.getElementByName = function(name) {
  for (let i = this.nodes.length - 1; i >= 0; i--) {
    if (this.nodes[i].getName() == name) {
      return this.nodes[i];
    }
  }
  return null;
};

DataBox.prototype.findCloserNode = function(node, cond) {
  let min = {
    distance: Number.MAX_VALUE,
    node: null
  };
  for (let i = this.nodes.length - 1; i >= 0; i--) {
    let typeNode = this.nodes[i];
    if (typeNode === node) {continue;}
    if (cond(typeNode)) {
      let dist = Util.getDistance(node, typeNode);
      if (dist < min.distance) {
        min.node = typeNode;
        min.distance = dist;
      }
    }
  }
  return min.node;
};

DataBox.prototype.cancleAllSelected = function() {
  for (let i = 0; i < this.selectedElements.length; i++) {
    this.selectedElements[i].cancleSelected();
  }
  this.selectedElements = [];
};

DataBox.prototype.mousedown = function(event) {
  let box = this;
  let xy = Util.getXY(box, event);
  let x = xy.x;
  let y = xy.y;

  let selectedNode = box.getElementByXY(x, y);
  if (selectedNode != undefined && selectedNode != null) {
    selectedNode.onMousedown({
      x: x,
      y: y,
      context: box
    });
    box.currElement = selectedNode;
  } else if (box.currElement) {
    box.currElement.cancleSelected();
    box.currElement = null;
  }

  box.startDragMouseX = x;
  box.startDragMouseY = y;

  if (box.currElement) {
    if (box.selectedElements.indexOf(box.currElement) == -1) {
      box.cancleAllSelected();
      box.selectedElements.push(box.currElement);
    }
  } else {
    box.cancleAllSelected();
  }

  for (let i = 0; i < box.selectedElements.length; i++) {
    let node = box.selectedElements[i];
    node.selectedLocation = {
      x: node.x,
      y: node.y
    };
  }

  box.isOnMouseDown = true;
  box.publish('mousedown', {
    target: box.currElement,
    x: x,
    y: y,
    context: box
  });
};

DataBox.prototype.mousemove = function(event) {
  let box = this;
  let xy = Util.getXY(box, event);
  let x = xy.x;
  let y = xy.y;
  let dx = (x - box.startDragMouseX);
  let dy = (y - box.startDragMouseY);
  box.publish('mousemove', {
    target: box.currElement,
    x: x,
    y: y,
    dx: dx,
    dy: dy,
    context: box
  });

  //if(box.currElement && !box.currElement.isDragable()) return;

  box.updateView();
  for (let i = this.nodes.length - 1; i >= 0; i--) {
    let node = this.nodes[i];
    if (node.x + node.width < 0 || node.x > box.canvas.width) {continue;}

    if (x > node.x && x < node.x + node.width && y > node.y && y < node.y + node.height) {
      node.onMouseover({
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        context: box
      });
      box.publish('mouseover', {
        target: node,
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        context: box
      });
    } else {
      if (node.isOnMousOver) {
        node.onMouseout({
          x: x,
          y: y,
          dx: dx,
          dy: dy,
          context: box
        });
        box.publish('mouseout', {
          target: node,
          x: x,
          y: y,
          dx: dx,
          dy: dy,
          context: box
        });
      }
    }
  }

  if (box.currElement && box.isOnMouseDown && box.currElement.isDragable()) {
    for (let j = 0; j < box.selectedElements.length; j++) {
      let node1 = box.selectedElements[j];
      node1.onMousedrag({
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        context: box
      });
    }
    box.publish('mousedrag', {
      target: box.currElement,
      x: x,
      y: y
    });
  } else if (box.isOnMouseDown && box.isRangeSelectable) {
    let startx = x >= box.startDragMouseX ? box.startDragMouseX : x;
    let starty = y >= box.startDragMouseY ? box.startDragMouseY : y;
    let width = Math.abs(x - box.startDragMouseX);
    let height = Math.abs(y - box.startDragMouseY);

    box.ctx.beginPath();
    box.ctx.fillStyle = 'rgba(168,202,236,0.5)';
    box.ctx.fillRect(startx, starty, width, height);
    box.ctx.closePath();

    for (let k = 0; k < box.nodes.length; k++) {
      let node2 = box.nodes[k];
      if (node2.x + node2.width < 0 || node2.x > box.canvas.width) {continue;}

      if (node2.x > startx && node2.x + node2.width < startx + width) {
        if (node2.y > starty && node2.y + node2.height < starty + height) {
          node2.onMouseselected({
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            context: box
          });
          box.selectedElements.push(node2);
        }
      } else {
        node2.cancleSelected();
      }
    }
  }
};

DataBox.prototype.mouseup = function(event) {
  let box = this;
  let xy = Util.getXY(this, event);
  let x = xy.x;
  let y = xy.y;
  let dx = (x - box.startDragMouseX);
  let dy = (y - box.startDragMouseY);

  box.publish('mouseup', {
    target: box.currElement,
    x: x,
    y: y,
    dx: dx,
    dy: dy,
    context: box
  });
  box.startDragMouseX = null;

  if (box.currElement) {
    box.currElement.onMouseup({
      x: x,
      y: y,
      context: box,
      dx: dx,
      dy: dy
    });
  }

  box.updateView();
  box.isOnMouseDown = false;
};

DataBox.prototype.keydown = function(e) {
  let box = this;
  let keyID = e.keyCode ? e.keyCode : e.which;
  box.publish('keydown', keyID);
  box.updateView();
  // return;

  if (keyID === 17) { // Ctrl
  }
  if (keyID === 18) { // Alt
  }
  if (keyID === 16) { // Shift
  }
  if (keyID === 27) { // Esc
    this.cancleAllSelected();
    this.currElement = null;
  }
  if (keyID === 38 || keyID === 87) { // up arrow and W
    if (this.currElement) {
      this.currElement.y -= 5;
    }
  }
  if (keyID === 39 || keyID === 68) { // right arrow and D
    if (this.currElement) {
      this.currElement.x += 5;
    }
  }
  if (keyID === 40 || keyID === 83) { // down arrow and S
    if (this.currElement) {
      this.currElement.y += 5;
    }
  }
  if (keyID === 37 || keyID === 65) { // left arrow and A
    if (this.currElement) {
      this.currElement.x -= 5;
    }
  }
  box.updateView();
};

DataBox.prototype.keyup = function(e) {
  let box = this;
  let keyID = e.keyCode ? e.keyCode : e.which;
  box.publish('keyup', keyID);
  box.updateView();
};

DataBox.prototype.subscribe = function(topic, action) {
  this.messageBus.subscribe(topic, action);
  return this;
};

DataBox.prototype.publish = function(topic, msg) {
  this.messageBus.publish(topic, msg);
  return this;
};

DataBox.prototype.removeElementById = function(id) {
  for (let i = 0; i < this.elements.length; i++) {
    if (this.elements[i].id == id) {
      this.remove(i);
      break;
    }
  }
};

DataBox.prototype.remove = function(e) {
  this.elements = this.elements.del(e);
  this.containers = this.containers.del(e);
  this.links = this.links.del(e);
  this.nodes = this.nodes.del(e);
  this.elementMap[e.id] = e;
};

DataBox.prototype.addElement = function(e) {
  return this.add(e);
};

DataBox.prototype.add = function(e) {
  if (this.elementMap[e.id] != undefined && this.elementMap[e.id] != null) {
    return;
  }
  if (!e.id) {e.id = Util.createUUID();}
  if (!e.z){ e.z = this.elements.length;}
  this.elements.push(e);
  // if (e instanceof Container) {
  //   this.containers.push(e);
  // } else if (e instanceof Link) {
  //   this.links.push(e);
  // } else if (e instanceof Node) {
  //   this.nodes.push(e);
  // }
  // let proptotype = Object.getPrototypeOf(e);
  // if (proptotype === Container.constructor.prototype) {
  //   this.containers.push(e);
  // } else if (proptotype === Link.constructor.prototype) {
  //   this.links.push(e);
  // } else if (proptotype === Node.constructor.prototype) {
  //   this.nodes.push(e);
  // }
  if (e.eleType === 'Container' || e instanceof Container) {
    this.containers.push(e);
  } else if (e.eleType === 'Link' || e instanceof Link) {
    this.links.push(e);
  } else if (e.eleType === 'Node' || e instanceof Node) {
    this.nodes.push(e);
  }
  this.elementMap[e.id] = e;
};

DataBox.prototype.clear = function() {
  this.elements = [];
  this.links = [];
  this.nodes = [];
  this.containers = [];
  this.elementMap = {};
};

DataBox.prototype.getChilds = function(node) {
  let result = [];
  for (let i = 0; i < this.links.length; i++) {
    if (this.links[i].nodeA === node) {
      result.push(this.links[i].nodeB);
    }
  }
  return result;
};

DataBox.prototype.getNodesBound = function(nodes) {
  let bound = {
    x: 10000000,
    y: 1000000,
    width: 0,
    height: 0
  };
  if (nodes.length > 0) {
    let minX = 10000000;
    let maxX = -10000000;
    let minY = 10000000;
    let maxY = -10000000;
    let width = maxX - minX;
    let height = maxY - minY;
    for (let i = 0; i < nodes.length; i++) {
      let item = nodes[i];
      if (item.x <= minX) {
        minX = item.x;
      }
      if (item.x >= maxX) {
        maxX = item.x;
      }
      if (item.y <= minY) {
        minY = item.y;
      }
      if (item.y >= maxY) {
        maxY = item.y;
      }
      width = maxX - minX + item.width;
      height = maxY - minY + item.height;
    }

    bound.x = minX;
    bound.y = minY;
    bound.width = width;
    bound.height = height;
    return bound;
  }
  return null;
};

DataBox.prototype.isAllChildIsEndpoint = function(node) {
  let childs = this.getChilds(node);
  for (let i = 0; i < childs.length; i++) {
    let grandsons = this.getChilds(childs[i]);
    if (grandsons.length > 0) {return false;}
  }
  return true;
};

DataBox.prototype.getBoundRecursion = function(node) {
  let childs = this.getChilds(node);
  if (childs.length == 0) {return node.getBound();}
  return this.getNodesBound(childs);
};

DataBox.prototype.layoutNode = function(node) {
  let childs = this.getChilds(node);
  if (childs.length == 0){ return node.getBound();}

  this.adjustPosition(node);
  if (this.isAllChildIsEndpoint(node)) {
    return null;
  }
  for (let i = 0; i < childs.length; i++) {
    this.layoutNode(childs[i]);
  }
  return null;
};

DataBox.prototype.adjustPosition = function(node) {
  let childs = this.getChilds(node);
  let layout = node.layout;
  let type = layout.type;
  let points = null;
  if (type == 'star') {
    points = Layout.getStarPositions(node.x, node.y, childs.length, node.layout.radius,
      node.layout.beginDegree, node.layout.endDegree);
  } else if (type == 'tree') {
    points = Layout.getTreePositions(node.x, node.y, childs.length, layout.width,
      layout.height, layout.direction);
  }
  for (let i = 0; i < childs.length; i++) {
    childs[i].setLocation(points[i].x, points[i].y);
  }
};

DataBox.prototype.getParents = function(node) {
  let result = [];
  for (let i = 0; i < this.links.length; i++) {
    if (this.links[i].nodeB === node) {
      result.push(this.links[i].nodeA);
    }
  }
  return result;
};

DataBox.prototype.updateView = function() {
  let box = this;
  // let nodes = this.nodes;

  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  if (this.image != undefined && this.image != null) {
    this.ctx.drawImage(this.image, 0, 0);
  }

  for (let i = 0; i < this.links.length; i++) {
    let link = this.links[i];
    if (link.nodeA.x + link.nodeA.width < 0 || link.nodeA.x > box.canvas.width) {continue;}
    if (link.nodeB.x + link.nodeA.width < 0 || link.nodeB.x > box.canvas.width) {continue;}

    link.draw(this.ctx);
  }

  for (let j = 0; j < this.containers.length; j++) {
    let c = this.containers[j];
    if (c.x + c.width < 0 || c.x > box.canvas.width) {continue;}

    this.containers[j].draw(this.ctx);
  }

  for (let k = 0; k < this.nodes.length; k++) {
    if (this.nodes[k].x + this.nodes[k].width < 0 || this.nodes[k].x > box.canvas.width) {continue;}
    this.nodes[k].draw(this.ctx);
  }
};

module.exports = DataBox;
