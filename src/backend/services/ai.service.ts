/**
 * ai.service.ts
 *
 * Handles Goal Extraction, Capability Extraction, and Task Classification.
 *
 * ARCHITECTURE NOTE:
 * This service currently mocks an AI's behavior via rule-based keyword matching.
 * The architecture enforces a strict separation: AI generates "tags" (capabilities)
 * here, but the actual deterministic matching is done in the DB (matching.engine.ts).
 *
 * To migrate to a real LLM (like Gemini or a local model like Llama 3),
 * simply replace the contents of these functions with API calls to the model,
 * prompting it to return a JSON array of predefined strings. No other parts
 * of the application will need to change.
 */

/**
 * Extracts capability tags from a raw task description.
 *
 * @param taskText The raw unstructured text from the user posting the task
 * @returns Array of structured capability strings
 */
export async function extractCapabilities(taskText: string): Promise<string[]> {
  const lowerText = taskText.toLowerCase();
  const capabilities = new Set<string>();

  // --- Existing Mappings ---

  if (lowerText.includes('competitor') || lowerText.includes('research')) {
    capabilities.add('research');
    capabilities.add('web_search');
  }

  if (lowerText.includes('code') || lowerText.includes('build') || lowerText.includes('app')) {
    capabilities.add('programming');
    capabilities.add('development');
  }

  if (lowerText.includes('write') || lowerText.includes('blog') || lowerText.includes('content')) {
    capabilities.add('content_writing');
    capabilities.add('copywriting');
  }

  // --- New Mappings ---

  // Design & UI/UX: Catches visual tasks like landing pages, mockups, icons, etc.
  if (lowerText.includes('design') || lowerText.includes('ui') || lowerText.includes('ux')) {
    capabilities.add('design');
    capabilities.add('ui_ux');
  }

  // Data Analysis: Catches data, analytics, dashboards, reports with numbers.
  if (lowerText.includes('data') || lowerText.includes('analytics') || lowerText.includes('report')) {
    capabilities.add('data_analysis');
  }

  // Marketing: Covers campaigns, ads, social media, growth tasks.
  if (lowerText.includes('marketing') || lowerText.includes('campaign') || lowerText.includes('ads')) {
    capabilities.add('marketing');
  }

  // Sales: Covers outreach, lead generation, CRM, pitching tasks.
  if (lowerText.includes('sales') || lowerText.includes('lead') || lowerText.includes('outreach')) {
    capabilities.add('sales');
  }

  // Automation: Covers workflow automation, scripting, scheduling, integrations.
  if (lowerText.includes('automate') || lowerText.includes('automation') || lowerText.includes('workflow')) {
    capabilities.add('workflow_automation');
  }

  // Fallback: if no specific capability was detected, assign general so matching
  // can still attempt to find broadly capable agents.
  if (capabilities.size === 0) {
    capabilities.add('general');
  }

  return Array.from(capabilities);
}

/**
 * Extracts structured goals/requirements from the task description.
 *
 * @param taskText The raw unstructured text
 * @returns A JSON record of inferred requirements (e.g., urgency, tone)
 */
export async function extractGoal(taskText: string): Promise<Record<string, any>> {
  // TODO: Implement actual LLM JSON extraction prompt here.
  return {
    raw_input: taskText,
    inferred_urgency: 'normal',
    extracted_keywords: await extractCapabilities(taskText)
  };
}

/**
 * Classifies the task into standard platform categories based on its capabilities.
 *
 * @param taskText The raw unstructured text
 * @returns The broad category string (e.g., 'Engineering')
 */
export async function classifyTask(taskText: string): Promise<string> {
  const capabilities = await extractCapabilities(taskText);
  if (capabilities.includes('programming')) return 'Engineering';
  if (capabilities.includes('research')) return 'Research';
  if (capabilities.includes('content_writing')) return 'Content';
  if (capabilities.includes('design')) return 'Design';
  if (capabilities.includes('data_analysis')) return 'Data';
  if (capabilities.includes('marketing')) return 'Marketing';
  if (capabilities.includes('sales')) return 'Sales';
  if (capabilities.includes('workflow_automation')) return 'Automation';
  return 'General';
}
