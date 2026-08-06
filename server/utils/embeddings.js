const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

async function getEmbedding(text){
  try{
    if(!text) return null;
    if (typeof fetch !== 'function') {
      console.error('embedding error: global fetch is not available in this Node runtime');
      return null;
    }
    // Ollama embeddings API (if available)
    const res = await fetch(`${OLLAMA_URL}/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_EMBEDDING_MODEL, prompt: text })
    });
    if(!res.ok) return null;
    const json = await res.json();
    return json?.embedding || json?.data?.[0]?.embedding || null;
  }catch(e){
    console.error('embedding error', e);
    return null;
  }
}

module.exports = { getEmbedding };
