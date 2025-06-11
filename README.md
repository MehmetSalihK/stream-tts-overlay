# 🎙️ Stream TTS Overlay

Un **overlay Text-to-Speech (TTS)** interactif pour **Twitch**, permettant aux viewers d'envoyer des **messages vocaux personnalisés** avec des voix variées. Idéal pour dynamiser vos streams et augmenter l'engagement de votre communauté ! ✨

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Licence](https://img.shields.io/badge/licence-ISC-green)

## 📑 Table des Matières

- [🎯 Présentation](#-présentation)
- [⭐ Fonctionnalités](#-fonctionnalités)
- [📋 Prérequis](#-prérequis)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🎮 Utilisation](#-utilisation)
- [🔧 API](#-api)
- [🎨 Personnalisation](#-personnalisation)
- [❓ Dépannage](#-dépannage)
- [🤝 Contribuer](#-contribuer)
- [📄 Licence](#-licence)

## 🎯 Présentation

Stream TTS Overlay est une solution complète pour intégrer un système Text-to-Speech interactif à vos streams Twitch. Ce projet permet à vos viewers de s'exprimer via des voix personnalisées, créant ainsi une expérience unique et engageante pour votre communauté.

**Principales caractéristiques :**
- 🎮 Expérience TTS interactive pour les streams Twitch
- 🗣️ Multiples voix personnalisées pour vos viewers
- 💫 Overlay animé et stylisé avec transitions fluides
- 🔧 Support de plusieurs services TTS (ElevenLabs, Coqui TTS, Google TTS)

## ⭐ Fonctionnalités

### 🔊 Voix disponibles

| Service | Voix disponibles |
|---------|------------------|
| **ElevenLabs** | `vieuxpere`, `alimata` |
| **Coqui TTS** | `jamy`, `bob` |
| **Google TTS** | `shrek`, `bob`, `patrick` |

### Autres fonctionnalités

- 💬 Commande Twitch `!tts` simple et intuitive
- 🎨 Overlay animé avec transitions fluides
- 🔄 Mise à jour des messages en temps réel
- 🎵 File d'attente audio pour éviter les chevauchements
- 🖼️ Interface responsive et élégante
- 🔒 Sécurité intégrée pour filtrer les messages inappropriés

## 📋 Prérequis

- [Node.js](https://nodejs.org/) v14 ou supérieur
- [Python](https://www.python.org/downloads/release/python-3109/) ≥ 3.10
- Un compte Twitch
- Token OAuth Twitch ([obtenir un token](https://twitchapps.com/tmi/))
- Clé API ElevenLabs (facultative, [obtenir une clé](https://elevenlabs.io/api))
- Fichier `.env` configuré avec vos informations personnelles

## 🚀 Installation

### Cloner le dépôt

```bash
git clone https://github.com/votre-username/stream-tts-overlay.git
cd stream-tts-overlay
```

### Installer les dépendances Node.js

```bash
npm install
```

### Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos informations
# Sous Windows, vous pouvez utiliser:
notepad .env
```

### Configurer l'environnement Python pour Coqui TTS

```bash
# Créer et activer l'environnement virtuel Python 3.10
py -3.10 -m venv .venv
.venv\Scripts\Activate.ps1  # Pour Windows PowerShell
# OU
.venv\Scripts\activate.bat  # Pour Windows CMD
# OU
source .venv/bin/activate   # Pour Linux/Mac

# Installer la dépendance TTS
pip install TTS
```

### Lancer le serveur

```bash
node app.js
```

> **Note :** Veillez à rester dans l'environnement virtuel Python lors du lancement si vous souhaitez utiliser les voix Coqui TTS.

## ⚙️ Configuration

### Variables d'environnement

Le projet utilise un fichier `.env` pour stocker les informations sensibles. Un fichier `.env.example` est fourni comme modèle.

1. Copiez le fichier `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
2. Modifiez le fichier `.env` avec vos informations personnelles :
   ```
   # Configuration Twitch
   CHANNEL_NAME=votre_nom_de_chaine
   TWITCH_OAUTH_TOKEN=votre_token_oauth
   
   # Configuration ElevenLabs
   ELEVENLABS_API_KEY=votre_cle_api_elevenlabs
   
   # Configuration du serveur
   PORT=3000
   ```

### Configuration Twitch

1. Créez une application sur la [console développeur Twitch](https://dev.twitch.tv/console/apps)
2. Récupérez votre token OAuth via [Twitch Chat OAuth Password Generator](https://twitchapps.com/tmi/)
3. Ajoutez ces informations dans votre fichier `.env`

### Configuration ElevenLabs (optionnel)

1. Créez un compte sur [ElevenLabs](https://elevenlabs.io/)
2. Récupérez votre clé API dans les paramètres de votre compte
3. Ajoutez-la dans votre fichier `.env`

### Configuration OBS

1. Ajoutez une source navigateur :
   - URL : `http://localhost:3000`
   - Dimensions : `1920x1080` (ajustez selon vos besoins)
   - ✅ Activez l'arrière-plan transparent

## 🎮 Utilisation

### Pour les Streamers

1. Lancez le serveur :
   ```bash
   node app.js
   ```
2. Vérifiez dans OBS que l'overlay s'affiche correctement

### Pour les Viewers

Dans le chat Twitch :
```
!tts <voix> <message>
```

**Exemples :**
- `!tts jamy Bonjour les amis !`
- `!tts bob C'est l'heure de cuisiner !`
- `!tts patrick Je veux un Krabby Patty !`

## 🔧 API

### Endpoints

- `GET /current_message.json` : retourne le message en cours
- `GET /audio.mp3` : retourne l'audio généré

### Format de message

```json
{
  "username": "viewer_name",
  "message": "texte du message",
  "voice": "nom_de_la_voix",
  "timestamp": "2024-01-20T12:00:00Z",
  "status": "ready"
}
```

## 🎨 Personnalisation

### Modifier le style de l'overlay

Éditez `public/index.html` pour personnaliser :
- Couleurs et thème
- Animations et transitions
- Position et taille des messages
- Polices et styles de texte

### Ajouter de nouvelles voix

- **ElevenLabs** : ajoutez l'ID de voix dans l'objet `voices`
- **Coqui TTS** : ajoutez la configuration dans l'objet `coquiVoices`
- **Google TTS** : ajoutez le code de langue dans l'objet `gttsVoices`

## ❓ Dépannage

### Aucun son ne sort

- Vérifiez les permissions du dossier `public`
- Vérifiez que `audio.mp3` est bien généré
- Ouvrez la console navigateur pour voir les erreurs éventuelles

### L'overlay ne s'affiche pas

- Assurez-vous que le serveur est lancé (`node app.js`)
- Rafraîchissez la source navigateur dans OBS
- Vérifiez que l'arrière-plan transparent est activé

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```
3. Committez vos changements :
   ```bash
   git commit -m "Ajout de nouvelle-fonctionnalite"
   ```
4. Poussez vers la branche :
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```
5. Ouvrez une Pull Request 🚀

## 📄 Licence

Ce projet est sous licence ISC. Voir le fichier LICENSE pour plus de détails.

---

⭐ Si vous trouvez ce projet utile, n'hésitez pas à lui donner une étoile sur GitHub !

Créé avec ❤️ pour la communauté des streamers.