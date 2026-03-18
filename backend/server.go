package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/yuuuuuh-14/ai-style-studio/backend/graph"
	"github.com/yuuuuuh-14/ai-style-studio/backend/graph/model"
	"github.com/yuuuuuh-14/ai-style-studio/backend/ml"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	router := chi.NewRouter()

	// Middleware
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Mock Data
	mockModels := []*model.ModelInfo{
		{
			ID:          "inception-v3",
			Name:        "Inception-v3",
			Description: stringPtr("High-performance feature extraction model for neural style transfer."),
			Layers:      []string{"mixed3", "mixed4", "mixed5"},
		},
	}
	mockStyles := []*model.StyleImage{
		{ID: "starry-night", Name: "Starry Night", ThumbnailPath: "/assets/styles/starry_night.png"},
		{ID: "the-scream", Name: "The Scream", ThumbnailPath: "/assets/styles/the_scream.png"},
	}

	// Initialize ML Engine
	modelPath := os.Getenv("MODEL_PATH")
	if modelPath == "" {
		modelPath = "./ml/models/inception-v3"
	}
	engine, err := ml.NewEngine(modelPath)
	if err != nil {
		log.Printf("Warning: Failed to initialize ML Engine: %v. Running in mock mode.", err)
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{
			Models:      mockModels,
			StyleImages: mockStyles,
			Engine:      engine,
		},
	}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	// SSE Endpoint
	router.Get("/events/{taskId}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		taskId := chi.URLParam(r, "taskId")
		taskChan, ok := ml.DefaultTaskManager.GetTaskChannel(taskId)
		if !ok {
			log.Printf("SSE error: task not found %s", taskId)
			http.Error(w, "Task not found", http.StatusNotFound)
			return
		}

		log.Printf("SSE connection started for taskId: %s", taskId)
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
			return
		}

		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-r.Context().Done():
				log.Printf("SSE client disconnected for taskId: %s", taskId)
				return
			case progress, ok := <-taskChan:
				if !ok {
					log.Printf("SSE channel closed for taskId: %s", taskId)
					return
				}
				data, _ := json.Marshal(progress)
				fmt.Fprintf(w, "data: %s\n\n", string(data))
				flusher.Flush()
				
				if progress.Status == "completed" || progress.Status == "failed" {
					return
				}
			case <-ticker.C:
				// Heartbeat to keep connection alive
				fmt.Fprintf(w, ": heartbeat\n\n")
				flusher.Flush()
			}
		}
	})

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func stringPtr(s string) *string {
	return &s
}
