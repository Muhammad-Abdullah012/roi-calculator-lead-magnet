export interface UtmData {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landingPage?: string;
  capturedAt?: string;
  [key: string]: string | undefined;
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
] as const;

/** Read UTM/referrer data from the current browser session. */
export function captureUtm(): UtmData {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const data: UtmData = {
    referrer: document.referrer || undefined,
    landingPage: window.location.href,
    capturedAt: new Date().toISOString(),
  };

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) data[key.replace("utm_", "")] = value;
  }

  return data;
}
