import { HfInference } from '@huggingface/inference'

const HUGGING_FACE_TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN
const inference = new HfInference(HUGGING_FACE_TOKEN)

if (!HUGGING_FACE_TOKEN) {
  console.error('HUGGING_FACE_TOKEN is not set in environment variables')
}

export async function generateAIResponse(message, context = {}) {
  try {
    // Format context into a string
    const contextString = Object.entries(context)
      .filter(([ value]) => value)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`
        }
        return `${key}: ${JSON.stringify(value)}`
      })
      .join('\n')

    const response = await inference.textGeneration({
      model: 'facebook/blenderbot-400M-distill',
      inputs: `Context: You are a helpful AI assistant focused on providing informative and relevant responses.\n${contextString}\nQuestion: ${message}\nAnswer:`,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.8,
        top_p: 0.92,
        repetition_penalty: 1.1,
        do_sample: true,
        return_full_text: false,
        num_return_sequences: 1
      }
    })

    if (!response || (!response.generated_text && (!Array.isArray(response) || !response[0]?.generated_text))) {
      console.error('Invalid response format:', response)
      return 'I apologize, but I am unable to generate a response at this time.'
    }

    // Handle different response formats
    let generatedText = ''
    if (typeof response === 'object' && response.generated_text) {
      generatedText = response.generated_text
    } else if (Array.isArray(response) && response[0]?.generated_text) {
      generatedText = response[0].generated_text
    }

    const cleanedResponse = generatedText
      .replace(/^(Human:|Assistant:)\s*/gi, '')
      .replace(/\n+/g, ' ')
      .trim()

    return cleanedResponse || 'I apologize, but I am unable to generate a response at this time.'
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw new Error('Failed to generate AI response: ' + error.message)
  }
}