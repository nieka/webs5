/**
 * Created by niek on 22-3-2016.
 */


function init(mongoose){
    console.log('Iniializing race schema');

    var race = new mongoose.Schema({
            naam: {type: String, required: true},
            plaats: {type: String, required: true},
            status: {type: String},
            wayPoints:[{type: String}],
            deelnemers: [{type: String}]
        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });
    mongoose.model("race",race);
}

module.exports = init;