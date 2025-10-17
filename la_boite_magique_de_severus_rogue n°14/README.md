# smart*rogue*

Outil C++ cross-platform pour rassembler les sources/documents d'un workshop,
les copier dans un dossier de packaging et (optionnellement) initialiser/pousser un repo Git.

## Prérequis

- CMake >= 3.15
- compilateur C++17 (GCC/Clang/MSVC)
- git (si vous utilisez `--git-init` / `--remote`)

## Compilation

```bash
mkdir build && cd build
cmake ..
cmake --build . --config Release
# exécutable: ./workshop_packer (ou workshop_packer.exe sous Windows)
```

<!-- J'ajoute un commentaire -->
