const dotenv = require('dotenv');
dotenv.load();

var gUsersDAO = require('./GoogleUsersDAO');
var GoogleUsersDAO = new gUsersDAO({ pgURL:process.env.PG_DB_URL });

var s3FilesDAO = require('./S3FilesDAO');
var S3FilesDAO = new s3FilesDAO();

var rDAO = require('./RDAO');
var RDAO = new rDAO();

function DAOMaster(){}

DAOMaster.prototype.constructor = DAOMaster;

DAOMaster.prototype.GoogleUsersDAO = GoogleUsersDAO;

DAOMaster.prototype.S3FilesDAO = S3FilesDAO;

DAOMaster.prototype.RDAO = RDAO;

module.exports = DAOMaster;