"use client";

import { useContext, useEffect, useRef, useState } from "react";
import firebaseApp from "@/utils/firebase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import SavedImageDisplay from "@/components/savedImageDisplay";
import BrainCacheEntry from "@/types/brainCacheEntry";

import algoliasearch from "algoliasearch/lite";
import { Hits, InstantSearch, SearchBox } from "react-instantsearch";
import SearchHit from "@/components/searchHit";
import UserContext from "@/utils/userContext";
import { redirect } from "next/navigation";
import { getAuth } from "firebase/auth";
import { SearchClient } from "algoliasearch";
import SearchResultListWrapper from "@/components/searchResultListWrapper";

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [uploadedImageURL, setUploadedImageURL] = useState<string>();
  const [storedImageData, setStoredImageData] = useState<
    Array<BrainCacheEntry>
  >([]);
  const [searchMode, setSearchMode] = useState(false);
  const [algoliaSearchToken, setAlgoliaSearchToken] = useState<string | null>(
    null
  );
  const [searchClient, setSearchClient] = useState<SearchClient | null>(null);

  const { user, loading } = useContext(UserContext);

  const uploadImage = () => {
    const randomFileName: string = uuidv4();
    const newImageRef = ref(storage, randomFileName);

    if (selectedFile != undefined) {
      uploadBytes(newImageRef, selectedFile, {
        customMetadata: {
          owner: user?.uid!,
        },
      }).then(() => {
        console.log("Uploaded a blob or file!");
        getDownloadURL(newImageRef).then((url) => {
          setUploadedImageURL(url);
        });
      });
    }
  };

  async function loadSavedImages() {
    const q = await query(
      collection(db, "brainCacheEntries"),

      // we're using this behind an if(user) statement
      where("owner", "==", user!.uid)
    );

    const querySnapshot = await getDocs(q);

    // this stores data on file names and buckets of fetched images
    const storedImageDataAccumulator: BrainCacheEntry[] = [];

    querySnapshot.forEach((doc) => {
      storedImageDataAccumulator.push(doc.data() as BrainCacheEntry);
    });

    setStoredImageData(storedImageDataAccumulator);
  }

  // load a list of all images that have been uploaded
  useEffect(() => {
    if (user) {
      console.log(user);
      loadSavedImages();
    }
  }, [user]);

  useEffect(() => {
    console.log("here");
    if (auth.currentUser != null) {
      auth.currentUser
        .getIdToken()
        .then(function (token) {
          // The token is then passed to our getSearchKey Cloud Function
          // change below to an actual environment variable
          return fetch(
            "https://us-central1-" +
              "brain-cache-3f0b6" +
              ".cloudfunctions.net/getSearchKey/",
            {
              headers: { Authorization: "Bearer " + token },
            }
          );
        })
        .then(async function (response) {
          // The Fetch API returns a stream, which we convert into a JSON object.
          const token = await response.json();
          console.log(token.key);
          setAlgoliaSearchToken(token.key);
          const newSearchClient = algoliasearch("I63EDMMDFM", token.key);
          // @ts-ignore
          setSearchClient(newSearchClient);
          return token;
        });
    }
  }, [auth.currentUser]);

  async function filterImages() {
    const q = await query(
      collection(db, "brainCacheEntries"),
      where("tags", "array-contains", searchQuery.toLowerCase())
    );

    const querySnapshot = await getDocs(q);

    // this stores data on file names and buckets of filtered images
    const storedImageDataAccumulator: BrainCacheEntry[] = [];

    querySnapshot.forEach((doc) => {
      storedImageDataAccumulator.push(doc.data() as BrainCacheEntry);
    });

    setStoredImageData(storedImageDataAccumulator);
  }

  // redirect users who are not logged in to dashboard
  useEffect(() => {
    console.log(loading, user);
    if (loading == false && user == null) {
      redirect("/auth");
    }
  }, [loading]);

  return (
    <main className="p-12 sm:p-24">
      Brain Cache
      <div>
        <form>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) setSelectedFile(e.target.files[0]);
            }}
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              uploadImage();
            }}
          >
            Upload image
          </button>
        </form>
      </div>
      <div>
        <button onClick={() => setSearchMode(!searchMode)}>
          Activate/Deactivate Search
        </button>
      </div>
      <div className={searchMode ? "block" : "hidden"}>
        {searchClient ? (
          <>
            <InstantSearch indexName="brain_cache" searchClient={searchClient}>
              <div className="right-panel">
                <SearchBox />
                <Hits hitComponent={SearchHit} />
              </div>
            </InstantSearch>
          </>
        ) : null}
      </div>
      <div className={!searchMode ? "block" : "hidden"}>
        <div>
          <input type="text" onChange={(e) => setSearchQuery(e.target.value)} />
          <button onClick={filterImages}>Search</button>
          <button onClick={loadSavedImages}>Reset Filters</button>

          <SearchResultListWrapper>
            {storedImageData.map((entry) => (
              <div>
                <SavedImageDisplay
                  filePath={entry.imageData.filePath}
                  key={entry.imageData.filePath}
                  tags={entry.tags}
                />
              </div>
            ))}
          </SearchResultListWrapper>
        </div>
      </div>
    </main>
  );
}
