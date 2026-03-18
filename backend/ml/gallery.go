package ml

import (
	"encoding/json"
	"os"
	"sync"
	"time"

	"github.com/yuuuuuh-14/ai-style-studio/backend/graph/model"
)

type GalleryManager struct {
	mu    sync.RWMutex
	items []*model.GalleryItem
	path  string
}

func NewGalleryManager(path string) *GalleryManager {
	gm := &GalleryManager{path: path}
	gm.Load()
	return gm
}

func (gm *GalleryManager) Load() {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	data, err := os.ReadFile(gm.path)
	if err != nil {
		gm.items = []*model.GalleryItem{}
		return
	}

	json.Unmarshal(data, &gm.items)
}

func (gm *GalleryManager) Save(item *model.GalleryItem) {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	gm.items = append([]*model.GalleryItem{item}, gm.items...) // Prepend
	data, _ := json.Marshal(gm.items)
	os.WriteFile(gm.path, data, 0644)
}

func (gm *GalleryManager) GetItems(page, limit int) []*model.GalleryItem {
	gm.mu.RLock()
	defer gm.mu.RUnlock()

	start := (page - 1) * limit
	if start >= len(gm.items) {
		return []*model.GalleryItem{}
	}
	end := start + limit
	if end > len(gm.items) {
		end = len(gm.items)
	}
	return gm.items[start:end]
}

var DefaultGalleryManager = NewGalleryManager("gallery.json")

func CreateGalleryItem(taskId, resultUrl, contentUrl, styleUrl string) *model.GalleryItem {
	return &model.GalleryItem{
		ID:         taskId, // Using taskId as ID for simplicity
		TaskID:     taskId,
		ResultURL:  resultUrl,
		ContentURL: contentUrl,
		StyleURL:   styleUrl,
		CreatedAt:  time.Now().Format(time.RFC3339),
	}
}
