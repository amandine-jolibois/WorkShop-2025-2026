#include "FileCollector.h"
#include <filesystem>
#include <regex>
#include <iostream>
#include <fstream>

namespace fs = std::filesystem;

FileCollector::FileCollector(const std::string& srcRoot) : srcRoot_(srcRoot) {}

void FileCollector::addPattern(const std::string& glob) {
    patterns_.push_back(glob);
}

static bool matchesAny(const std::string& filename, const std::vector<std::regex>& regs) {
    for (const auto& r : regs) {
        if (std::regex_match(filename, r)) return true;
    }
    return false;
}

std::string FileCollector::globToRegex(const std::string& glob) {
    std::string regex = "^";
    for (char c : glob) {
        switch(c) {
            case '*': regex += ".*"; break;
            case '?': regex += "."; break;
            case '.': regex += "\\."; break;
            case '\\': regex += "\\\\"; break;
            default:
                if (std::string("()+|^$[]{}").find(c) != std::string::npos) regex += '\\';
                regex += c;
        }
    }
    regex += "$";
    return regex;
}

std::vector<std::string> FileCollector::collect() const {
    std::vector<std::string> result;
    std::vector<std::regex> regs;
    for (const auto& g : patterns_) regs.emplace_back(globToRegex(g), std::regex::ECMAScript | std::regex::icase);

    if (!fs::exists(srcRoot_)) {
        std::cerr << "Source root does not exist: " << srcRoot_ << "\n";
        return result;
    }

    for (auto it = fs::recursive_directory_iterator(fs::path(srcRoot_)); it != fs::recursive_directory_iterator(); ++it) {
        try {
            if (!fs::is_regular_file(it->path())) continue;
            std::string rel = fs::relative(it->path(), srcRoot_).generic_string();
            if (patterns_.empty()) {
                result.push_back(rel);
            } else {
                if (matchesAny(rel, regs) || matchesAny(it->path().filename().generic_string(), regs)) {
                    result.push_back(rel);
                }
            }
        } catch (const std::exception& e) {
            std::cerr << "Error scanning: " << e.what() << "\n";
        }
    }
    return result;
}

bool FileCollector::copyTo(const std::string& destRoot) const {
    std::vector<std::string> files = collect();
    if (files.empty()) {
        std::cerr << "No files to copy.\n";
        return false;
    }

    try {
        fs::create_directories(destRoot);
        for (const auto& rel : files) {
            fs::path src = fs::path(srcRoot_) / rel;
            fs::path dst = fs::path(destRoot) / rel;
            fs::create_directories(dst.parent_path());
            fs::copy_file(src, dst, fs::copy_options::overwrite_existing);
        }
    } catch (const std::exception& e) {
        std::cerr << "Copy failed: " << e.what() << "\n";
        return false;
    }
    return true;
}
