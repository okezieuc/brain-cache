export type BrainCacheEntry = {
  imageData: {
    fileBucket: string;
    filePath: string;
  };
  tags: string[];
};

export default BrainCacheEntry;
