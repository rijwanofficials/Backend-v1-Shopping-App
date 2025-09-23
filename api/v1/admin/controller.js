const sendAdminInfoController = (req, res) => {
    res.status(200).json({
        isSuccess: true,
    })
}

module.exports = { sendAdminInfoController } 