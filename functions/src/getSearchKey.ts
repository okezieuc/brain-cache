// This complex HTTP function will be created as an ExpressJS app:
// https://expressjs.com/en/4x/api.html
const ALGOLIA_ID = process.env.ALGOLIA_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY;
import * as algoliasearch from "algoliasearch";
import * as functions from "firebase-functions";

// @ts-ignore
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

import * as express from "express";
import * as admin from "firebase-admin";
import * as cors from "cors";

const app = express();

// We'll enable CORS support to allow the function to be invoked
// from our app client-side.
app.use(cors({ origin: true }));

/**
 * Brief description of the function.
 *
 * @param {type} req - Request
 * @param {type} res - Response
 * @param {type} next - Next
 */
function getFirebaseUser(req: any, res: any, next: any) {
  console.log("Check if request is authorized with Firebase ID token");

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    console.error(
      "No ID token was passed as a Bearer token in the Authorization header.",
      "Authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>"
    );
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log("Found 'Authorization' header");
    idToken = req.headers.authorization.split("Bearer ")[1];
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedIdToken) => {
      console.log("ID Token correctly decoded", decodedIdToken);
      req.user = decodedIdToken;
      next();
    })
    .catch((error) => {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
    });
}

// Then we'll also use a special 'getFirebaseUser' middleware which
// verifies the Authorization header and adds a `user` field to the
// incoming request:
// https://gist.github.com/abeisgoat/832d6f8665454d0cd99ef08c229afb42
app.use(getFirebaseUser);

// Add a route handler to the app to generate the secured key
app.get("/", (req, res) => {
  // @ts-ignore
  const uid = req.user.uid;

  // Create the params object as described in the Algolia documentation:
  // https://www.algolia.com/doc/guides/security/api-keys/#generating-api-keys
  const params = {
    // Ensures that only documents where owner == uid will be readable
    filters: `owner:${uid}`,
    // We also proxy the uid as a unique token for this key.
    userToken: uid,
  };

  // Call the Algolia API to generate a unique key based on our search key
  const key = client.generateSecuredApiKey(ALGOLIA_SEARCH_KEY, params);

  // Then return this key as {key: '...key'}
  res.json({ key });
});

// Finally, pass our ExpressJS app to Cloud Functions as a function
// called 'getSearchKey';
// exports.getSearchKey = functions.https.onRequest(app);
export default functions.https.onRequest(app);

