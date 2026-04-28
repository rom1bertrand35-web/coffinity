/**
 * Affiliate Utils for Coffinity
 * Manage all referral tags and links centrally.
 */

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || 'coffinity06-21';

/**
 * Generates an Amazon affiliate link using an ASIN.
 * ASIN example: B00OXXXXXX
 */
export function getAmazonAffiliateUrl(asin: string | null | undefined): string | null {
  if (!asin) return null;
  // Clean ASIN (remove spaces or common errors)
  const cleanAsin = asin.trim();
  return `https://www.amazon.fr/dp/${cleanAsin}/?tag=${AMAZON_TAG}`;
}

/**
 * Generates a MaxiCoffee affiliate link via Effiliation.
 * Needs your specific Effiliation ID when you get it.
 */
export function getMaxiCoffeeAffiliateUrl(originalUrl: string | null | undefined, effiliationId: string = 'YOUR_ID'): string | null {
  if (!originalUrl) return null;
  // Effiliation pattern: https://track.effiliation.com/servlet/effi.redir?id_compteur=XXXX&url=URL_ENCODEE
  const encodedUrl = encodeURIComponent(originalUrl);
  return `https://track.effiliation.com/servlet/effi.redir?id_compteur=${effiliationId}&url=${encodedUrl}`;
}
