import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ChangeEvent, useRef, useState } from 'react';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<number | null>(null);
  const [transcodedVideo, setTranscodedVideo] = useState<string | null>(null);
  const [transcodedSize, setTranscodedSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      const file = event.target.files[0];
      setVideoFile(URL.createObjectURL(file));
      setVideoName(file.name);
      setVideoSize(file.size);
      setTranscodedVideo(null);
      setTranscodedSize(null);
    }
  };

  const handleTranscode = () => {
    setIsLoading(true);
    // Placeholder for the transcoding process
    // Here, we just simulate the transcoding by reusing the uploaded video
    if (videoFile !== null && ffmpegRef.current !== null)
      transcodeVideo(videoFile, ffmpegRef.current).then((video) => {
        setTranscodedVideo(video.blobUrl);
        setTranscodedSize(video.size);
        setIsLoading(false);
      })
  };

  return (
    <div>
      <h3>Upload and Play Video</h3>
      <input type="file" accept="video/*" onChange={handleFileUpload} />
      {videoFile && (
        <div>
          <h4>Original Video {videoSize && (formatFileSize(videoSize))}</h4>
          <video controls width="400" src={videoFile} />
          <button onClick={handleTranscode} disabled={isLoading || transcodedVideo !== null}>
            {isLoading ? 'Transcoding...' : 'Transcode Video'}
          </button>
        </div>
      )}
      {isLoading && (
        <div style={loadingStyle}>
          <div className="spinner"></div>
          <p>Transcoding video...</p>
        </div>
      )}
      {transcodedVideo && (
        <div>
          <h4>Transcoded Video {transcodedSize && (formatFileSize(transcodedSize))}</h4>
          <video controls width="400" src={transcodedVideo} />
          <button onClick={() => handleDownload(transcodedVideo, videoName?.replace(/\.[^/.]+$/, ''))} style={downloadButtonStyle}>
            Download Video
          </button>
        </div>
      )}
      <style>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #007bff;
          animation: spin 1s ease infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

async function transcodeVideo(video: string, ffmpeg: FFmpeg) {
  const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });
  await ffmpeg.writeFile('input.mp4', await fetchFile(video));
  await ffmpeg.exec(['-i', 'input.mp4', 'output.mp4']);
  const fileData = await ffmpeg.readFile('output.mp4');
  const data = new Uint8Array(fileData as ArrayBuffer);
  const blobUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  return {
    blobUrl,
    size: data.byteLength
  }
}

function handleDownload(blobUrl: string, filename?: string) {
  const link = document.createElement('a');
  link.href = blobUrl;
  if (filename) link.download = `${filename}-transcoded.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '20px',
} as const;

const downloadButtonStyle = {
  marginTop: '10px',
  padding: '10px 20px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
} as const;

export default VideoUpload;
