var ironcache = require('iron-cache');
var IRON_CACHE_PROJECT = process.env.IRON_CACHE_PROJECT_ID || '54dd67f6afc2630006000124',
IRON_CACHE_TOKEN = process.env.IRON_CACHE_TOKEN || 'QOfGHSVCGTNQOamsxZuaJaBF44E',
CACHE_NAME = process.env.IRON_CACHE_NAME || 'geospatial-melvrick';

// Pass an options object.
var CLIENT = ironcache.createClient({ project: IRON_CACHE_PROJECT, token: IRON_CACHE_TOKEN });

function IronCache(){}

IronCache.prototype.constructor = IronCache;

IronCache.prototype.cacheRequest = function(request,callback){
	_get(request,function(err,res){
		if (err) { //request type does not exist
			callback(false);
		}else{ // request type exists
			callback(true,res);
		}
	});
}

IronCache.prototype.get = function(key,callback){
	_get(key,callback);
}

function _get(key,callback){
	CLIENT.get(CACHE_NAME, key,callback);
}

IronCache.prototype.put = function(key,value,callbak){
	CLIENT.put(CACHE_NAME, key, { value: value }, callback);
}

IronCache.prototype.delete = function(key,callback){
	CLIENT.del(CACHE_NAME, key, callback);
}

IronCache.prototype.clearCache = function(callback){
	CLIENT.clearCache(CACHE_NAME, callback);
}

module.exports = IronCache;