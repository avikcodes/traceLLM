import { NextResponse } from "next/server";

const REPO_OWNER = "avikcodes";
const REPO_NAME = "traceLLM";
const GITHUB_API = "https://api.github.com";

export async function GET() {
  try {
    const [repoRes, contributorsRes, releaseRes] = await Promise.all([
      fetch(`${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "tracellm-website",
        },
        next: { revalidate: 300 },
      }),
      fetch(
        `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=5`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "tracellm-website",
          },
          next: { revalidate: 300 },
        }
      ),
      fetch(`${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "tracellm-website",
        },
        next: { revalidate: 300 },
      }),
    ]);

    if (!repoRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repo data" },
        { status: repoRes.status }
      );
    }

    const repo = await repoRes.json();
    const contributors = contributorsRes.ok ? await contributorsRes.json() : [];
    const release = releaseRes.ok ? await releaseRes.json() : null;

    return NextResponse.json({
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      watchers: repo.subscribers_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      description: repo.description ?? "",
      latestRelease: release?.tag_name ?? null,
      contributors: contributors.map((c: { login: string; avatar_url: string; contributions: number }) => ({
        login: c.login,
        avatarUrl: c.avatar_url,
        contributions: c.contributions,
      })),
      totalContributors: repo.contributors_count ?? contributors.length,
    });
  } catch {
    return NextResponse.json(
      { error: "GitHub API unreachable" },
      { status: 503 }
    );
  }
}
