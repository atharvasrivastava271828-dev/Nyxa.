/**
 * @nyxa/sdk — Official Nyxa Task & Utility Developer SDK
 * 
 * Easily build, validate, and publish client-side tools and API workflows to the Nyxa marketplace.
 */

export interface NyxaTaskInputSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    label: string;
    description?: string;
    required?: boolean;
    default?: any;
  };
}

export interface NyxaTaskOutputSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'file' | 'object';
    label: string;
    description?: string;
  };
}

export interface NyxaTaskConfig<TInputs = Record<string, any>, TOutputs = Record<string, any>> {
  /** Unique URL slug for your tool (e.g. "invoice-generator") */
  id: string;
  /** Human-readable title */
  title: string;
  /** Detailed description of what the tool accomplishes */
  description: string;
  /** Pricing tier in USD ($0 for free client-side utilities) */
  price: number;
  /** Category tag (e.g. "Education", "Business", "Tech", "Utility") */
  category: 'Education' | 'Business' | 'Tech' | 'Utility';
  /** Search tags */
  tags: string[];
  /** Expected input parameters */
  inputs: NyxaTaskInputSchema;
  /** Expected output deliverables */
  outputs: NyxaTaskOutputSchema;
  /** Client-side execution function */
  handler?: (inputs: TInputs) => Promise<TOutputs> | TOutputs;
}

/**
 * Define a Nyxa Task with full TypeScript type inference and runtime schema validation.
 */
export function defineNyxaTask<TInputs = Record<string, any>, TOutputs = Record<string, any>>(
  config: NyxaTaskConfig<TInputs, TOutputs>
): NyxaTaskConfig<TInputs, TOutputs> {
  // Runtime validation
  if (!config.id || !config.title) {
    throw new Error('[@nyxa/sdk] Task definition requires a valid `id` and `title`.');
  }
  if (config.price < 0) {
    throw new Error('[@nyxa/sdk] Price cannot be negative.');
  }

  return {
    ...config,
    price: Number(config.price) || 0,
    tags: Array.isArray(config.tags) ? config.tags : [],
  };
}

/**
 * Starter React Component Template Generator
 */
export function generateComponentBoilerplate(id: string, title: string): string {
  const componentName = id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return `'use client';

import React, { useState } from 'react';
import { defineNyxaTask } from '@nyxa/sdk';

export const taskConfig = defineNyxaTask({
  id: '${id}',
  title: '${title}',
  description: 'Built with @nyxa/sdk for instant client-side execution.',
  price: 0,
  category: 'Utility',
  tags: ['${id}', 'utility', 'tools'],
  inputs: {
    query: { type: 'string', label: 'Input Text', required: true },
  },
  outputs: {
    result: { type: 'string', label: 'Processed Output' },
  },
});

export default function ${componentName}() {
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');

  const handleProcess = () => {
    setOutputVal(inputVal.toUpperCase());
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-4 nyxa-card">
      <h2 className="text-2xl font-bold tracking-tight">${title}</h2>
      
      <div className="space-y-2">
        <label className="nyxa-label">Enter Details</label>
        <input
          type="text"
          className="nyxa-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type here..."
        />
      </div>

      <button onClick={handleProcess} className="nyxa-btn nyxa-btn-primary w-full">
        Process Instant Outcome ⚡
      </button>

      {outputVal && (
        <div className="p-4 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] mt-4">
          <span className="text-xs font-bold uppercase text-[var(--muted)] block">Result:</span>
          <p className="font-mono text-sm mt-1">{outputVal}</p>
        </div>
      )}
    </div>
  );
}
`;
}
