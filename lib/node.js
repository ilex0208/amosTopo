/**
 * Node
 * @author ilex
 */

const AbstractNode = require('./abstractNode');

/**
 *
 * Node
 *
 * @param {any} name
 */
function Node(name) {
  this.eleType = 'Node';
  this.name = name;
  this.width = 35;
  this.height = 35;
  this.x = 0;
  this.y = 0;
  this.style = {
    fillStyle: '71, 167, 184',
    fontSize: '10pt',
    font: 'Consolas'
  };
  this.type = null;
  this.selected = false;

  this.alpha = 1;
  this.scala = 1;
  this.rotate = 0;
}

Node.prototype = new AbstractNode();

Node.prototype.drawText = function(ctx) {
  let name = this.getName();
  if (!name || name == '') {
    return;
  }
  let textWidth = ctx.measureText(name).width;
  ctx.font = this.style.fontSize + ' ' + this.style.font;
  ctx.strokeStyle = 'rgba(230, 230, 230, ' + this.alpha + ')';
  ctx.strokeText(name, -this.width / 2 + (this.width - textWidth) / 2, this.height / 2 + 12);
};

Node.prototype.drawTip = function(ctx) {
  let tip = this.getTip();
  if (!tip || tip == '') {
    return;
  }

  let textWidth = ctx.measureText(tip).width;
  ctx.save();
  ctx.beginPath();
  ctx.font = this.style.fontSize + ' ' + this.style.font;
  ctx.strokeStyle = 'rgba(230, 230, 230, ' + this.alpha + ')';
  if (textWidth > this.width) {
    ctx.strokeText(tip, -this.wdith - 2, -this.y - 2);
  } else {
    ctx.strokeText(tip, -this.width() + this.getWidth() - textWidth - 2, this.getY() - 2);
  }
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};

Node.prototype.drawSelectedRect = function(ctx) {
  let textWidth = ctx.measureText(this.getName()).width;
  let w = Math.max(this.width, textWidth);
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(168,202,255, 0.9)';
  ctx.fillStyle = 'rgba(168,202,236,0.5)';
  ctx.rect(-w / 2 - 3, -this.height / 2 - 2, w + 6, this.height + 16);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};

Node.prototype.draw = function(ctx) {
  if (!this.isVisible()) {
    return;
  }
  let node = this;
  ctx.save();
  ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
  ctx.rotate(this.rotate);
  ctx.scale(this.scala, this.scala);

  if (node.isSelected() || node.isFocus()) {
    this.drawSelectedRect(ctx);
  }

  let image = this.getImage();
  if (image != undefined && image != null) {
    //ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
    //ctx.clip();
    ctx.drawImage(image, -this.width / 2, -this.height / 2);
  } else {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.fill();
    ctx.closePath();
  }
  this.drawText(ctx);
  if (this.isTipVisible) {
    this.drawTip(ctx);
  }
  ctx.restore();
};

Node.prototype.split = function(angle) {
  let node = this;

  function genNode(x, y, r, beginDegree, endDegree) {
    let newNode = new Node();
    newNode.setImage(node.image);
    newNode.setLocation(x, y);
    newNode.draw = function(ctx) {
      ctx.save();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, r, beginDegree, endDegree);
      ctx.clip();
      ctx.beginPath();
      if (this.image != undefined && this.image != null) {
        ctx.drawImage(this.image, this.x, this.y);
      } else {
        ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
      }
      ctx.closePath();
      ctx.restore();
    };
    return newNode;
  }
  let beginDegree = angle;
  let endDegree = angle + Math.PI;

  let nodeA = genNode(node.x, node.y, node.width, beginDegree, endDegree);
  let nodeB = genNode(node.x, node.y, node.width, beginDegree + Math.PI, beginDegree);

  return {
    nodeA: nodeA,
    nodeB: nodeB
  };
};

