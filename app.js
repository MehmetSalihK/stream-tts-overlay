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

  if (!voiceName || !text) {
    await client.say(channel, `@${tags.username} Utilisation : !tts <voix> <message>`);
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
      await generateTTS(text, voices[voiceName]);
      messageInfo.status = 'ready';
    } else if (coquiVoices[voiceName]) {
      await generateCoquiTTS(text, coquiVoices[voiceName]);
      messageInfo.status = 'ready';
    } else if (gttsVoices[voiceName]) {
      await generateGoogleTTS(text, gttsVoices[voiceName]);
      messageInfo.status = 'ready';
    } else {
      await client.say(channel, `@${tags.username} Voix inconnue. Utilise : ${[...Object.keys(voices), ...Object.keys(coquiVoices), ...Object.keys(gttsVoices)].join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Erreur TTS:', error);
    await client.say(channel, `@${tags.username} Une erreur est survenue.`);
  }
});

// === Fonctions TTS ===

async function generateTTS(text, voiceId) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8
      }
    })
  });

  if (!res.ok) throw new Error(await res.text());

  const buffer = await res.arrayBuffer();
  const tempPath = saveBufferAsFile(buffer, 'mp3');
  finalizeAudioFile(tempPath);
}

async function generateGoogleTTS(text, lang) {
  return new Promise((resolve, reject) => {
    const ttsInstance = gtts(lang);
    const tempPath = generateTempFilePath('mp3');

    ttsInstance.save(tempPath, text, (err) => {
      if (err) return reject(err);
      finalizeAudioFile(tempPath);
      resolve();
    });
  });
}

async function generateCoquiTTS(text, config) {
  const tempPath = generateTempFilePath('wav');
  const command = `tts --text "${text}" --model_name "${config.model}" --out_path "${tempPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) return reject(err);
      finalizeAudioFile(tempPath);
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

function finalizeAudioFile(tempPath) {
  const finalPath = path.join(__dirname, 'public', 'audio.mp3');
  if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
  fs.renameSync(tempPath, finalPath);
  const stats = fs.statSync(finalPath);
  console.log(`✅ Fichier audio généré : ${finalPath}, taille : ${stats.size} octets`);
}

function saveBufferAsFile(buffer, extension) {
  const tempPath = generateTempFilePath(extension);
  fs.writeFileSync(tempPath, Buffer.from(buffer));
  return tempPath;
}
