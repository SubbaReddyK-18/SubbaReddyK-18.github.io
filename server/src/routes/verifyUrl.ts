import { Router } from 'express';
import { parse } from 'node-html-parser';
import { requireAuth } from '../middleware/auth';
import { classifyUrlWithMetadata, classifyUrlFallback } from '../lib/gemini';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ verified: false, reason: 'URL is required' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.json({ verified: false, reason: 'Invalid URL format' });
    }

    let pageTitle = '';
    let description = '';

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MINDORA/1.0)' },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const html = await response.text();
        const root = parse(html);

        const ogTitle = root.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const metaTitle = root.querySelector('title')?.text;
        pageTitle = ogTitle || metaTitle || '';

        const ogDesc = root.querySelector('meta[property="og:description"]')?.getAttribute('content');
        const metaDesc = root.querySelector('meta[name="description"]')?.getAttribute('content');
        description = ogDesc || metaDesc || '';
      }

      const result = await classifyUrlWithMetadata(url, pageTitle, description);

      res.json({
        verified: result.isEducational,
        platform: result.platform,
        category: result.category,
        reason: result.reason,
      });
    } catch (fetchError) {
      const fallbackResult = await classifyUrlFallback(url);
      res.json({
        verified: fallbackResult.isEducational,
        platform: fallbackResult.platform,
        category: fallbackResult.category,
        reason: fallbackResult.reason || 'Could not access this URL. Check the link and try again.',
      });
    }
  } catch (error) {
    res.status(500).json({ verified: false, reason: 'Could not access this URL. Check the link and try again.' });
  }
});

export default router;
