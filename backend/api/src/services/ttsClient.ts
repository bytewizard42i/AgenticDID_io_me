/**
 * ============================================================================
 * TTS (TEXT-TO-SPEECH) SERVICE CLIENT
 * ============================================================================
 * 
 * HTTP client for communicating with the TTS service.
 * 
 * The TTS service is responsible for:
 * - Converting agent reasoning steps to speech (Listen In Mode)
 * - Generating audio files from text
 * - Streaming audio in real-time
 * - Managing audio file storage and serving
 * 
 * KEY RESPONSIBILITIES:
 * - Request TTS generation for agent narration
 * - Handle text-to-speech conversion requests
 * - Retrieve audio URLs for playback
 * - Provide type-safe API for TTS operations
 * 
 * DATA FLOW:
 * ```
 * Agents Runtime
 *   → TTS Client.synthesizeSpeech()
 *     → HTTP POST to TTS Service
 *       → Service generates audio
 *         → Saves to storage
 *           → Returns URL
 *   ← Client returns audio URL
 * ← Frontend plays audio for user
 * ```
 * 
 * LISTEN IN MODE:
 * When enabled, the user hears the agent "thinking out loud" as it works.
 * This provides transparency and makes the AI interaction more engaging.
 * 
 * Example flow:
 * 1. Agent: "I need to send money to Alice"
 * 2. TTS: Converts to speech → audio1.mp3
 * 3. Agent: "Checking account balance..."
 * 4. TTS: Converts to speech → audio2.mp3
 * 5. Frontend plays audio1, then audio2 as agent works
 * 
 * TECHNOLOGY STACK:
 * - fetch API: Standard HTTP client
 * - ElevenLabs API: High-quality TTS (or alternative)
 * - zod: Response validation
 * - pino: Structured logging
 * 
 * RELATED FILES:
 * @see ../../../backend/tts/ - TTS service implementation (Phase 4)
 * @see src/routes/agents.ts - Triggers TTS during agent execution
 * @see src/config.ts - Provides TTS service URL
 * 
 * VOICE SELECTION:
 * Each agent can have a distinct voice for personality:
 * - Comet: Friendly, energetic voice
 * - Banker: Professional, calm voice
 * - Researcher: Clear, informative voice
 * 
 * FUTURE PHASES:
 * Phase 4 will implement the actual TTS service.
 * For now, this client is ready but Listen In Mode won't work until Phase 4.
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import { z } from 'zod';
import type { FastifyBaseLogger } from 'fastify';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Request to synthesize speech from text
 * 
 * FIELDS:
 * - text: The text to convert to speech
 * - voiceId: Which voice to use (maps to agent personality)
 * - agentId: Which agent is speaking (for voice selection)
 * - speed: Speaking speed (0.5 = slow, 1.0 = normal, 2.0 = fast)
 * - format: Audio format (mp3, wav, etc.)
 */
export interface SynthesizeSpeechRequest {
  text: string;
  voiceId?: string;
  agentId?: string;
  speed?: number;
  format?: 'mp3' | 'wav' | 'ogg';
}

/**
 * Response from TTS synthesis
 * 
 * FIELDS:
 * - audioUrl: URL where the generated audio can be accessed
 * - duration: Length of audio in seconds
 * - format: Audio format
 * - voiceId: Voice that was used
 */
export interface SynthesizeSpeechResponse {
  audioUrl: string;
  duration: number;
  format: string;
  voiceId: string;
}

/**
 * Health status of TTS service
 */
export interface TTSHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    ttsApi: boolean; // ElevenLabs or alternative TTS API
    storage: boolean; // Audio file storage
  };
  voicesAvailable: number;
}

/**
 * Available voice information
 */
export interface VoiceInfo {
  id: string;
  name: string;
  description: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  style?: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for validating TTS responses
 */
const synthesizeSpeechResponseSchema = z.object({
  audioUrl: z.string().url(),
  duration: z.number().positive(),
  format: z.string(),
  voiceId: z.string(),
});

const ttsHealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  timestamp: z.string(),
  checks: z.object({
    ttsApi: z.boolean(),
    storage: z.boolean(),
  }),
  voicesAvailable: z.number().nonnegative(),
});

const voiceInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  language: z.string(),
  gender: z.enum(['male', 'female', 'neutral']).optional(),
  style: z.string().optional(),
});

// ============================================================================
// CLIENT CLASS
// ============================================================================

/**
 * HTTP client for TTS service
 * 
 * USAGE:
 * ```typescript
 * const client = new TTSClient('http://tts:3003', logger);
 * 
 * // Generate speech for agent narration
 * const result = await client.synthesizeSpeech({
 *   text: 'I am analyzing the transaction now...',
 *   agentId: 'comet',
 *   speed: 1.0
 * });
 * 
 * console.log(result.audioUrl); // "http://tts/audio/abc123.mp3"
 * // Frontend can now play this audio
 * ```
 * 
 * ERROR HANDLING:
 * - Network errors: Throws with connection error
 * - Invalid text: Throws with validation error
 * - TTS API down: Throws error (Listen In Mode unavailable)
 * - Empty text: Returns immediately without calling service
 * 
 * PERFORMANCE:
 * TTS generation typically takes 1-3 seconds per sentence.
 * For long text, consider chunking into smaller pieces.
 */
export class TTSClient {
  private readonly baseUrl: string;
  private readonly logger: FastifyBaseLogger;
  private readonly timeout: number = 15000; // 15 seconds for TTS generation

  /**
   * Create a new TTS service client
   * 
   * @param baseUrl - Base URL of TTS service (e.g., 'http://tts:3003')
   * @param logger - Pino logger instance for structured logging
   */
  constructor(baseUrl: string, logger: FastifyBaseLogger) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.logger = logger.child({ component: 'TTSClient' });
    
