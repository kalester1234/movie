// @ts-nocheck
'use client'

import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

interface VideoPlayerProps {
  url: string
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <ReactPlayer
      url={url}
      width="100%"
      height="100%"
      controls
      light
      playing
    />
  )
}
