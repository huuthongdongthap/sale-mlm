const JWT_SECRET = 'hive-academy-secret-key-2024';

export async function signToken(payload, secret = JWT_SECRET) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const base64Payload = btoa(JSON.stringify(payload));
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${base64Payload}.${base64Sig}`;
}

export async function verifyToken(token, secret = JWT_SECRET) {
  const [base64Payload, base64Sig] = token.split('.');
  if (!base64Payload || !base64Sig) throw new Error('Invalid token format');

  const encoder = new TextEncoder();
  const payload = JSON.parse(atob(base64Payload));
  const data = encoder.encode(JSON.stringify(payload));
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signature = Uint8Array.from(atob(base64Sig), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, signature, data);
  
  if (!valid) throw new Error('Invalid signature');
  return payload;
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function comparePassword(password, storedHash) {
  const hash = await hashPassword(password);
  return hash === storedHash;
}
