const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    tid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    num: { type: Number, required: true },
    lat: { type: Number, required: false },
    lon: { type: Number, required: false },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
