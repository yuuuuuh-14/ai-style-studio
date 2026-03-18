import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Provider } from "react-redux";
import { createSlice, configureStore } from "@reduxjs/toolkit";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const initialState = {
  value: 0
};
const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    }
  }
});
const { increment, decrement } = counterSlice.actions;
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "bg-gray-50 text-gray-900 font-sans antialiased min-h-screen",
      children: [/* @__PURE__ */ jsx(Provider, {
        store,
        children
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function meta({}) {
  return [{
    title: "AI Style Studio"
  }, {
    name: "description",
    content: "Welcome to AI Style Studio!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-[80vh] flex items-center justify-center p-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-blue-100/50",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white text-center",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-4xl md:text-5xl font-black mb-4 tracking-tight",
          children: "AI Style Studio"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-blue-100 text-lg md:text-xl font-medium opacity-90",
          children: "Learn Neural Style Transfer Principles Interactive Platform"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "p-10 text-center",
        children: /* @__PURE__ */ jsxs("div", {
          className: "space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100",
            children: [/* @__PURE__ */ jsxs("span", {
              className: "relative flex h-2 w-2",
              children: [/* @__PURE__ */ jsx("span", {
                className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              }), /* @__PURE__ */ jsx("span", {
                className: "relative inline-flex rounded-full h-2 w-2 bg-green-500"
              })]
            }), /* @__PURE__ */ jsx("span", {
              children: "Full Stack Migration Complete"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-4 py-6",
            children: [{
              label: "Language",
              value: "TypeScript",
              color: "blue"
            }, {
              label: "Styling",
              value: "Tailwind CSS",
              color: "indigo"
            }, {
              label: "Backend",
              value: "Go (Golang)",
              color: "cyan"
            }].map((tech) => /* @__PURE__ */ jsxs("div", {
              className: "p-4 rounded-2xl bg-gray-50 border border-gray-100",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1",
                children: tech.label
              }), /* @__PURE__ */ jsx("p", {
                className: "text-lg font-bold text-gray-800",
                children: tech.value
              })]
            }, tech.label))
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-gray-500 leading-relaxed",
            children: ["성공적으로 ", /* @__PURE__ */ jsx("strong", {
              children: "Remix + TypeScript + Tailwind CSS"
            }), " 환경으로 전환되었습니다.", /* @__PURE__ */ jsx("br", {}), "이제 백엔드 ", /* @__PURE__ */ jsx("strong", {
              children: "Go (TF Native)"
            }), " 개발을 계속해볼까요?"]
          })]
        })
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-C4vAeVvd.js", "imports": ["/assets/chunk-EPOLDU6W-CP3WDhNt.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-Di2HjYcg.js", "imports": ["/assets/chunk-EPOLDU6W-CP3WDhNt.js"], "css": ["/assets/root-CmLvz6oc.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-CzUk8iG5.js", "imports": ["/assets/chunk-EPOLDU6W-CP3WDhNt.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-e211d57f.js", "version": "e211d57f", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
