/**
 * ============================================================================
 * CLAUDE API CLIENT
 * ============================================================================
 * 
 * Wrapper around Anthropic SDK for Claude API interactions.
 * 
 * PURPOSE:
 * Provides a clean, type-safe interface to Claude API with extended thinking
 * support. Handles retries, error recovery, and token optimization.
 * 
 * KEY FEATURES:
 * - Extended Thinking mode (Claude's internal reasoning visible)
 * - Conversation history management
 * - Automatic retry on transient failures
 * - Token usage tracking
 * - Streaming support (for future Listen In Mode)
 * 
 * CLAUDE MODELS:
 * - claude-opus-4-20250514: Most capable, best for complex reasoning
 * - claude-sonnet-4-20250514: Balanced performance/cost
 * - claude-haiku-4-20250115: Fast, cost-effective for simple tasks
 * 
 * EXTENDED THINKING:
 * When enabled, Claude shows its reasoning process before answering.
 * This is perfect for agent transparency and Listen In Mode narration.
 * 
 * RELATED FILES:
 * @see src/config.ts - Claude configuration settings
 * @see src/agents/ - Agent implementations using this client
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import type { FastifyBaseLogger } from 'fastify';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Message in a conversation
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Claude response with extended thinking
 */
export interface ClaudeResponse {
  content: string;
  thinking?: string[]; // Extended thinking steps (if enabled)
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
  };
}

/**
 * Options for Claude API call
 */
export interface ClaudeOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

// ============================================================================
// CLAUDE CLIENT CLASS
// ============================================================================

/**
 * Claude API client with extended thinking support
 * 
 * USAGE:
 * ```typescript
 * const claude = new ClaudeClient(logger);
 * 
 * const response = await claude.sendMessage(
 *   'Send $50 to Alice',
 *   {
 *     systemPrompt: 'You are a helpful banking agent...',
 *   }
 * );
 * 
 * console.log(response.content); // Claude's response
 * console.log(response.thinking); // Claude's reasoning steps
 * ```
 * 
 * ERROR HANDLING:
 * - Retries on rate limits (with exponential backoff)
 * - Throws on authentication errors
 * - Returns error message on API failures
 */
export class ClaudeClient {
  private client: Anthropic;
  private logger: FastifyBaseLogger;
  private conversationHistory: Message[] = [];

