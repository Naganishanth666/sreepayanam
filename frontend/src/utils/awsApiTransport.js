const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024;

export function createAwsApiFetch({ origin, fetchImpl, cryptoImpl = globalThis.crypto }) {
  const normalizedOrigin = new URL(origin).origin;
  const sendSigned = async request => {
    const headers = new Headers(request.headers);
    const authorization = headers.get('Authorization') || (headers.get('x-auth-token') ? `Bearer ${headers.get('x-auth-token')}` : null);
    if (authorization) headers.set('x-application-authorization', authorization);
    if (!['GET', 'HEAD'].includes(request.method)) {
      const bytes = await request.clone().arrayBuffer();
      const digest = await cryptoImpl.subtle.digest('SHA-256', bytes);
      headers.set('x-amz-content-sha256', Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(''));
    }
    return fetchImpl(new Request(request, { headers }));
  };

  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input), normalizedOrigin);
    if (url.origin !== normalizedOrigin || !url.pathname.startsWith('/api/')) return fetchImpl(input, init);
    const request = new Request(input instanceof Request ? input : url, init);

    if (url.pathname === '/api/ai/parse-brochure'
      && request.headers.get('Content-Type')?.startsWith('multipart/form-data')) {
      const form = await request.clone().formData();
      const brochure = form.get('brochure');
      if (brochure instanceof Blob && brochure.size > DIRECT_UPLOAD_THRESHOLD) {
        const headers = new Headers(request.headers);
        headers.set('Content-Type', 'application/json');
        headers.delete('Content-Length');
        const prepared = await sendSigned(new Request(new URL('/api/ai/brochure-uploads', normalizedOrigin), {
          method: 'POST', headers, credentials: request.credentials, signal: request.signal,
          body: JSON.stringify({ size: brochure.size, contentType: brochure.type })
        }));
        if (!prepared.ok) return prepared;
        const { uploadUrl, uploadKey, headers: uploadHeaders } = await prepared.json();
        const uploaded = await fetchImpl(uploadUrl, {
          method: 'PUT', headers: uploadHeaders, body: brochure, signal: request.signal
        });
        if (!uploaded.ok) return new Response(JSON.stringify({ message: 'Could not upload the brochure. Please try again.' }), {
          status: 502, headers: { 'Content-Type': 'application/json' }
        });
        const fields = Object.fromEntries(Array.from(form.entries()).filter(([, value]) => !(value instanceof Blob)));
        return sendSigned(new Request(request, { headers, body: JSON.stringify({ ...fields, uploadKey }) }));
      }
    }
    return sendSigned(request);
  };
}

export function installAwsApiTransport(target = globalThis) {
  const originalFetch = target.fetch.bind(target);
  target.fetch = createAwsApiFetch({ origin: target.location.origin, fetchImpl: originalFetch, cryptoImpl: target.crypto });
  return () => { target.fetch = originalFetch; };
}
