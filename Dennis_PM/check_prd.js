const https = require('https');

const email = 'dennis.he@gaatu.com';
const token = 'ATATT3xFfGF0EmEj8yaQXt-58od8vpZt9SofhCh4NGvzCUZZO9yfeqh5Pz_iMHmzf5OQGcnueTKbHWM5cCHqtMfD6uszNEL61Y7eTDMqu_drGmuM7bDToVyMifmEBkmLmrZw99lWwgEFIEuhdAExPN3pNGwEjMjivysjOGi4l-7llCyiWblMhVY=7A659FC5';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const options = {
      hostname: 'gaatuinc.atlassian.net',
      port: 443,
      path: `/wiki/rest/api${path}`,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function checkSpace() {
  console.log('=== 检查PRD空间 ===\n');
  const result = await makeRequest('GET', '/space/PRD');
  console.log(`状态: ${result.status}`);
  console.log(JSON.stringify(result.data, null, 2));
}

checkSpace().catch(console.error);
