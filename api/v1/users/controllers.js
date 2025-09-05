const sendsUserInfoControllers = (req, res) => {
    try {
        console.log("<-----Inside sendsUserInfoControllers------>");
        const user = req.currentUser;

        res.status(200).json({
            isSuccess: true,
            message: "User is loged in!",
            data: {
                email: user.email,
            }
        })
    } catch (err) {
        console.log("----Error inside sendsUserInfoControllers--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch products",
            error: err.message
        });
    }

}

module.exports = { sendsUserInfoControllers }