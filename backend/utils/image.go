package utils

import (
	"image"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"

	"github.com/disintegration/gift"
)

// LoadImage loads an image from a file path.
func LoadImage(path string) (image.Image, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return nil, err
	}
	return img, nil
}

// SaveImage saves an image to a file path.
func SaveImage(path string, img image.Image) error {
	dir := filepath.Dir(path)
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.MkdirAll(dir, 0755)
	}

	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	ext := filepath.Ext(path)
	if ext == ".png" {
		return png.Encode(file, img)
	}
	return jpeg.Encode(file, img, &jpeg.Options{Quality: 95})
}

// ResizeImage resizes an image to specified dimensions.
func ResizeImage(img image.Image, width, height int) image.Image {
	g := gift.New(
		gift.Resize(width, height, gift.LanczosResampling),
	)
	dst := image.NewRGBA(g.Bounds(img.Bounds()))
	g.Draw(dst, img)
	return dst
}
