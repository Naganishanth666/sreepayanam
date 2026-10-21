import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyMetadata, metadataForPath, DEFAULT_SITE_ORIGIN } from '../utils/seoMetadata.js';

export default function SiteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyMetadata(metadataForPath(pathname, import.meta.env.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_ORIGIN));
  }, [pathname]);
  return null;
}
