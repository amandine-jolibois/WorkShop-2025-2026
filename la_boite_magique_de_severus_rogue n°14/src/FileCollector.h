#pragma once
#include <string>
#include <vector>

class FileCollector {
public:
    // pattern examples: "*.cpp", "*.md"
    FileCollector(const std::string& srcRoot);
    // add a file glob pattern to include
    void addPattern(const std::string& glob);
    // collect files matching patterns (relative paths returned)
    std::vector<std::string> collect() const;
    // copy collected files into destRoot preserving directory structure
    bool copyTo(const std::string& destRoot) const;
private:
    std::string srcRoot_;
    std::vector<std::string> patterns_;
    // helper converts glob to regex
    static std::string globToRegex(const std::string& glob);
};
