import { useEffect, useMemo, useState } from "react";
import type { SiteGraphDocument } from "../types/graph";
import { cloneSiteGraphDocument, normalizeSiteGraphDocument } from "../utils/siteGraphDocument";

export function useSiteGraphDraft(seedDocument: SiteGraphDocument) {
  const storageKey = "peaceland-site-draft";
  const seedSignature = useMemo(() => normalizeSiteGraphDocument(seedDocument), [seedDocument]);

  const [draftDocument, setDraftDocument] = useState<SiteGraphDocument>(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return cloneSiteGraphDocument(seedDocument);
    }

    try {
      return cloneSiteGraphDocument(JSON.parse(saved) as SiteGraphDocument);
    } catch {
      return cloneSiteGraphDocument(seedDocument);
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draftDocument));
  }, [draftDocument]);

  const hasDraftChanges = useMemo(
    () => normalizeSiteGraphDocument(draftDocument) !== seedSignature,
    [draftDocument, seedSignature]
  );

  const resetDraft = () => {
    const cloned = cloneSiteGraphDocument(seedDocument);
    setDraftDocument(cloned);
    window.localStorage.setItem(storageKey, JSON.stringify(cloned));
  };

  return {
    draftDocument,
    setDraftDocument,
    hasDraftChanges,
    resetDraft
  };
}
