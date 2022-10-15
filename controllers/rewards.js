const mongoose = require('mongoose');
const _ = require('lodash');
const Rewards = require('../models/reward');
const Users = require('../models/user');
const config = require('../setting/config');
const jwt = require('jsonwebtoken');


const getUserByToken = (req) => {
    const token = req.headers.authorization.split(' ')[1]
    return jwt.verify(token, config.secret);
};

const formatUser = (user) => ({
    id: user._id,
    name: user.profile.fullName,
    logo: user.profile.logo,
})

const formatReward = (reward) => ({
    ..._.pick(reward, 'title', 'description', 'amount', 'createdAt'),
    sender: formatUser(reward.senderId),
    recipient: formatUser(reward.recipientId),
    id: reward._id,
})

exports.getRewards = async (req, res, next) => {
    try {
        const { start, pageSize, my } = req.query;
        const {id: currentUserId} = getUserByToken(req);
        const objectId = new mongoose.Types.ObjectId(currentUserId)
        const searchParams = my ? {
            $or:[
                {'senderId': objectId},
                {'recipientId': objectId},
            ]
        } : undefined;
        const rewards = await Rewards.find(searchParams)
            .skip(start)
            .limit(pageSize)
            .populate('senderId')
            .populate('recipientId');

        res.status(200).json(rewards.map(formatReward));
    } catch (err) {
        next(err);
    }
};

exports.createRewards = async (req, res, next) => {
    try {
        const {id: currentUserId} = getUserByToken(req);
        const {
            title,
            description,
            amount,
            // recipient,
            recipientId, // TODO remove
        } = req.body;

        const reward = new Rewards({
            title,
            description,
            amount,
            // recipientId: recipient.id,
            recipientId: recipientId,
            senderId: currentUserId
        });

        const [currentUser, recipientUser] = await Promise.all([
            Users.findById(reward.senderId),
            Users.findById(reward.recipientId),
            await reward.save(),
        ]);

        currentUser.sentAmount += +amount;
        recipientUser.receivedAmount += +amount;

        const [populatedReward] = await Promise.all([
            Rewards.findById(reward._id).populate('senderId').populate('recipientId'),
            currentUser.save(),
            recipientUser.save(),
        ])

        res.status(200).json(formatReward(populatedReward));
    } catch (err) {
        next(err);
    }
}
