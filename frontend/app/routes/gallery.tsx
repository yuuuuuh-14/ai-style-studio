import React from "react";
import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/gallery";

// Mock Gallery Data
const MOCK_GALLERY = [
  { id: "1", title: "Starry Seoul", style: "Starry Night", result: "https://images.unsplash.com/photo-1510519133417-c848696ec060?auto=format&fit=crop&q=80&w=800", date: "2024-03-18" },
  { id: "2", title: "Cyberpunk Scream", style: "The Scream", result: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800", date: "2024-03-17" },
  { id: "3", title: "Abstract Flow", style: "Udnie", result: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800", date: "2024-03-16" },
  { id: "4", title: "Neon Mosaic", style: "Candy", result: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800", date: "2024-03-15" },
];

export async function loader({ request }: Route.LoaderArgs) {
  // In a real Remix/RRv7 app, this would fetch from GraphQL or DB
  // const data = await fetchGallery();
  return { items: MOCK_GALLERY };
}

export default function Gallery() {
  const { items } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Community <span className="text-indigo-600">Showcase</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Explore the amazing artistic synthesis created by our users using the AI Style Studio engine.
            </p>
          </div>
          <Link to="/style-transfer" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-100">
             Create Your Own Art
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
               <div className="aspect-[4/5] relative overflow-hidden">
                  <img src={item.result} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                     <span className="text-white text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                        Style: {item.style}
                     </span>
                  </div>
               </div>
               <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                     <span>{item.date}</span>
                     <span>#{item.id.padStart(4, '0')}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="py-20 text-center">
             <div className="text-6xl mb-4">🎨</div>
             <p className="text-gray-400 font-medium">No masterpieces yet. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
