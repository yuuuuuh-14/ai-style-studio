package ml

import (
	"sync"
)

// TaskProgress represents the current state of a style transfer task.
type TaskProgress struct {
	Step          int     `json:"step"`
	MaxSteps      int     `json:"maxSteps"`
	ContentLoss   float32 `json:"contentLoss"`
	StyleLoss     float32 `json:"styleLoss"`
	Status        string  `json:"status"`
	StatusMessage string  `json:"statusMessage,omitempty"`
	PreviewURL    string  `json:"previewUrl,omitempty"`
}

// TaskManager handles multiple style transfer tasks and their progress.
type TaskManager struct {
	tasks    map[string]chan TaskProgress
	progress map[string]TaskProgress
	mu       sync.RWMutex
}

func NewTaskManager() *TaskManager {
	return &TaskManager{
		tasks:    make(map[string]chan TaskProgress),
		progress: make(map[string]TaskProgress),
	}
}

func (tm *TaskManager) CreateTask(taskId string) chan TaskProgress {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	ch := make(chan TaskProgress, 100)
	tm.tasks[taskId] = ch
	tm.progress[taskId] = TaskProgress{Status: "queued"}
	return ch
}

func (tm *TaskManager) UpdateProgress(taskId string, p TaskProgress) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	tm.progress[taskId] = p
}

func (tm *TaskManager) GetTask(taskId string) *TaskProgress {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	if p, ok := tm.progress[taskId]; ok {
		return &p
	}
	return nil
}

func (tm *TaskManager) GetTaskChannel(taskId string) (chan TaskProgress, bool) {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	ch, ok := tm.tasks[taskId]
	return ch, ok
}

func (tm *TaskManager) DeleteTask(taskId string) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	if ch, ok := tm.tasks[taskId]; ok {
		close(ch)
		delete(tm.tasks, taskId)
		// We might want to keep the final progress for a while
	}
}

// Global instance or injected via Resolver
var DefaultTaskManager = NewTaskManager()
