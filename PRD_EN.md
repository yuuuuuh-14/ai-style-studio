[🇰🇷 한국어 문서](PRD.md)

# PRD: Neural Style Transfer Web Application

## 1. Project Overview

### 1.1 Project Name
**AI Style Studio** — Neural Style Transfer Learning & Experience Platform

### 1.2 Purpose
As the 3rd AI project milestone, build a web application to learn and experience the principles of Neural Style Transfer.

### 1.3 Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Backend** | Flask | 3+ |
| **API** | Ariadne GraphQL | 0.23+ |
| **Frontend** | Angular + Webpack | Angular 17 (fixed) / Webpack 5+ |
| **ML Framework** | Tensorflow | 2.15+ (CPU, SavedModel format) |
| **Image Processing** | Pillow (PIL) | 11+ |
| **State Management** | Angular Signals | Angular built-in |
| **Styling** | Angular Materials | Angular built-in |
| **Communication** | GraphQL, SSE | - |
| **Authentication** | OAuth2 | - |
| **Build/Deploy** | Docker Compose (Backend), CI/CD (F+B), Netlify (Frontend) | - |

### 1.4 Runtime Constraints
- **CPU-only environment**
- No GPU usage
- Personal laptop environment
- Webcam available
- Maximum image size: **400px** (CPU performance optimization)
- Python 3.8, Node.js 18

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Angular + Webpack)        │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Style    │ │ Real-time│ │ Learning        │  │
│  │ Transfer │ │ Webcam   │ │ Dashboard       │  │
│  │ UI       │ │ UI       │ │ (Theory/Viz)    │  │
│  └────┬─────┘ └────┬─────┘ └────────┬────────┘  │
│       │            │                │            │
│       ▼            ▼                ▼            │
│  ┌─────────────────────────────────────────────┐ │
│  │      Angular Services (GraphQL Client)      │ │
│  │              + SSE Listener                 │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼────────────────────────────┘
                      │
               GraphQL / SSE
                      │
┌─────────────────────┼────────────────────────────┐
│                     ▼        Backend (Flask)     │
│  ┌─────────────────────────────────────────────┐ │
│  │             API Router Layer                │ │
│  │  /style-transfer  /webcam  /gallery  /learn │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                            │
│  ┌──────────┐ ┌─────┴─────┐ ┌────────────────┐  │
│  │ Gatys    │ │ Fast      │ │ Gallery /      │  │
│  │ Style    │ │ Style     │ │ History        │  │
│  │ Transfer │ │ Transfer  │ │ Manager        │  │
│  │ (VGG19)  │ │ (OpenCV)  │ │                │  │
│  └──────────┘ └───────────┘ └────────────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │        Tensorflow (CPU) / Pillow (PIL)      │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │    File Storage (uploads/ results/ models/) │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 3. Functional Requirements

### 3.1 Basic Style Transfer (Gatys Method)

| Item | Detail |
|------|--------|
| **Description** | User uploads content/style images; generates style-transferred result via VGG19-based optimization |
| **Priority** | P0 (Required) |

#### Feature Details

**FR-1.1: Image Upload**
- Upload content image and style image separately
- Supported formats: PNG, WEBP
- Auto-resize on upload (400px)
- Support both drag-and-drop and file selection
- Display image preview

**FR-1.2: Hyperparameter Adjustment**
- Content Weight (α): Slider, range 0.1 ~ 100, default 1
- Style Weight (β): Slider, range 1e4 ~ 1e8, log scale, default 1e6
- Iterations (Steps): Slider, range 50 ~ 500, default 300
- Learning Rate: Slider, range 0.001 ~ 0.1, default 0.01

**FR-1.3: Transform Execution & Progress**
- Click "Start Transform" button to send request to backend
- Real-time progress display via SSE (Server-Sent Events)
  - Current Step / Total Steps
  - Current Loss values (Content Loss, Style Loss, Total Loss)
  - Progress bar
- Intermediate result image preview sent every 50 steps
- Cancel function during transformation

**FR-1.4: Result Display & Download**
- Original / Style / Result 3-panel comparison view
- Slider for original ↔ result overlay comparison
- Result image download (PNG/WEBP selection)
- Auto-save to gallery

---

### 3.2 Fast Style Transfer (Real-time)

| Item | Detail |
|------|--------|
| **Description** | Apply style in real-time to images or webcam feed using pre-trained SavedModel (Tensorflow) |
| **Priority** | P0 (Required) |

