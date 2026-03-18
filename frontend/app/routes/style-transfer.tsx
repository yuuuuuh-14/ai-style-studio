import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { fetchGraphQL, subscribeToTask } from "../services/api";
import { setError, setProcessing } from "../store";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

import { SSEService } from "../services/sse";

export default function StyleTransfer() {
  const dispatch = useDispatch();
  const { currentTask, isProcessing, error } = useSelector((state: RootState) => state.styleTransfer);
  
  const [contentImage, setContentImage] = useState<File | null>(null);
  const [styleId, setStyleId] = useState("inception-v3");
  const [contentWeight, setContentWeight] = useState(1.0);
  const [styleWeight, setStyleWeight] = useState(1e4);
  const [iterations, setIterations] = useState(200);

  // New state for SSE
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [sseError, setSseError] = useState<string | null>(null); // Renamed to avoid conflict with Redux 'error'

  // History for chart
  const [lossHistory, setLossHistory] = useState<{ step: number, content: number, style: number }[]>([]);

  useEffect(() => {
    if (taskId) {
      const sse = new SSEService(`http://localhost:8080/events/${taskId}`, {
        onMessage: (data) => {
          setProgress(data);
          // Dispatch Redux actions based on SSE data
          dispatch(setProcessing(data.status === "processing"));
          if (data.status === "completed") {
            dispatch(setError(null));
            setSseError(null);
          } else if (data.status === "error") {
             dispatch(setError(data.statusMessage || "Style transfer failed."));
             setSseError(data.statusMessage || "Style transfer failed.");
          }
          // Update currentTask in Redux if needed, or let the SSE data drive the UI directly
          // For now, assuming currentTask is updated by another mechanism or we'll use 'progress' directly
        },
        onError: (err) => {
          setSseError("Connection to style transfer service lost. Attempting to reconnect...");
          dispatch(setError("Connection to style transfer service lost. Attempting to reconnect..."));
        }
      });

      sse.connect();
      return () => sse.disconnect();
    }
  }, [taskId, dispatch]); // Added dispatch to dependencies

  useEffect(() => {
    // Use 'progress' from SSE for loss history if available, otherwise fallback to currentTask
    const dataPoint = progress || currentTask;

    if (dataPoint && isProcessing) {
      setLossHistory(prev => [
        ...prev, 
        { step: dataPoint.step, content: dataPoint.contentLoss, style: dataPoint.styleLoss }
      ].slice(-50)); // Keep last 50 points
    } else if (!isProcessing) {
      // Reset history when starting new task
      // setLossHistory([]); 
    }
  }, [currentTask?.step, isProcessing]);

  const handleUpload = async () => {
    if (!contentImage) return;
    
    setLossHistory([]);
    dispatch(setProcessing(true));
    dispatch(setError(null));

    try {
      const mutation = `
        mutation StartTransfer($input: StyleTransferInput!) {
          startGatysTransfer(input: $input) {
            taskId
            status
          }
        }
      `;
      const result = await fetchGraphQL(mutation, {
        input: {
          contentImagePath: "uploads/test.jpg",
          styleImageId: styleId,
          contentWeight,
          styleWeight,
          iterations
        }
      });

      const taskId = result.startGatysTransfer.taskId;
      subscribeToTask(taskId);
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  const saveToGallery = async () => {
    if (!currentTask?.taskId) return;
    try {
      const mutation = `
        mutation Save($id: ID!) {
          saveToGallery(taskId: $id) {
            id
          }
        }
      `;
      await fetchGraphQL(mutation, { id: currentTask.taskId });
      alert("추출된 결과물이 갤러리에 저장되었습니다!");
    } catch (err) {
      alert("갤러리 저장 실패: " + err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Configuration */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center space-x-3 mb-2">
             <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl">⚙️</div>
             <h2 className="text-2xl font-black text-gray-900">Control Panel</h2>
          </div>
          
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 capitalize tracking-widest">Base Content</label>
            <div className="border-2 border-dashed border-gray-100 rounded-[1.5rem] bg-gray-50/50 p-6 text-center hover:border-indigo-200 transition-all cursor-pointer group"
                 onClick={() => document.getElementById('file-upload')?.click()}>
              <div className="mb-2 text-2xl group-hover:scale-125 transition-transform duration-300">📸</div>
              <p className="text-gray-500 font-medium text-sm">{contentImage ? contentImage.name : "Drop Content Image Here"}</p>
              <input id="file-upload" type="file" className="hidden" onChange={(e) => setContentImage(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Style Importance</label>
                  <span className="text-sm font-mono font-black text-indigo-600">{(styleWeight / 1e4).toFixed(1)}x</span>
                </div>
                <input type="range" min="1000" max="100000" step="1000" value={styleWeight} 
                       onChange={(e) => setStyleWeight(Number(e.target.value))}
                       className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Iteration Loop</label>
                  <span className="text-sm font-mono font-black text-indigo-600">{iterations}</span>
                </div>
                <input type="range" min="50" max="1000" step="50" value={iterations} 
                       onChange={(e) => setIterations(Number(e.target.value))}
                       className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
             </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={isProcessing || !contentImage}
            className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black transform active:scale-95 hover:bg-indigo-700 disabled:bg-gray-200 transition-all shadow-xl shadow-indigo-100 overflow-hidden relative group"
          >
            <span className="relative z-10">{isProcessing ? "GENERATING ART..." : "START NEURAL ENGINE"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
          
          {error && <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
        </div>

        {/* Right: Preview & Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-900 rounded-[3rem] overflow-hidden aspect-video relative flex items-center justify-center border-[12px] border-gray-900 shadow-2xl group transition-all duration-700">
             {/* Progress Overlay */}
             <div className="absolute top-6 left-6 z-20 flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[10px] font-mono text-white tracking-widest uppercase">
                  {isProcessing ? `Optimizing: ${currentTask?.step}/${currentTask?.maxSteps}` : 'System Ready'}
                </span>
             </div>

            {currentTask?.previewUrl ? (
               <img src={currentTask.previewUrl} className="w-full h-full object-contain" alt="Preview" />
            ) : (
               <div className="text-center">
                  <div className="mb-4 text-6xl opacity-30">⚡</div>
                  <p className="text-gray-500 font-bold tracking-tight uppercase">Upload to start synthesis</p>
               </div>
            )}
            
            {!isProcessing && currentTask?.previewUrl && (
               <button 
                 onClick={saveToGallery}
                 className="absolute bottom-8 right-8 px-6 py-3 bg-white text-gray-900 rounded-2xl font-black shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
               >
                 <span className="mr-2">💾</span> Save Masterpiece
               </button>
            )}
          </div>

          {/* Real-time Loss Analytics */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Real-time Loss Diagnostics</h3>
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      <span className="text-[10px] font-bold text-gray-400">CONTENT</span>
                   </div>
                   <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-[10px] font-bold text-gray-400">STYLE</span>
                   </div>
                </div>
             </div>
             
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lossHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="step" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                      labelClassName="font-black text-gray-900"
                    />
                    <Line type="monotone" dataKey="content" stroke="#6366f1" strokeWidth={3} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="style" stroke="#a855f7" strokeWidth={3} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
