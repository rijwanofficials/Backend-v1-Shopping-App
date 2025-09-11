const jwt = require("jsonwebtoken");
const { ROLE_OPTIONS } = require("../../models/userSchema");
const validateUsersLoggedInMiddleware = (req, res, next) => {
    try {
        console.log("-------validateUsersLoggedInMiddleware-------");
        const { authorization } = req.cookies;
        if (!authorization) {
            console.log(" 🟠 Token Not Present!!!");
            res.status(400).json({
                isSuccess: true,
                message: "User not logged In!"
            });
            return;
        }

        jwt.verify(authorization, process.env.JWT_SECRET, (err, data) => {
            if (err) {
                console.log("🔴 Invalid token.... may be hacking attempt!");
                res.status(400).json({
                    isSuccess: true,
                    message: "User not logged In!"
                });
                return;
            }
            else {
                console.log("✅ valid User", data);
                req.currentUser = data;
                next();
            }
        })
    }
    catch (err) {
        console.log("<-----Error In validateUsersLoggedInMiddleware------>", err);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
            data: {}
        });
    }

}


const validateIsAdminMiddleware = (req, res, next) => {
    try {
        console.log("-------In Side validateIsAdminMiddleware-------");

        const { role } = req.currentUser;
        if (role == ROLE_OPTIONS.ADMIN) {
            req.currentAdmin = req.currentUser;
            next();
        }
        else {
            res.status(403).json({
                isSuccess: false,
                message: "User is not an admin in!"
            })
        }
    }
    catch (err) {
        console.log("-------Error in Side validateIsAdminMiddleware-------");
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
            data: {}
        });

    }
}

module.exports = { validateUsersLoggedInMiddleware, validateIsAdminMiddleware }