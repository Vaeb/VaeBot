exports.funcs = [];

exports.addEvent = function(name, callback) {
	exports.funcs[name] = callback;
};

exports.remEvent = function(name) {
	exports.funcs[name] = null;
};

exports.onEvent = function(name) {
	var args = Array.prototype.slice.call(arguments, 1);
	var func = funcs[name];
	if (func) {
		func(...args);
	}
};