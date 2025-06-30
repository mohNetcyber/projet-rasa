## 1. Lancer d'abord les actions avec la commande : (terminal à part)
```bash
rasa run actions
```

## 2. Lance le serveur Rasa avec Socket.IO activé (sur un autre terminal)

```bash
rasa run -m models --enable-api --cors "*" --debug 
```

Descriptions des options
- `-m models` : utilise le modèle entraîné
    
- `--enable-api` : autorise les requêtes HTTP/API (utilisé en Socket.IO)
    
- `--cors "*"` : autorise l’accès depuis ton navigateur
    
- `--debug` : pour voir tous les logs utiles

## 3. Lancer le serveur python (sur un autre  terminal)

```bash
cd emplacement_code_html
python -m http.server 8000
```

Maintenant on accède via : http://localhost:8000 