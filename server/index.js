/*
 * GET home page.
 */

var APP;

/*
* APP Classes
*/
function Router(app){
	APP = app;
}

Router.prototype.init = function(){
	APP.get('/',function(req,res){
		res.send('welcome to head');
	});

	APP.get('/teamextracts',function(req,res){
		res.send('team extracts');
	});

	APP.get('/hello',function(req,res){
		res.render('hello', { message: 'Congrats, you just set up your app!' });
	});
}

exports.index = Router;