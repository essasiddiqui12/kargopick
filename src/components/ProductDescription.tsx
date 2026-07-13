"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDescriptionProps {
  text: string;
}

export default function ProductDescription({ text }: ProductDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`text-surface-600 leading-relaxed text-[15px] ${
          !expanded ? "line-clamp-3 sm:line-clamp-none" : ""
        }`}
      >
        {text}
      </p>
      {text.length > 120 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
