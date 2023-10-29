/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";

import * as storage from "firebase-admin/storage";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as vision from "@google-cloud/vision";

admin.initializeApp();

exports.generateBrainCacheEntry = functions.storage
  .object()
  .onFinalize(async (object) => {
    // Get the file metadata
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType; // File content type.

    if (!(contentType && filePath)) {
      return null;
    }
    // Exit if this is not an image file.
    if (!contentType.startsWith("image/")) {
      logger.error("This is not an image.");
      return null;
    }

    // Log the download URL
    logger.log("Path: ", fileBucket, filePath);

    const bucket = storage.getStorage().bucket(fileBucket);
    const downloadResponse = await bucket.file(filePath).download();
    const imageBuffer = downloadResponse[0];

    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    // Performs label detection on the image file
    const [result] = await client.labelDetection(imageBuffer);
    const labels = result.labelAnnotations;

    const labelsToSave: string[] = [];

    if (labels != null && labels != undefined) {
      labels.forEach((label) => {
        if (label.description != null && label.description != undefined) {
          labelsToSave.push(label.description);
        }
      });
    }

    return admin
      .firestore()
      .collection("brainCacheEntries")
      .doc()
      .create({ imageData: { fileBucket, filePath }, tags: labelsToSave });
  });
