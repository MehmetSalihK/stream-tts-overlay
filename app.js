const express = require('express');
const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const gtts = require('node-gtts');
const { exec } = require('child_process'); // Ajout de l'import manquant

const CHANNEL_NAME = 'msketur60';
const ELEVENLABS_API_KEY = 'sk_fb4c284787cbebc89609047308235ddc70ee03e708f986b5';

// Voix disponibles ElevenLabs
const voices = {
  vieuxpere: 't4fHUMAMZxaaV2inHOnb',
  alimata: '4SFJvuIUvxaPLgk8FoK3',
};

// Voix Google TTS disponibles
const gttsVoices = {
  shrek: 'fr', // Voix française pour Shrek
  bob: 'fr', // Voix française pour Bob l'éponge
  patrick: 'fr', // Voix française pour Patrick
  // Vous pouvez ajouter d'autres personnages ici
};

const app = express();
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: CHANNEL_NAME,
    password: 'oauth:plz3eii9jwdsr1fb4f38z5gdntv4je' // Remplacez par votre token OAuth Twitch
  },
  connection: { 
    reconnect: true,
    secure: true
  },
  channels: [CHANNEL_NAME]
});

client.connect().catch(console.error);

// Configuration des voix Coqui TTS
const coquiVoices = {
  jamy: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 0.8,
    pitch: 1.0
  },
  bob: {
    model: 'tts_models/fr/css10/vits',
    speaker_idx: 0,
    speed: 1.2,
    pitch: 1.5
  }
};

// Modifier la partie du message handler
client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  const msg = message.trim();

  if (msg.startsWith('!tts ')) {
    try {
      const parts = msg.split(' ');
      if (parts.length < 3) {
        await client.say(channel, `@${tags.username} Usage : !tts <${Object.keys(voices).join('|')}|${Object.keys(coquiVoices).join('|')}> <message>`);
        return;
      }
      const voiceName = parts[1].toLowerCase();
      const text = parts.slice(2).join(' ');

      console.log(`Voix demandée: ${voiceName}, Texte: ${text}`);

      // Sauvegarder les informations du message dans un fichier JSON
      const messageInfo = {
        username: tags.username,
        message: text,
        voice: voiceName
      };
      fs.writeFileSync(path.join(__dirname, 'public', 'current_message.json'), JSON.stringify(messageInfo));

      if (voices[voiceName]) {
        await generateTTS(text, voices[voiceName]);
        await client.say(channel, `@${tags.username} Message TTS généré avec ElevenLabs`);
      } else if (coquiVoices[voiceName]) {
        await generateCoquiTTS(text, coquiVoices[voiceName]);
        await client.say(channel, `@${tags.username} Message TTS généré avec Coqui TTS`);
      } else {
        await client.say(channel, `@${tags.username} Voix inconnue. Voix disponibles : ${Object.keys(voices).concat(Object.keys(coquiVoices)).join(', ')}`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      try {
        await client.say(channel, `@${tags.username} Désolé, une erreur s'est produite lors de la génération du TTS.`);
      } catch (chatError) {
        console.error('Erreur lors de l\'envoi du message d\'erreur:', chatError);
      }
    }
  }
});

// Fonction pour générer le TTS avec Coqui
async function generateCoquiTTS(text, voiceConfig) {
  try {
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const timestamp = Date.now();
    const tempFilePath = path.join(publicDir, `audio_${timestamp}.wav`);
    const finalFilePath = path.join(publicDir, 'audio.mp3');

    let command = '';
    if (voiceConfig.speaker_wav) {
      // Commande pour XTTS avec clonage de voix
      command = `tts --text "${text}" --model_name "${voiceConfig.model}" --out_path "${tempFilePath}" --speaker_wav "${voiceConfig.speaker_wav}" --language_idx "${voiceConfig.language_idx}"`;
    } else {
      // Commande standard pour les autres modèles
      command = `tts --text "${text}" --model_name "${voiceConfig.model}" --out_path "${tempFilePath}"`;
    }
    
    console.log('Commande TTS exécutée:', command);

    return new Promise((resolve, reject) => {
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error('Erreur Coqui TTS:', error);
          reject(error);
          return;
        }

        try {
          // Convertir WAV en MP3 si nécessaire
          if (fs.existsSync(finalFilePath)) {
            fs.unlinkSync(finalFilePath);
          }
          fs.renameSync(tempFilePath, finalFilePath);
          resolve();
        } catch (renameError) {
          console.error('Erreur lors du renommage du fichier:', renameError);
          reject(renameError);
        }
      });
    });
  } catch (e) {
    console.error('Erreur TTS:', e);
  }
}

