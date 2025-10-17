#include <iostream>
#include <filesystem>
#include <string>
#include <fstream>
#include <unordered_map>
#include <cstdlib>

namespace fs = std::filesystem;

// Supprime les accents
std::string removeAccents(const std::string& input) {
    std::unordered_map<char, char> accentMap = {
        {'à', 'a'}, {'á', 'a'}, {'â', 'a'}, {'ä', 'a'},
        {'ç', 'c'},
        {'é', 'e'}, {'è', 'e'}, {'ê', 'e'}, {'ë', 'e'},
        {'î', 'i'}, {'ï', 'i'},
        {'ô', 'o'}, {'ö', 'o'},
        {'ù', 'u'}, {'û', 'u'}, {'ü', 'u'},
        {'ÿ', 'y'},
        {'À', 'A'}, {'É', 'E'}, {'Ô', 'O'}
    };

    std::string result;
    for (char c : input) {
        if (accentMap.count(c)) result += accentMap[c];
        else result += c;
    }
    return result;
}

// Vérifie si un dossier est un dépôt git
bool isGitRepo(const fs::path& path) {
    return fs::exists(path / ".git");
}

int main() {
    std::string baseDir;
    std::string commitMessage;

    std::cout << "=============================\n";
    std::cout << "   SmartRogue Git AutoPusher\n";
    std::cout << "=============================\n\n";

    // Dossier de base
    std::cout << "Chemin du dossier parent : ";
    std::getline(std::cin, baseDir);
    baseDir = removeAccents(baseDir);

    if (!fs::exists(baseDir)) {
        std::cerr << "ERREUR : Dossier inexistant !" << std::endl;
        return 1;
    }

    // Message de commit
    std::cout << "Message du commit : ";
    std::getline(std::cin, commitMessage);
    commitMessage = removeAccents(commitMessage);

    std::cout << "\nRecherche des depots Git dans : " << baseDir << "\n\n";

    int repoCount = 0;
    for (const auto& entry : fs::directory_iterator(baseDir)) {
        if (entry.is_directory() && isGitRepo(entry.path())) {
            repoCount++;
            std::cout << "➡ Depot trouve : " << entry.path().filename().string() << std::endl;

            std::string cmd = "cd \"" + entry.path().string() + "\" && git add . && git commit -m \"" + commitMessage + "\" && git push";
            int result = system(cmd.c_str());

            if (result == 0)
                std::cout << "✅ Push reussi pour " << entry.path().filename().string() << "\n\n";
            else
                std::cout << "⚠️  Erreur sur " << entry.path().filename().string() << "\n\n";
        }
    }

    if (repoCount == 0)
        std::cout << "Aucun depot Git trouve dans le dossier." << std::endl;
    else
        std::cout << "Traitement termine : " << repoCount << " depot(s) traites." << std::endl;

    std::cout << "\nAppuyez sur Entree pour quitter...";
    std::cin.get();
    return 0;
}
