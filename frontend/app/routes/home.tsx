import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Style Studio | Neural Art Engine" },
    { name: "description", content: "Empowering creativity with Neural Style Transfer." },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-6 border border-indigo-100 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span>Next-Gen Neural Engine Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            Transcend Your <span className="text-indigo-600">Creativity</span> <br />
            with Neural AI
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            AI Style Studio brings high-performance Neural Style Transfer to your browser. 
            Experience Gatys optimization and Fast Style models in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/style-transfer" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center group">
              Get Started Free
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link to="/webcam" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              Try Live Webcam
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard 
          icon="✨"
          title="Gatys Style Transfer"
          desc="Fine-grained optimization using Inception-v3 features for high-quality artistic synthesis."
          to="/style-transfer"
        />
        <FeatureCard 
          icon="🎥"
          title="Real-time Webcam"
          desc="Instant style transfer on your live camera feed using high-speed deep learning models."
          to="/webcam"
        />
        <FeatureCard 
          icon="⚡"
          title="GraphQL + SSE"
          desc="Real-time progress streaming and efficient API communication for a seamless experience."
          to="/style-transfer"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, to }: { icon: string, title: string, desc: string, to: string }) {
  return (
    <Link to={to} className="group p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500">
       <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{icon}</div>
       <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
       <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </Link>
  );
}
