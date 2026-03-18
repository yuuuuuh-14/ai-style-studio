package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

import (
	"github.com/yuuuuuh-14/ai-style-studio/backend/graph/model"
	"github.com/yuuuuuh-14/ai-style-studio/backend/ml"
)

type Resolver struct {
	Models      []*model.ModelInfo
	StyleImages []*model.StyleImage
	Engine      *ml.Engine
}