#### Feature Details

**FR-2.1: Image Fast Style Transfer**
- Apply pre-trained style instantly to uploaded image
- One-click selection from style preset list
  - Starry Night
  - The Scream
  - Mosaic
  - Candy
  - Udnie
  - Rain Princess
- Application time: < 1 second (CPU)

**FR-2.2: Webcam Real-time Style Transfer**
- Capture webcam stream in browser (getUserMedia API)
- Frame transmission via GraphQL, status via SSE → transform → return pipeline
- Frame size: 320×240 (CPU optimization)
- Target FPS: 5~10 (CPU environment)
- Side-by-side display: original / transformed
- Keyboard shortcuts for style switching (keys 1~6)
- Snapshot capture and save function

**FR-2.3: Style Model Management**
- Pre-trained model list query API
- Model file location: `backend/models/` directory
- Model metadata: name, description, example image, file size

---

### 3.3 Learning Dashboard

| Item | Detail |
|------|--------|
| **Description** | Interactive page for visually learning CNN structure, feature maps, Gram Matrix, etc. |
| **Priority** | P1 (Recommended) |

#### Feature Details

**FR-3.1: CNN Structure Visualization**
- Display CNN layer structure as interactive diagram
- Click each layer for role description popup
- Highlight Content Layer (conv4_2) and Style Layers (conv1_1~conv5_1)

**FR-3.2: Feature Map Visualization**
- Upload image to display feature maps of each CNN layer as heatmaps
- API: `POST /api/learn/feature-maps`
  - Input: Image file
  - Output: Per-layer feature map images (conv1_1, conv2_1, conv3_1, conv4_1, conv4_2, conv5_1)
- Switch between layers via dropdown

**FR-3.3: Gram Matrix Visualization**
- Display Gram Matrix of selected layer as heatmap
- Comparison view of content and style image Gram Matrices
- API: `POST /api/learn/gram-matrix`

**FR-3.4: Loss Change Graph**
- Display Content/Style/Total Loss changes during style transfer as real-time chart
- Line chart using charting library
- Per-step log data download (CSV)

---

### 3.4 Gallery

| Item | Detail |
|------|--------|
| **Description** | Gallery system for saving, viewing, and sharing generated results |
| **Priority** | P1 (Recommended) |

#### Feature Details

**FR-4.1: Result Saving**
- Auto-save all style transfer results
- Saved info: content image, style image, result image, hyperparameters, creation date, student name (optional)

**FR-4.2: Gallery View**
- Grid layout (responsive 2~4 columns)
- Sort: newest / popular
- Filter: by style type / by date
- Click image for detail modal (original, style, result, parameters)

**FR-4.3: Download/Delete**
- Individual result download (original resolution)
- Delete own results

---

### 3.5 Preset Style Images

| Item | Detail |
|------|--------|
| **Description** | Provide representative masterpiece style images for immediate practice |
| **Priority** | P0 (Required) |

#### Feature Details

**FR-5.1: Default Styles**
- Van Gogh — The Starry Night
- Munch — The Scream
- Kandinsky — Composition VII
- Hokusai — The Great Wave off Kanagawa
- Picasso — Weeping Woman
- Monet — Water Lilies

**FR-5.2: Custom Style Upload**
- Users can upload their own style images

---

## 4. API Specification

### 4.1 Ariadne GraphQL

```
Base URL: http://localhost:8000/graphql
```

```graphql
# backend/schema.graphql

type Query {
  getModels: [StyleModel!]!
  getGallery(page: Int, limit: Int): [GalleryItem!]!
  getVggInfo: VGGInfo!
}

type Mutation {
  # Start Gatys transfer -> return taskId immediately
  startGatysTransfer(input: GatysInput!): TaskResponse!
  
  # Process single webcam frame (HTTP POST equivalent)
  processWebcamFrame(image: String!, modelId: String!): StyledFrame!
}
```

### 4.2 SSE API

```
Endpoint: http://localhost:8000/sse/webcam
```

#### Webcam Real-time Style Transfer Protocol

**Client → Server (GraphQL):**
```json
{
  "image": "<base64_encoded_jpeg>",
  "model_id": "starry_night"
}
```

**Server → Client:**
- Wait for SSE channel

### 4.3 Key Request/Response Schemas

