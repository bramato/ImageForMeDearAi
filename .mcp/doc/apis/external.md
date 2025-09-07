# 🌐 External APIs - ImageForMeDearAi

## Provider APIs per Generazione Immagini

### 1. OpenAI DALL-E API
**Base URL:** https://api.openai.com/v1/
**Endpoint:** `/images/generations`
**Authentication:** Bearer token (API Key)

#### Capabilities:
- **Modelli:** DALL-E 3, DALL-E 2
- **Risoluzioni:** 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792
- **Formati:** PNG, base64
- **Rate Limits:** Vari tier based su piano

#### Request Format:
```json
{
  "model": "dall-e-3",
  "prompt": "text prompt",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard|hd",
  "response_format": "url|b64_json"
}
```

### 2. HuggingFace Inference API
**Base URL:** https://api-inference.huggingface.co/
**Endpoint:** `/models/{model-id}`
**Authentication:** Bearer token (API Key)

#### Popular Models:
- `runwayml/stable-diffusion-v1-5`
- `stabilityai/stable-diffusion-2-1`
- `CompVis/stable-diffusion-v1-4`

#### Request Format:
```json
{
  "inputs": "text prompt",
  "parameters": {
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "width": 512,
    "height": 512
  }
}
```

### 3. Stability AI API (Future)
**Base URL:** https://api.stability.ai/
**Models:** Stable Diffusion variants
**Authentication:** API Key header

## Rate Limiting Strategy
- **OpenAI:** Rispettare rate limits del tier
- **HuggingFace:** Cold start delays per modelli inattivi
- **Retry Logic:** Exponential backoff
- **Fallback:** Provider alternativo in caso di errori

## Error Handling
- **401 Unauthorized:** Chiave API invalida
- **429 Too Many Requests:** Rate limit exceeded
- **503 Service Unavailable:** Servizio temporaneamente non disponibile
- **Custom Errors:** Mapping per errori specifici provider

## Configuration Requirements
```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-... (optional)

# HuggingFace
HUGGINGFACE_API_KEY=hf_...

# General
DEFAULT_PROVIDER=openai
FALLBACK_PROVIDER=huggingface
REQUEST_TIMEOUT=30000
MAX_RETRIES=3
```