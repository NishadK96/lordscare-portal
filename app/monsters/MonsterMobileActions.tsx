"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { MonsterFavoriteButton } from "./MonsterFavoriteButton";

export function MonsterMobileActions({ slug, name }: { slug: string; name: string }) {
  return <div className="monster-mobile-actions"><MonsterFavoriteButton slug={slug} name={name} compact /><Link href="/monsters"><Search />Find monster</Link></div>;
}
