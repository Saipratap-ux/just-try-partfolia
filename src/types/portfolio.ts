export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string;
  pushed_at: string;
  fork: boolean;
}

export interface FeaturedProject {
  id: string;
  repoName: string;
  title: string;
  category: string;
  summary: string;
  highlights: string[];
  stack: string[];
  repoUrl: string;
  demoUrl?: string;
  imageUrl?: string;
  accentColor: string;
}

export type SkillCategory = 'all' | 'frontend' | 'mobile' | 'tools';

export interface SkillItem {
  name: string;
  category: Exclude<SkillCategory, 'all'>;
  level: number;
  focus: string;
  accent: string;
}

export interface JourneyMilestone {
  period: string;
  title: string;
  context: string;
  description: string;
  artifacts: string[];
}

export interface AudioSettings {
  musicPlaying: boolean;
  sfxEnabled: boolean;
  muted: boolean;
  volume: number;
}
