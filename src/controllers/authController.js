// Import
const bcryptjs = require('bcryptjs');
const User = require('./../models/User');
const mongoose = require('mongoose');
// Functions Signup
exports.getSignup = (req, res) => {
    res.render('auth/signup');
};

exports.postSignup = async (req, res) => {
    // Get Data
    const { name, email, password } = req.body;
    // Validations
    if ((!name, !email, !password)) {
        return res.render('auth/signup', {
            msg: 'All fields required.',
        });
    }
    // Regex
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
        return res.render('auth/signup', {
            msg: 'Please include 6 characters, 1 number, 1 uppercase, 1 lowercase',
        });
    }
    // Create user
    try {
        // Encript password
        // Times of Hashing
        const salt = await bcryptjs.genSalt(10);
        // Passoword Hashed
        const hashed = await bcryptjs.hash(password, salt);

        // Create user
        const createdUser = await User.create({
            name,
            email,
            password: hashed,
            imgUrl: 'https://library.kissclipart.com/20180906/wtq/kissclipart-user-profile-clipart-user-profile-computer-icons-15b5c3086edf7512.png',
        });
        // Create session
        req.session.currentUser = {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            imgUrl: createdUser.imgUrl,
        };
        res.redirect(`/`);
    } catch (error) {
        // Validar email desde servidor
        if (error instanceof mongoose.Error.ValidationError) {
            res.render('auth/signup', {
                msg: 'Use a valid email',
            });
        } else if (error.code === 11000) {
            res.render('auth/signup', {
                msg: 'Email already exist. Try another.',
            });
        }
    }
};
// Functions Login
exports.getLogin = (req, res) => {
    res.render('auth/login');
};

exports.postLogin = async (req, res) => {
    // Get Data
    const { email, password } = req.body;

    // Find User
    try {
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.render('auth/login', {
                msg: 'User not Found',
            });
        }
        // Check Password - return boolean
        const checkedPassword = await bcryptjs.compareSync(
            password,
            findUser.password,
        );

        if (!checkedPassword) {
            return res.render('auth/login', {
                msg: 'Invalid Password',
            });
        }
        req.session.currentUser = {
            _id: findUser._id,
            name: findUser.name,
            email: findUser.email,
            imgUrl: findUser.imgUrl,
        };
        // Redirect
         res.redirect(`/`);
    } catch (e) {
        console.log(e);
    }
};

// Function Logout
exports.postLogout = async (req, res) => {
    res.clearCookie('session-token');
    req.session.destroy(err =>
        err ? console.log(e) : res.redirect('/auth/login'),
    );
};
