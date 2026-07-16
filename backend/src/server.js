// src/server.js

require("dotenv").config();


const app = require("./app");
const connectDB = require("./config/database");
const mysqlPool = require("./config/mysql");

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        // MongoDB
        await connectDB();

        // MySQL Test
        const connection = await mysqlPool.getConnection();

        console.log("✅ MySQL Connected");

        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error(err);

        process.exit(1);

    }

}

startServer();