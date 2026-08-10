"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

export function MonsterImage({ src, alt, priority = false, className = "" }: { src?: string; alt: string; priority?: boolean; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);

  return <div className={`monster-image ${className} ${loaded ? "is-loaded" : ""} ${failed ? "is-fallback" : ""}`}>
    {!loaded && !failed && <span className="monster-image-skeleton" aria-hidden="true" />}
    {failed ? <div className="monster-image-fallback"><ImageOff /><strong>{alt.slice(0, 2).toUpperCase()}</strong><span>Image unavailable</span></div> : <Image src={src!} alt={alt} fill sizes="(max-width: 560px) 92vw, (max-width: 900px) 46vw, 320px" priority={priority} loading={priority ? "eager" : "lazy"} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
  </div>;
}
