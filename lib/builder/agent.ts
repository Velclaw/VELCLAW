const modelName =
  clean(input.model, 120) ||
  clean(process.env.OPENAI_AGENTS_MODEL, 120) ||
  'gpt-4.1-mini'

if (!modelName || !/^[A-Za-z0-9._:-]+$/.test(modelName)) {
  throw new Error('OPENAI_AGENTS_MODEL is missing or invalid. Use a supported model name.')
}