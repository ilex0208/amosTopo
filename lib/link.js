/**
 * Link
 * @author ilex
 */

const Element = require('./element');
const Util = require('./util');

/**
 * Layout of topo for personal project
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns Link
 */
function Link(nodeA, nodeB) {
  this.eleType = 'Link';
  this.nodeA = nodeA;
  this.nodeB = nodeB;
  this.style = {
    strokeStyle: '116, 166, 250',
    alpha: 1,
    lineWidth: 2
  };
}

Link.prototype = new Element();

Link.prototype.draw = function(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
  ctx.lineWidth = this.style.lineWidth;
  ctx.moveTo(this.nodeA.x + this.nodeA.width / 2, this.nodeA.y + this.nodeA.height / 2);
  ctx.lineTo(this.nodeB.x + this.nodeB.width / 2, this.nodeB.y + this.nodeB.height / 2);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};

Link.prototype.getLength = function() {
  return Util.getDistance(this.nodeA, this.nodeB);
};

function FoldLink(nodeA, nodeB) {
  let link = new Link(nodeA, nodeB);
  link.fold = 'x';
  link.draw = function(ctx) {
    let x1 = this.nodeA.x;
    let y1 = this.nodeA.y;
    let x2 = this.nodeB.x;
    let y2 = this.nodeB.y;
    let mx = x1;
    let my = y1;

    if (x1 == x2 || y1 == y2) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
      ctx.lineWidth = this.style.lineWidth;
      ctx.moveTo(this.nodeA.x + this.nodeA.width / 2, this.nodeA.y + this.nodeA.height / 2);
      ctx.lineTo(this.nodeB.x + this.nodeB.width / 2, this.nodeB.y + this.nodeB.height / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else {
      if (this.fold == 'x') {
        mx = x1 + (x2 - x1);
      } else {
        my = y1 + (y2 - y1);
      }
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
      ctx.lineWidth = this.style.lineWidth;
      ctx.moveTo(x1 + this.nodeA.width / 2, y1 + this.nodeA.height / 2);
      ctx.lineTo(mx + this.nodeA.width / 2, my + this.nodeA.height / 2);
      ctx.lineTo(x2 + this.nodeA.width / 2, y2 + this.nodeA.height / 2);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  };

  return link;
}


function CurveLink(nodeA, nodeB) {
  let link = new Link(nodeA, nodeB);
  link.curve = 0.5;
  link.draw = function(ctx) {
    let x1 = this.nodeA.x;
    let y1 = this.nodeA.y;
    let x2 = this.nodeB.x;
    let y2 = this.nodeB.y;
    let mx = x1;
    let my = y1;

    mx = x1 + (x2 - x1);
    my = y1 + (y2 - y1);

    mx *= this.curve;
    my *= this.curve;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
    ctx.lineWidth = this.style.lineWidth;
    ctx.moveTo(x1 + this.nodeA.width / 2, y1 + this.nodeA.height / 2);
    ctx.quadraticCurveTo(mx + this.nodeA.width / 2, my + this.nodeA.height / 2,
      x2 + this.nodeA.width / 2, y2 + this.nodeA.height / 2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };
  return link;
}

function ArrowsLink(nodeA, nodeB) {
  let link = new Link(nodeA, nodeB);
  link.angle = 0.4;
  link.offset = 30;
  //link.style.fillStyle = '116, 166, 250';
  link.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
    ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.style.alpha + ')';
    ctx.lineWidth = this.style.lineWidth;

    let ta = {
      x: this.nodeA.x + this.nodeA.width / 2,
      y: this.nodeA.y + this.nodeA.height / 2
    };
    let t = {
      x: this.nodeB.x + this.nodeB.width / 2,
      y: this.nodeB.y + this.nodeB.height / 2
    };

    let angle = Math.atan2(ta.y - t.y, ta.x - t.x);
    t.x = t.x + Math.cos(angle) * this.nodeB.width / 2;
    t.y = t.y + Math.sin(angle) * this.nodeB.height / 2;

    let da = 0.4;
    let pointA = {
      x: t.x + Math.cos(angle - da) * this.offset,
      y: t.y + Math.sin(angle - da) * this.offset
    };

    let pointB = {
      x: t.x + Math.cos(angle + da) * this.offset,
      y: t.y + Math.sin(angle + da) * this.offset
    };

    ctx.moveTo(this.nodeA.x + this.nodeA.width / 2, this.nodeA.y + this.nodeA.height / 2);
    //ctx.lineTo(this.nodeB.x + this.nodeB.width / 2, this.nodeB.y + this.nodeB.height / 2);
    ctx.lineTo(pointA.x + (pointB.x - pointA.x) / 2, pointA.y + (pointB.y - pointA.y) / 2);

    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(t.x, t.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.lineTo(pointA.x, pointA.y);
    if (this.style.fillStyle && this.style.fillStyle != null) {
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };
  return link;
}

function ArrowsFoldLink(nodeA, nodeB) {
  let link = new Link(nodeA, nodeB);
  link.fold = 'x';
  link.angle = 0.4;
  link.offset = 30;

  link.draw = function(ctx) {
    let x1 = this.nodeA.x;
    let y1 = this.nodeA.y;
    let x2 = this.nodeB.x;
    let y2 = this.nodeB.y;
    let mx = x1;
    let my = y1;
    let ta,t,angle,da,pointA,pointB;

    if (x1 == x2 || y1 == y2) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
      ctx.lineWidth = this.style.lineWidth;

      ta = {
        x: this.nodeA.x + this.nodeA.width / 2,
        y: this.nodeA.y + this.nodeA.height / 2
      };
      t = {
        x: this.nodeB.x + this.nodeB.width / 2,
        y: this.nodeB.y + this.nodeB.height / 2
      };

      angle = Math.atan2(ta.y - t.y, ta.x - t.x);
      t.x = t.x + Math.cos(angle) * this.nodeB.width / 2;
      t.y = t.y + Math.sin(angle) * this.nodeB.height / 2;

      da = 0.4;
      pointA = {
        x: t.x + Math.cos(angle - da) * this.offset,
        y: t.y + Math.sin(angle - da) * this.offset
      };

      pointB = {
        x: t.x + Math.cos(angle + da) * this.offset,
        y: t.y + Math.sin(angle + da) * this.offset
      };

      ctx.lineTo(pointA.x + (pointB.x - pointA.x) / 2, pointA.y + (pointB.y - pointA.y) / 2);

      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(t.x, t.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.lineTo(pointA.x, pointA.y);
      if (this.style.fillStyle && this.style.fillStyle != null) {
        ctx.fill();
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else {
      if (this.fold == 'x') {
        mx = x1 + (x2 - x1);
      } else {
        my = y1 + (y2 - y1);
      }
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + this.style.strokeStyle + ',' + this.style.alpha + ')';
      ctx.lineWidth = this.style.lineWidth;
      ctx.moveTo(x1 + this.nodeA.width / 2, y1 + this.nodeA.height / 2);
      ctx.lineTo(mx + this.nodeA.width / 2, my + this.nodeA.height / 2);

      ta = {
        x: mx + this.nodeA.width / 2,
        y: my + this.nodeA.height / 2
      };
      t = {
        x: this.nodeB.x + this.nodeB.width / 2,
        y: this.nodeB.y + this.nodeB.height / 2
      };

      angle = Math.atan2(ta.y - t.y, ta.x - t.x);
      t.x = t.x + Math.cos(angle) * this.nodeB.width / 2;
      t.y = t.y + Math.sin(angle) * this.nodeB.height / 2;

      da = 0.4;
      pointA = {
        x: t.x + Math.cos(angle - da) * this.offset,
        y: t.y + Math.sin(angle - da) * this.offset
      };

      pointB = {
        x: t.x + Math.cos(angle + da) * this.offset,
        y: t.y + Math.sin(angle + da) * this.offset
      };

      ctx.lineTo(pointA.x + (pointB.x - pointA.x) / 2, pointA.y + (pointB.y - pointA.y) / 2);

      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(t.x, t.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.lineTo(pointA.x, pointA.y);

      if (this.style.fillStyle && this.style.fillStyle != null) {
        ctx.fill();
      }
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  };

  return link;
}

module.exports = {
  Link: Link,
  FoldLink: FoldLink,
  CurveLink: CurveLink,
  ArrowsLink: ArrowsLink,
  ArrowsFoldLink: ArrowsFoldLink
};
