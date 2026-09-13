/**
 * AXON Knowledge & System Identity Engine
 */

export interface SelfKnowledgeCheckResult {
  matches: boolean;
  response: string;
}

export interface AccountSwitchCheckResult {
  isSwitchCommand: boolean;
  targetAccountLabel?: string;
}

/**
 * Detects if the user query is asking about AXON's identity, capabilities, or self-knowledge.
 */
export function detectSelfKnowledgeQuery(text: string): SelfKnowledgeCheckResult {
  const clean = text.trim().toLowerCase();

  const isSelfQuery =
    clean === 'who are you' ||
    clean === 'who are you?' ||
    clean === 'what are you' ||
    clean === 'what are you?' ||
    clean === 'what can you do' ||
    clean === 'what can you do?' ||
    clean === 'describe yourself' ||
    clean === 'tell me about yourself' ||
    clean === 'what is axon' ||
    clean === 'what is axon?' ||
    clean === 'what features do you have' ||
    clean === 'what tools do you have';

  if (!isSelfQuery) {
    return { matches: false, response: '' };
  }

  const response = `I am **AXON**, your intelligent on-device smartphone workspace and neural copilot.

Here is what I can do:
1. **Interactive Workspace Code**: Live JavaScript, HTML/Web, and JSON sandbox with automatic execution and PyDroid-3 style traceback diagnostics.
2. **Built-in Offline Tools**:
   - **Text Tools**: Word counter, stylish typography, deduplication, and case transformations.
   - **Calculation & Units**: Keypad calculator with memory history and physical unit converters.
   - **Color Tools**: Spectrum inspector and harmonic palette generator.
   - **Image Utilities**: Format converter (PNG/JPG/WEBP), space saver compression, and blur filters.
   - **File Conversions**: Image/Text to PDF export and CSV ⇄ JSON formatters.
   - **Speech-Rate Analysis**: Acoustic cadence, speaking velocity (WPM), and pacing diagnostics.
   - **Offline Bible**: Zero-network scriptures, full-text search, and bookmarking.
3. **Storage & Manifest**: Dynamic device-aware budgeting, lossless quality preservation, and asset trim planning.
4. **Automation & Run Code**: Event triggers, automatic connection retries, and slash commands.
5. **Project Memory & Timeline**: Threaded project workspaces, note extraction, and executive summaries.

How can I assist you with your work today?`;

  return { matches: true, response };
}

/**
 * Detects if the user prompt is a command to switch or log into a specific AI account.
 */
export function detectAccountSwitchCommand(text: string): AccountSwitchCheckResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const switchRegexes = [
    /(?:switch|change)\s+(?:to\s+)?(?:account\s+)?["']?([^"'\n]+)["']?$/i,
    /(?:log\s*in|login)\s+(?:to|into)\s+(?:account\s+)?["']?([^"'\n]+)["']?$/i,
    /(?:use|select)\s+account\s+["']?([^"'\n]+)["']?$/i,
  ];

  for (const regex of switchRegexes) {
    const match = clean.match(regex);
    if (match && match[1]) {
      const label = match[1].trim().replace(/^["']|["']$/g, '');
      if (label && !['to', 'a', 'the', 'my'].includes(label.toLowerCase())) {
        return { isSwitchCommand: true, targetAccountLabel: label };
      }
    }
  }

  return { isSwitchCommand: false };
}

/**
 * Builds the comprehensive AXON system instruction prompt.
 */
export function buildAxonSystemInstruction(options: Record<string, any> = {}): string {
  return `You are AXON, the state-of-the-art neural assistant and mobile productivity workspace.
You communicate clearly, concisely, and execute code and technical requests with pristine craftsmanship.
When asked for code, provide clean, modern, well-formatted code blocks.`;
}
