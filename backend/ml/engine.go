package ml

import (
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"log"
	"os"
	"path/filepath"
	"time"

	tf "github.com/galeone/tensorflow/tensorflow/go"
	"github.com/yuuuuuh-14/ai-style-studio/backend/graph/model"
)

// Engine represents the Style Transfer engine using TensorFlow.
type Engine struct {
	model *tf.SavedModel
	input tf.Output
	loss  tf.Output
	grad  tf.Output
}

// NewEngine loads a pre-trained SavedModel and initializes the engine.
func NewEngine(modelPath string) (*Engine, error) {
	model, err := tf.LoadSavedModel(modelPath, []string{"serve"}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to load SavedModel: %v", err)
	}

	// Note: You must identify the input and output node names from your SavedModel.
	// Common names for style transfer models: "Placeholder", "total_loss", "gradients"
	// For this simulation, we'll try to find them by name.
	inputOp := model.Graph.Operation("input_image")
	if inputOp == nil {
		log.Printf("Warning: 'input_image' node not found in graph")
	}

	return &Engine{
		model: model,
		input: inputOp.Output(0), // Assuming the input operation has one output
	}, nil
}

// ExecuteTask coordinates the optimization loop for a specific style transfer task.
func (e *Engine) ExecuteTask(taskId string, input model.StyleTransferInput) {
	ch, ok := DefaultTaskManager.GetTaskChannel(taskId)
	if !ok {
		return
	}

	defer func() {
		if r := recover(); r != nil {
			log.Printf("Recovered from panic in ExecuteTask (task %s): %v", taskId, r)
			ch <- TaskProgress{
				Status:        "error",
				StatusMessage: fmt.Sprintf("Internal ML error occurred: %v", r),
			}
		}
	}()

	iterations := int(input.Iterations)
	lr := 10.0 // Default learning rate for Gatys-style Adam/L-BFGS (manual SGD here)

	// 1. Initial status
	ch <- TaskProgress{Step: 0, MaxSteps: iterations, Status: "loading"}

	// 2. Load Content Image
	contentImg, err := loadAndResizeImage(input.ContentImagePath, 400)
	if err != nil {
		ch <- TaskProgress{Status: "error", StatusMessage: fmt.Sprintf("failed to load content image: %v", err)}
		return
	}

	contentTensor, err := CreateImageTensor(contentImg, 400, 400)
	if err != nil {
		ch <- TaskProgress{Status: "error", StatusMessage: fmt.Sprintf("failed to create content tensor: %v", err)}
		return
	}

	// 3. Optimization Loop (Simplified SGD on Image)
	state := &OptimizationState{
		Step:        0,
		ContentLoss: 0,
		StyleLoss:   0,
		ImageTensor: contentTensor, // Initialize with content image
	}

	for i := 0; i < iterations; i++ {
		err := e.RunOptimizationStep(state, float32(lr))
		if err != nil {
			ch <- TaskProgress{Status: "error", StatusMessage: err.Error()}
			log.Printf("Optimization failed for task %s: %v", taskId, err)
			return
		}

		progress := TaskProgress{
			Step:        state.Step,
			MaxSteps:    iterations,
			ContentLoss: state.ContentLoss,
			StyleLoss:   state.StyleLoss,
			Status:      "processing",
		}

		// Preview logic (every 50 steps)
		if i%50 == 0 || i == iterations-1 {
			resultPath := fmt.Sprintf("storage/results/%s_step%d.jpg", taskId, i)
			err := saveTensorAsImage(state.ImageTensor, resultPath)
			if err == nil {
				progress.PreviewURL = "/" + resultPath
			}
		}

		DefaultTaskManager.UpdateProgress(taskId, progress)
		ch <- progress
		time.Sleep(10 * time.Millisecond)
	}

	// 3. Completion
	ch <- TaskProgress{
		Step:   iterations,
		Status: "completed",
	}
	log.Printf("Style transfer task completed: %s", taskId)
}

func loadAndResizeImage(path string, size int) (image.Image, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return nil, err
	}

	// Simple resize (cropping/scaling could be added here)
	// For now, we assume the user provides manageable sizes or we just return it.
	return img, nil
}

func saveTensorAsImage(t *tf.Tensor, path string) error {
	// Ensure directory exists
	dir := filepath.Dir(path)
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.MkdirAll(dir, 0755)
	}

	// Assuming tensor is [1, H, W, 3] float32
	// Need to convert to Go's image.Image format
	// The Value() method returns an interface{}, which needs to be type asserted.
	// For a [1, H, W, 3] tensor, it might be [][][][3]float32 or a flattened slice.
	// Let's assume it's [][][][3]float32 for direct access.
	val, ok := t.Value().([][][][3]float32)
	if !ok {
		return fmt.Errorf("failed to assert tensor value to [][][][3]float32")
	}
	if len(val) == 0 || len(val[0]) == 0 || len(val[0][0]) == 0 {
		return fmt.Errorf("empty or malformed tensor for image saving")
	}

	h := len(val[0])
	w := len(val[0][0])

	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			c := val[0][y][x]
			img.Set(x, y, color.RGBA{
				R: uint8(clamp(c[0])),
				G: uint8(clamp(c[1])),
				B: uint8(clamp(c[2])),
				A: 255,
			})
		}
	}

	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()

	return jpeg.Encode(out, img, nil)
}

func clamp(v float32) float32 {
	if v < 0 { return 0 }
	if v > 255 { return 255 }
	return v
}

// ImageToTensor converts a Go image.Image to a TensorFlow tensor (Float32, [1, H, W, 3]).
func ImageToTensor(img image.Image, height, width int) (*tf.Tensor, error) {
	// This function is now an alias to CreateImageTensor for consistency.
	return CreateImageTensor(img, height, width)
}

// CreateImageTensor converts Go image.Image to a TensorFlow tensor [1, H, W, 3].
func CreateImageTensor(img image.Image, h, w int) (*tf.Tensor, error) {
	data := make([][][][3]float32, 1)
	data[0] = make([][][3]float32, h)
	
	bounds := img.Bounds()
	for y := 0; y < h; y++ {
		data[0][y] = make([][3]float32, w)
		for x := 0; x < w; x++ {
			var r, g, b uint32
			// Check if the pixel is within the image bounds
			if x < bounds.Dx() && y < bounds.Dy() {
				r, g, b, _ = img.At(bounds.Min.X+x, bounds.Min.Y+y).RGBA()
			}
			// Scaled to 0-255 for Inception-v3 (or similar models expecting 0-255)
			data[0][y][x][0] = float32(r >> 8)
			data[0][y][x][1] = float32(g >> 8)
			data[0][y][x][2] = float32(b >> 8)
		}
	}

	return tf.NewTensor(data)
}
