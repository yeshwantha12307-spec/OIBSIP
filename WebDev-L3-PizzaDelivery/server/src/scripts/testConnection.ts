import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Ensure SRV records resolve cleanly even if local Windows/router DNS blocks SRV queries
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore if not permitted
}

// Load .env
dotenv.config();

const testAtlasConnection = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log(JSON.stringify({
      configured: false,
      error: 'MONGODB_URI is not set in server/.env',
    }));
    process.exit(1);
  }

  // Check if placeholder is present
  const hasPlaceholder = uri.includes('<db_password>') || uri.includes('<password>');

  // Parse safe metadata without secrets
  let protocol = 'unknown';
  let host = 'unknown';
  let database = 'test';

  try {
    const match = uri.match(/^(mongodb(?:\+srv)?):\/\/(?:[^:]+:[^@]+@)?([^/?#]+)(?:\/([^?#]*))?/);
    if (match) {
      protocol = match[1];
      host = match[2];
      database = match[3] || 'test (default)';
    }
  } catch {
    // ignore parse error
  }

  if (hasPlaceholder) {
    console.log(JSON.stringify({
      configured: true,
      protocol,
      host,
      database,
      hasPlaceholder: true,
      errorCategory: 'PLACEHOLDER_NOT_REPLACED',
      details: 'The connection string contains the literal placeholder <db_password>. You need to replace <db_password> with your actual database user password in server/.env.',
    }, null, 2));
    process.exit(0);
  }

  console.log(`[Diagnostic] Attempting connection to ${protocol}://${host}/${database}...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    const dbName = conn.connection.name;
    const clusterHost = conn.connection.host;

    await mongoose.disconnect();

    console.log(JSON.stringify({
      configured: true,
      connected: true,
      protocol,
      clusterHost,
      dbName,
    }, null, 2));
    process.exit(0);
  } catch (err: any) {
    const message = err?.message || '';
    let errorCategory = 'UNKNOWN';

    if (message.includes('bad auth') || message.includes('Authentication failed')) {
      errorCategory = 'AUTHENTICATION_FAILED';
    } else if (message.includes('ENOTFOUND') || message.includes('querySrv')) {
      errorCategory = 'DNS_RESOLUTION_FAILED';
    } else if (
      message.includes('selection timed out') ||
      message.includes('timed out') ||
      message.includes('whitelisted') ||
      message.includes('SSL alert') ||
      message.includes('ReplicaSetNoPrimary')
    ) {
      errorCategory = 'NETWORK_TIMEOUT_OR_IP_RESTRICTION';
    }

    const serverDetails: any[] = [];
    if (err.reason?.servers) {
      for (const [address, desc] of err.reason.servers.entries()) {
        serverDetails.push({
          address,
          type: desc.type,
          error: desc.error?.message || desc.error || 'None',
        });
      }
    }

    console.log(JSON.stringify({
      configured: true,
      connected: false,
      protocol,
      host,
      errorCategory,
      errorMessage: message.replace(/\/\/(.*?)@/, '//***:***@'),
      serverDetails,
    }, null, 2));
    process.exit(0);
  }
};

testAtlasConnection();
