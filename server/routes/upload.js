const express = require("express");
const multer = require("multer");
const { handleUpload } = require("../controllers/uploadController");

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("pdf"), handleUpload);

module.exports = router;
