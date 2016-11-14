const Element = require('./_element');

/**
 * AbstractNode of topo for personal project
 *
 * @param {any} name
 * @returns node
 * @author ilex
 */
function AbstractNode(name) {
  this.eleType = 'AbstractNode';
  this.id = null;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.visible = true;
  this.dragable = true;

  this.name = name;
  this.image = null;
  this.color = null;
  this.layout = null;
  this.gravitate = null; //function(){};
  this.parentContainer = null;
  this.inContainer = null;
  this.outContainer = null;
  this.fixed = false;
}

AbstractNode.prototype = new Element();

AbstractNode.prototype.getName = function() {
  return this.name;
};

AbstractNode.prototype.setName = function(n) {
  this.name = n;
  return this;
};

AbstractNode.prototype.getImage = function() {
  return this.image;
};

AbstractNode.prototype.setImage = function(i) {
  let node = this;
  if (typeof i == 'string') {
    let img = this.image = new Image();
    this.image.onload = function() {
      node.setSize(img.width, img.height);
    };
    this.image.src = i;
  } else {
    this.image = i;
  }
};

let ImageCache = {};
AbstractNode.prototype.getTypeImage = function(type) {
  let typeImages = {
    'zone': './assets/img/zone.png',
    'host': './assets/img/host.png',
    'vm': './assets/img/vm.png'
  };
  if (ImageCache[type]) {
    return ImageCache[type];
  }
  let src = typeImages[type];
  if (src == null) {return null;}

  let image = new Image();
  image.src = src;
  return ImageCache[type] = image;
};

AbstractNode.prototype.getType = function() {
  return this.type;
};

AbstractNode.prototype.setType = function(type) {
  this.type = type;
  this.setImage(this.getTypeImage(type));
};

module.exports = AbstractNode;
