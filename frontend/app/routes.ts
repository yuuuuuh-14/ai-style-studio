import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("style-transfer", "routes/style-transfer.tsx"),
  route("webcam", "routes/webcam.tsx"),
  route("learn", "routes/learn.tsx"),
  route("gallery", "routes/gallery.tsx"),
] satisfies RouteConfig;
