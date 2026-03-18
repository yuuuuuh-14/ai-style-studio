package ml

import (
	"fmt"
	"sync"

	tf "github.com/galeone/tensorflow/tensorflow/go"
)

// ModelCache stores loaded SavedModels to avoid redundant disk I/O.
type ModelCache struct {
	models map[string]*tf.SavedModel
	mu     sync.RWMutex
}

var DefaultModelCache = &ModelCache{
	models: make(map[string]*tf.SavedModel),
}

// GetModel retrieves a model from cache or loads it if not present.
func (c *ModelCache) GetModel(modelPath string) (*tf.SavedModel, error) {
	c.mu.RLock()
	m, ok := c.models[modelPath]
	c.mu.RUnlock()
	if ok {
		return m, nil
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	
	// Double check after lock
	if m, ok := c.models[modelPath]; ok {
		return m, nil
	}

	m, err := tf.LoadSavedModel(modelPath, []string{"serve"}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to load SavedModel for fast transfer: %v", err)
	}

	c.models[modelPath] = m
	return m, nil
}

// FastTransferEngine handles single-pass style transfer.
type FastTransferEngine struct {
	cache *ModelCache
}

func NewFastTransferEngine() *FastTransferEngine {
	return &FastTransferEngine{
		cache: DefaultModelCache,
	}
}

// RunInference executes the fast style transfer model on an input tensor.
func (e *FastTransferEngine) RunInference(modelPath string, inputTensor *tf.Tensor) (*tf.Tensor, error) {
	model, err := e.cache.GetModel(modelPath)
	if err != nil {
		return nil, err
	}

	// Fast Style Transfer models usually have:
	// Input: "input_image" or similar
	// Output: "output_image" or "transformer/expand_dims"
	
	// Note: In a real scenario, these names should be discovered or configured per model.
	inputOp := model.Graph.Operation("input_image")
	outputOp := model.Graph.Operation("output_image")
	
	if inputOp == nil || outputOp == nil {
		return nil, fmt.Errorf("model operations not found (input_image/output_image)")
	}

	feeds := map[tf.Output]*tf.Tensor{
		inputOp.Output(0): inputTensor,
	}
	
	results, err := model.Session.Run(feeds, []tf.Output{outputOp.Output(0)}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to run fast transfer inference: %v", err)
	}

	return results[0], nil
}
