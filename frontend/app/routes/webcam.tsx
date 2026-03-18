import React, { useRef, useState, useEffect } from "react";
import { fetchGraphQL } from "../services/api";

export default function WebcamTransfer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [modelId, setModelId] = useState("fast-starry-night");
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const processFrame = async () => {
      if (!isLive || !videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      // 1. Draw video to hidden canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // 2. Extract base64
      const base64Image = canvas.toDataPath("image/jpeg", 0.7);

      try {
        // 3. Send to Backend via GraphQL
        const mutation = `
          mutation ProcessFrame($image: String!, $modelId: String!) {
            processWebcamFrame(image: $image, modelId: $modelId) {
              taskId
              styledImage
            }
          }
        `;
        const result = await fetchGraphQL(mutation, { image: base64Image, modelId });
        setStyledImage(result.processWebcamFrame.styledImage);

        // 4. Update FPS
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastTime = now;
        }
      } catch (err) {
        console.error("Frame processing failed:", err);
      }

      // 5. Loop
      if (isLive) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    if (isLive) {
      processFrame();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isLive, modelId]);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsLive(true);
      }
    } catch (err) {
      alert("웹캠을 활성화할 수 없습니다: " + err);
    }
  };

  const stopCam = () => {
    setIsLive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
       <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Controls & Original */}
          <div className="w-full md:w-1/3 space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Live Console</h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Style Preset</label>
                  <select 
                    value={modelId} 
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  >
                    <option value="fast-starry-night">Starry Night (Fast)</option>
                    <option value="fast-the-scream">The Scream (Fast)</option>
                    <option value="fast-udnie">Udnie (Fast)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                   {!isLive ? (
                     <button onClick={startCam} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        Start Camera
                     </button>
                   ) : (
                     <button onClick={stopCam} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
                        Stop Camera
                     </button>
                   )}
                </div>

                <div className="pt-4 flex justify-between items-center text-xs text-gray-500 font-mono">
                   <span>Status: {isLive ? "🔴 LIVE" : "⚪ STANDBY"}</span>
                   <span>FPS: {fps}</span>
                </div>
             </div>

             <div className="overflow-hidden rounded-2xl aspect-square bg-black border-4 border-white shadow-xl relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">ORIGINAL FEED (HIDDEN)</span>
                </div>
                <canvas ref={canvasRef} width={400} height={400} className="hidden" />
             </div>
          </div>

          {/* Result Area */}
          <div className="flex-1 w-full bg-gray-950 rounded-[2.5rem] p-4 shadow-2xl border-8 border-gray-900 aspect-square flex items-center justify-center relative overflow-hidden group">
             {styledImage ? (
                <img src={`data:image/jpeg;base64,${styledImage}`} className="w-full h-full object-cover rounded-[1.5rem]" alt="Styled Webcam" />
             ) : (
                <div className="text-center space-y-4 animate-pulse">
                   <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto" />
                   <p className="text-gray-500 font-medium">Waiting for webcam stream...</p>
                </div>
             )}
             
             {/* Fancy UI Overlay */}
             <div className="absolute top-8 left-8 flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-indigo-400 font-mono text-xs tracking-widest uppercase">Stylizing AI Engine v1.0</span>
             </div>
             
             <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-mono">
                   Model: {modelId}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
