import rawConfig from "../../config/property.json";

export type PropertyConfig = {
  propertyName: string;
  cleanerName: string;
  icalUrl: string;
};

// Validation runs at module load. If the config is invalid, the throw propagates
// out of the import — on Cloudflare Workers the isolate fails to boot, and the
// first request returns 500. That's intentional: silent fallbacks would hide
// misconfig (e.g. a typo in icalUrl) until bookings stopped appearing days later.
function validate(raw: unknown): PropertyConfig {
  if (!raw || typeof raw !== "object") {
    throw new Error("config/property.json must be a JSON object");
  }
  const c = raw as Record<string, unknown>;
  if (typeof c.icalUrl !== "string" || c.icalUrl.trim() === "") {
    throw new Error("config/property.json: icalUrl is required and must be a non-empty string");
  }
  if (typeof c.propertyName !== "string") {
    throw new Error("config/property.json: propertyName must be a string");
  }
  if (typeof c.cleanerName !== "string") {
    throw new Error("config/property.json: cleanerName must be a string");
  }
  return {
    propertyName: c.propertyName,
    cleanerName: c.cleanerName,
    icalUrl: c.icalUrl,
  };
}

export const propertyConfig: PropertyConfig = validate(rawConfig);
