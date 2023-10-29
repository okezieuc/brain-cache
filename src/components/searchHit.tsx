import SavedImageDisplay from "./savedImageDisplay";
import BrainCacheEntry from "@/types/brainCacheEntry";

export default function SearchHit(props: { hit: BrainCacheEntry }) {
  return (
    <div>
      <SavedImageDisplay
        filePath={props.hit.imageData.filePath}
        tags={props.hit.tags}
      />
    </div>
  );
}
