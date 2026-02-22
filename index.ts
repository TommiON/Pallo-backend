import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const start = async () => {
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    })
};

start()