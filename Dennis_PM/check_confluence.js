const https = require('https');

const CONFLUENCE_DOMAIN = 'gaatuinc.atlassian.net';
const email = 'dennis.he@gaatu.com';
const token = 'ATATT3xFfGF0EmEj8yaQXt-58od8vpZt9SofhCh4NGvzCUZZO9yfeqh5Pz_iMHmzf5OQGcnueTKbHWM5cCHqtMfD6uszNEL61Y7eTDMqu_drGmuM7bDToVyMifmEBkmLmrZw99lWwgEFIEuhdAExPN3pNGwEjMjivysjOGi4l-7llCyiWblMhVY=7A659FC5';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    const options = {
      hostname: CONFLUENCE_DOMAIN,
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkSpace() {
  console.log('=== 检查Confluence空间 ===\n');

  console.log('1. 列出所有空间...');
  const spacesResult = await makeRequest('GET', '/space');
  console.log(`   状态: ${spacesResult.status}`);
  if (spacesResult.data.results) {
    console.log(`   找到 ${spacesResult.data.results.length} 个空间:`);
    spacesResult.data.results.forEach(s => {
      console.log(`   - ${s.key}: ${s.name}`);
    });
  }

  console.log('\n2. 检查Dennis-PRDs空间...');
  const spaceResult = await makeRequest('GET', '/space/Dennis-PRDs');
  console.log(`   状态: ${spaceResult.status}`);
  console.log(`   结果: ${JSON.stringify(spaceResult.data)}`);

  console.log('\n3. 检查当前用户权限...');
  const userResult = await makeRequest('GET', '/user/current');
  console.log(`   状态: ${userResult.status}`);
  console.log(`   用户: ${JSON.stringify(userResult.data)}`);
}

checkSpace().catch(err => {
  console.error('错误:', err.message);
});
