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
