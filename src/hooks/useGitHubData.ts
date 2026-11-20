import { useCallback, useEffect, useState } from 'react';
import {
  DEVELOPER_IDENTITY,
  FALLBACK_GITHUB_PROFILE,
  FALLBACK_GITHUB_REPOS,
} from '../data/portfolioData';
import type { GitHubProfile, GitHubRepo } from '../types/portfolio';

const CACHE_KEY = 'saipratap_github_cache_v1';
const CACHE_TTL_MS = 15 * 60 * 1000;

interface CachedGitHubData {
  timestamp: number;
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

export function useGitHubData() {
  const [profile, setProfile] = useState<GitHubProfile>(FALLBACK_GITHUB_PROFILE);
  const [repos, setRepos] = useState<GitHubRepo[]>(FALLBACK_GITHUB_REPOS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchGitHub = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrorMessage(null);

    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as CachedGitHubData;
          if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.repos.length > 0) {
            setProfile(cached.profile);
            setRepos(cached.repos);
            setIsLive(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore corrupt cache
      }
    }

    try {
      const username = DEVELOPER_IDENTITY.githubUsername;
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, {
          headers: { Accept: 'application/vnd.github+json' },
        }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
          headers: { Accept: 'application/vnd.github+json' },
        }),
      ]);

      if (!profileRes.ok || !reposRes.ok) {
        throw new Error(`GitHub API returned status ${profileRes.status}/${reposRes.status}`);
      }

      const profileData = (await profileRes.json()) as GitHubProfile;
      const reposData = (await reposRes.json()) as GitHubRepo[];

      if (Array.isArray(reposData) && reposData.length > 0) {
        setProfile(profileData);
        setRepos(reposData);
        setIsLive(true);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              profile: profileData,
              repos: reposData,
            }),
          );
        } catch {
          // Ignore storage limit
        }
      }
    } catch (err) {
      setIsLive(false);
      setErrorMessage(
        err instanceof Error
          ? 'Showing verified snapshot (live GitHub API rate-limited or offline).'
          : 'Showing verified snapshot.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGitHub(false);
  }, [fetchGitHub]);

  return {
    profile,
    repos,
    loading,
    isLive,
    errorMessage,
    refresh: () => fetchGitHub(true),
  };
}
