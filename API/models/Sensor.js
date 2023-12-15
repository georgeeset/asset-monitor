const mongoose = require ('mongoose');

/// schema for asset model
const Sensor = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please indicate name of asset']
        },
        sensing: {
            type: String,
            required: [true, 'Indicate the unit you are measuring']
        },
        address: {
            type: String,
            required: [true, 'address: /company/location/asset_id/']
        },
        locaitonTag: {
            type: List[String],
            required: [true, 'Should be automatically generated from address']
            
        }
        
    }
)

module.exports = mongoose.model(
    'Sensor', Sensor
);
