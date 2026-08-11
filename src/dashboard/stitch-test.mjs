const { StitchToolClient } = await import('@google/stitch-sdk');

const accessToken = "REDACTED_GOOGLE_OAUTH_TOKEN";

const client = new StitchToolClient({ 
  accessToken,
  timeout: 30000 
});

const { tools } = await client.listTools();
console.log('Available tools:', tools.map(t => t.name));
await client.close();
