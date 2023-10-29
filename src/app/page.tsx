'use client'

import { useState } from "react"
import firebaseApp from "@/utils/firebase";
import { getStorage, ref, uploadBytes } from "firebase/storage";

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(firebaseApp);


export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File>();


  const uploadImage = () => {
    const newImageRef = ref(storage, 'file.jpg');

    if (selectedFile != undefined) {
      uploadBytes(newImageRef, selectedFile).then((snapshot) => {
        console.log('Uploaded a blob or file!');
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
            if (e.target.files) setSelectedFile(e.target.files[0])
          }}
        />

        <button onClick={(e) => {
          e.preventDefault()
          uploadImage()
        }}>Upload image</button>
      </form>
    </main>
  )
}

