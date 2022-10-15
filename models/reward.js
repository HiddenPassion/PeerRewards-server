const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rules = {
    type: String,
    required: true,
    trim : true
};

const RewardSchema = new Schema({
    title: rules,
    description: rules,
    amount: {
        type: Number,
        required: true,
    },
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Reward', RewardSchema);
