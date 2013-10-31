/*
 * Dependencies
 */
var secure_data        = require('../../../config/security').get;
var inscription_path   = secure_data.security.inscription.inscription_path ;
var inscription_target = secure_data.security.inscription.target;



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