#### POST /api/style-transfer/gatys

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content_image` | File | Yes | Content image |
| `style_image` | File | Yes | Style image |
| `content_weight` | float | No | Content weight (default: 1) |
| `style_weight` | float | No | Style weight (default: 1e6) |
| `num_steps` | int | No | Number of iterations (default: 300) |
| `max_size` | int | No | Maximum image size (default: 400) |
| `learning_rate` | float | No | Learning rate (default: 0.01) |
| `student_name` | string | No | Student name |

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "processing",
  "message": "Style transfer has started."
}
```

#### GET /api/style-transfer/gatys/{task_id}/status (SSE)

**Event Stream:**
```
event: progress
data: {"step": 50, "total_steps": 300, "content_loss": 12345.6, "style_loss": 0.89, "total_loss": 12346.5, "preview_url": "/api/previews/task_id_step50.jpg"}

event: progress
data: {"step": 100, "total_steps": 300, ...}

event: complete
data: {"result_url": "/api/results/task_id.png", "gallery_id": 42, "elapsed_seconds": 320.5}

event: error
data: {"message": "Transform failed due to insufficient memory."}
```

#### POST /api/style-transfer/fast

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Input image |
| `model_name` | string | Yes | Model name (e.g., starry_night) |

**Response:**
```json
{
  "result_url": "/api/results/fast_uuid.jpg",
  "processing_time_ms": 245,
  "model_used": "starry_night"
}
```

---

## 5. Directory Structure

```
neural-style-transfer/
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                     # Flask & GraphQL app entry point
│   ├── config.py                   # Configuration (paths, defaults, etc.)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py               # Router integration
│   │   ├── style_transfer.py       # Style transfer endpoints
│   │   ├── webcam.py               # SSE webcam endpoints
│   │   ├── gallery.py              # Gallery endpoints
│   │   ├── learn.py                # Learning visualization endpoints
│   │   └── presets.py              # Preset style endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gatys_transfer.py       # Gatys style transfer logic
│   │   ├── fast_transfer.py        # Fast Style Transfer logic
│   │   ├── feature_extractor.py    # CNN feature extraction
│   │   ├── image_processor.py      # Image pre/post-processing utilities
│   │   └── task_manager.py         # Async task management
│   │
│   ├── models/                     # Pre-trained model files (SavedModel)
│   │   ├── starry_night/
│   │   ├── the_scream/
│   │   ├── mosaic/
│   │   ├── candy/
│   │   ├── udnie/
│   │   └── rain_princess/
│   │
│   ├── presets/                    # Preset style images
│   │   ├── starry_night.png
│   │   ├── the_scream.png
│   │   ├── composition_vii.png
│   │   ├── great_wave.png
│   │   ├── weeping_woman.png
│   │   └── water_lilies.png
│   │
│   └── storage/                    # Runtime file storage
│       ├── uploads/
│       ├── results/
│       ├── previews/
│       └── gallery.json
│
│   frontend/
│       ├── src/
│           ├── app/
│           │   ├── app.config.ts            # Application config (Router, Animations, ProvideHttpClient)
│           │   ├── app.routes.ts            # Routing configuration
│           │   ├── app.component.ts         # Root component
│           │   │
│           │   ├── core/                    # Singleton services & interceptors
│           │   │   ├── services/
│           │   │   │   ├── api.service.ts
│           │   │   │   └── sse.service.ts   # SSE connection management
│           │   │   └── models/              # TS interface definitions
│           │   │
│           │   ├── features/                # Feature modules (components + services)
│           │   │   ├── style-transfer/
│           │   │   │   ├── style-transfer.component.ts
│           │   │   │   ├── components/      # Sub UI components
│           │   │   │   │   ├── image-uploader/
│           │   │   │   │   └── parameter-panel/
│           │   │   │   └── style.store.ts   # Signal-based feature state management
│           │   │   │
│           │   │   ├── webcam/
│           │   │   │   ├── webcam.component.ts
│           │   │   │   └── webcam.service.ts
│           │   │   │
│           │   │   └── gallery/
│           │   │       ├── gallery.component.ts
│           │   │       └── gallery.store.ts
│           │   │
│           │   └── shared/                  # Common UI components (Material Wrapper)
│           │       └── components/
│           │           ├── loading-spinner/
│           │           └── image-compare/
│           │
│           ├── assets/                      # Static files
│           └── styles.scss                  # Global styles (Angular Material)
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
└── docs/
    ├── PRD.md                              # This document
    ├── setup-guide.md                      # Setup guide
    └── student-guide.md                    # Student practice guide
```

