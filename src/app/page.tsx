"use client";

import { useState } from "react";
import firebaseApp from "@/utils/firebase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(firebaseApp);

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [uploadedImageURL, setUploadedImageURL] = useState<string>();

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
      </form>
    </main>
  );
}
