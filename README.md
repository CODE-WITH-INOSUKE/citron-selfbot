# CITRON-S3LFBOT

>⚠️ Warning: Using selfbots violates Discord's Terms of Service and can result in account termination. Use at your own risk.

**INSTALLATION GUIDE**

**NOTE: DOSENT WORK IN TERMUX**
**USE THIS INSTEAD [LITE VERSION](https://github.com/CODE-WITH-INOSUKE/citron-lite.git)**

To install first clone this repository or donload it as zip

```
git clone https://github.com/CODE-WITH-INOSUKE/citron-selfbot.git
```
Then install packages
```
npm install
```
> Now fill the config.json.

```json
{
    "token": "your token here",
    "prefix": "!",
    "allowedUserIds": ["primary user", "secondary user"],
    "port": 3000
}
```
> **NOTE**: *The primary user should be non bot account and the secondary user should be a bot account*

> **Note that change the port according to your servers port if hosting on pterodactyl panel**

This bot also comes with ai functionality for which you need api keys from there respective providers.

| API  | Description |
| ----------- | ----------- |
| GROQ   | For text based response. |
| GEMINI | Image reasoning |
| NVIDIA | Fallback if groq has errors |
| SHAPES | Required for generating images and using !imagine command |

THis bot comes with built-in dashboard

![image](https://cdn.discordapp.com/attachments/1395648220188770345/1404077978391937159/Screenshot_2025-08-10_175424.png?ex=6899e104&is=68988f84&hm=530a503ff881ce2c4d2302423588f121a25692c9fff4f921579f8478d4dc457e&)

> Fill the ai-config.json

```json
{
  "groq": {
    "apiKey": "",
    "model": "llama3-70b-8192"
  },
  "gemini": {
    "apiKey": "",
    "model": "gemini-1.5-flash"
  },
  "shapes": {
    "apiKey": "",
    "model": "{create your own at shape.inc}"
  },
  "nvidia": {
    "apiKey": "",
    "model": "meta/llama-4-maverick-17b-128e-instruct",
    "invokeUrl": "https://integrate.api.nvidia.com/v1/chat/completions"
  }
}
```
|Model|Their api key|
|------|------|
|Nvidia| https://build.nvidia.com|
|Groq| https://groq.com/|
|shapes| https://shapes.inc/ |
|Gemini| https://aistudio.google.com/ |

**This bot comes with 55+ commands also supports music playback in vc**

**NOTE**: FOR MUSIC YOU NEED TO USE SECOND ACCOUNT. PUT THE MAIN ACCOUNT USER ID FIRST ``non bot account`` THEN THE SECOND ``bot account`` WHICH WILL CONNECT TO VC TO PLAY AUDIO.

**TO START BOT**
```
node index.js
```
Or
```
node .
```
Or 
```
npm start
```
Can use any one of the following command to start the bot


# ✅ Legal & Safety
⚠️ Warning: Selfbots are against Discord's rules – accounts using selfbots may be disabled. This project is for educational purposes only.
