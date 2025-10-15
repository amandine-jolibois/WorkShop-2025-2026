import pytest
from wigor_client import WigorClient
import requests_mock
import requests
import sys
import tempfile
import os
from io import StringIO

def test_set_cookies():
    client = WigorClient()
    cookies = {"session": "abc123"}
    client.set_cookies(cookies)
    assert client.cookies == cookies
    assert client.session.cookies.get("session") == "abc123"

def test_fetch_and_parse_success(requests_mock):
    url = "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx"
    sample_html = "<html><body><div class='Case'><font>Math</font></div></body></html>"
    requests_mock.get(url, text=sample_html, status_code=200)

    client = WigorClient()
    client.set_cookies({"dummy": "value"})
    # Construire l'URL avec les params pour fetch_url
    params = {
        "action": "posEDTLMS",
        "serverID": "C",
        "Tel": "user",
        "date": "10/13/2025",
        "hashURL": "dummy"
    }
    from urllib.parse import urlencode
    full_url = f"{url}?{urlencode(params)}"

    html = client.fetch_url(full_url).text  # <-- Corrigé ici
    parsed = client.parse_edt_html(html)

    assert len(parsed) == 1
    assert parsed[0]["raw_title"] == "Math"

def test_fetch_url_http_error(monkeypatch):
    client = WigorClient()

    def mock_get(*args, **kwargs):
        raise requests.RequestException("Network error")
    client.session.get = mock_get

    with pytest.raises(RuntimeError):
        client.fetch_url("https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx")

def test_parse_empty_html():
    html = "<html><body>No data</body></html>"
    parsed = WigorClient.parse_edt_html(html)
    assert parsed == []

def test_main_end_to_end(monkeypatch, requests_mock):
    # Fichier cookies temporaire
    with tempfile.NamedTemporaryFile("w+", delete=False) as f:
        f.write("ASP.NET_SessionId=dummyid\n")
        cookie_path = f.name

    # Simule le HTML de réponse SANS cours pour tester la branche "aucun cours"
    url = "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx"
    html = "<html><body>No data</body></html>"
    requests_mock.get(url, text=html, status_code=200)

    # Simule les arguments CLI
    test_args = [
        "wigor_client.py",
        "--cookies", cookie_path,
        "--date", "10/13/2025",
        "--username", "amandine.jolibois"
    ]
    monkeypatch.setattr(sys, "argv", test_args)

    # Mock tkinter messagebox pour ne pas bloquer le test
    import tkinter.messagebox as mb
    monkeypatch.setattr(mb, "showwarning", lambda title, msg: None)
    monkeypatch.setattr(mb, "showinfo", lambda title, msg: None)

    from wigor_client import main
    main()

    # Vérifie que le fichier debug a été créé
    desktop_file = os.path.join(os.path.expanduser("~"), "Desktop", "wigor_response_debug.html")
    assert os.path.exists(desktop_file)

    # Nettoyage
    os.remove(cookie_path)
    os.remove(desktop_file)

