import { configure } from "./interactions.js";

const apiKey = process.env.COMPOSABLE_PROMPT_API_KEY;

if (!apiKey) {
  throw new Error("COMPOSABLE_PROMPT_API_KEY environment variable must be set");
}

configure({
  apikey: apiKey,
});
