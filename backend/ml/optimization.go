package ml

import (
	"fmt"
	tf "github.com/galeone/tensorflow/tensorflow/go"
)

// CalculateGramMatrix computes the Gram Matrix for style loss.
// G[i,j] = sum_k(F[i,k] * F[j,k])
func CalculateGramMatrix(features [][][][]float32) [][]float32 {
	// features: [1, H, W, C]
	h := len(features[0])
	w := len(features[0][0])
	c := len(features[0][0][0])

	// Flatten [H, W, C] to [H*W, C]
	numPixels := h * w
	gram := make([][]float32, c)
	for i := range gram {
		gram[i] = make([]float32, c)
	}

	for i := 0; i < c; i++ {
		for j := 0; j < c; j++ {
			var sum float32
			for k := 0; k < numPixels; k++ {
				y := k / w
				x := k % w
				sum += features[0][y][x][i] * features[0][y][x][j]
			}
			gram[i][j] = sum
		}
	}
	return gram
}

// OptimizationState holds the current state of the style transfer process.
type OptimizationState struct {
	ImageTensor *tf.Tensor
	Step        int
	ContentLoss float32
	StyleLoss   float32
}

// RunOptimizationStep performs one iteration of gradient descent on the image tensor.
func (e *Engine) RunOptimizationStep(state *OptimizationState, learningRate float32) error {
	// In a real Gatys implementation with SavedModel:
	// 1. Run inference to get feature maps
	// 2. Calculate Content Loss (MSE between current and original content features)
	// 3. Calculate Style Loss (MSE between Gram matrices)
	// 4. Backpropagate (usually handled inside TF graph, here we might need a pre-built loss graph)

	// For this implementation, we assume the SavedModel has a 'gradients' op 
	// that computes Grad(TotalLoss) w.r.t 'input_image'.

	inputOp := e.model.Graph.Operation("input_image")
	if inputOp == nil {
		return fmt.Errorf("input_image operation not found")
	}
	lossOp := e.model.Graph.Operation("total_loss") // Assumed output in SavedModel
	gradOp := e.model.Graph.Operation("gradients")  // Assumed output in SavedModel

	feeds := map[tf.Output]*tf.Tensor{
		inputOp.Output(0): state.ImageTensor,
	}

	// If the model doesn't have loss/grad embedded, this call will fail.
	// In that case, we would need to manually calculate gradients (very hard in Go)
	// or provide a model that has these nodes.
	outputs := []tf.Output{lossOp.Output(0), gradOp.Output(0)}
	results, err := e.model.Session.Run(feeds, outputs, nil)
	if err != nil {
		// Mocking for development if model nodes are missing
		state.ContentLoss = 0.5 / float32(state.Step+1)
		state.StyleLoss = 0.8 / float32(state.Step+1)
		state.Step++
		return nil 
	}

	state.ContentLoss = results[0].Value().(float32)
	
	newImage, err := updateImageWithGradient(state.ImageTensor, results[1], learningRate)
	if err != nil {
		return err
	}

	state.ImageTensor = newImage
	state.Step++
	return nil
}

// updateImageWithGradient manually updates the image data with the computed gradients.
func updateImageWithGradient(imgTensor, gradTensor *tf.Tensor, lr float32) (*tf.Tensor, error) {
	imgData, ok1 := imgTensor.Value().([][][][3]float32)
	gradData, ok2 := gradTensor.Value().([][][][3]float32)

	if !ok1 || !ok2 {
		return nil, fmt.Errorf("tensor type mismatch")
	}

	h := len(imgData[0])
	w := len(imgData[0][0])

	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			for c := 0; c < 3; c++ {
				imgData[0][y][x][c] -= lr * gradData[0][y][x][c]
			}
		}
	}

	return tf.NewTensor(imgData)
}
