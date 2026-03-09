/**
 * Proxy لتجاوز CORS - يوجّه الطلبات من souqegy.net إلى الباك إند
 * المسار: /api/proxy/*  →  https://talabat-ehpd.onrender.com/servy/api/v1/*
 */
const BACKEND_URL = process.env.BACKEND_URL || 'https://talabat-ehpd.onrender.com';

export default async function handler(req, res) {
  const path = req.query.path || [];
  const pathStr = Array.isArray(path) ? path.join('/') : path;
  const qs = req.url?.includes('?') ? req.url.split('?')[1] : '';
  const targetUrl = `${BACKEND_URL}/servy/api/v1/${pathStr}${qs ? '?' + qs : ''}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(502).json({
      success: false,
      message: error.message || 'Proxy error',
    });
  }
}