---

## 6. Page UI Wireframes

### 6.1 Style Transfer Page (`/style-transfer`)

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 AI Style Studio     [Style Transfer] [Live] [Learn] [Gallery] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                  │
│  │                 │    │                 │                  │
│  │  Content Image  │    │  Style Image    │                  │
│  │  (Drag & Drop)  │    │  (Drag & Drop)  │                  │
│  │                 │    │                 │                  │
│  └─────────────────┘    └─────────────────┘                  │
│                                                              │
│  Preset Styles:                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │Star │ │Scream│ │Comp7│ │Wave │ │Weep │ │Lily │           │
│  │Night│ │     │ │     │ │     │ │Woman│ │     │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│                                                              │
│  ── Parameter Settings ────────────────────────               │
│  Content Weight (α)   ──●──────────────  1.0                 │
│  Style Weight (β)     ────────●────────  1e6                 │
│  Iterations (Steps)   ─────────●───────  300                 │
│  Image Size           [200] [300] [●400]                     │
│                                                              │
│                    [ 🎨 Start Transform ]                     │
│                                                              │
│  ── Progress ──────────────────────────────                   │
│  Step: 150 / 300  ████████████░░░░░░░░░░ 50%                 │
│  Content Loss: 12,345  Style Loss: 0.89  Total: 12,346       │
│                                                              │
│  ── Results ──────────────────────────────                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │   Original   │ │    Style     │ │    Result    │          │
│  │              │ │              │ │              │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                              │
│  [📥 Download PNG]  [📥 Download JPG]  [🖼️ Save to Gallery]  │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Webcam Real-time Transfer Page (`/webcam`)

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 AI Style Studio     [Style Transfer] [●Live] [Learn] [Gallery]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │                      │  │                      │          │
│  │                      │  │                      │          │
│  │  📷 Original Webcam  │  │  🎨 Styled Output    │          │
│  │                      │  │                      │          │
│  │                      │  │                      │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│  FPS: 8.2  |  Processing: 122ms  |  Resolution: 320×240     │
│                                                              │
│  Style Selection (Keys 1~6):                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │●Star│ │Scream│ │Mosaic│ │Candy│ │Udnie│ │Rain │           │
│  │ (1) │ │ (2) │ │ (3) │ │ (4) │ │ (5) │ │ (6) │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│                                                              │
│  [📸 Snapshot]  [⏸️ Pause]  [⏹️ Stop]                        │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Learning Dashboard (`/learn`)

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 AI Style Studio     [Style Transfer] [Live] [●Learn] [Gallery]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [VGG19 Structure]  [Feature Maps]  [Gram Matrix]  [Loss Graph]│
│                                                              │
│  ── VGG19 Structure Visualization ──                          │
│  ┌────┐   ┌────┐   ┌────┐   ┌────┐   ┌────┐                 │
│  │conv│──▸│conv│──▸│conv│──▸│conv│──▸│conv│                 │
│  │1_1 │   │2_1 │   │3_1 │   │4_1 │   │5_1 │                 │
│  │    │   │    │   │    │   │    │   │    │                 │
│  │Style│  │Style│  │Style│  │Style│  │Style│                 │
│  │Layer│  │Layer│  │Layer│  │  +  │  │Layer│                 │
│  │    │   │    │   │    │   │Conv │   │    │                 │
│  │    │   │    │   │    │   │4_2  │   │    │                 │
│  │    │   │    │   │    │   │Cont.│   │    │                 │
│  └────┘   └────┘   └────┘   └────┘   └────┘                 │
│                                                              │
│  ── Feature Map Visualization ──                              │
│  Upload Image: [Choose File]                                  │
│  Select Layer: [conv1_1 ▼]                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Channel 1│ │ Channel 2│ │ Channel 3│ │ Channel 4│        │
│  │ (edge)   │ │(texture) │ │ (color)  │ │ (shape)  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  ── Loss Change Graph ──                                      │
│  Loss │  ╲                                                   │
│       │    ╲                                                 │
│       │      ╲____                                           │
│       │           ╲___________                               │
│       └──────────────────────── Step                         │
│       ── Content Loss ── Style Loss ── Total Loss            │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Backend Core Implementation Specs

### 7.1 Gatys Style Transfer Service

