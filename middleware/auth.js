/**
 * Middleware that redirects unauthenticated users to /login.
 * API routes return 401 JSON instead of redirecting.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorised' });
  }
  res.redirect('/login');
}

module.exports = { requireAuth };
