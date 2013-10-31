var secure_data        = require('../../../config/security').get;
var login_target       = secure_data.security.form_login.target;
var login_path         = secure_data.security.form_login.login_path;

exports.login_check = function(req, res){
    if( login_target == 'last_page'){
        login_target = '/';
        if(req.session.last_page){
            login_target = req.session.last_page;
        }
    }
    var get_username = req.body.username;
    var get_password = req.body.password;
    var user_result;
    User.find( { where: {username : get_username}})
        .on('success', function(user) {
            if(user !== null) {
                user_result = user.dataValues;
                if(get_password == user_result.password){
                    req.session.c_user = {

                        id        : user_result.id,
                        firstname : user_result.firstname,
                        lastname  : user_result.lastname,
                        email     : user_result.email,
                        role      : user_result.role

                    };
                    if(req.session.error){
                        req.session.error.destroy();
                    }
                    res.redirect(login_target);
                }
                else{
                    req.session.error = {
                        code : 1,
                        text : "wrong password"
                    };
                    res.redirect(login_path);
                }
            }
            else {
                req.session.error = {
                    code : 2,
                    text : "no such user"
                };
                res.redirect(login_path);
            }
        })
        .on('failure',function(error) {
            req.session.error = {
                code : 3,
                text : error
            };
            res.redirect(login_path);
        });

};