```python
# backend/services/gatys_transfer.py - core structure
import tensorflow as tf

class GatysStyleTransfer:
    def __init__(self):
        # Load VGG19 model (ImageNet weights)
        vgg = tf.keras.applications.VGG19(include_top=False, weights='imagenet')
        vgg.trainable = False
        
        # Intermediate layer configuration
        self.content_layers = ['block4_conv2']
        self.style_layers = ['block1_conv1', 'block2_conv1', 'block3_conv1', 'block4_conv1', 'block5_conv1']
        self.model = self.get_sub_model(vgg)

    def get_sub_model(self, vgg):
        outputs = [vgg.get_layer(name).output for name in (self.style_layers + self.content_layers)]
        return tf.keras.Model([vgg.input], outputs)

    # Gram Matrix computation (TF version)
    def gram_matrix(self, input_tensor):
        result = tf.linalg.einsum('bijc,bijd->bcd', input_tensor, input_tensor)
        input_shape = tf.shape(input_tensor)
        num_locations = tf.cast(input_shape[1]*input_shape[2], tf.float32)
        return result / num_locations
```

### 7.2 Fast Style Transfer Service

```python
# backend/services/fast_transfer.py - core structure
import tensorflow as tf
import numpy as np
from PIL import Image
import io

class FastStyleTransfer:
    def __init__(self):
        # CPU optimization settings
        tf.config.set_visible_devices([], 'GPU')
        self.models = {}  # Per-style model caching

    def load_model(self, model_path):
        # Load SavedModel format
        return tf.saved_model.load(model_path)

    def transform(self, pil_image: Image, model_id: str):
        # 1. Pillow: Preprocessing (400px limit & normalization)
        img = pil_image.convert('RGB')
        img = img.resize((400, 400))
        img_array = np.array(img).astype(np.float32)
        img_array = img_array[np.newaxis, ...] / 255.0  # [1, 400, 400, 3]

        # 2. TensorFlow: Model inference
        if model_id not in self.models:
            self.models[model_id] = self.load_model(f'models/{model_id}')
        
        stylized_tensors = self.models[model_id](tf.constant(img_array))
        
        # 3. Pillow: Postprocessing (back to image object)
        output = stylized_tensors[0].numpy()
        output = np.uint8(np.clip(output * 255, 0, 255))
        return Image.fromarray(output)
```

### 7.3 Async Task Manager

```python
# backend/services/task_manager.py

class TaskManager:
    """Manages long-running Gatys-style transform tasks asynchronously"""

    tasks: dict[str, TaskInfo] = {}

    async def create_task(self, params) -> str:
        """Create new transform task, return task_id"""
        ...

    async def cancel_task(self, task_id: str):
        """Cancel an in-progress task"""
        ...

    def get_status(self, task_id: str) -> TaskStatus:
        """Query task status"""
        ...
```

### 7.4 SSE Webcam Handler

```python
# backend/api/sse.py

from flask import Blueprint, Response, request, jsonify
from services.fast_transfer import FastStyleTransfer
from services.image_processor import decode_base64_to_pil, encode_pil_to_base64
import time
import json

webcam_bp = Blueprint('webcam', __name__)

# Global model instance (TensorFlow model load)
fast_transformer = FastStyleTransfer()

@webcam_bp.route('/stream', methods=['POST'])
def receive_frame():
    """
    Endpoint to receive frames from client, process them,
    and prepare results for SSE delivery or immediate return
    """
    data = request.json
    frame_data = data.get('data')
    model_id = data.get('model', 'starry_night')
    
    # 1. Load and preprocess image using Pillow
    pil_img = decode_base64_to_pil(frame_data)
    
    # 2. TensorFlow model inference
    start_time = time.time()
    styled_pil = fast_transformer.transform(pil_img, model_id)
    elapsed = (time.time() - start_time) * 1000
    
    # 3. Return result (Base64)
    result_base64 = encode_pil_to_base64(styled_pil)
    
    return jsonify({
        "status": "success",
        "data": result_base64,
        "processing_time_ms": round(elapsed, 1)
    })

@webcam_bp.route('/events')
def sse_events():
    """SSE channel for Gatys transform progress, etc."""
    def event_stream():
        # Fetch progress status from TaskManager and yield
        while True:
            # Example data
            # yield f"data: {json.dumps({'progress': 50})}\n\n"
            time.sleep(1)
            
    return Response(event_stream(), mimetype="text/event-stream")
```

---

## 8. Frontend Core Implementation Specs

