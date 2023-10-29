"use client";

import { useEffect, useRef, useState } from "react";
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

const searchClient = algoliasearch(
  "I63EDMMDFM",
  "2270787f30ce5ceea1e90dc066fbcfd6"
);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [uploadedImageURL, setUploadedImageURL] = useState<string>();
  const [storedImageData, setStoredImageData] = useState<
    Array<BrainCacheEntry>
  >([]);
  const [searchMode, setSearchMode] = useState(false);

  const uploadImage = () => {
    const randomFileName: string = uuidv4();
    const newImageRef = ref(storage, randomFileName);

    if (selectedFile != undefined) {
      uploadBytes(newImageRef, selectedFile).then(() => {
        console.log("Uploaded a blob or file!");
        getDownloadURL(newImageRef).then((url) => {
          setUploadedImageURL(url);
        });
      });
    }
  };

  async function loadSavedImages() {
    const querySnapshot = await getDocs(collection(db, "brainCacheEntries"));

    // this stores data on file names and buckets of fetched images
    const storedImageDataAccumulator: BrainCacheEntry[] = [];

    querySnapshot.forEach((doc) => {
      storedImageDataAccumulator.push(doc.data() as BrainCacheEntry);
    });

    setStoredImageData(storedImageDataAccumulator);
  }

  // load a list of all images that have been uploaded
  useEffect(() => {
    loadSavedImages();
  }, []);

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

  return (
    <main>
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
        <InstantSearch indexName="brain_cache" searchClient={searchClient}>
          <div className="right-panel">
            <SearchBox />
            <Hits hitComponent={SearchHit} />
          </div>
        </InstantSearch>
      </div>
      <div className={!searchMode ? "block" : "hidden"}>
        <div>
          <input type="text" onChange={(e) => setSearchQuery(e.target.value)} />
          <button onClick={filterImages}>Search</button>
          <button onClick={loadSavedImages}>Reset Filters</button>

          {storedImageData.map((entry) => (
            <SavedImageDisplay
              filePath={entry.imageData.filePath}
              key={entry.imageData.filePath}
              tags={entry.tags}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
