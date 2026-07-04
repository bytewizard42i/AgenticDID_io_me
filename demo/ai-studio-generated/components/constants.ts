/**
 * AI Studio Generated - Agent Definitions
 * Generated: October 23, 2025
 * Source: Google AI Studio (Gemini 2.5 Pro)
 */

import { Agent } from './types';


export const AGENTS: Agent[] = [
  {
    did: 'did:key:z6Mkk89y2D2s2d2h2b2s2t2f2h2j2k2l2m2n2p2q2r2s2t',
    name: 'First Digital Banker',
    role: 'finance',
    scope: ['read:balance', 'read:transactions', 'transfer:internal'],
    description: 'Handles banking queries, balance checks, and internal transfers securely.',
  },
  {
    did: 'did:key:z6MknAdT1fV3Vf5V7V9VbVdVfVhVjVlVnVpVvVxVzV1V3V5',
    name: 'Amazon Shopper',
    role: 'commerce',
    scope: ['search:products', 'purchase', 'read:orders'],
    description: 'Manages online shopping, product searches, and purchase execution.',
  },
  {
    did: 'did:key:z6MkfA5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U',
    name: 'Expedia Traveler',
    role: 'travel',
    scope: ['search:flights', 'book:hotel', 'read:itinerary'],
    description: 'Assists with travel planning, flight searches, and hotel bookings.',
  },
];
