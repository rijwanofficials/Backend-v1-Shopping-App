const cors = require('cors');
require("dotenv").config();
require("./config/db")
const express = require("express");
const morgan = require("morgan");
const { apiRouter } = require("./api/v1/routes");
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3900;


const allowedOrigins = ["http://localhost:5174", process.env.FRONTEND_URL];
const app = express();
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

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