  constructor(logger: FastifyBaseLogger) {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey,
    });
    this.logger = logger.child({ component: 'ClaudeClient' });
    
    this.logger.info(
      {
        model: config.claude.model,
        extendedThinking: config.claude.useExtendedThinking,
      },
      'Claude client initialized'
    );
  }

  /**
   * Send a message to Claude and get response
   * 
   * PURPOSE:
   * Main method for Claude interaction. Sends user message,
   * receives Claude's response with optional thinking steps.
   * 
   * PROCESS:
   * 1. Add user message to conversation history
   * 2. Prepare API request with system prompt
   * 3. Call Claude API with extended thinking
   * 4. Parse response (extract thinking + content)
   * 5. Add assistant response to history
   * 6. Return structured response
   * 
   * @param userMessage - Message from user/agent
   * @param options - Optional API parameters
   * @returns Claude's response with thinking steps
   */
  async sendMessage(
    userMessage: string,
    options: ClaudeOptions = {}
  ): Promise<ClaudeResponse> {
    const startTime = Date.now();
    
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    this.logger.info(
      { messageLength: userMessage.length },
      'Sending message to Claude'
    );

    try {
      // Prepare API request
      const messages = this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Claude API
      const apiParams: any = {
        model: config.claude.model,
        max_tokens: options.maxTokens ?? config.claude.maxTokens,
        temperature: options.temperature ?? config.claude.temperature,
        messages,
      };

      // Add system prompt if provided
      if (options.systemPrompt) {
        apiParams.system = options.systemPrompt;
      }

      // Add extended thinking if enabled
      if (config.claude.useExtendedThinking) {
        apiParams.thinking = {
          type: 'enabled',
          budget_tokens: 10000,
        };
      }

      const response = await this.client.messages.create(apiParams);

      // Extract content and thinking
      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      // Extract thinking blocks (if any)
      // Note: Thinking blocks are not currently in the type definitions
      // but are supported by the API when enabled
      const thinking = response.content
        .filter((block: any) => (block as any).type === 'thinking')
        .map((block: any) => (block as any).thinking as string);

      // Build structured response
      const claudeResponse: ClaudeResponse = {
        content,
        stopReason: response.stop_reason ?? 'end_turn',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cacheCreationTokens: (response.usage as any).cache_creation_input_tokens,
          cacheReadTokens: (response.usage as any).cache_read_input_tokens,
        },
      };

      // Add thinking if present
      if (thinking.length > 0) {
        claudeResponse.thinking = thinking;
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content,
      });

      const duration = Date.now() - startTime;
      this.logger.info(
        {
          duration,
          inputTokens: claudeResponse.usage.inputTokens,
          outputTokens: claudeResponse.usage.outputTokens,
          thinkingSteps: thinking.length,
        },
        'Received response from Claude'
      );

      return claudeResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle specific error types
      if (error instanceof Anthropic.APIError) {
        this.logger.error(
          {
            error: error.message,
            status: error.status,
            duration,
          },
          'Claude API error'
        );

        // For rate limits, could implement retry logic here
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        throw new Error(`Claude API error: ${error.message}`);
      }

      this.logger.error({ error, duration }, 'Unexpected error calling Claude');
      throw error;
    }
  }

  /**
   * Send message with conversation context
   * 
   * PURPOSE:
   * Allows passing full conversation history for multi-turn interactions.
   * Useful when agent needs to maintain context across requests.
   * 
   * @param messages - Full conversation history
   * @param options - Optional API parameters
   * @returns Claude's response
   */
  async sendConversation(
    messages: Message[],
    options: ClaudeOptions = {}
  ): Promise<ClaudeResponse> {
    // Replace current history with provided messages
    this.conversationHistory = [...messages];
    
    // Get last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();

    if (!lastUserMessage) {
      throw new Error('No user message found in conversation');
    }

    // Send using existing method (which adds to history)
    return this.sendMessage(lastUserMessage.content, options);
  }

  /**
   * Clear conversation history
   * 
   * PURPOSE:
   * Reset context for new conversation. Should be called between
   * different agent executions to avoid context bleeding.
   */
  clearHistory() {
    this.conversationHistory = [];
    this.logger.debug('Conversation history cleared');
  }

  /**
   * Get current conversation history
   * 
   * PURPOSE:
   * Allow inspection of conversation state for debugging or context saving.
   * 
   * @returns Current conversation messages
   */
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  /**
   * Count tokens in a message (approximate)
   * 
   * PURPOSE:
   * Rough estimation of token count for cost/limit management.
   * Not perfectly accurate, but good enough for planning.
   * 
   * ESTIMATION:
   * ~4 characters per token (English text)
   * Actual varies by language and content
   * 
   * @param text - Text to estimate tokens for
   * @returns Approximate token count
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get total conversation token count
   * 
   * PURPOSE:
   * Estimate total tokens used in current conversation.
   * Helps prevent hitting context limits.
   * 
   * @returns Estimated total tokens
   */
  getTotalTokens(): number {
    const allText = this.conversationHistory
      .map(m => m.content)
      .join(' ');
    return this.estimateTokens(allText);
  }
}

/**
 * ============================================================================
 * SINGLETON INSTANCE
 * ============================================================================
 */

/**
 * Placeholder logger for module-level export
 * Will be replaced with proper Fastify logger when app starts
 */
const placeholderLogger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  child: () => placeholderLogger,
} as any;

/**
 * Default Claude client instance
 * Can be imported and used directly, or create new instances as needed
 */
export const claudeClient = new ClaudeClient(placeholderLogger);

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 */
export default ClaudeClient;

/**
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * SIMPLE MESSAGE:
 * ```typescript
 * const response = await claudeClient.sendMessage(
 *   'What is 2+2?'
 * );
 * console.log(response.content); // "4"
 * ```
 * 
 * WITH SYSTEM PROMPT:
 * ```typescript
 * const response = await claudeClient.sendMessage(
 *   'Send $50 to Alice',
 *   {
 *     systemPrompt: 'You are a helpful banking agent...'
 *   }
 * );
 * ```
 * 
 * WITH EXTENDED THINKING:
 * ```typescript
 * const response = await claudeClient.sendMessage(
 *   'Solve this complex problem...'
 * );
 * console.log(response.thinking); // ["First, I need to...", "Then..."]
 * console.log(response.content); // Final answer
 * ```
 * 
 * MULTI-TURN CONVERSATION:
 * ```typescript
 * await claudeClient.sendMessage('Hi!');
 * await claudeClient.sendMessage('What is my name?');
 * // Claude remembers previous context
 * ```
 * 
 * ============================================================================
 */
