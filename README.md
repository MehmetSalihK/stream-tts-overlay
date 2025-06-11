# 🎙️ Stream TTS Overlay

Un **overlay Text-to-Speech (TTS)** interactif pour **Twitch**, permettant aux viewers d'envoyer des **messages vocaux personnalisés** avec des voix variées. Idéal pour dynamiser vos streams et augmenter l'engagement de votre communauté ! ✨

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Licence](https://img.shields.io/badge/licence-ISC-green)

> **Note importante** : Ce projet est en cours de développement. Certaines fonctionnalités sont opérationnelles, d'autres sont en cours d'implémentation.

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

| Service | Voix disponibles | État |
|---------|------------------|------|
| **ElevenLabs** | `vieuxpere`, `alimata` | ✅ Fonctionnel |
| **Coqui TTS** | `jamy`, `bob`, `michel`, `sophie`, `rapide`, `robot` | ✅ Fonctionnel |
| **Coqui TTS (Clonage)** | `mavoix` (votre propre voix) | ✅ Fonctionnel |
| **Google TTS** | `shrek`, `bob`, `patrick` | ✅ Fonctionnel |

### État du projet

#### ✅ Ce qui fonctionne

- 💬 Commande Twitch `!tts` simple et intuitive
- 🎨 Overlay animé avec transitions fluides
- 🔄 Mise à jour des messages en temps réel
- 🎵 Génération audio avec plusieurs services TTS
- 🗣️ Clonage de voix avec Coqui TTS XTTS-v2
- 🔧 Commandes pour gérer votre voix clonée (`!tts créer`, `!tts fichier`, `!tts langue`, `!tts liste`)

#### 🔄 En cours de développement

- 📊 Interface d'administration pour gérer les voix
- 🎛️ Ajustement des paramètres de voix en temps réel
- 🎭 Support des émotions pour certains modèles TTS
- 🔊 Amélioration de la qualité audio et des transitions

#### ❌ Limitations actuelles

- 🌐 Seules les voix françaises sont supportées actuellement
- ⚙️ Les paramètres de vitesse et de hauteur ne sont pas supportés par tous les modèles
- 🖥️ Installation complexe pour Coqui TTS sur certains systèmes

#### 💡 Fonctionnalités qui pourraient être ajoutées

- 🎮 Interface web pour tester les voix
- 🎯 Filtrage des messages inappropriés
- 🎵 Effets sonores et musique de fond
- 📱 Application mobile pour contrôler les voix
- 🔄 Intégration avec d'autres plateformes de streaming

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

# Activer l'environnement virtuel
# Pour Windows PowerShell
.venv\Scripts\Activate.ps1
# OU pour Windows CMD
.venv\Scripts\activate.bat
# OU pour Linux/Mac
# source .venv/bin/activate

# Installer la dépendance TTS
pip install TTS
```

#### Installation des modèles Coqui TTS

```bash
# Pour les voix françaises (CSS10)
.venv\Scripts\tts.exe --model_name tts_models/fr/css10/vits --list_models

# Pour le clonage de voix (XTTS-v2)
.venv\Scripts\tts.exe --model_name tts_models/multilingual/multi-dataset/xtts_v2 --list_models
```

> **Important :** L'application utilise le chemin absolu vers l'exécutable TTS dans l'environnement virtuel. Assurez-vous que l'environnement virtuel est correctement configuré et que TTS est installé avant de lancer l'application.

#### Configuration pour le clonage de voix

Pour utiliser votre propre voix avec le clonage de voix :

1. Enregistrez un fichier audio de votre voix (minimum 6 secondes)
2. Convertissez-le au format WAV (44.1kHz, 16-bit)
3. Nommez-le `ma_voix.wav` et placez-le dans le dossier `ttsmodel`
4. Utilisez la commande `!tts mavoix <message>` pour parler avec votre voix

### Lancer le serveur

```bash
node app.js
```

> **Note :** Grâce à l'utilisation du chemin absolu vers l'exécutable TTS, il n'est plus nécessaire d'activer manuellement l'environnement virtuel Python avant de lancer l'application. Assurez-vous simplement que l'environnement virtuel est correctement configuré et que TTS est installé.

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

**Exemples de base :**
- `!tts jamy Bonjour les amis !`
- `!tts bob C'est l'heure de cuisiner !`
- `!tts patrick Je veux un Krabby Patty !`

**Commandes pour le clonage de voix :**
- `!tts liste` - Affiche toutes les voix disponibles
- `!tts créer` - Affiche les instructions pour créer sa propre voix
- `!tts mavoix Ceci est ma voix clonée !` - Parle avec votre voix clonée
- `!tts fichier <nom>` - Change le fichier audio utilisé pour le clonage (sans l'extension .wav)
- `!tts langue fr` - Confirme la langue française pour la voix clonée

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

- **ElevenLabs** : ajoutez l'ID de voix dans l'objet `voices` dans `app.js`
  ```javascript
  const voices = {
    vieuxpere: 't4fHUMAMZxaaV2inHOnb',
    alimata: '4SFJvuIUvxaPLgk8FoK3',
    // Ajoutez votre nouvelle voix ici
    nouvelle_voix: 'votre_id_de_voix_elevenlabs'
  };
  ```

- **Coqui TTS** : ajoutez la configuration dans l'objet `coquiVoices` dans `app.js`
  ```javascript
  const coquiVoices = {
    // Ajoutez votre nouvelle voix française ici
    nouvelle_voix: {
      model: 'tts_models/fr/css10/vits',
      speaker_idx: 0,
      speed: 1.0,
      pitch: 1.0,
      emotion: 'neutral',
      breathIntensity: 0.2
    }
  };
  ```

- **Google TTS** : ajoutez le code de langue dans l'objet `gttsVoices` dans `app.js`
  ```javascript
  const gttsVoices = {
    shrek: 'fr',
    bob: 'fr',
    patrick: 'fr',
    // Ajoutez votre nouvelle voix ici
    nouvelle_voix: 'fr'
  };
  ```

### Personnaliser le clonage de voix

Vous pouvez ajouter plusieurs fichiers audio dans le dossier `ttsmodel` pour avoir différentes voix clonées :

1. Placez vos fichiers audio au format WAV dans le dossier `ttsmodel`
2. Utilisez la commande `!tts fichier nom_du_fichier` pour changer de voix (sans l'extension .wav)

Exemple : si vous avez `voix1.wav` et `voix2.wav` dans le dossier `ttsmodel`, vous pouvez utiliser :
- `!tts fichier voix1` pour utiliser la première voix
- `!tts fichier voix2` pour utiliser la deuxième voix

## ❓ Dépannage

### Erreur "tts.exe n'est pas reconnu en tant que commande interne ou externe"

Cette erreur se produit lorsque le package TTS n'est pas correctement installé dans l'environnement virtuel Python.

**Solution :**

1. Assurez-vous que l'environnement virtuel Python est correctement configuré :
   ```bash
   # Pour Windows PowerShell
   .venv\Scripts\Activate.ps1
   # OU pour Windows CMD
   .venv\Scripts\activate.bat
   ```

2. Installez le package TTS dans l'environnement virtuel :
   ```bash
   pip install TTS
   ```

3. Vérifiez que le fichier `tts.exe` existe dans le répertoire `.venv\Scripts\`

4. Si l'installation échoue avec des erreurs de compilation, essayez d'installer les outils de développement C++ nécessaires :
   - Installez [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Sélectionnez "Outils de développement C++" lors de l'installation
   - Réessayez l'installation de TTS

5. Alternativement, vous pouvez modifier le code dans `app.js` pour utiliser une autre méthode TTS ou désactiver temporairement Coqui TTS.

### Erreur lors du téléchargement du modèle XTTS-v2

Le modèle XTTS-v2 est volumineux (environ 3 Go) et peut prendre du temps à télécharger.

**Solution :**

1. Assurez-vous d'avoir une connexion internet stable
2. Exécutez la commande de téléchargement et attendez patiemment :
   ```bash
   .venv\Scripts\tts.exe --model_name tts_models/multilingual/multi-dataset/xtts_v2 --list_models
   ```
3. Si le téléchargement échoue, essayez de le relancer
4. Vérifiez que vous avez suffisamment d'espace disque (au moins 5 Go)

### Problèmes avec le clonage de voix

**Solutions :**

1. **Qualité audio insuffisante** : Assurez-vous que votre fichier audio est :
   - D'une durée d'au moins 6 secondes
   - Enregistré avec une bonne qualité (44.1kHz, 16-bit)
   - Sans bruit de fond ou écho
   - Avec une voix claire et naturelle

2. **Fichier non reconnu** : Vérifiez que :
   - Le fichier est au format WAV
   - Le fichier est placé dans le dossier `ttsmodel`
   - Le nom du fichier est correctement spécifié dans la commande `!tts fichier`

3. **Erreur de modèle** : Si vous obtenez des erreurs liées au modèle XTTS-v2 :
   - Vérifiez que le modèle est correctement téléchargé
   - Réinstallez le package TTS
   - Essayez de télécharger à nouveau le modèle

### Aucun son ne sort

- Vérifiez les permissions du dossier `public`
- Vérifiez que `audio.mp3` est bien généré
- Ouvrez la console navigateur pour voir les erreurs éventuelles
- Consultez les logs du serveur pour voir les erreurs liées à la génération audio
- Vérifiez si des erreurs apparaissent dans la console du serveur concernant la génération TTS
- Si vous utilisez Coqui TTS, assurez-vous que le package est correctement installé (voir section précédente)

### L'overlay ne s'affiche pas

- Assurez-vous que le serveur est lancé (`node app.js`)
- Rafraîchissez la source navigateur dans OBS
- Vérifiez que l'arrière-plan transparent est activé

## 🔮 Projets futurs

Ce projet est en développement actif. Voici les améliorations prévues :

### Priorité haute
- ⚙️ Support complet des paramètres de vitesse et de hauteur pour tous les modèles
- 🎭 Ajout du support des émotions pour les modèles qui le permettent
- 🔊 Amélioration de la qualité audio et des transitions

### Priorité moyenne
- 📊 Interface d'administration web pour gérer les voix
- 🎛️ Ajustement des paramètres de voix en temps réel
- 🎯 Filtrage des messages inappropriés

### Priorité basse
- 🎮 Interface web pour tester les voix
- 🎵 Effets sonores et musique de fond
- 📱 Application mobile pour contrôler les voix
- 🔄 Intégration avec d'autres plateformes de streaming

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