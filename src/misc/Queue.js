var Queue = function (array = [], maxSize = 5) {
  if (!Array.isArray(array)) {
    throw new Error("not a valid Array");
  }
  this.elements = [...array];
};

Queue.prototype.enqueue = function (data) {
  this.elements.push(data);
  if (this.elements.length > 5) {
    this.elements.shift();
  }
};

Queue.prototype.dequeue = function () {
  this.elements.shift();
};

Queue.prototype.getElements = function () {
  return this.elements.filter(i => i)
};

export default Queue;