### 8.1 State Management (Signal Store Service)
```typescript
// src/app/core/services/sse.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService {
  constructor(private zone: NgZone) {}

  /**
   * Subscribe to real-time events from the server.
   * @param url SSE endpoint (e.g., /api/stream-status)
   */
  observe(url: string): Observable<any> {
    return new Observable(observer => {
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        // Run inside NgZone for Angular Change Detection
        this.zone.run(() => {
          observer.next(JSON.parse(event.data));
        });
      };

      eventSource.onerror = (error) => {
        this.zone.run(() => observer.error(error));
      };

      return () => eventSource.close(); // Close connection on unsubscribe
    });
  }
}

// src/app/features/style-transfer/style.store.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StyleStore {
  // State definitions
  readonly contentImage = signal<File | null>(null);
  readonly styleImage = signal<File | null>(null);
  readonly isProcessing = signal<boolean>(false);
  
  readonly params = signal({
    contentWeight: 1,
    styleWeight: 1e6,
    numSteps: 300,
    maxSize: 400
  });

  // Derived state (Computed)
  readonly canStart = computed(() => 
    this.contentImage() !== null && this.styleImage() !== null && !this.isProcessing()
  );

  // Actions
  updateParams(newParams: Partial<{contentWeight: number, styleWeight: number, numSteps: number}>) {
    this.params.update(p => ({ ...p, ...newParams }));
  }

  reset() {
    this.contentImage.set(null);
    this.isProcessing.set(false);
  }
}
```

### 8.2 Routing Structure (Standalone)
```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'style-transfer', pathMatch: 'full' },
  { 
    path: 'style-transfer', 
    loadComponent: () => import('./features/style-transfer/style-transfer.component').then(m => m.StyleTransferComponent) 
  },
  { 
    path: 'webcam', 
    loadComponent: () => import('./features/webcam/webcam.component').then(m => m.WebcamComponent) 
  },
  { 
    path: 'learn', 
    loadComponent: () => import('./features/learn/learn.component').then(m => m.LearnComponent) 
  },
  { 
    path: 'gallery', 
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent) 
  }
];
```

### 8.3 Component Example (Using Signals)
```typescript
// src/app/features/style-transfer/style-transfer.component.ts
import { Component, inject } from '@angular/core';
import { StyleStore } from './style.store';
import { MatSliderModule } from '@angular/material/slider'; // Angular Material

@Component({
  standalone: true,
  imports: [MatSliderModule],
  template: `
    <div class="container">
      @if (store.isProcessing()) {
        <app-loading-spinner />
      }

      <mat-slider min="0.1" max="100">
        <input matSliderThumb [value]="store.params().contentWeight" 
               (valueChange)="onWeightChange($event)">
      </mat-slider>
      
      <button [disabled]="!store.canStart()" (click)="start()">Start Transform</button>
    </div>
  `
})
export class StyleTransferComponent {
  protected readonly store = inject(StyleStore);

  onWeightChange(value: number) {
    this.store.updateParams({ contentWeight: value });
  }

  start() {
    // API call logic
  }
}
```

---

## 9. Performance Requirements

| Item | Target | Notes |
|------|--------|-------|
| Gatys transform (400px, 300 steps) | 5~10 min | CPU only |
| Gatys transform (200px, 200 steps) | 1~3 min | Quick test |
| Fast Style Transfer (single image) | < 1 sec | Pillow DNN |
| Webcam real-time transform FPS | 5~10 FPS | 320×240 resolution |
| SSE latency | < 200ms | Frame round-trip |
| Frontend initial load | < 3 sec | Webpack bundle optimization |
| Image upload max size | 10MB | Server-side resize |
| Concurrent Gatys tasks | 1 | CPU resource limitation |

---

## 10. Pre-trained Model Preparation

Models for Fast Style Transfer will be researched from multiple sources and presented to the user for selection.

---

## 13. Error Handling Strategy

| Scenario | Handling |
|----------|----------|
| Unsupported image format | 400 error + supported format info message |
| Image size exceeds 10MB | 400 error + auto-resize suggestion |
| Out of memory during transform | SSE error event + image size reduction guide |
| SSE connection lost | Auto-reconnect (max 3 attempts, exponential backoff) |
| Model file missing | 500 error + download_models.sh execution guide |
| Concurrent transform request | 429 error + "retry after previous completion" message |
| Webcam permission denied | Permission request guide displayed on frontend |
