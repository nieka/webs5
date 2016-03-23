/**
 * Created by niek on 22-3-2016.
 */


function init(mongoose){
    console.log('Iniializing wayPoint schema');

    var wayPoint = new mongoose.Schema({
            place_id: {type: String, required: true}, //id van het cafe in google places
            gemeldeUsers:[{type: String}]
        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });
    mongoose.model("wayPoint",wayPoint);
}

module.exports = init;