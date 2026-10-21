const createReadinessHandler = connection => (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const ready = connection.readyState === 1;
  return res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
};

module.exports = { createReadinessHandler };
