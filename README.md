# 🎙️ TTS Overlay pour Twitch

Un **overlay Text-to-Speech (TTS)** interactif pour **Twitch**, permettant aux viewers d’envoyer des **messages vocaux personnalisés** avec des voix variées. Idéal pour dynamiser tes streams ! ✨

---

## 📑 Table des Matières

- [🎯 Objectifs](#🎯-objectifs)
- [⭐ Fonctionnalités](#⭐-fonctionnalités)
- [📋 Prérequis](#📋-prérequis)
- [🚀 Installation](#🚀-installation)
- [⚙️ Configuration](#⚙️-configuration)
- [🎮 Utilisation](#🎮-utilisation)
- [🔧 API](#🔧-api)
- [🎨 Personnalisation](#🎨-personnalisation)
- [❓ Dépannage](#❓-dépannage)
- [🤝 Contribuer](#🤝-contribuer)
- [📄 Licence](#📄-licence)

---

## 🎯 Objectifs

- 🎮 Offrir une expérience TTS interactive pour les streams Twitch
- 🗣️ Permettre aux viewers de s’exprimer via des voix personnalisées
- 💫 Afficher un overlay animé et stylisé
- 🔧 Supporter plusieurs services TTS (ElevenLabs, Coqui TTS, Google TTS)

---

## ⭐ Fonctionnalités

- 🔊 **Voix disponibles** :
  - **ElevenLabs** : `vieuxpere`, `alimata`
  - **Coqui TTS** : `jamy`, `bob`
  - **Google TTS** : `shrek`, `bob`, `patrick`
- 💬 Commande Twitch `!tts` simple et intuitive
- 🎨 Overlay animé avec transitions fluides
- 🔄 Mise à jour des messages en temps réel
- 🎵 File d'attente audio pour éviter les chevauchements
- 🖼️ Interface responsive et élégante

---

## 📋 Prérequis

- [Node.js](https://nodejs.org/) v14+
- Python ≥ 3.10 (installer depuis https://www.python.org/downloads/release/python-3109/)
- Un compte Twitch
- Token OAuth Twitch
- Clé API ElevenLabs (facultative)

---

## 🚀 Installation

```bash
git clone <votre-repo>
cd stream-tts-overlay

# Installer les dépendances Node.js
npm install

# Créer et activer l'environnement virtuel Python 3.10
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Installer la dépendance TTS
pip install TTS
```

### Lancer le serveur

```bash
node app.js
```

Veillez à rester dans l'environnement virtuel Python lors du lancement.

---

## ⚙️ Configuration

Twitch
Crée une app sur la console développeur Twitch

Récupère ton token OAuth

Remplis les variables CHANNEL_NAME et TWITCH_OAUTH_TOKEN dans app.js

ElevenLabs (optionnel)
Crée un compte sur ElevenLabs

Récupère ta clé API

Ajoute-la dans ELEVENLABS_API_KEY

OBS
Ajoute une source navigateur :

URL : http://localhost:3000

Dimensions : 1920x1080 (ajuste selon tes besoins)

✅ Active l’arrière-plan transparent

---

## 🎮 Utilisation

Pour les Streamers
Lancer le serveur :

bash
Copier
Modifier
node app.js
Vérifie dans OBS que l’overlay s’affiche correctement.

Pour les Viewers
Dans le chat :

php-template
Copier
Modifier
!tts <voix> <message>
Exemples :

!tts jamy Bonjour les amis !

!tts bob C’est l’heure de cuisiner !

!tts patrick Je veux un Krabby Patty !

---

## 🔧 API

Endpoints
GET /current_message.json : retourne le message en cours

GET /audio.mp3 : retourne l’audio généré

Exemple de message :
json
Copier
Modifier
{
  "username": "viewer_name",
  "message": "texte du message",
  "voice": "nom_de_la_voix",
  "timestamp": "2024-01-20T12:00:00Z"
}

---

## 🎨 Personnalisation

Modifier le style de l'overlay
Édite public/index.html :

Couleurs

Animations

Position des messages

Polices

Ajouter de nouvelles voix
ElevenLabs : ajoute l’ID dans voices

Coqui TTS : ajoute la voix dans coquiVoices

Google TTS : ajoute la voix dans gttsVoices

---

## ❓ Dépannage

Aucun son ne sort :
Vérifie les permissions du dossier public

Vérifie que audio.mp3 est bien généré

Ouvre la console navigateur pour voir les erreurs

L’overlay ne s’affiche pas :
Assure-toi que le serveur est lancé (node app.js)

Rafraîchis la source navigateur dans OBS

Active bien l’arrière-plan transparent

---

## 🤝 Contribuer

Fork le projet

Crée une branche :

bash
Copier
Modifier
git checkout -b feature/NouvelleFeature
Commit tes changements :

bash
Copier
Modifier
git commit -m "Ajout de NouvelleFeature"
Push :

bash
Copier
Modifier
git push origin feature/NouvelleFeature
Ouvre une Pull Request 🚀

---

## 📄 Licence

Ce projet est sous licence ISC. Voir le fichier LICENSE pour plus de détails.