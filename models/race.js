/**
 * Created by niek on 22-3-2016.
 */


function init(mongoose){
    console.log('Iniializing race schema');

    var schema = mongoose.Schema,
        ObjectId = schema.ObjectId;
    schema = new mongoose.Schema({
            naam: {type: String, required: true},
            plaats: {type: String, required: true},
            lat: {type: Number, required: true},
            lon: {type: Number, required: true},
            status: {type: String, default : "Niet Gestart"},
            wayPoints:[{type: mongoose.Schema.Types.ObjectId, ref: "wayPoint"}],
            deelnemers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
        },
        {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });
    mongoose.model("race",schema);
}

module.exports = init;