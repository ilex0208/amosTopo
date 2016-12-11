/**
 * Element of topo for personal project
 *
 * @returns
 * @author ilex
 */

// const extend = require('./core/extend');

let Element = function() {
  this.eleType = 'Element';
};

Element.prototype.draw = function() {};

Element.prototype.getId = function() {
  return this.id;
};

Element.prototype.setId = function(i) {
  this.id = i;
  return this;
};

Element.prototype.getFloatMenu = function() {
  return this.floatMenu;
};

Element.prototype.setFloatMenu = function(m) {
  this.floatMenu = m;
  return this;
};

Element.prototype.isFloatMenuVisible = function() {
  return this.floatMenuVisible;
};

Element.prototype.setFloatMenuVisible = function(v) {
  this.floatMenuVisible = v;
  return this;
};

Element.prototype.setX = function(x) {
  this.x = x;
  return this;
};

Element.prototype.setY = function(y) {
  this.y = y;
  return this;
};

Element.prototype.getX = function() {
  return this.x;
};

Element.prototype.getY = function() {
  return this.y;
};

Element.prototype.getLocation = function(x, y) {
  return {
    x: this.getX(),
    y: this.getY()
  };
};

Element.prototype.setLocation = function(x, y) {
  this.setX(x);
  this.setY(y);
  return this;
};

Element.prototype.getWidth = function() {
  return this.width;
};

Element.prototype.setWidth = function(width) {
  this.width = width;
  return this;
};

Element.prototype.getHeight = function() {
  return this.height;
};

Element.prototype.setHeight = function(height) {
  this.height = height;
  return this;
};

Element.prototype.getSize = function() {
  return {
    width: this.getWidth(),
    height: this.getHeight()
  };
};

Element.prototype.setSize = function(width, height) {
  this.setWidth(width);
  this.setHeight(height);
  return this;
};

Element.prototype.setBound = function(x, y, width, height) {
  this.setLocation(x, y);
  this.setSize(width, height);
  return this;
};

Element.prototype.getBound = function() {
  return {
    left: this.getX(),
    top: this.getY(),
    right: this.getX() + this.getWidth(),
    bottom: this.getY() + this.getHeight()
  };
};

Element.prototype.isVisible = function() {
  return this.visible;
};

Element.prototype.setVisible = function(v) {
  this.visible = v;
  return this;
};

Element.prototype.isDragable = function() {
  return this.dragable;
};

Element.prototype.setDragable = function(d) {
  this.dragable = d;
  return this;
};

Element.prototype.isSelected = function() {
  return this.selected;
};

Element.prototype.setSelected = function(s) {
  this.selected = s;
  return this;
};

Element.prototype.isFocus = function() {
  return this.focus;
};

Element.prototype.setFocus = function(f) {
  this.focus = f;
  return this;
};

Element.prototype.onFocus = function() {
  this.setFocus(true);
  return this;
};

Element.prototype.loseFocus = function() {
  this.setFocus(false);
  return this;
};

Element.prototype.setTip = function(tip) {
  this.tip = tip;
  return this;
};

Element.prototype.getTip = function() {
  return this.tip;
};

Element.prototype.onMousedown = function(e) {
  console.log(this);
  this.setSelected(true);
  this.mousedownX = e.x;
  this.mousedownY = e.y;
  this.selectedLocation = {
    x: this.getX(),
    y: this.getY()
  };
};

Element.prototype.onMouseselected = function() {
  this.setSelected(true);
  this.selectedLocation = {
    x: this.getX(),
    y: this.getY()
  };
};

Element.prototype.goBack = function(box) {};

Element.prototype.onMouseup = function(e) {
  this.mouseupX = e.x;
  this.mouseupY = e.y;
  let x = e.x;
  let y = e.y;
  let box = e.context;

  if (this.gravitate) {
    for (let i = 0; i < box.links.length; i++) {
      let link = box.links[i];
      if (this === link.nodeB) {
        let newNodeA = box.findCloserNode(this, this.gravitate);
        let gravitateMsg = {
          link: link,
          target: this,
          oldNode: this.lastParentNode,
          newNode: newNodeA
        };
        if (newNodeA && newNodeA.layout && newNodeA.layout.auto) {
          box.layoutNode(newNodeA);
        }
        if (this.lastParentNode && this.lastParentNode.layout && this.lastParentNode.layout.auto) {
          box.layoutNode(this.lastParentNode);
        }
        box.publish('gravitate', gravitateMsg);
        break;
      }
    }
  }

  if (this.outContainer && this.isIndrag) {
    for (let j = 0; j < box.containers.length; j++) {
      let c = box.containers[j];
      if (!this.inContainer(c)) {continue;}
      if (this.parentContainer !== c) {continue;}
      if (this.x + this.width < c.x || this.x > c.x + c.width || this.y + this.height < c.y || this.y > c.y + c.height) {
        this.parentContainer.remove(this);
        break;
      }
    }
  }

  if (this.inContainer && this.isOnMousedrag) {
    for (let k = 0; k < box.containers.length; k++) {
      let group = box.containers[k];
      if (!this.inContainer(group)) {continue;}
      if (x > group.x && x < group.x + group.width && y > group.y && y < group.y + group.height) {
        if (this.parentContainer) {
          this.parentContainer.remove(this);
        }
        group.add(this);
        break;
      }
    }
  }
  if (this.layout && this.layout.auto) {
    box.layoutNode(this);
  }
  this.isOnMousedrag = false;
};

Element.prototype.cancleSelected = function() {
  this.setSelected(false);
  this.selectedLocation = null;
};

Element.prototype.onMouseover = function(e) {
  this.isOnMousOver = true;
  this.isTipVisible = true;
  this.setFocus(true);
};

Element.prototype.onMouseout = function(e) {
  this.isOnMousOver = false;
  this.isTipVisible = false;
  this.setFocus(false);
};

Element.prototype.onMousedrag = function(e) {
  this.isOnMousedrag = true;
  let dx = e.dx;
  let dy = e.dy;
  let x = e.x;
  let y = e.y;

  let newX = this.selectedLocation.x + dx;
  let newY = this.selectedLocation.y + dy;
  this.setLocation(newX, newY);
  let box = e.context;

  if (this.gravitate) {
    for (let i = 0; i < box.links.length; i++) {
      let link = box.links[i];
      if (this === link.nodeB) {
        let newNodeA = box.findCloserNode(this, this.gravitate);
        if (newNodeA && newNodeA != null && newNodeA !== link.nodeA) {
          if (this.lastParentNode == null) {
            this.lastParentNode = link.nodeA;
          }
          link.nodeA = newNodeA;
          break;
        }
      }
    }
  }

  if (this.inContainer) {
    for (let j = 0; j < box.containers.length; j++) {
      let group = box.containers[j];
      if (!this.inContainer(group)) {continue;}
      if (x > group.x && x < group.x + group.width && y > group.y && y < group.y + group.height) {
        group.setFocus(true);
      } else {
        group.setFocus(false);
      }
    }
  }
  this.isIndrag = true;
};

module.exports = Element;
