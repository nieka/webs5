

function init(mongoose){
    console.log('Iniializing user schema');

    var user = new mongoose.Schema({
            firstname: {type: String, required: true},
            lastname: {type: String, required: true},
            email: {type: String},
            woonplaats: {type: String, required: true},
            pokomons: [{type: String}]
        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });
    user.virtual('fullname')
        .get(function () {
            return this.firstname + ' ' + this.lastname;
        });
    mongoose.model("User",user);
}

module.exports = init;