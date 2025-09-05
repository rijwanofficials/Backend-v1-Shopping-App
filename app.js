const cors = require('cors');
require("dotenv").config();
require("./config/db")
const express = require("express");
const morgan = require("morgan");
const { apiRouter } = require("./api/v1/routes");
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3900;

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
})
);

app.use((req, res, next) => {
    setTimeout(() => {
        next();
    }, 2000);
});

app.use(morgan("dev")); // for printing in console

app.use(express.json()); // read the body in json formate

app.use(cookieParser()); // for parsing cookie

app.use("/api/v1", apiRouter);

app.listen(PORT, () => {
    console.log("----- ✅ Server started------");
});