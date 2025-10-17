cmake_minimum_required(VERSION 3.15)
project(smart_rogue VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# allow building with MSVC / GNU / Clang
if(MSVC)
  add_compile_options(/W4 /permissive-)
else()
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

add_executable(smart_rogue
    src/main.cpp
    src/FileCollector.cpp
)

# install target (optional)
install(TARGETS smart_rogue DESTINATION bin)
