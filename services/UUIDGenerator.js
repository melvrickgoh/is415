var generator = require('node-uuid');

function UUIDGenerator(){}

UUIDGenerator.prototype.constructor = UUIDGenerator;

UUIDGenerator.prototype.generate = function(){
	return generator.v4();
}

module.exports = UUIDGenerator;
