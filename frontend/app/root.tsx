import React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
} from "react-router";

import type { Route } from "./+types/root";
import { Provider } from "react-redux";
import { store } from "./store";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white text-gray-900 font-sans antialiased min-h-screen flex flex-col">
        <Provider store={store}>
          <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <NavLink to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Style Studio
              </NavLink>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <NavLink to="/style-transfer" className={({ isActive }) => isActive ? "text-indigo-600 font-semibold" : "text-gray-500 hover:text-indigo-600 transition-colors"}>
                  Style Transfer
                </NavLink>
                <NavLink to="/webcam" className={({ isActive }) => isActive ? "text-indigo-600 font-semibold" : "text-gray-500 hover:text-indigo-600 transition-colors"}>
                  Live Webcam
                </NavLink>
                <div className="h-4 w-px bg-gray-200" />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
                  Get Started
                </button>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "We encountered an unexpected error while processing your request. Our neural engine is recalibrating.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = status === 404 ? "Page Not Found" : "Server Error";
    details = status === 404 
      ? "The coordinates you provided do not exist in the AI Style Studio." 
      : (error.statusText || details);
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
          <span className="text-5xl">⚠️</span>
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
          {status} <span className="text-red-600 block text-2xl mt-1 uppercase tracking-widest">{message}</span>
        </h1>
        
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          {details}
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200 flex items-center justify-center space-x-2"
          >
            <span>Attempt Recalibration</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          
          <NavLink 
            to="/" 
            className="block w-full py-4 text-gray-400 hover:text-gray-900 font-bold transition-colors"
          >
            Return to Command Center
          </NavLink>
        </div>

        <div className="mt-12 pt-12 border-t border-gray-100 italic text-xs text-gray-300">
          Error Signature: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
