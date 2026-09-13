import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const SeoHeadManager: React.FC = () => {
  const { data } = usePortfolio();
  const { seo, profile, certifications } = data;

  useEffect(() => {
    // 1. Update Document Title
    document.title = seo.metaTitle || `${profile.fullName} | Portofolio & Sertifikasi`;

    // 2. Helper to set/update meta tag
    const setMetaTag = (nameAttr: string, nameValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${nameValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, nameValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard SEO Tags
    setMetaTag('name', 'description', seo.metaDescription);
    setMetaTag('name', 'keywords', seo.keywords);
    setMetaTag('name', 'author', seo.authorName || profile.fullName);

    // Open Graph Tags
    setMetaTag('property', 'og:title', seo.metaTitle || `${profile.fullName} - Portofolio`);
    setMetaTag('property', 'og:description', seo.metaDescription);
    setMetaTag('property', 'og:image', seo.ogImageUrl || profile.avatarUrl);
    setMetaTag('property', 'og:type', 'profile');
    if (seo.canonicalUrl) {
      setMetaTag('property', 'og:url', seo.canonicalUrl);
    }

    // Twitter Tags
    setMetaTag('name', 'twitter:title', seo.metaTitle);
    setMetaTag('name', 'twitter:description', seo.metaDescription);
    setMetaTag('name', 'twitter:image', seo.ogImageUrl || profile.avatarUrl);

    // 3. Structured Data JSON-LD (Person & WebSite Schema)
    if (seo.enableJsonLd) {
      const scriptId = 'portfolio-jsonld-schema';
      let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person',
            name: profile.fullName,
            jobTitle: seo.jobTitle || profile.headline,
            description: profile.bio,
            image: profile.avatarUrl,
            url: seo.canonicalUrl || window.location.href,
            sameAs: [
              profile.socialLinks.linkedin,
              profile.socialLinks.github,
              profile.socialLinks.instagram,
              profile.socialLinks.facebook,
              profile.socialLinks.tiktok,
            ].filter(Boolean),
            address: {
              '@type': 'PostalAddress',
              addressLocality: profile.location,
              addressCountry: 'ID',
            },
            hasCredential: certifications.map((c) => ({
              '@type': 'EducationalOccupationalCredential',
              name: c.title,
              credentialCategory: 'certification',
              recognizedBy: {
                '@type': 'Organization',
                name: c.issuer,
              },
              validFrom: c.issueDate,
            })),
          },
          {
            '@type': 'WebSite',
            name: `${profile.fullName} - Portofolio Profesional`,
            url: seo.canonicalUrl || window.location.href,
            description: seo.metaDescription,
            inLanguage: 'id-ID',
          },
        ],
      };

      scriptTag.text = JSON.stringify(structuredData);
    }
  }, [seo, profile, certifications]);

  return null;
};
