/**
 * HireLab Boolean Search Engine
 * Generates precise Boolean search strings for talent sourcing
 */

import { SearchParams, BooleanQuery, SourceKey, SearchEngine } from './types';
import { SOURCES } from './sources';

/**
 * Sanitizes and quotes a search token
 */
function sanitizeToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) return '';
  
  // If token contains spaces or special chars, wrap in quotes
  if (trimmed.includes(' ') || /[&|()!]/.test(trimmed)) {
    return `"${trimmed.replace(/"/g, '\\"')}"`;
  }
  
  return trimmed;
}

/**
 * Builds AND group from array of tokens
 */
function buildAndGroup(tokens: string[]): string {
  const sanitized = tokens
    .map(sanitizeToken)
    .filter(Boolean);
  
  if (sanitized.length === 0) return '';
  if (sanitized.length === 1) return sanitized[0];
  
  return `(${sanitized.join(' AND ')})`;
}

/**
 * Builds OR group from array of tokens
 */
function buildOrGroup(tokens: string[]): string {
  const sanitized = tokens
    .map(sanitizeToken)
    .filter(Boolean);
  
  if (sanitized.length === 0) return '';
  if (sanitized.length === 1) return sanitized[0];
  
  return `(${sanitized.join(' OR ')})`;
}

/**
 * Builds NOT group from array of tokens
 */
function buildNotGroup(tokens: string[]): string {
  const sanitized = tokens
    .map(sanitizeToken)
    .filter(Boolean);
  
  if (sanitized.length === 0) return '';
  
  return sanitized.map(token => `-${token}`).join(' ');
}

/**
 * Generates Boolean search query for a specific source
 */
export function generateBooleanQuery(
  sourceKey: SourceKey,
  params: SearchParams,
  searchEngine: SearchEngine = 'google'
): BooleanQuery {
  const source = SOURCES[sourceKey];
  if (!source) {
    throw new Error(`Unknown source: ${sourceKey}`);
  }

  const parts: string[] = [];

  // Site restriction
  parts.push(`site:${source.site}`);

  // Role/Title
  if (params.role?.trim()) {
    parts.push(sanitizeToken(params.role));
  }

  // Include keywords (AND group)
  if (params.include && params.include.length > 0) {
    const includeGroup = buildAndGroup(params.include);
    if (includeGroup) {
      parts.push(includeGroup);
    }
  }

  // Location
  if (params.location?.trim()) {
    parts.push(sanitizeToken(params.location));
  }

  // LinkedIn-specific fields
  if (sourceKey === 'linkedin') {
    if (params.employer?.trim()) {
      parts.push(sanitizeToken(params.employer));
    }
    
    if (params.education) {
      const eduMap = {
        bachelors: 'Bachelor',
        masters: 'Master',
        doctoral: 'PhD OR Doctoral',
      };
      parts.push(sanitizeToken(eduMap[params.education]));
    }

    if (params.openToWork) {
      const statusMap = {
        opentowork: '#OpenToWork',
        hiring: '#Hiring',
      };
      parts.push(statusMap[params.openToWork]);
    }
  }

  // Exclude keywords (NOT group) - always last
  if (params.exclude && params.exclude.length > 0) {
    const excludeGroup = buildNotGroup(params.exclude);
    if (excludeGroup) {
      parts.push(excludeGroup);
    }
  }

  const raw = parts.join(' ');
  const encoded = encodeURIComponent(raw);
  const url = buildSearchUrl(raw, searchEngine);

  return { raw, encoded, url };
}

/**
 * Builds search URL for specified engine
 */
function buildSearchUrl(query: string, engine: SearchEngine): string {
  const encoded = encodeURIComponent(query);
  
  switch (engine) {
    case 'google':
      return `https://www.google.com/search?q=${encoded}`;
    case 'bing':
      return `https://www.bing.com/search?q=${encoded}`;
    case 'twitter':
      return `https://twitter.com/search?q=${encoded}`;
    default:
      return `https://www.google.com/search?q=${encoded}`;
  }
}

/**
 * Validates search parameters
 */
export function validateParams(params: SearchParams): string[] {
  const errors: string[] = [];

  if (!params.role && (!params.include || params.include.length === 0)) {
    errors.push('Either role or include keywords are required');
  }

  return errors;
}

/**
 * Parses array input from comma-separated string
 */
export function parseArrayInput(input: string): string[] {
  return input
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Gets search engine options
 */
export function getSearchEngineOptions(sourceKey: SourceKey): SearchEngine[] {
  if (sourceKey === 'twitter') {
    return ['twitter', 'google', 'bing'];
  }
  return ['google', 'bing'];
}

