const { Client } = require('ldapts');

/**
 * Authenticate a user against LDAP, or via the dev bypass.
 * Returns { ok: true, username } on success, { ok: false, message } on failure.
 */
async function authenticate(username, password) {
  // ── Dev bypass ─────────────────────────────────────────────────────────────
  if (process.env.DEV_BYPASS === 'true') {
    if (
      username === process.env.DEV_USERNAME &&
      password === process.env.DEV_PASSWORD
    ) {
      return { ok: true, username };
    }
    return { ok: false, message: 'Invalid username or password.' };
  }

  // ── Real LDAP bind ─────────────────────────────────────────────────────────
  const userDN = process.env.LDAP_USER_DN.replace('{{username}}', username);
  const client = new Client({ url: process.env.LDAP_URL });

  try {
    await client.bind(userDN, password);
    return { ok: true, username };
  } catch (err) {
    return { ok: false, message: 'Invalid username or password.' };
  } finally {
    await client.unbind();
  }
}

module.exports = { authenticate };
