import firebaseApp from "@/utils/firebase";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useEffect, useState } from "react";

const storage = getStorage(firebaseApp);

export default function SavedImageDisplay({
  filePath,
  tags,
}: {
  filePath: string;
  tags: string[];
}) {
  const [imageURL, setImageURL] = useState<string>();

  async function fetchImage() {
    const imageRef = ref(storage, filePath);

    getDownloadURL(imageRef).then((url) => {
      setImageURL(url);
      console.log("done");
    });
  }

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <>
      <img src={imageURL} className="p-2 sm:p-4 rounded-3xl" />
      <div className="truncate mr-6 ml-4">
        {tags.map((tag) => (
          <span key={tag}> {tag} • </span>
        ))}
      </div>
    </>
  );
}
