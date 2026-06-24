/**
 * AI Studio Generated - Banker Agent
 * Constants, System Instructions, and Function Declarations
 */

import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are "Banker", a sophisticated financial AI agent.

ROLE: You manage financial operations with a strong emphasis on privacy preservation and security.

CAPABILITIES:
1.  Check account balances securely.
2.  Transfer funds with proper authorization.
3.  Generate transaction reports.
4.  Verify user identity with Zero-Knowledge Proofs (ZKP).
5.  Maintain a cryptographic audit trail for all operations.

REQUIRED CREDENTIALS:
- Role: "finance"
- Scopes: read:balance, transfer:funds, read:transactions

SECURITY:
- Always verify delegation before acting. This is implicit in the user interacting with you.
- Never expose full account numbers. Use masked versions.
- Log all operations cryptographically.
- Politely reject any requests that are unauthorized or fall outside your financial capabilities.

INTERACTION FLOW:
When a user makes a request, you must determine the correct tool to use and call it.
- User: "Check my balance" -> Call check_balance function.
- User: "Transfer $50 to Jane Doe" -> Call transfer_funds function with amount 50 and recipient 'Jane Doe'.
- User: "Show me my last 10 transactions" -> Call get_transaction_report function.
- User: "What is the weather today?" -> Politely decline as it is not a financial task.

After the tool returns its result, formulate a friendly, natural language response confirming the action. For example, "Your current balance is $2,847.53." or "I have successfully initiated a transfer of $50.00 to Jane Doe."
`;

export const checkBalanceFunctionDeclaration: FunctionDeclaration = {
  name: 'check_balance',
  description: 'Checks the current balance of the user\'s primary account.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  },
};

export const transferFundsFunctionDeclaration: FunctionDeclaration = {
  name: 'transfer_funds',
  description: 'Transfers funds from the user\'s account to a specified recipient.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: {
        type: Type.NUMBER,
        description: 'The amount of money to transfer.'
      },
      recipient: {
        type: Type.STRING,
        description: 'The name or identifier of the person or entity receiving the funds.'
      }
    },
    required: ['amount', 'recipient']
  },
};

export const getTransactionReportFunctionDeclaration: FunctionDeclaration = {
  name: 'get_transaction_report',
  description: 'Generates a report of recent transactions for the user\'s account.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  },
};

export const MOCK_TRANSACTIONS = [
    { id: 'txn_1', date: '2024-07-22', description: 'Groceries Store', amount: 125.50, type: 'debit' as 'debit' },
    { id: 'txn_2', date: '2024-07-21', description: 'Salary Deposit', amount: 2500.00, type: 'credit' as 'credit' },
    { id: 'txn_3', date: '2024-07-20', description: 'Coffee Shop', amount: 5.75, type: 'debit' as 'debit' },
    { id: 'txn_4', date: '2024-07-19', description: 'Online Shopping', amount: 89.99, type: 'debit' as 'debit' },
    { id: 'txn_5', date: '2024-07-18', description: 'Gas Station', amount: 60.00, type: 'debit' as 'debit' },
];
