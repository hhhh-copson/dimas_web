/**
 * Helper utilities for formatting and generating social media links & WhatsApp URLs.
 */

/**
 * Extracts and cleans a WhatsApp phone number into standard digits.
 * Supports:
 * - Direct phone: "081234567890" -> "081234567890"
 * - International: "+62 812-3456-7890" -> "6281234567890"
 * - Legacy wa.me link: "https://wa.me/6281234567890" -> "6281234567890"
 */
export function cleanWhatsAppNumber(input: string | undefined | null): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If user pasted a full wa.me or api.whatsapp link, extract the phone part
  if (trimmed.includes('wa.me/') || trimmed.includes('whatsapp.com')) {
    const match = trimmed.match(/(?:wa\.me\/|phone=)(\+?[0-9]+)/);
    if (match && match[1]) {
      return match[1].replace(/\D/g, '');
    }
  }

  // Strip all non-digit characters except maybe leading plus
  return trimmed.replace(/[^\d]/g, '');
}

/**
 * Converts a phone number to standard international WhatsApp link (https://wa.me/...).
 * Automatically converts Indonesian local prefix "08..." or "8..." to international "628...".
 */
export function getWhatsAppUrl(phoneOrLink: string | undefined | null, message?: string): string {
  if (!phoneOrLink) return '';
  
  let digits = cleanWhatsAppNumber(phoneOrLink);
  if (!digits) return '';

  // If local Indonesian format starting with 0 (e.g. 081234567890) -> change to 6281234567890
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8') && digits.length >= 9) {
    // If starts directly with 8 (e.g. 81234567890)
    digits = '62' + digits;
  }

  const defaultMsg = message ?? 'Halo, saya tertarik dengan portofolio Anda dan ingin berdiskusi peluang kerja sama.';
  const encodedText = encodeURIComponent(defaultMsg);

  return `https://wa.me/${digits}?text=${encodedText}`;
}

/**
 * Opens WhatsApp link in a safe manner that works well across desktop, mobile, and sandboxed iframes.
 */
export function openWhatsAppSafely(phone: string, message?: string): void {
  const url = getWhatsAppUrl(phone, message);
  if (!url) return;

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Formats user input into a valid destination URL for various social platforms.
 * Handles handles, @usernames, or full URLs seamlessly.
 */
export function formatSocialUrl(
  platform: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'linkedin' | 'github' | 'email' | string,
  input: string | undefined | null
): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (platform === 'email') {
    if (trimmed.startsWith('mailto:')) return trimmed;
    return `mailto:${trimmed}`;
  }

  // If already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Remove leading @ if present
  const handle = trimmed.replace(/^@/, '');

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    case 'twitter':
      return `https://x.com/${handle}`;
    case 'youtube':
      return handle.startsWith('@') ? `https://youtube.com/${handle}` : `https://youtube.com/@${handle}`;
    case 'telegram':
      return `https://t.me/${handle}`;
    case 'linkedin':
      if (handle.startsWith('in/')) return `https://linkedin.com/${handle}`;
      return `https://linkedin.com/in/${handle}`;
    case 'github':
      return `https://github.com/${handle}`;
    default:
      return `https://${trimmed}`;
  }
}
