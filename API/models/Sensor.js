const mongoose = require ('mongoose');

/// schema for asset model
const Sensor = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please indicate name of asset']
        },
        address: {
            type: String,
            required: [true, 'address: /company/location/asset_id/']
        },
        locaitonTag: {
            type: List[String],
            required: [true, 'Should be automatically generated from address']
            
        },
        proccessName: {
            type: String,
            required: [true, 'what variable are you measuring, switch, speed, count e.t.c']
        },

        sensingUnit: {
            type: String,
            required: [true, 'Indicate the unit you are measuring']
        },
        dataFrequency: {
            type: String, // ms, s, m, hr, d, w, m
            required: [true, 'this determines how data stored are managed']
        },
        
    }
)

module.exports = mongoose.model(
    'Sensor', Sensor
);
