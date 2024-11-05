const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');

module.exports.registerUser = (req, res) => {
    const { username, email, password } = req.body;

    if (!email.includes('@')) {
        return res.status(400).send({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    }

    const newUser = new User({
        username,
        email,
        password: bcrypt.hashSync(password, 10)
    });

    newUser.save()
        .then(result => res.status(201).send({ message: 'Registered Successfully' }))
        .catch(err => {
            if (err.code === 11000) {
                return res.status(400).send({ message: 'Username or email already exists' });
            }
            return res.status(500).send({ error: 'Error registering user', details: err });
        });
};


module.exports.loginUser = (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        return res.status(400).send({ message: 'Username or email must be provided' });
    }

    const query = username ? { username } : { email };

    User.findOne(query)
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: 'User not found' });
            }

            const isPasswordCorrect = bcrypt.compareSync(password, result.password);
            if (isPasswordCorrect) {
                return res.status(200).send({ access: auth.createAccessToken(result) });
            } else {
                return res.status(401).send({ message: 'Incorrect password' });
            }
        })
        .catch(err => res.status(500).send({ error: 'Error logging in user', details: err }));
};


module.exports.getProfile = (req, res) => {
    const userId = req.user.id;

    return User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }
            user.password = undefined;
            return res.status(200).send({ user });
        })
        .catch(err => res.status(500).send({ error: 'Failed to fetch user profile', details: err }));
};
