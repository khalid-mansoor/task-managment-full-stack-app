const { BlobServiceClient } = require("@azure/storage-blob");
const { AzureCliCredential } = require("@azure/identity");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!accountName) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME is not defined");
}

if (!containerName) {
    throw new Error("AZURE_STORAGE_CONTAINER_NAME is not defined");
}

const credential = new AzureCliCredential();

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
);

const containerClient =
    blobServiceClient.getContainerClient(containerName);

module.exports = {
    blobServiceClient,
    containerClient,
};