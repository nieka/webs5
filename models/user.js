var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

function init(){
    console.log('Iniializing user schema');

    var userSchema = new mongoose.Schema(
        {
            local            : {
                email        : String,
                password     : String,
                voornaam     : String,
                achternaam   : String
            },
            google           : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            }
        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });
    userSchema.virtual('fullname')
        .get(function () {
            if(this.local.email){
                return this.local.voornaam + ' ' + this.local.achternaam;
            }else {
                return this.google.name;
            }

        });
    userSchema.virtual('email')
        .get(function () {
            if(this.local.email){
                return this.local.email;
            }else {
                return this.google.email;
            }

        });

    // methods ======================
    // generating a hash
    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    return mongoose.model("User",userSchema);
}

module.exports = init();