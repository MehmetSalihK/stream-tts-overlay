const express = require('express');
const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const gtts = require('node-gtts');
const { exec } = require('child_process');
require('dotenv').config();

// === Configuration ===
const CHANNEL_NAME = process.env.CHANNEL_NAME;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const PORT = process.env.PORT || 3000;

const voices = {
  vieuxpere: 't4fHUMAMZxaaV2inHOnb',
  alimata: '4SFJvuIUvxaPLgk8FoK3',
};

const coquiVoices = {
  // Voix françaises avec le modèle CSS10
  jamy: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 0.85,  // Légèrement ajusté pour un débit plus naturel
    pitch: 1.0,
    emotion: 'neutral',  // Émotion par défaut
    breathIntensity: 0.2  // Intensité des respirations (si supporté)
  },
  bob: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 1.1,  // Légèrement ajusté pour un débit plus naturel
    pitch: 1.4,  // Légèrement ajusté pour une meilleure intonation
    emotion: 'neutral',  // Émotion par défaut
    breathIntensity: 0.3  // Intensité des respirations (si supporté)
  },
  michel: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 0.9,  // Débit légèrement plus lent
    pitch: 0.8,  // Voix plus grave
    emotion: 'neutral',
    breathIntensity: 0.25
  },
  sophie: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 1.0,  // Débit normal
    pitch: 1.2,  // Voix légèrement plus aiguë
    emotion: 'neutral',
    breathIntensity: 0.2
  },
  rapide: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 1.3,  // Débit très rapide
    pitch: 1.1,  // Hauteur légèrement plus élevée
    emotion: 'neutral',
    breathIntensity: 0.15
  },
  robot: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 1.0,  // Débit normal
    pitch: 0.5,  // Voix très grave pour effet robotique
    emotion: 'neutral',
    breathIntensity: 0.1  // Peu de respirations pour effet mécanique
  },
  
  // Voix multilingues avec le modèle XTTS-v2
  // Pour utiliser ces voix, vous devez installer le modèle XTTS-v2 avec:
  // pip install TTS
  // puis télécharger le modèle avec:
  // tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 --list_models
  
  // Voix personnalisée avec clonage de voix
  // Pour utiliser cette voix, vous devez enregistrer un fichier audio de votre voix
  // et le placer dans le dossier 'ttsmodel' avec le nom 'ma_voix.wav'
  mavoix: {
    model: 'tts_models/multilingual/multi-dataset/xtts_v2',
    speaker_wav: path.join(__dirname, 'ttsmodel', 'ma_voix.wav'),
    language: 'fr',  // Langue par défaut (français)
    speed: 1.0,
    pitch: 1.0,
    emotion: 'neutral'
  }
  // Les voix non françaises ont été supprimées
};

const gttsVoices = {
  shrek: 'fr',
  bob: 'fr',
  patrick: 'fr'
};

// === Serveur Web ===
const app = express();
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// === Connexion Twitch ===
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: CHANNEL_NAME,
    password: `oauth:${process.env.TWITCH_OAUTH_TOKEN}`
  },
  connection: { reconnect: true, secure: true },
  channels: [CHANNEL_NAME]
});

client.connect().catch(console.error);

