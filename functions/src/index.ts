/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

    return admin
      .firestore()
      .collection("brainCacheEntries")
      .doc()
      .create({ imageData: { fileBucket, filePath } });
  });
