/**
 * Agentic UI Demonstration
 * 
 * This file demonstrates how the agentic communication system works
 * and provides examples for testing the natural language integration.
 */

import { parseAgenticCommunicationIntent, EXAMPLE_PATTERNS } from "./agenticIntentParser"
import { processChatMessageForAgenticWorkflows, generateAgenticChatResponse } from "./chatAgenticIntegration"

/**
 * Test the agentic intent parsing with various inputs
 */
export function demonstrateAgenticParsing() {
  console.log("🤖 Agentic Communication Intent Parsing Demo\n")
  
  const testMessages = [
    "Send Tata Nexon policy document to customer",
    "Email the claim form urgently", 
    "Text payment receipt via WhatsApp",
    "Share insurance document ASAP",
    "Send KYC documents to client",
    "Forward policy document to customer via email",
    "Can you help with a claim?", // Should not trigger
    "What is my policy number?", // Should not trigger
  ]

  testMessages.forEach((message, index) => {
    console.log(`\n${index + 1}. Input: "${message}"`)
    
    const trigger = processChatMessageForAgenticWorkflows(message)
    
    if (trigger) {
      console.log(`   ✅ Detected agentic intent (confidence: ${(trigger.confidence * 100).toFixed(1)}%)`)
      console.log(`   📄 Document: ${trigger.intent.documentType || "auto-detect"}`)
      console.log(`   🚗 Policy: ${trigger.intent.policyFilter || "any"}`)
      console.log(`   📱 Channels: ${trigger.intent.channels?.join(", ") || "auto-suggest"}`)
      console.log(`   ⚡ Urgency: ${trigger.intent.urgency || "normal"}`)
      
      const response = generateAgenticChatResponse(trigger)
      console.log(`   💬 AI Response: "${response.chatResponse}"`)
      console.log(`   🔄 Triggers workflow: ${response.shouldTriggerWorkflow}`)
    } else {
      console.log(`   ❌ No agentic intent detected - handled by normal chat`)
    }
  })
}

/**
 * Example of how agentic workflows improve UX
 */
export function demonstrateUXImprovement() {
  console.log("\n\n🎯 UX Improvement Demonstration\n")
  
  const scenarios = [
    {
      title: "Traditional Manual Flow",
      steps: [
        "1. User: 'I need to send policy document'",
        "2. AI: 'Sure! Let me open the communication panel'",
        "3. User manually selects: Document Type → Policy Document",
        "4. User manually selects: Policy → Tata Nexon",
        "5. User manually selects: Channel → Email",
        "6. User manually enters: Email address",
        "7. User clicks Send",
      ],
      totalSteps: 7,
      userActions: 6
    },
    {
      title: "Agentic AI-Assisted Flow", 
      steps: [
        "1. User: 'Send Tata Nexon policy document to customer via email'",
        "2. AI: Parses intent and pre-populates everything",
        "3. User reviews pre-populated form (all fields filled)",
        "4. User clicks Send",
      ],
      totalSteps: 4,
      userActions: 2
    }
  ]

  scenarios.forEach((scenario, index) => {
    console.log(`\n${scenario.title}:`)
    scenario.steps.forEach(step => console.log(`   ${step}`))
    console.log(`   📊 Total steps: ${scenario.totalSteps}`)
    console.log(`   👆 User actions: ${scenario.userActions}`)
    console.log(`   ⏱️  Time saved: ~${Math.round((1 - scenario.userActions / 6) * 100)}%`)
  })

  console.log("\n🎉 Result: 67% reduction in user effort!")
}

/**
 * Show supported natural language patterns
 */
export function showSupportedPatterns() {
  console.log("\n\n📝 Supported Natural Language Patterns\n")
  
  const patterns = [
    {
      category: "Document Types",
      examples: [
        "policy document", "insurance document", "coverage document",
        "claim form", "insurance claim", "file claim", 
        "payment receipt", "invoice", "billing",
        "KYC documents", "verification docs", "identity documents"
      ]
    },
    {
      category: "Policy Identification", 
      examples: [
        "Tata Nexon", "Honda Activa", "Maruti Swift",
        "my car policy", "bike insurance", "two wheeler",
        "policy number ACCR10468614939"
      ]
    },
    {
      category: "Communication Channels",
      examples: [
        "email", "send via email", "mail it",
        "WhatsApp", "text via WhatsApp", "WA",
        "SMS", "text message", "send text",
        "app notification", "ACKO alert", "in-app"
      ]
    },
    {
      category: "Urgency Levels",
      examples: [
        "urgent", "ASAP", "immediately", "emergency",
        "soon", "today", "this week",
        "when possible", "no rush", "at your convenience"
      ]
    }
  ]

  patterns.forEach(pattern => {
    console.log(`${pattern.category}:`)
    pattern.examples.forEach(example => console.log(`   • "${example}"`))
    console.log("")
  })
}

/**
 * Run all demonstrations
 */
export function runAgenticDemo() {
  demonstrateAgenticParsing()
  demonstrateUXImprovement() 
  showSupportedPatterns()
  
  console.log("\n🚀 To test in the app:")
  console.log("1. Open the chat in RaiseClaimHelloView")
  console.log("2. Type any of the example messages above")
  console.log("3. Watch as AI Actions automatically opens with pre-populated data!")
  console.log("\n💡 The system intelligently bridges natural language → structured UI actions")
}

// Export example messages for easy testing
export const DEMO_MESSAGES = [
  "Send Tata Nexon policy document to customer",
  "Email the claim form for Honda Activa urgently",
  "Text the payment receipt via WhatsApp",
  "Share KYC documents ASAP",
  "Forward insurance document to customer via email"
]