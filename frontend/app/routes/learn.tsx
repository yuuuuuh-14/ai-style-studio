import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/learn";
import { fetchGraphQL } from "../services/api";

// Mock data for Inception-v3 structure
const INCEPTION_LAYERS = [
  { id: "input", name: "Input Image", type: "Input", connections: ["conv1"] },
  { id: "conv1", name: "Conv2d_1", type: "Conv", connections: ["pool1"] },
  { id: "pool1", name: "MaxPool_1", type: "Pool", connections: ["conv2"] },
  { id: "conv2", name: "Conv2d_2", type: "Conv", connections: ["mixed_0"] },
  { id: "mixed_0", name: "Mixed_0 (Inception A) ", type: "Block", connections: ["mixed_1"] },
  { id: "mixed_1", name: "Mixed_1 (Inception B)", type: "Block", connections: ["mixed_2"] },
  { id: "mixed_2", name: "Mixed_2 (Inception C)", type: "Block", connections: ["output"] },
  { id: "output", name: "Final Logits", type: "Output", connections: [] },
];

export async function loader({ params }: Route.LoaderArgs) {
  return {
    layers: INCEPTION_LAYERS,
    description: "Inception-v3 is a deep convolutional neural network architecture that introduced the Inception module, allowing for more efficient computation and deeper networks."
  };
}

export default function Learn() {
  const { layers, description } = useLoaderData<typeof loader>();
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [featureMaps, setFeatureMaps] = useState<string[]>([]);
  const [gramMatrix, setGramMatrix] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLayer) {
      loadLayerData(selectedLayer);
    }
  }, [selectedLayer]);

  const loadLayerData = async (layerId: string) => {
    setLoading(true);
    try {
      const query = `
        query GetLayerData($taskId: ID!, $layer: String!) {
          getFeatureMaps(taskId: $taskId, layerName: $layer)
          getGramMatrix(taskId: $taskId, layerName: $layer)
        }
      `;
      // Using a placeholder task ID for demonstration
      const result = await fetchGraphQL(query, { taskId: "demo-task", layer: layerId });
      setFeatureMaps(result.getFeatureMaps);
      setGramMatrix(result.getGramMatrix);
    } catch (err) {
      console.error("Failed to load layer data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
          Exploring <span className="text-indigo-600 italic underline decoration-indigo-300">Inception-v3</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Layer DAG Visualization */}
        <div className="lg:col-span-8 bg-gray-50 rounded-[3rem] p-8 border border-gray-100 shadow-inner relative overflow-hidden min-h-[600px]">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-8 py-10">
            {layers.map((layer, idx) => (
              <React.Fragment key={layer.id}>
                <div 
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`
                    group cursor-pointer relative px-6 py-4 rounded-2xl border-2 transition-all duration-500
                    ${selectedLayer === layer.id 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110" 
                      : "bg-white border-white hover:border-indigo-300 text-gray-700 shadow-md hover:shadow-lg"}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">{layer.type}</span>
                    <span className="font-bold">{layer.name}</span>
                  </div>
                  
                  {/* Decorative line to next layer */}
                  {idx < layers.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 h-8 w-px bg-indigo-200 group-hover:bg-indigo-400 transition-colors">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-200 group-hover:bg-indigo-400"></div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Sidebar: Layer Details / Feature Maps */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 min-h-[400px]">
             {selectedLayer ? (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-indigo-600 inline-block mb-4">
                      {layers.find(l => l.id === selectedLayer)?.name}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Detailed analysis of feature activations in this specific layer. 
                      Neural networks learn to detect patterns: early layers find edges, while deeper layers detect complex shapes.
                    </p>
                  </div>

                  <div className="space-y-3">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feature Map Preview</p>
                     <div className="grid grid-cols-3 gap-2">
                        {loading ? (
                          [1, 2, 3].map(i => <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-xl" />)
                        ) : (
                          featureMaps.map((fm, idx) => (
                            <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-300 transition-colors cursor-zoom-in group">
                               <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300 font-mono text-[8px] group-hover:text-indigo-600 group-hover:bg-indigo-100">
                                 CH_{idx}
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>

                  {gramMatrix.length > 0 && (
                    <div className="space-y-3">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gram Matrix (Style Signature)</p>
                       <div className="grid grid-cols-10 gap-0.5 border border-gray-100 rounded-lg overflow-hidden">
                          {gramMatrix[0]?.map((v, i) => (
                            <div key={i} className="aspect-square bg-indigo-500" style={{ opacity: Math.min(1, v) }}></div>
                          ))}
                       </div>
                    </div>
                  )}

                  <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2">
                    <span>Export Activations</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </button>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl">🧠</span>
                  </div>
                  <p className="text-gray-400 font-medium">Select a layer from the graph to see its activations in detail.</p>
               </div>
             )}
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] shadow-xl text-white">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                 <span className="mr-2">💡</span> Tech Insights
              </h3>
              <p className="text-indigo-100 text-sm opacity-90 leading-relaxed">
                 The <strong>mixed_0</strong> layer (Inception A) is crucial for style transfer as it captures intermediate texture patterns that define the "artistic style".
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