// === Gestion des messages ===
client.on('message', async (channel, tags, message, self) => {
  if (self || !message.startsWith('!tts ')) return;

  const args = message.trim().split(' ');
  const voiceName = args[1]?.toLowerCase();
  const text = args.slice(2).join(' ');

  // Commande pour expliquer comment créer sa propre voix
  if (voiceName === 'creer' || voiceName === 'créer') {
    await client.say(channel, `@${tags.username} Pour créer votre propre voix, enregistrez un fichier audio de 6 secondes minimum avec votre voix, nommez-le 'ma_voix.wav' et placez-le dans le dossier 'ttsmodel'. Ensuite, utilisez la commande !tts mavoix <message> pour parler avec votre voix.`);
    return;
  }
  
  // Commande pour changer la langue de la voix clonée (uniquement français)
  if (voiceName === 'langue' || voiceName === 'language') {
    const language = args[2]?.toLowerCase();
    const validLanguages = ['fr']; // Uniquement français
    
    if (!language || !validLanguages.includes(language)) {
      await client.say(channel, `@${tags.username} Seule la langue française (fr) est disponible.`);
      return;
    }
    
    // Mettre à jour la langue de la voix clonée
    if (coquiVoices.mavoix) {
      coquiVoices.mavoix.language = language;
      await client.say(channel, `@${tags.username} La langue de votre voix clonée a été confirmée en français.`);
    } else {
      await client.say(channel, `@${tags.username} Erreur : La voix clonée n'est pas configurée.`);
    }
    return;
  }
  
  // Commande pour changer le fichier audio utilisé pour le clonage de voix
  if (voiceName === 'fichier' || voiceName === 'file') {
    const fileName = args[2];
    
    if (!fileName) {
      await client.say(channel, `@${tags.username} Veuillez spécifier un nom de fichier audio dans le dossier 'ttsmodel' (sans l'extension .wav).`);
      return;
    }
    
    const filePath = path.join(__dirname, 'ttsmodel', `${fileName}.wav`);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      await client.say(channel, `@${tags.username} Erreur : Le fichier '${fileName}.wav' n'existe pas dans le dossier 'ttsmodel'.`);
      return;
    }
    
    // Mettre à jour le fichier audio de la voix clonée
    if (coquiVoices.mavoix) {
      coquiVoices.mavoix.speaker_wav = filePath;
      await client.say(channel, `@${tags.username} Le fichier audio pour le clonage de voix a été changé pour : ${fileName}.wav`);
    } else {
      await client.say(channel, `@${tags.username} Erreur : La voix clonée n'est pas configurée.`);
    }
    return;
  }
  
  // Commande pour lister toutes les voix disponibles
  if (voiceName === 'liste' || voiceName === 'list') {
    const allVoices = [...Object.keys(voices), ...Object.keys(coquiVoices), ...Object.keys(gttsVoices)];
    await client.say(channel, `@${tags.username} Voix disponibles : ${allVoices.join(', ')}`);
    
    // Afficher des informations sur la voix clonée si elle est configurée
    if (coquiVoices.mavoix) {
      const cloneInfo = `Voix clonée 'mavoix' configurée avec la langue '${coquiVoices.mavoix.language}' et le fichier '${path.basename(coquiVoices.mavoix.speaker_wav)}'`;
      await client.say(channel, `@${tags.username} ${cloneInfo}`);
    }
    return;
  }

  if (!voiceName || !text) {
    await client.say(channel, `@${tags.username} Utilisation : !tts <voix> <message> | !tts liste (pour voir toutes les voix) | !tts créer (pour créer votre propre voix) | !tts langue fr (pour confirmer la langue française) | !tts fichier <nom> (pour changer le fichier audio)`);
    return;
  }

  const messageInfo = {
    username: tags.username,
    message: text,
    voice: voiceName,
    timestamp: Date.now(),
    status: 'pending'
  };

  fs.writeFileSync(path.join(__dirname, 'public', 'current_message.json'), JSON.stringify(messageInfo));

  try {
    if (voices[voiceName]) {
      await generateTTS(text, voices[voiceName], tags.username, channel, messageInfo);
    } else if (coquiVoices[voiceName]) {
      try {
        await generateCoquiTTS(text, coquiVoices[voiceName], tags.username, channel, messageInfo);
      } catch (coquiError) {
        console.error('❌ Erreur Coqui TTS:', coquiError);
        // Essayer de générer avec Google TTS comme fallback
        console.log('⚠️ Tentative de fallback vers Google TTS...');
        try {
          await generateGoogleTTS(text, { lang: 'fr' }, tags.username, channel, messageInfo); // Utiliser français par défaut
          await client.say(channel, `@${tags.username} Voix Coqui indisponible, utilisation de Google TTS à la place.`);
        } catch (fallbackError) {
          console.error('❌ Erreur fallback Google TTS:', fallbackError);
          // Mettre à jour le statut à ready même en cas d'erreur pour éviter le blocage de l'interface
          messageInfo.status = 'ready';
          fs.writeFileSync(path.join(__dirname, 'public', 'current_message.json'), JSON.stringify(messageInfo));
          await client.say(channel, `@${tags.username} Une erreur est survenue lors de la génération TTS.`);
        }
      }
    } else if (gttsVoices[voiceName]) {
      await generateGoogleTTS(text, gttsVoices[voiceName], tags.username, channel, messageInfo);
    } else {
      await client.say(channel, `@${tags.username} Voix inconnue. Utilise : ${[...Object.keys(voices), ...Object.keys(coquiVoices), ...Object.keys(gttsVoices)].join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Erreur TTS:', error);
    // Mettre à jour le statut à ready même en cas d'erreur pour éviter le blocage de l'interface
    messageInfo.status = 'ready';
    fs.writeFileSync(path.join(__dirname, 'public', 'current_message.json'), JSON.stringify(messageInfo));
  }
});

// === Fonctions TTS ===

// Fonction pour ajouter des pauses naturelles et des variations d'intonation au texte
function addNaturalBreaths(text) {
  // Ajouter des pauses et des variations d'intonation après la ponctuation
  let processedText = text;
  
  // Remplacer les points par une pause longue avec baisse d'intonation
  // Le point indique une fin de phrase, donc on baisse l'intonation puis on fait une pause
  processedText = processedText.replace(/\. /g, '. ... ');
  
  // Remplacer les virgules par une pause courte avec légère montée d'intonation
  // La virgule indique souvent une continuation, donc on monte légèrement l'intonation
  processedText = processedText.replace(/\, /g, ', .. ');
  
  // Remplacer les points d'exclamation par une pause longue avec forte variation d'intonation
  processedText = processedText.replace(/\! /g, '! ... ');
  
  // Remplacer les points d'interrogation par une pause longue avec montée d'intonation
  processedText = processedText.replace(/\? /g, '? ... ');
  
  // Ajouter des pauses pour les phrases longues (après environ 8-10 mots)
  const words = processedText.split(' ');
  if (words.length > 10) {
    // Insérer des respirations tous les ~8 mots si pas déjà de ponctuation
    let result = [];
    for (let i = 0; i < words.length; i++) {
      result.push(words[i]);
      if (i % 8 === 7 && !words[i].match(/[,.!?]$/)) {
        // Ajouter une légère pause pour simuler une respiration
        result.push('...');
      }
    }
    processedText = result.join(' ');
  }
  
  // Ajouter des variations subtiles d'intonation pour certains mots importants
  // Mettre en majuscule certains mots pour accentuer (fonctionne avec certains TTS)
  const emphasisWords = ['très', 'beaucoup', 'jamais', 'toujours', 'important', 'incroyable', 'énorme'];
  
  emphasisWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    processedText = processedText.replace(regex, match => {
      // 30% de chance de mettre l'emphase sur ce mot
      return Math.random() < 0.3 ? match.toUpperCase() : match;
    });
  });
  
  return processedText;
}

async function generateTTS(text, config, username, channel, messageInfoParam) {
  // Ajouter des pauses naturelles au texte
  const textWithBreaths = addNaturalBreaths(text);
  
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.voice_id}`;
  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': config.api_key
  };
  
  const body = {
    text: textWithBreaths,
    model_id: config.model_id || 'eleven_monolingual_v1',
    voice_settings: {
      stability: config.stability || 0.5,
      similarity_boost: config.similarity_boost || 0.75
    }
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!res.ok) throw new Error(await res.text());

  const buffer = await res.arrayBuffer();
  const tempPath = saveBufferAsFile(buffer, 'mp3');
  
  // Récupérer les données du message actuel si messageInfoParam n'est pas fourni
  let messageInfo = messageInfoParam;
  if (!messageInfo) {
    const messagePath = path.join(__dirname, 'public', 'current_message.json');
    try {
      if (fs.existsSync(messagePath)) {
        messageInfo = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du message:', error);
      messageInfo = { timestamp: Date.now() };
    }
  }
  
  finalizeAudioFile(tempPath, messageInfo);
}

async function generateGoogleTTS(text, langParam, username, channel, messageInfoParam) {
  // Ajouter des pauses naturelles au texte
  const textWithBreaths = addNaturalBreaths(text);
  
  // Vérifier si langParam est un objet ou une chaîne
  const lang = typeof langParam === 'object' ? langParam.lang : langParam;
  
  if (!lang || typeof lang !== 'string') {
    throw new Error('Paramètre de langue invalide pour Google TTS');
  }
  
  return new Promise((resolve, reject) => {
    const ttsInstance = gtts(lang);
    const tempPath = generateTempFilePath('mp3');

    // Récupérer les données du message actuel si messageInfoParam n'est pas fourni
    let messageInfo = messageInfoParam;
    if (!messageInfo) {
      const messagePath = path.join(__dirname, 'public', 'current_message.json');
      try {
        if (fs.existsSync(messagePath)) {
          messageInfo = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
        }
      } catch (error) {
        console.error('❌ Erreur lors de la lecture du message:', error);
        messageInfo = { timestamp: Date.now() };
      }
    }

    ttsInstance.save(tempPath, textWithBreaths, (err) => {
      if (err) return reject(err);
      finalizeAudioFile(tempPath, messageInfo);
      resolve();
    });
  });
}

async function generateCoquiTTS(text, config, username, channel, messageInfoParam) {
  // Ajouter des pauses naturelles au texte
  const textWithBreaths = addNaturalBreaths(text);
  
  const tempPath = generateTempFilePath('wav');
  // Utiliser le chemin complet vers l'exécutable tts dans l'environnement virtuel
  const ttsPath = path.join(__dirname, '.venv', 'Scripts', 'tts.exe');
  
  // Construction de la commande avec les paramètres supportés uniquement
  let command = `"${ttsPath}" --text "${textWithBreaths}" --model_name "${config.model}" --out_path "${tempPath}"`;
  
  // Ajouter uniquement les paramètres supportés
  // Utiliser --speaker_name au lieu de --speaker_idx pour éviter l'erreur KeyError: '0'
  if (config.speaker_idx !== undefined) {
    // Convertir l'index en chaîne de caractères pour l'utiliser comme nom
    const speakerName = String(config.speaker_idx);
    command += ` --speaker_name "${speakerName}"`;
  }
  
  // Ajouter le paramètre de langue si spécifié (pour les modèles multilingues)
  if (config.language) {
    command += ` --language "${config.language}"`;
  }
  
  // Ajouter le paramètre speaker_wav pour le clonage de voix si spécifié
  if (config.speaker_wav) {
    command += ` --speaker_wav "${config.speaker_wav}"`;
  }
  
  // Les paramètres speed et pitch ne sont pas supportés par cette version de Coqui TTS
  // Ils sont donc commentés pour éviter les erreurs
  // if (config.speed !== undefined) command += ` --speed ${config.speed}`;
  // if (config.pitch !== undefined) command += ` --pitch ${config.pitch}`;
  
  // Ajouter des paramètres supplémentaires via des variables d'environnement ou des arguments
  // Ces paramètres peuvent ne pas être directement supportés par la commande tts.exe,
  // mais sont inclus pour une future compatibilité ou pour des modèles spécifiques
  if (config.emotion) {
    console.log(`Info: Émotion demandée: ${config.emotion} (peut ne pas être supportée par tous les modèles)`);
  }
  
  if (config.breathIntensity) {
    console.log(`Info: Intensité de respiration demandée: ${config.breathIntensity} (peut ne pas être supportée par tous les modèles)`);
  }

  console.log(`Exécution de la commande: ${command}`);
  
  // Vérifier si le fichier tts.exe existe
  if (!fs.existsSync(ttsPath)) {
    console.error(`❌ Erreur: Le fichier tts.exe n'existe pas à l'emplacement ${ttsPath}`);
    console.error('Veuillez installer TTS dans l\'environnement virtuel avec la commande: .venv\\Scripts\\pip.exe install TTS');
    throw new Error(`Le fichier tts.exe n'existe pas à l'emplacement ${ttsPath}. Veuillez installer TTS.`);
  }

  // Récupérer les données du message actuel si messageInfoParam n'est pas fourni
  let messageInfo = messageInfoParam;
  if (!messageInfo) {
    const messagePath = path.join(__dirname, 'public', 'current_message.json');
    try {
      if (fs.existsSync(messagePath)) {
        messageInfo = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du message:', error);
      messageInfo = { timestamp: Date.now() };
    }
  }

  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la commande TTS:', err);
        return reject(err);
      }
      finalizeAudioFile(tempPath, messageInfo);
      resolve();
    });
  });
}

