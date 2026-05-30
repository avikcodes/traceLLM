import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DocsLayout } from "@/components/docs/docs-layout";
import { docsPages, getDefaultDocsPage, getDocsPage } from "@/components/docs/docs-data";

type DocsPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export function generateStaticParams() {
  return docsPages.map((page) => ({
    slug: page.slug.split("/"),
  }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const joinedSlug = slug?.join("/");
  const page = joinedSlug ? getDocsPage(joinedSlug) : getDefaultDocsPage();

  if (!page) {
    return {
      title: "TraceLLM Docs",
    };
  }

  return {
    title: `${page.title} | TraceLLM Docs`,
    description: page.description,
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    redirect(`/docs/${getDefaultDocsPage().slug}`);
  }

  const page = getDocsPage(slug.join("/"));

  if (!page) {
    notFound();
  }

  return <DocsLayout page={page} />;
}
