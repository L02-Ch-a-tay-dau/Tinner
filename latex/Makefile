# Makefile for Tinner LaTeX Report
# Usage: 
#   make           - Compile PDF and clean temp files
#   make compile   - Just compile PDF (twice for TOC)
#   make clean     - Remove temp files only
#   make distclean - Remove everything including PDF

MAIN = Chua_Tay_Dau_report
LATEX = pdflatex
FLAGS = -interaction=nonstopmode

# Extensions of temporary files to be removed
EXTS = aux log out toc synctex.gz fdb_latexmk fls

all: compile clean

compile:
	$(LATEX) $(FLAGS) $(MAIN).tex
	$(LATEX) $(FLAGS) $(MAIN).tex

clean:
	@echo "Cleaning up temporary files..."
	@$(foreach ext, $(EXTS), rm -f $(MAIN).$(ext) || del /q $(MAIN).$(ext) 2>nul;)
	@rm -f *.aux *.log *.out *.toc 2>nul || del /q *.aux *.log *.out *.toc 2>nul

distclean: clean
	@echo "Removing PDF..."
	@rm -f $(MAIN).pdf || del /q $(MAIN).pdf 2>nul

.PHONY: all compile clean distclean
