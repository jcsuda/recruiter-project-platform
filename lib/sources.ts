/**
 * Supported sources configuration
 */

import { Source, SourceKey } from './types';

export const SOURCES: Record<SourceKey, Source> = {
  linkedin: {
    id: 'linkedin',
    key: 'linkedin',
    label: 'LinkedIn',
    enabled: true,
    site: 'linkedin.com/in',
  },
  github: {
    id: 'github',
    key: 'github',
    label: 'GitHub',
    enabled: true,
    site: 'github.com',
  },
  stackoverflow: {
    id: 'stackoverflow',
    key: 'stackoverflow',
    label: 'Stack Overflow',
    enabled: true,
    site: 'stackoverflow.com/users',
  },
  dribbble: {
    id: 'dribbble',
    key: 'dribbble',
    label: 'Dribbble',
    enabled: true,
    site: 'dribbble.com',
  },
  xing: {
    id: 'xing',
    key: 'xing',
    label: 'Xing',
    enabled: true,
    site: 'xing.com/profile',
  },
  twitter: {
    id: 'twitter',
    key: 'twitter',
    label: 'X (Twitter)',
    enabled: true,
    site: 'twitter.com',
  },
};

export const SOURCE_LIST = Object.values(SOURCES);


