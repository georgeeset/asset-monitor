const mongoose = require ('mongoose');

const userAccess = mongoose.schema(
    {
        sessionID: {
            type: String,
            required: false
        },

        passwordRecoveryToken: {
            type: String,
            required: false,
        },

        emailVerified: {
            type: Boolean,
            default: true,
            required: false
        },

        token: {
            type: String,
            required: false
        },

        level: {
            type: Number,
            default: 1,
        }

    }
);


/// schema for asset model
const User = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required']
        },
        email: {
            type: String,
            required: [true, 'Email is required']
        },
        password: {
            type: String,
            required: [true, 'must have a password']
        },
        company: {
            type: String,
            required: [true, 'connects to company'] 
        },

        access: userAccess,
        
    }
)

module.exports = mongoose.model(
    'User', User
);
