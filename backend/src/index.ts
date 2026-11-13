import { createApp } from './app.js';

// Temporary: replaced by validated config (config.ts) in the next checklist item.
const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