    this.logger.info({ baseUrl: this.baseUrl }, 'TTS client initialized');
  }

  /**
   * Convert text to speech
   * 
   * PURPOSE:
   * Main method for TTS generation. Sends text to TTS service,
   * which generates audio and returns a URL for playback.
   * 
   * PROCESS:
   * 1. Validate request (text not empty, etc.)
   * 2. Make HTTP POST to /synthesize
   * 3. Wait for audio generation (1-3 seconds)
   * 4. Validate response structure
   * 5. Return audio URL and metadata
   * 
   * USE CASES:
   * - Listen In Mode: Agent narrates its reasoning
   * - Accessibility: Audio version of responses
   * - Notifications: Audio alerts for important events
   * 
   * @param request - Text and voice parameters
   * @returns Audio URL and metadata
   * @throws Error if synthesis fails
   */
  async synthesizeSpeech(
    request: SynthesizeSpeechRequest
  ): Promise<SynthesizeSpeechResponse> {
    const startTime = Date.now();
    
    // Validate input
    if (!request.text || request.text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Truncate very long text (>5000 chars)
    const text = request.text.length > 5000 
      ? request.text.substring(0, 5000) + '...'
      : request.text;

    this.logger.info(
      { 
        textLength: text.length, 
        agentId: request.agentId,
        voiceId: request.voiceId 
      },
      'Synthesizing speech'
    );

    try {
      // Make HTTP request to TTS service
      const response = await fetch(`${this.baseUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          text,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          { status: response.status, error: errorText },
          'Speech synthesis failed'
        );
        throw new Error(`Speech synthesis failed: ${response.status} ${errorText}`);
      }

      // Parse and validate response
      const data = await response.json();
      const validated = synthesizeSpeechResponseSchema.parse(data);

      const duration = Date.now() - startTime;
      this.logger.info(
        {
          audioUrl: validated.audioUrl,
          audioDuration: validated.duration,
          synthesisTime: duration,
        },
        'Speech synthesis completed'
      );

      return validated;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          { duration, timeout: this.timeout },
          'Speech synthesis timed out'
        );
        throw new Error(`Speech synthesis timed out after ${this.timeout}ms`);
      }

      // Handle other errors
      this.logger.error(
        { error, duration },
        'Speech synthesis error'
      );
      
      throw error;
    }
  }

  /**
   * Synthesize multiple text segments in batch
   * 
   * PURPOSE:
   * Efficiently generate audio for multiple text segments.
   * Useful when agent has multiple reasoning steps to narrate.
   * 
   * OPTIMIZATION:
   * The TTS service can process these in parallel or batch them
   * for better performance than individual requests.
   * 
   * @param requests - Array of synthesis requests
   * @returns Array of audio URLs and metadata
   */
  async synthesizeBatch(
    requests: SynthesizeSpeechRequest[]
  ): Promise<SynthesizeSpeechResponse[]> {
    this.logger.info(
      { count: requests.length },
      'Batch synthesizing speech'
    );

    try {
      const response = await fetch(`${this.baseUrl}/synthesize/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
        signal: AbortSignal.timeout(this.timeout * requests.length), // Scale timeout
      });

      if (!response.ok) {
        throw new Error(`Batch synthesis failed: ${response.status}`);
      }

      const data = await response.json();
      return z.array(synthesizeSpeechResponseSchema).parse(data);
    } catch (error) {
      this.logger.error({ error }, 'Batch speech synthesis error');
      throw error;
    }
  }

  /**
   * Check health of TTS service
   * 
   * PURPOSE:
   * Verify that TTS service is running and TTS API is accessible.
   * Used by API Gateway's health check endpoint.
   * 
   * @returns Health status of TTS service
   * @throws Error if health check fails
   */
  async checkHealth(): Promise<TTSHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health checks
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return ttsHealthResponseSchema.parse(data);
    } catch (error) {
      this.logger.error({ error }, 'TTS health check failed');
      throw error;
    }
  }

  /**
   * Get list of available voices
   * 
   * PURPOSE:
   * Fetch metadata about available TTS voices.
   * Used for agent-to-voice mapping and configuration.
   * 
   * RESPONSE FORMAT:
   * [
   *   { id: 'voice1', name: 'Rachel', description: 'Professional female', ... },
   *   { id: 'voice2', name: 'Adam', description: 'Friendly male', ... }
   * ]
   * 
   * @returns Array of available voices
   */
  async listVoices(): Promise<VoiceInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Failed to list voices: ${response.status}`);
      }

      const data = await response.json();
      return z.array(voiceInfoSchema).parse(data);
    } catch (error) {
      this.logger.error({ error }, 'Failed to list voices');
      throw error;
    }
  }

  /**
   * Delete audio file from storage
   * 
   * PURPOSE:
   * Clean up audio files after they've been played.
   * Prevents storage from filling up with old audio.
   * 
   * CLEANUP STRATEGY:
   * - Audio files are temporary (Listen In Mode sessions)
   * - Delete after 1 hour or when session ends
   * - TTS service may also have auto-cleanup
   * 
   * @param audioUrl - URL of audio file to delete
   */
  async deleteAudio(audioUrl: string): Promise<void> {
    try {
      // Extract audio ID from URL
      const audioId = audioUrl.split('/').pop();
      
      const response = await fetch(`${this.baseUrl}/audio/${audioId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok && response.status !== 404) {
        // 404 is OK - already deleted
        throw new Error(`Failed to delete audio: ${response.status}`);
      }

      this.logger.debug({ audioUrl }, 'Audio deleted');
    } catch (error) {
      // Log but don't throw - cleanup is best-effort
      this.logger.warn({ error, audioUrl }, 'Failed to delete audio');
    }
  }
}

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 */

export default TTSClient;
