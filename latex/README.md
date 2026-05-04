# LaTeX Document Compilation

This folder contains the Tinner project report document written in LaTeX.

## File Structure

- `main.tex`: The main document entry point that inputs the sections.
- `images/`: Put all your diagrams, screenshots, and visual assets here.
- `sections/`: Individual `.tex` files for the report sections.

## Prerequisites

To compile the LaTeX file into a PDF, you need a TeX distribution:

### For Windows

Install **MiKTeX** or **TeX Live**:
- Download MiKTeX from the official website: [https://miktex.org/download](https://miktex.org/download)
- Or install using Windows Package Manager (winget):
  ```bash
  winget install MiKTeX.MiKTeX
  ```

### For Linux (Ubuntu/Debian)

Install the full TeX Live distribution:
```bash
sudo apt update
sudo apt install texlive-full
```

### For macOS

Install **MacTeX**:
- Download from [https://tug.org/mactex/](https://tug.org/mactex/)
- Or install via Homebrew:
  ```bash
  brew install --cask mactex
  ```

## Compiling to PDF

Once you have installed the TeX distribution, you can compile the document in several ways:

### 1. Using terminal command line (pdflatex)

Navigate to this `latex` folder and run `pdflatex`:
```bash
pdflatex main.tex
```

To resolve references and labels properly, run it twice:
```bash
pdflatex main.tex
pdflatex main.tex
```

### 2. Using `pnpm docs:build` from the workspace root

You can also compile the document directly from the project root directory using `pnpm`:
```bash
pnpm docs:build
```

### 3. Using Visual Studio Code (Recommended)

1. Install the **LaTeX Workshop** extension by James Yu.
2. Open `main.tex`.
3. Press `Ctrl + Alt + B` (Windows/Linux) or `Cmd + Option + B` (macOS) to build the PDF.

### 3. Using Online Editors (Overleaf)

If you prefer not to install any local dependencies:
1. Zip the contents of the `latex/` folder.
2. Upload the ZIP file to [Overleaf](https://www.overleaf.com/).
3. Click on the **Recompile** button.
