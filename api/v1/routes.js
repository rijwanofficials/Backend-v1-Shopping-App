const express = require("express");
const { productRouter } = require("./product/routes");
const { signupRouter } = require("./auth/routes");
const { otpRouter } = require("./otp/routes");
const { usersRouter } = require("./users/routes");
const { cartRouter } = require("./cart/routes");
const apiRouter = express.Router();

apiRouter.use("/products", productRouter);
apiRouter.use("/auth", signupRouter);
apiRouter.use("/otps", otpRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/cart", cartRouter);
module.exports = { apiRouter };
