var secure_data        = require('../../../config/security').get;
var login_target       = secure_data.security.form_login.target;
var login_path         = secure_data.security.form_login.login_path;
var logout_target      = secure_data.security.logout.target;
var inscription_path   = secure_data.security.inscription.inscription_path ;
var inscription_target = secure_data.security.inscription.target;
var c_user             = secure_data.user;
var User               = require('caradoc-user').User["User"];

var mysql     = require('caradoc-sql');
var sequelize = mysql.sequelize;
var Sequelize = mysql.Sequelize;


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

exports.logout = function(req,res){
    if(req.session.c_user)
        req.session.destroy();

    res.redirect(logout_target);
};

exports.inscription_check =  function(req, res){
    var is_error=false;
    req.session.inscription = {
        username : '',
        firstname: null,
        lastname : null,
        password : '',
        email    : '',
        role     : 'ROLE_MEMBER'
    };


    if(req.body.firstname){
        req.session.inscription.firstname=req.body.firstname;
    }
    if(req.body.lastname){
        req.session.inscription.lastname=req.body.lastname;
    }
    if(req.body.password && req.body.repassword){
        if(req.body.password == req.body.repassword){
            req.session.inscription['password']=req.body.password;
        }
        else{
            //password are different
            is_error=true;
        }
    }
    else{
        //missing one password
        is_error=true;
    }
    if(req.body.username){
        if(verify_username(req.body.username)){
            req.session.inscription.username = req.body.username;
        }
        else{
            //some error
        }
    }
    if(req.body.email){
        if(verify_email(req.body.email)){
            req.session.inscription.email = req.body.email;
        }
        else{
            //some error
        }
    }
    else{
        //missing email
        is_error=true;
    }

    if(is_error == false){
        User.build({
            username : req.session.inscription.username,
            firstname: req.session.inscription.firstname,
            lastname : req.session.inscription.lastname,
            password : req.session.inscription.password,
            email    : req.session.inscription.email,
            role     : req.session.inscription.role
        })
            .save()
            .success(function(){
                if(req.session.error){
                    req.session.error.destroy();
                }
                if(req.session.inscription){
                    req.session.destroy();
                }
                res.redirect(inscription_target);

            })
            .fail(function(error){
                req.session.error = {
                    code : 1,
                    text : "fail to insert into database"
                };
                res.redirect(inscription_path);
            });
    }
};

function verify_username (user_name){
    var is_error = true;
    User.find( { where: {username : user_name}})
        .on('success', function(user){
            if(user) {
                // username exist in database
                is_error=true;
            }
            else{
                is_error = false;
            }
        })
        .on('failure', function(error){
            // database error
            is_error = true;
        });
    return is_error;

}

function verify_email(user_email) {
    var is_error = true;
    User.find( { where: {email : user_email}})
        .on('success', function(user){
            if(user !== null) {
                // username exist in database
                is_error=true;
            }
            else{
                is_error=false;

            }
        })
        .on('failure', function(error){
            // database error
            is_error = true;
        });
}