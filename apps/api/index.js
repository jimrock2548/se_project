const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express API!");
});

app.listen(5000, () => console.log("API running on port 5000"));
