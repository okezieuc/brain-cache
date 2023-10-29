"use client";

import { useEffect, useState } from "react";
import firebaseApp from "@/utils/firebase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import SavedImageDisplay from "@/components/savedImageDisplay";
import BrainCacheEntry from "@/types/brainCacheEntry";

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [uploadedImageURL, setUploadedImageURL] = useState<string>();
  const [storedImageData, setStoredImageData] = useState<
    Array<BrainCacheEntry>
  >([]);

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

  return (
    <main>
      Brain Cache
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

        <img src={uploadedImageURL} />

        {storedImageData.map((entry) => (
          <SavedImageDisplay
            filePath={entry.imageData.filePath}
            key={entry.imageData.filePath}
          />
        ))}
      </form>
    </main>
  );
}
