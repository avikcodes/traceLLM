"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  FileText,
  Menu,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { docsPages, docsSections, getDocsPageIndex, type DocsPage } from "@/components/docs/docs-data";
import { getDocContent } from "@/components/docs/docs-content";

function TraceLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 512 512"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="256" cy="256" r="188" />
        <path d="M183 203C211 173 242 170 272 146C288 133 312 132 330 141C370 162 389 203 385 247C382 284 393 311 421 334" />
        <path d="M183 203C166 214 154 232 151 255C147 287 172 307 210 307C246 307 271 296 290 279" />
        <path d="M220 307C249 315 280 313 307 308" />
        <path d="M299 282C303 316 290 344 271 374C255 400 249 423 256 444" />
        <path d="M225 188L274 171" />
        <path
          d="M304 195C316 195 325 204 325 216C325 228 316 237 304 237C292 237 283 228 283 216C283 204 292 195 304 195Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M199 244L186 257" />
      </g>
    </svg>
  );
}

function SearchBox({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search docs..."
        className="h-10 w-full rounded-lg border border-white/10 bg-black pl-9 pr-3 font-mono text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300/40"
      />
    </label>
  );
}

function DocsNav({
  activeSlug,
  query,
  onNavigate,
}: {
  activeSlug: string;
  query: string;
  onNavigate?: () => void;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <nav className="space-y-8">
      {docsSections.map((section) => {
        const pages = normalizedQuery
          ? section.pages.filter((page) =>
              `${page.title} ${page.description}`.toLowerCase().includes(normalizedQuery)
            )
          : section.pages;

        if (pages.length === 0) return null;

        return (
          <div key={section.title}>
            <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
              <ChevronDown className="size-3.5" />
              {section.title}
            </div>
            <div className="space-y-1">
              {pages.map((page) => {
                const active = page.slug === activeSlug;
                return (
                  <Link
                    key={page.slug}
                    href={`/docs/${page.slug}`}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm leading-5 transition",
                      active
                        ? "bg-white/[0.06] text-white"
                        : "text-zinc-400 hover:bg-white/[0.035] hover:text-white"
                    )}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function DocsArticle({ page }: { page: DocsPage }) {
  const content = getDocContent(page.slug);

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 font-mono text-xs text-violet-200">
        <BookOpen className="size-3.5" />
        Documentation
      </div>
      <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
        {page.title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">{page.description}</p>

      {content.length > 0 ? (
        content.map((section) => (
          <section key={section.id} id={section.id} className="mt-10 scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{section.title}</h2>
            {section.content}
          </section>
        ))
      ) : (
        <>
          <section id="overview" className="mt-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Overview</h2>
            <p className="mt-4 leading-7 text-zinc-400">
              {page.description}
            </p>
          </section>
          <section id="next-steps" className="mt-10 scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Next Steps</h2>
            <p className="mt-4 leading-7 text-zinc-400">
              Content for this page is being written.
            </p>
          </section>
        </>
      )}
    </article>
  );
}

function PageNavigation({ page }: { page: DocsPage }) {
  const pageIndex = getDocsPageIndex(page.slug);
  const previous = pageIndex > 0 ? docsPages[pageIndex - 1] : null;
  const next = pageIndex >= 0 && pageIndex < docsPages.length - 1 ? docsPages[pageIndex + 1] : null;

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 border-t border-white/10 px-6 py-8 lg:grid-cols-2 lg:px-10">
      {previous ? (
        <Link
          href={`/docs/${previous.slug}`}
          className="rounded-2xl border border-white/10 bg-[#09090d] p-5 transition hover:border-violet-300/30 hover:bg-white/[0.035]"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <ArrowLeft className="size-3.5" />
            Previous
          </div>
          <p className="font-medium text-white">{previous.title}</p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="rounded-2xl border border-white/10 bg-[#09090d] p-5 text-left transition hover:border-violet-300/30 hover:bg-white/[0.035] lg:text-right"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-zinc-500 lg:justify-end">
            Next
            <ArrowRight className="size-3.5" />
          </div>
          <p className="font-medium text-white">{next.title}</p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

function OnThisPage({ tocItems }: { tocItems: { title: string; href: string }[] }) {
  if (tocItems.length === 0) return null;
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 border-l border-white/10 px-6 py-10 xl:block">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
        On This Page
      </p>
      <nav className="space-y-2">
        {tocItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block text-sm text-zinc-500 transition hover:text-white"
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export function DocsLayout({ page }: { page: DocsPage }) {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const resultCount = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return docsPages.length;
    return docsPages.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery)
    ).length;
  }, [query]);
  const tocItems = useMemo(
    () => getDocContent(page.slug).map((s) => ({ title: s.title, href: `#${s.id}` })),
    [page.slug],
  );

  return (
    <main className="min-h-screen bg-[#050506] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050506]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <TraceLogo className="size-8 text-white" />
            <span className="font-semibold tracking-tight">TraceLLM</span>
            <span className="hidden rounded-md border border-white/10 px-2 py-1 font-mono text-xs text-zinc-500 sm:inline">
              Docs
            </span>
          </Link>
          <div className="hidden w-full max-w-sm md:block">
            <SearchBox value={query} onChange={setQuery} />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white sm:inline-flex"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 text-zinc-300 md:hidden"
              aria-label="Open docs navigation"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-white/10 px-5 py-6 md:block">
          <SearchBox value={query} onChange={setQuery} className="mb-4 lg:hidden" />
          <div className="mb-5 flex items-center justify-between text-xs text-zinc-600">
            <span className="font-mono uppercase tracking-[0.18em]">Navigation</span>
            <span>{resultCount} pages</span>
          </div>
          <DocsNav activeSlug={page.slug} query={query} />
        </aside>

        <div className="min-w-0 flex-1">
          <DocsArticle page={page} />
          <PageNavigation page={page} />
        </div>

        <OnThisPage tocItems={tocItems} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden">
          <div className="h-full w-full max-w-sm overflow-y-auto border-r border-white/10 bg-[#050506] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-violet-200" />
                <span className="font-semibold">Docs</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 text-zinc-300"
                aria-label="Close docs navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <SearchBox value={query} onChange={setQuery} className="mb-5" />
            <DocsNav activeSlug={page.slug} query={query} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
