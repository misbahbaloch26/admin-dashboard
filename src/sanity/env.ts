export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-06'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  "sk597GtqVS42RoCyeRNac4GtDpwEvjlmGXwwS5b9POEwL13wY7YeuEWIbcSLqJ13Id7s47mgpjTeYumczcQLHc6WlV2hLqmxFwXPTju6o0DdrmRWEiDfldkDlDk2KAlUxWqmenqSs4fHQgfWA3Z5hhlY1pjbTN6cxqclsBisIU9XNCYvAuLx",
  'Missing environment variable: NEXT_API_TOKEN'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
