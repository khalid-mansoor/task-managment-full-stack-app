const express = require("express");
const { containerClient } = require("../config/azureblob");

const router = express.Router();

router.get("/test", async (req, res) => {
    try {
        const blobs = [];

        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push(blob.name);
        }

        res.json({
            success: true,
            blobs,
        });
    } catch (error) {
        console.error("Azure Blob Storage Error:", error);

        res.status(500).json({
            success: false,
            message: "Could not connect to Azure Blob Storage",
            error: error.message,
        });
    }
});

module.exports = router;