function CircleNode(name) {
  let node = new Node(name);
  node.r = 30;
  node.beginDegree = 0;
  node.endDegree = 2 * Math.PI;
  node.draw = function(ctx) {
    if (this.visible) {
      return;
    }
    let w = node.r * 2 * this.scala;
    let h = node.r * 2 * this.scala;
    this.setWidth(w);
    this.setHeight(h);
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
    ctx.arc(node.x + w / 2, node.y + h / 2, w / 2, this.beginDegree, this.endDegree, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };
  return node;
}

function HeartNode() {
  let node = new Node();
  node.setSize(120, 120);
  node.draw = function(ctx) {
    if (!this.visible) {
      return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
    ctx.moveTo(this.x + 75, this.y + 40);
    ctx.bezierCurveTo(this.x + 75, this.y + 37, this.x + 70, this.y + 25, this.x + 50, this.y + 25);
    ctx.bezierCurveTo(this.x + 20, this.y + 25, this.x + 20, this.y + 62.5, this.x + 20, this.y + 62.5);
    ctx.bezierCurveTo(this.x + 20, this.y + 80, this.x + 40, this.y + 102, this.x + 75, this.y + 120);
    ctx.bezierCurveTo(this.x + 110, this.y + 102, this.x + 130, this.y + 80, this.x + 130, this.y + 62.5);
    ctx.bezierCurveTo(this.x + 130, this.y + 62.5, this.x + 130, this.y + 25, this.x + 100, this.y + 25);
    ctx.bezierCurveTo(this.x + 85, this.y + 25, this.x + 75, this.y + 37, this.x + 75, this.y + 40);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };
  return node;
}

function TipNode(name) {
  let node = new Node(name);
  node.setSize(100, 100);
  node.draw = function(ctx) {
    if (!this.visible) {
      return;
    }
    let x = this.x;
    let y = this.y;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(230, 230, 230, 0.8)';
    ctx.moveTo(x + 50, y);
    ctx.quadraticCurveTo(x, y, x, y + 37.5);
    ctx.quadraticCurveTo(x, y + 75, x + 25, y + 75);
    ctx.quadraticCurveTo(x + 25, y + 95, x + 5, y + 100);
    ctx.quadraticCurveTo(x + 35, y + 95, x + 45, y + 75);
    ctx.quadraticCurveTo(x + 100, y + 75, x + 100, y + 37.5);
    ctx.quadraticCurveTo(x + 100, y, x + 50, y);

    ctx.strokeText(node.name, node.x + 20, node.y + 20);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };
  return node;
}

function TextNode(name) {
  let node = new Node(name);
  node.setHeight(14);
  node.style = {
    strokeStyle: 'rgba(255,255,255, 0.99)',
    fillStyle: 'rgba(255,255,255, 0.5)'
  };
  node.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.font = this.style.fontSize + ' ' + this.style.font;
    let textWidth = ctx.measureText(this.name).width;
    ctx.closePath();
    ctx.restore();

    node.width = textWidth;
    if (!this.visible) {
      return;
    }

    if (node.selected) {
      let startx = this.x - (textWidth > this.width ? (textWidth - this.width) / 2 : 0);
      let width = Math.max(this.width, textWidth);
      ctx.save();
      ctx.beginPath();
      ctx.rect(startx - 3, this.y - 1, width + 6, this.height + 20);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
    ctx.save();
    ctx.beginPath();
    ctx.font = this.style.fontSize + ' ' + this.style.font;
    ctx.strokeStyle = this.style.strokeStyle;
    ctx.fillStyle = this.style.fillStyle;
    ctx.strokeText(node.name, node.x, node.y + 12);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };
  return node;
}

function GhomboidNode() {
  let node = new Node();
  node.offset = 10;
  node.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.shadowBlur = 9;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
    ctx.moveTo(this.x + this.offset, this.y);
    ctx.lineTo(this.x + this.offset + this.width, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.offset, this.y);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };
  return node;
}

function UMLClassNode(name) {
  let node = new Node();
  node.style.fillStyle = '71, 167, 184';
  node.className = name;
  node.rowHeight = 18;
  node.width = 168;
  node.classObj = null;

  node.draw = function(ctx) {
    if (!this.visible) {
      return;
    }
    if (this.classObj && this.classObj != null) {
      node.operations = [];
      node.attributes = [];
      for (let k in this.classObj) {
        let v = this.classObj[k];
        if (typeof v == 'function') {
          this.operations.push('+ ' + k);
        } else {
          this.attributes.push('- ' + k);
        }
      }
    }

    if (node.operations == null || node.operations.length == 0) {
      node.operations = [' '];
    }
    if (node.attributes == null || node.attributes.length == 0) {
      node.attributes = [' '];
    }
    node.height = (node.operations.length + node.attributes.length + 1) * node.rowHeight + 3;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(239,247,149,' + this.alpha + ')';
    ctx.rect(this.x, this.y, this.width, this.getHeight());
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fill();
    ctx.font = this.style.fontSize + ' ' + this.style.font;

    ctx.moveTo(this.x, this.y + node.rowHeight + 3);
    ctx.lineTo(this.x + this.width, this.y + node.rowHeight + 3);

    let textWidth = ctx.measureText(node.className).width;
    ctx.strokeText(node.className, this.getX() + (this.getWidth() - textWidth) / 2, this.getY() + node.rowHeight);

    for (let i = 0; i < this.operations.length; i++) {
      let operation = this.operations[i];
      ctx.strokeText(operation, this.getX() + 5, this.getY() + node.rowHeight + node.rowHeight * (i + 1));
    }

    ctx.moveTo(this.x, this.y + node.rowHeight * (this.operations.length + 1) + 3);
    ctx.lineTo(this.x + this.width, this.y + node.rowHeight * (this.operations.length + 1) + 3);

    let begingHeight = this.y + node.rowHeight * (this.operations.length + 1);
    for (let j = 0; j < this.attributes.length; j++) {
      let attribute = this.attributes[j];
      ctx.strokeText(attribute, this.getX() + 5, begingHeight + this.rowHeight * (j + 1));
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };
  return node;
}


function EndPointNode(name) {
  let node = new Node(name);
  let bak = node.draw;
  node.draw = function(ctx) {
    if (!this.visible) {
      return;
    }
    let points = [];

    let rx = node.width / 3;
    let ry = node.height / 3;

    function createPoint(x, y) {
      let point = new Node();
      point.setSize(rx, ry);
      point.style.fillStyle = '0,255,0';
      point.setDragable(false);
      point.setLocation(x, y);
      return point;
    }

    points.push(createPoint(this.x - rx / 2, this.y + this.height / 2 - ry / 2));
    points.push(createPoint(this.x + this.width / 2 - rx / 2, this.y - ry / 2));

    points.push(createPoint(this.x + this.width - rx / 2, this.y + this.height / 2 - ry / 2));
    points.push(createPoint(this.x + this.width / 2 - rx / 2, this.y + this.height - ry / 2));
    if (this.isSelected()) {
      for (let i = 0; i < points.length; i++) {
        points[i].draw(ctx);
      }
    }
    bak.call(this, ctx);
  };
  return node;
}

module.exports = {
  Node: Node,
  CircleNode: CircleNode,
  GhomboidNode: GhomboidNode,
  TipNode: TipNode,
  TextNode: TextNode,
  HeartNode: HeartNode,
  UMLClassNode: UMLClassNode,
  EndPointNode: EndPointNode
};
