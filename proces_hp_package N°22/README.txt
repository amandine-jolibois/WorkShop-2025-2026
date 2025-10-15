
Livrables générés in /mnt/data/procès_hp_output

Fichiers clés :
- analyse_hp.py       # script principal d'analyse
- requirements.txt    # dépendances
- pages.json          # exemples de nombres de pages
- summary.csv         # résultats simulés
- mort_trend.png, speech_t1.png
- rapport_synthese_demo.docx

Pour exécuter sur vos textes :
1) placez vos fichiers .txt dans un dossier 'books' (noms: 01_Harry_Potter_T1.txt etc.)
2) python -m venv venv && source venv/bin/activate
3) pip install -r requirements.txt
4) python analyse_hp.py --books_dir books --out_dir output --page_counts pages.json
