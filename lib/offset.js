/**
 * 获取偏移位置
 *
 * @param {any} domEle dom元素
 * @returns
 */
function getOffsetPosition(domEle) {
  if (!domEle) {
    return {
      left: 0,
      top: 0
    };
  }
  let _top = 0, _left = 0;
  if ('getBoundingClientRect' in document.documentElement) {
    let clientRect = domEle.getBoundingClientRect(),
      ownerDoc = domEle.ownerDocument,
      _body = ownerDoc.body,
      _de = ownerDoc.documentElement,
      tempTop = _de.clientTop || _body.clientTop || 0,
      tempLeft = _de.clientLeft || _body.clientLeft || 0;
    _top = clientRect.top + (self.pageYOffset || _de && _de.scrollTop || _body.scrollTop) - tempTop,
      _left = clientRect.left + (self.pageXOffset || _de && _de.scrollLeft || _body.scrollLeft) - tempLeft;
  } else {
    do {
      _top += domEle.offsetTop || 0,
        _left += domEle.offsetLeft || 0,
        domEle = domEle.offsetParent;
    }
    while (domEle);
  }
  return {
    left: _left,
    top: _top
  };
}

module.exports = getOffsetPosition;