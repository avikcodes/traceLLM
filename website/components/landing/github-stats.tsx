"use client";

import { useEffect, useState } from "react";

const REPO_URL = "https://github.com/avikcodes/traceLLM";

interface GitHubData {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  description: string;
  contributors: { login: string; avatarUrl: string; contributions: number }[];
  totalContributors: number;
}

function formatCount(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(n);
}

function GithubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.15-4.55-5.13 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.07A9.3 9.3 0 0 1 12 6.91c.85 0 1.7.12 2.5.37 1.91-1.35 2.75-1.07 2.75-1.07.55 1.42.2 2.47.1 2.73.64.73 1.03 1.66 1.03 2.79 0 3.99-2.33 4.86-4.56 5.12.36.32.68.95.68 1.93 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.27 10.27 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

export function GitHubStats() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/github");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-w-[260px] rounded-xl border border-white/[0.08] bg-[#111111] p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 rounded bg-white/[0.08]" />
          <div className="h-8 w-20 rounded bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
            <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
            <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
            <div className="h-4 w-24 rounded bg-white/[0.08]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-w-[260px] rounded-xl border border-white/[0.08] bg-[#111111] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
              GitHub stars
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#F5F5F5]">—</p>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.12] bg-transparent px-4 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-white/[0.05]"
          >
            <GithubMark className="size-4" />
            Star
          </a>
        </div>
        <p className="mt-4 text-xs text-[#6B6B6B]">
          Could not load live data.{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#F5F5F5]"
          >
            View on GitHub →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-[260px] rounded-xl border border-white/[0.08] bg-[#111111] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
            GitHub stars
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#F5F5F5]">
            {formatCount(data.stars)}
          </p>
        </div>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.12] bg-white px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.25]"
        >
          <GithubMark className="size-4" />
          Star
        </a>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-[#0B0B0B] px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">
            Forks
          </p>
          <p className="mt-1 text-sm font-medium text-[#9A9A9A]">
            {formatCount(data.forks)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-[#0B0B0B] px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">
            Watchers
          </p>
          <p className="mt-1 text-sm font-medium text-[#9A9A9A]">
            {formatCount(data.watchers)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-[#0B0B0B] px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">
            Issues
          </p>
          <p className="mt-1 text-sm font-medium text-[#9A9A9A]">
            {formatCount(data.openIssues)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex -space-x-2.5">
          {data.contributors.slice(0, 5).map((contributor) => (
            <img
              key={contributor.login}
              src={contributor.avatarUrl}
              alt={contributor.login}
              title={`${contributor.login} — ${contributor.contributions} contributions`}
              className="h-8 w-8 rounded-full border border-white/[0.08]"
            />
          ))}
        </div>
        <p className="text-sm text-[#6B6B6B]">
          {data.totalContributors}+ contributors
        </p>
      </div>
    </div>
  );
}
