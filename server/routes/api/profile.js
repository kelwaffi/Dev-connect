const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/user');
const { check, validationResult } = require('express-validator');
const { findOneAndUpdate } = require('../../models/user');


//@route Get api/profile/me
//@desc Get current user profile
//@access Private
router.get('/me', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user }).populate('user', "name");
        if (!profile) {
            return res.status(400).json({ msg: "there is no profile for this user" });
        }
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server error")
    }
});

//@route POST api/profile
//@desc create or update a user profile
//@access Private
router.post('/', [
    auth,
    [
        check('status', 'status is required').not().isEmpty(),
        check('skills', 'skills is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //destructure the request
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,

        youtube,
        twitter,
        facebook,
        linkedin,
        instagram,
        // spread the rest of the fields we don't need to check
        ...others
    } = req.body;

    const profileFields = {};

    profileFields.user = req.user;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(', ').map((skill) => skill.trim())
    }
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;

    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;

    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({ user: req.user });
        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate({ user: req.user }, { $set: profileFields }, { new: true })
            res.json(profile);
        }
        //create profile if not found
        profile = new Profile(profileFields);
        profile.save();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//@route Get api/profile
//@desc Get all prfiles
//@access Public

router.get('/all/profiles', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name']);
        res.json(profiles)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "server error" })
    }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {

    try {
        const profiles = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name']);
        if (!profiles) return res.status(400).json({ msg: "there is no profile" })
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        if (error.kind == "ObjectId") {
            return res.status(400).json({ msg: "profile not found" })
        }
    }
});

// @route    DELETE api/profile
// @desc     Delete profile, user and post
// @access   Private
router.delete('/delete', auth, async (req, res) => {

    try {
        //@todo - remove users posts


        //Remove profile
        await Profile.findOneAndRemove({ user: req.user });

        //remove user
        console.log(req.user.id)
        await User.findOneAndRemove({ _id: req.user });
        res.json({ msg: "user deleted" })


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: error.message });
    }
});

// @route   PUT api/profile/experience
// @desc   add profile experience
// @access  Private
router.put('/experience', auth, async (req, res) => {

    //add experience t the dtabase 
    try {

    } catch (error) {
        console.error(error.message);
    }

})


module.exports = router;