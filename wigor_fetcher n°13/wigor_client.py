# wigor_client_gui.py
import requests
from bs4 import BeautifulSoup
import tkinter as tk
from tkinter import messagebox, filedialog, simpledialog
import sys
import os
import webbrowser

class WigorClient:
    def __init__(self):
        self.session = requests.Session()
        self.cookies = {}

    def set_cookies(self, cookies: dict):
        self.cookies = cookies
        self.session.cookies.update(cookies)

    def fetch_url(self, url: str, extra_headers: dict = None):
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        if extra_headers:
            headers.update(extra_headers)
        try:
            resp = self.session.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:
            raise RuntimeError(f"Erreur HTTP: {e}")

    @staticmethod
    def parse_edt_html(html: str) -> list:
        soup = BeautifulSoup(html, "html.parser")
        classes = []
        for div in soup.find_all("div", class_="Case"):
            title_tag = div.find("font")
            if title_tag:
                classes.append({"raw_title": title_tag.get_text(strip=True)})
        return classes

def read_cookies_from_file(path: str) -> dict:
    cookies = {}
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if "=" in line:
                key, val = line.split("=", 1)
                cookies[key.strip()] = val.strip()
    return cookies

def save_and_open_html(content: str, filename: str = "wigor_response_debug.html"):
    outpath = os.path.join(os.path.expanduser("~"), "Desktop", filename)
    with open(outpath, "w", encoding="utf-8", errors="ignore") as f:
        f.write(content)
    # Ouvre automatiquement le fichier dans le navigateur par défaut
    webbrowser.open(f"file://{os.path.realpath(outpath)}")
    return outpath

def main():
    root = tk.Tk()
    root.withdraw()

    # Sélection du fichier cookies
    cookies_path = filedialog.askopenfilename(
        title="Sélectionnez le fichier cookies",
        filetypes=[("Fichiers texte", "*.txt"), ("Tous les fichiers", "*.*")]
    )
    if not cookies_path:
        messagebox.showinfo("Annulé", "Aucun fichier cookies sélectionné.")
        return

    # Saisie de l'URL complète avec hash
    full_url = simpledialog.askstring("URL complète", "Collez l'URL complète (avec hashURL) :")
    if not full_url:
        messagebox.showwarning("Annulé", "Aucune URL fournie.")
        return

    try:
        cookies = read_cookies_from_file(cookies_path)
    except Exception as e:
        messagebox.showerror("Erreur fichier", f"Impossible de lire le fichier cookies :\n{e}")
        return

    client = WigorClient()
    client.set_cookies(cookies)

    # Définir Referer pour éviter certains blocages serveur
    referer = "https://ws-edt-cd.wigorservices.net/"
    extra_headers = {"Referer": referer}

    try:
        resp = client.fetch_url(full_url, extra_headers=extra_headers)
    except RuntimeError as e:
        messagebox.showerror("Erreur HTTP", str(e))
        return

    parsed_classes = client.parse_edt_html(resp.text)

    if parsed_classes:
        edt_text = "\n".join([f" - {c['raw_title']}" for c in parsed_classes])
        messagebox.showinfo("EDT Wigor", edt_text)
    else:
        # sauvegarde et ouverture automatique du HTML pour debug
        outpath = save_and_open_html(resp.text)
        messagebox.showwarning("Aucun cours",
                               f"Aucun cours trouvé. Le HTML de debug a été sauvegardé et ouvert :\n{outpath}")

if __name__ == "__main__":
    main()
