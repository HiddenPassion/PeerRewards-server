const mongoose = require('mongoose');
const bcrypt =  require('bcrypt-nodejs');

const Schema  = mongoose.Schema;

const rules = {
  type: String,
  required: true,
  trim : true
};

function randomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

getRandomLogo = () => {
  const sex = Math.round(Math.random()) > 0.5 ? 'men' : 'women';
  const position = randomValue(1, 99);
  return `https://randomuser.me/api/portraits/${sex}/${position}.jpg`
}

const UserSchema = new Schema({
  email: {
    ...rules,
    lowercase: true,
    unique: true,
  },
  password: rules,
  profile: {
    firstName: rules,
    lastName: rules,
    fullName: rules,
    logo: {
      ...rules,
      default: getRandomLogo,
      required: false,
    },
  },
  receivedAmount: {
    type: Number,
    default: 0,
  },
  sentAmount: {
    type: Number,
    default: 0,
  }
});

UserSchema.pre('save', function(next) {
  const user = this;
  const saltRounds = 5;

   bcrypt.genSalt(saltRounds, function(err, salt) {
     if (err) return next(err);
     console.log(salt)

     bcrypt.hash(user.password, salt, null, function(err, hash) {
       if (err) return next(err);
       user.password = hash;
       next();
    });
   });
});

UserSchema.methods.comparePassword = function(incomingPassword, cb) {
  console.log(incomingPassword, this.password);
  bcrypt.compare(incomingPassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);
