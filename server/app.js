const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const uploadRoutes = require("./routes/upload");
const chatRoutes = require("./routes/chat");
const pdfParserRoutes = require("./routes/pdfParser");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "Server is running"
  });
})
app.use("/api", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", pdfParserRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});