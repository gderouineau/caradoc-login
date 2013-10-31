var secure_data        = require('../../../config/security').get;
var logout_target      = secure_data.security.logout.target;

exports.logout = function(req,res){
    if(req.session.c_user)
        req.session.destroy();

    res.redirect(logout_target);
};