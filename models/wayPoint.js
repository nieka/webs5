/**
 * Created by niek on 22-3-2016.
 */


function init(mongoose){
    console.log('Iniializing wayPoint schema');
    var schema = mongoose.Schema,
        ObjectId = schema.ObjectId;
    schema = new mongoose.Schema({
            place_id: {type: String, required: true}, //id van het cafe in google places
            naam: {type: String, required: true},
            gemeldeUsers:[{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });
    mongoose.model("wayPoint",schema);
}

module.exports = init;