var secure_data        = require('../../../config/security').get;


var inscription_path   = secure_data.security.inscription.inscription_path ;
var inscription_target = secure_data.security.inscription.target;
var c_user             = secure_data.user;
var User               = require('caradoc-user').User["User"];

var mysql     = require('caradoc-sql');
var sequelize = mysql.sequelize;
var Sequelize = mysql.Sequelize;


module.exports = require('./login_check');


module.exports = require('./logout');


module.exports = require('./inscription_check');

