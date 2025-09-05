const usersignupValidator = (req, res, next) => {
    try {
        console.log("<----Inside usersignupValidator------>");
        const { email, password, otp } = req.body;
        if (!email || !otp || !password) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email password and OTP are required"
            });
        }

        // Email validator
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid email format"
            });
        }

        // Password validator
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(req.body.password)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            });
        }
        next();
    }
    catch (err) {
        console.log("<-----Error In usersignupValidator------>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error"
        });
    }
};
const userloginValidator = (req, res, next) => {
    try {
        console.log("<----Inside userloginValidator------>");
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email and password are required"
            });
        }
        // // Email validator
        // const emailRegex = /^\S+@\S+\.\S+$/;
        // if (!emailRegex.test(req.body.email)) {
        //     return res.status(400).json({
        //         isSuccess: false,
        //         message: "Invalid email format"
        //     });
        // }

        // // Password validator
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // if (!passwordRegex.test(req.body.password)) {
        //     return res.status(400).json({
        //         isSuccess: false,
        //         message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
        //     });
        // }
        next();
    }
    catch (err) {
        console.log("<-----Error In userloginValidator------>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { usersignupValidator, userloginValidator };
