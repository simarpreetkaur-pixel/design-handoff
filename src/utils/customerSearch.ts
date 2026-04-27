import { searchCustomer } from '@/data/mockCustomers'
import type { Customer, InactivePolicy, JTBD, Policy } from '@/types/crm'

export interface SearchResult {
  customer: Customer
  jtbds: JTBD[]
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
}

export interface SearchResponse {
  found: boolean
  result?: SearchResult
  query: string
}

/**
 * Search for a customer by phone number, email, name, or policy number
 * @param query - Search query (phone, email, name, or a substring of a policy number)
 * @returns SearchResponse with found status and customer data if found
 */
export function performCustomerSearch(query: string): SearchResponse {
  const result = searchCustomer(query)
  
  return {
    found: result !== null,
    result: result || undefined,
    query: query.trim(),
  }
}

/**
 * Validate if a query looks like a phone number
 * @param query - Input query
 * @returns boolean indicating if it looks like a phone number
 */
export function isPhoneQuery(query: string): boolean {
  const phonePattern = /^[\+]?[0-9\s\-\(\)]{7,}$/
  return phonePattern.test(query.trim())
}

/**
 * Validate if a query looks like an email
 * @param query - Input query
 * @returns boolean indicating if it looks like an email
 */
export function isEmailQuery(query: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(query.trim())
}

/**
 * Get search type for analytics/logging purposes
 * @param query - Search query
 * @returns string indicating search type
 */
export function getSearchType(query: string): 'phone' | 'email' | 'name' | 'unknown' {
  const cleanQuery = query.trim()
  
  if (isPhoneQuery(cleanQuery)) return 'phone'
  if (isEmailQuery(cleanQuery)) return 'email'
  if (cleanQuery.length >= 2) return 'name'
  
  return 'unknown'
}