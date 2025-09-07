const { otpModel } = require("../../../models/otpSchema");
const { UserModel } = require("../../../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const usersignupController = async (req, res) => {
    try {
        console.log("<-----Inside usersignupController------>");
        const { email, password } = req.body;

        // const salt = await bcrypt.genSalt(15)
        // // increasing the computation in order of 2^x where x is rounds
        // // higher the number ,more secure it is ,it is more computationally heavy---->>slower
        // console.log("salt--->>", salt);
        // const hashedPassword = await bcrypt.hash(password.toString(), salt);
        // console.log("Hashed Password---->>", hashedPassword);
        // const hashedPassword = await bcrypt.hash(password.toString(), 12);
        const normalizedEmail = email.toLowerCase();
        const newUser = await UserModel.create({
            email: normalizedEmail,
            password,
        });
        res.status(201).json({
            isSuccess: true,
            message: "User Created",
            data: {
                user: {
                    email: newUser.email,
                    id: newUser._id
                }
            }
        });
    } catch (err) {
        console.log("<-----Error In usersignupController------>", err);
        if (err.code === 11000) {
            return res.status(400).json({
                isSuccess: false,
                message: "User Account already exits!"
            });
        }
        else if (err.name === "ValidationError") {
            return res.status(400).json({
                isSuccess: false,
                message: err.message
            });
        }

        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};

const userloginController = async (req, res) => {
    try {
        console.log("<-----Inside userloginController------>");
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();


        const userDoc = await UserModel.findOne({
            email: normalizedEmail,
        }).lean();
        // validation if user exist or not
        if (userDoc == null) {
            res.status(400).json({
                isSuccess: false,
                message: "User Account does not exist! Please Singup first",
            });
            return;
        }
        // i will check if the given password is matching with the password in DB
        const { password: hashedPassword } = userDoc;
        const isCorrect = await bcrypt.compare(password.toString(), hashedPassword);

        if (!isCorrect) {
            res.status(400).json({
                isSuccess: false,
                message: "Incorrect password! Please try again...",
            });
            // have some logic for max attempt or max try as a user can do 
            // when ever there is error attempt a count of try 
            // after the threshold limit is reached! block the activity for some time 
            return;
        }
        const token = jwt.sign(
            {
                email: userDoc.email,
                _id: userDoc._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: 60 * 60 * 24, // should be in seconds
            }
        )
        res.cookie('authorization', token, {
            httpOnly: true,
            sameSite: "None", //production:STRICT            //backend and frontend should on the same domain
            secure: true,   // do you want it only on HTTPs Connection?
            maxAge: 60 * 60 * 24 * 1000    //should be in miliseconds
        })
        res.status(201).json({
            isSuccess: true,
            message: "User Logged In",
            // data: {
            //     user: {
            //         email: userDoc.email,
            //         id: userDoc._id
            //     }
            // }
        });
    } catch (err) {
        console.log("<-----Error In userloginController------>", err);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};

const userlogoutController = (req, res) => {
    try {
        console.log("<-----Inside userlogoutController------>");
        // delet the cookies
        res.cookie('authorization', " ", {
            httpOnly: true,
            sameSite: "None", //production:STRICT            //backend and frontend should on the same domain
            secure: true,   // do you want it only on HTTPs Connection?
            maxAge: 60 * 60 * 24 * 1000    //should be in miliseconds
        })
        res.status(200).json({
            isSuccess: true,
            message: "User Logged Out",
        });


    } catch (err) {
        console.log("<-----Error In userlogoutController------>", err);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }

}

module.exports = { usersignupController, userloginController, userlogoutController };

