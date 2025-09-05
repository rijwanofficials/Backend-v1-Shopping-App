const jwt = require("jsonwebtoken")
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
module.exports = { validateUsersLoggedInMiddleware }