async function generateGoogleTTS(text, lang) {
  try {
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const timestamp = Date.now();
    const tempFilePath = path.join(publicDir, `audio_${timestamp}.mp3`);
    const finalFilePath = path.join(publicDir, 'audio.mp3');

    return new Promise((resolve, reject) => {
      // Créer une instance de gtts avec la langue spécifiée
      const tts = gtts('fr'); // Forcer la langue française
      
      // Générer l'audio avec le texte
      tts.save(tempFilePath, text, async (err) => {
        if (err) {
          console.error('Erreur Google TTS:', err);
          reject(err);
          return;
        }

        try {
          if (fs.existsSync(finalFilePath)) {
            fs.unlinkSync(finalFilePath);
          }
          fs.renameSync(tempFilePath, finalFilePath);
          resolve();
        } catch (renameError) {
          console.error('Erreur lors du renommage du fichier:', renameError);
          console.log(`Utilisation du fichier temporaire: ${tempFilePath}`);
          reject(renameError);
        }
      });
    });
  } catch (e) {
    console.error('Erreur TTS:', e);
  }
}

async function generateTTS(text, voiceId) {
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Erreur ElevenLabs:', err);
      return;
    }

    const buffer = await res.arrayBuffer();
    const publicDir = path.join(__dirname, 'public');
    
    // Ensure the public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Generate a unique filename based on timestamp
    const timestamp = Date.now();
    const tempFilePath = path.join(publicDir, `audio_${timestamp}.mp3`);
    const finalFilePath = path.join(publicDir, 'audio.mp3');
    
    // Write to a temporary file first
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));
    
    // Try to rename the temp file to the final filename
    try {
      // If the final file exists, try to delete it first
      if (fs.existsSync(finalFilePath)) {
        fs.unlinkSync(finalFilePath);
      }
      
      // Rename the temp file to the final filename
      fs.renameSync(tempFilePath, finalFilePath);
    } catch (renameError) {
      console.error('Erreur lors du renommage du fichier:', renameError);
      // If rename fails, keep using the temp file
      console.log(`Utilisation du fichier temporaire: ${tempFilePath}`);
    }
  } catch (e) {
    console.error('Erreur TTS:', e);
  }
}

async function generateLocalTTS(text, voiceConfig) {
  try {
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const timestamp = Date.now();
    const tempFilePath = path.join(publicDir, `audio_${timestamp}.mp3`);
    const finalFilePath = path.join(publicDir, 'audio.mp3');

    // Commande pour Mozilla TTS (à adapter selon votre installation)
    const command = `tts --text "${text}" --model_name "tts_models/${voiceConfig.model}" --out_path "${tempFilePath}"`;

    return new Promise((resolve, reject) => {
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error('Erreur TTS Local:', error);
          reject(error);
          return;
        }

        try {
          if (fs.existsSync(finalFilePath)) {
            fs.unlinkSync(finalFilePath);
          }
          fs.renameSync(tempFilePath, finalFilePath);
          resolve();
        } catch (renameError) {
          console.error('Erreur lors du renommage du fichier:', renameError);
          reject(renameError);
        }
      });
    });
  } catch (e) {
    console.error('Erreur TTS:', e);
  }
}