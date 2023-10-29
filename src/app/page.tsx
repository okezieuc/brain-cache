'use client'

import { useState } from "react"

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File>();

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
      </form>
    </main>
  )
}

