package main

import (
	"bytes"
	"context"
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"time"

	"github.com/chromedp/chromedp"
)

const (
	width  = 1440
	height = 1600
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run() error {
	flags := flag.NewFlagSet(os.Args[0], flag.ContinueOnError)
	flags.SetOutput(new(bytes.Buffer))
	flags.Usage = func() {}

	update := flags.Bool("update", false, "refresh the baseline image")
	baseURL := flags.String("base-url", lookupBaseURL(), "benchmark page URL")
	if err := flags.Parse(os.Args[1:]); err != nil {
		return err
	}

	startedAt := time.Now()
	dir, err := os.Getwd()
	if err != nil {
		return err
	}

	allocatorCtx, cancelAllocator := chromedp.NewExecAllocator(context.Background(),
		append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.Headless,
			chromedp.DisableGPU,
			chromedp.WindowSize(width, height),
		)...,
	)
	defer cancelAllocator()

	ctx, cancel := chromedp.NewContext(allocatorCtx)
	defer cancel()

	ctx, timeoutCancel := context.WithTimeout(ctx, 45*time.Second)
	defer timeoutCancel()

	var screenshot []byte
	if err := chromedp.Run(ctx,
		chromedp.Navigate(*baseURL),
		chromedp.WaitVisible(`[data-benchmark-root]`, chromedp.ByQuery),
		chromedp.Screenshot(`[data-benchmark-root]`, &screenshot, chromedp.ByQuery),
	); err != nil {
		return err
	}

	actualPath := filepath.Join(dir, "actual.png")
	baselinePath := filepath.Join(dir, "baseline.png")
	diffPath := filepath.Join(dir, "diff.png")

	if err := os.WriteFile(actualPath, screenshot, 0o644); err != nil {
		return err
	}

	if *update || !fileExists(baselinePath) {
		if err := os.WriteFile(baselinePath, screenshot, 0o644); err != nil {
			return err
		}
		fmt.Printf("chromedp baseline refreshed in %s\n", time.Since(startedAt).Round(time.Millisecond))
		return nil
	}

	baselineBytes, err := os.ReadFile(baselinePath)
	if err != nil {
		return err
	}

	baselineImage, err := decodePNG(baselineBytes)
	if err != nil {
		return err
	}

	actualImage, err := decodePNG(screenshot)
	if err != nil {
		return err
	}

	if !baselineImage.Bounds().Eq(actualImage.Bounds()) {
		return fmt.Errorf("chromedp screenshot bounds changed from %v to %v", baselineImage.Bounds(), actualImage.Bounds())
	}

	diffImage, diffPixels := diffImages(baselineImage, actualImage)
	if diffPixels > 0 {
		if err := writePNG(diffPath, diffImage); err != nil {
			return err
		}
		return fmt.Errorf("chromedp screenshot diff detected: %d pixels", diffPixels)
	}

	fmt.Printf("chromedp visual check passed in %s\n", time.Since(startedAt).Round(time.Millisecond))
	return nil
}

func lookupBaseURL() string {
	if value := os.Getenv("VISUAL_BENCHMARK_BASE_URL"); value != "" {
		return value
	}
	if value := os.Getenv("BASE_URL"); value != "" {
		return value
	}
	return "http://127.0.0.1:4173/view/bench/visual"
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func decodePNG(input []byte) (image.Image, error) {
	imageValue, err := png.Decode(bytes.NewReader(input))
	if err != nil {
		return nil, err
	}
	return imageValue, nil
}

func writePNG(path string, img image.Image) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	return png.Encode(file, img)
}

func diffImages(left image.Image, right image.Image) (*image.NRGBA, int) {
	bounds := left.Bounds()
	diff := image.NewNRGBA(bounds)
	diffPixels := 0

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			leftColor := color.NRGBAModel.Convert(left.At(x, y)).(color.NRGBA)
			rightColor := color.NRGBAModel.Convert(right.At(x, y)).(color.NRGBA)

			if leftColor != rightColor {
				diffPixels++
				diff.SetNRGBA(x, y, color.NRGBA{R: 255, G: 0, B: 0, A: 255})
				continue
			}

			diff.SetNRGBA(x, y, color.NRGBA{
				R: rightColor.R / 3,
				G: rightColor.G / 3,
				B: rightColor.B / 3,
				A: 255,
			})
		}
	}

	return diff, diffPixels
}
