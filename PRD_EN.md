[🇰🇷 한국어 문서](PRD.md)

# PRD: AI Style Studio (Neural Style Transfer Web App)

## 1. Project Overview

### 1.1 Project Name
**AI Style Studio** — Neural Style Transfer Learning & Experience Platform

### 1.2 Purpose
A high-performance web application designed to help users learn and experience the inner workings of Neural Style Transfer (Gatys method) and Fast Style Transfer through an interactive interface.

### 1.3 Technology Stack

| Category | Technology | Version / Notes |
|----------|------------|-----------------|
| **Backend** | Go (Golang) | 1.21+ |
| **API** | gqlgen (GraphQL) | 0.17+ |
| **Router** | chi | 5.0+ |
| **Frontend** | React Router v7 | TypeScript + Vite |
| **Styling** | Tailwind CSS | v4.0+ |
| **Deploy** | Cloudflare Pages / Docker | - |
| **ML Framework** | TensorFlow | 2.15+ |
| **Base Model** | Inception-v3 | - |
| **Communication** | GraphQL, SSE | Real-time streaming |
| **State Management** | Redux Toolkit | Global UI & Task state |

---

## 2. Functional Requirements

### 2.1 Neural Style Transfer (Gatys Method)
- **High-Resolution Processing**: Users can upload content and style images (max 400px recommended for CPU).
- **Hyperparameter Tuning**: Real-time adjustment of Content/Style weights, iterations, and learning rate.
- **Real-time Monitoring**: Progress tracking via SSE (Server-Sent Events) displaying current step, loss values, and intermediate previews.
- **Comparison View**: Interactive 3-panel comparison (Original, Style, Result) with result download options.

### 2.2 Fast Style Transfer
- **Instant Transformation**: Apply pre-trained artistic styles to uploaded images in under 1 second.
- **Webcam Integration**: Real-time style application to browser webcam feed via a frame-processing pipeline.
- **Style Presets**: A curated list of masterpieces (e.g., Starry Night, The Scream) available as instant filters.

### 2.3 Learning & Visualization
- **CNN Architecture Explorer**: Interactive visualization of the Inception-v3 model structure.
- **Feature Map Heatmaps**: Visual representation of how different layers "see" the image content.
- **Gram Matrix Analysis**: Explanation and visualization of style representation within the network.
- **Loss Optimization Chart**: Real-time graphing of Content, Style, and Total loss during the transformation process.

---

## 3. Implementation Specification

### 3.1 Backend (Go)
- **GraphQL Engine**: Uses `gqlgen` for type-safe schema management and async mutation handling.
- **ML Core**: Integrates TensorFlow Go bindings to execute high-performance linear algebra and deep learning inference.
- **Task Management**: A robust, channel-based system to handle asynchronous transformation tasks and broadcast progress via SSE.

### 3.2 Frontend (React Router v7)
- **Component Architecture**: Built with modern React patterns and Tailwind CSS for a premium, responsive UI.
- **State Flow**: Uses Redux Toolkit to synchronize real-time updates from SSE with the UI state.
- **Data Fetching**: Leverages React Router Loaders/Actions for seamless GraphQL integration.

---

## 4. Performance & Error Handling
- **CPU Optimization**: Target processing time of 5-10 minutes for Gatys method under CPU constraints.
- **Memory Management**: Automatic image resizing and single-task concurrency limits to prevent server crashes.
- **Resilient SSE**: Automatic reconnection strategies for long-running transformation streams.
- **Validation**: Strict server-side validation for image formats and sizes.