// === Outils ===

function generateTempFilePath(extension) {
  const timestamp = Date.now();
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  return path.join(publicDir, `audio_${timestamp}.${extension}`);
}

function finalizeAudioFile(tempFilePath, messageInfo) {
    try {
        // Utiliser directement audio.mp3 sans créer de fichier unique avec timestamp
        const standardAudioPath = path.join(__dirname, 'public', 'audio.mp3');
        
        // Vérifier si le fichier temporaire existe
        if (!fs.existsSync(tempFilePath)) {
            console.error(`Le fichier temporaire n'existe pas: ${tempFilePath}`);
            return false;
        }
        
        // Supprimer l'ancien fichier audio.mp3 s'il existe
        if (fs.existsSync(standardAudioPath)) {
            try {
                fs.unlinkSync(standardAudioPath);
                console.log('Ancien fichier audio.mp3 supprimé');
            } catch (unlinkError) {
                console.error('Erreur lors de la suppression de l\'ancien audio.mp3:', unlinkError);
            }
        }
        
        // Renommer directement le fichier temporaire en audio.mp3
        fs.renameSync(tempFilePath, standardAudioPath);
        console.log('Fichier audio renommé en audio.mp3')
        
        // Obtenir la taille du fichier
        const stats = fs.statSync(standardAudioPath);
        const fileSizeInBytes = stats.size;
        console.log(`Taille du fichier audio: ${fileSizeInBytes} octets`);
        
        // Mettre à jour le statut du message
        const messageJsonPath = path.join(__dirname, 'public', 'current_message.json');
        if (fs.existsSync(messageJsonPath)) {
            const currentMessageData = JSON.parse(fs.readFileSync(messageJsonPath, 'utf8'));
            currentMessageData.status = 'ready';
            currentMessageData.audioFile = 'audio.mp3'; // Utiliser toujours audio.mp3
            fs.writeFileSync(messageJsonPath, JSON.stringify(currentMessageData, null, 2));
            console.log('Statut du message mis à jour: ready');
        }
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la finalisation du fichier audio:', error);
        return false;
    }
}

function saveBufferAsFile(buffer, extension) {
  const tempPath = generateTempFilePath(extension);
  fs.writeFileSync(tempPath, Buffer.from(buffer));
  return tempPath;
}

// Fin du fichier

// Fin du fichier
