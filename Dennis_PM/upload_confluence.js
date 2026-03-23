const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFLUENCE_DOMAIN = 'gaatuinc.atlassian.net';
const CONFLUENCE_SPACE = 'dev';
const PAGE_TITLE = 'POD打印系统竞品深度分析报告 v2';

const MARKDOWN_FILE = path.join(__dirname, 'drafts', '2026-03-17-POD跨境电商分析', 'POD竞品深度分析v2.md');

function convertMarkdownToConfluenceStorageFormat(markdown) {
  let html = markdown;

  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  html = html.replace(/^\- \[ \] (.*$)/gm, '<ac:task-item><ac:task-status>incomplete</ac:task-status><ac:task-body>$1</ac:task-body></ac:task-item>');
  html = html.replace(/^\- \[x\] (.*$)/gm, '<ac:task-item><ac:task-status>complete</ac:task-status><ac:task-body>$1</ac:task-body></ac:task-item>');

  html = html.replace(/\|(.*)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    if (cells.length === 0 || match.includes('---')) return match;

    const isHeader = cells.every(c => c.trim().startsWith('-') || c.trim() === '');
    if (isHeader) return '';

    const rows = match.trim().split('\n');
    if (rows.length === 1) return match;

    let tableHtml = '<table><tbody>';
    rows.forEach((row, index) => {
      const cols = row.split('|').filter(c => c.trim());
      if (cols.length === 0) return;

      const tag = index === 0 ? 'th' : 'td';
      tableHtml += '<tr>';
      cols.forEach(col => {
        tableHtml += `<${tag}>${col.trim()}</${tag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[123]>)/g, '$1');
  html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  return html;
}

function makeRequest(email, token, method, path, data = null) {
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

async function uploadToConfluence(email, token) {
  console.log('=== 开始上传到 Confluence ===\n');

  console.log('1. 读取Markdown文件...');
  const markdownContent = fs.readFileSync(MARKDOWN_FILE, 'utf-8');
  console.log(`   文件大小: ${markdownContent.length} 字符\n`);

  console.log('2. 转换为Confluence格式...');
  const storageFormat = convertMarkdownToConfluenceStorageFormat(markdownContent);
  console.log(`   转换后大小: ${storageFormat.length} 字符\n`);

  console.log('3. 检查页面是否已存在...');
  const searchResult = await makeRequest(email, token, 'GET', `/content?title=${encodeURIComponent(PAGE_TITLE)}&spaceKey=${CONFLUENCE_SPACE}&expand=version`);

  let pageId;
  let version = 1;

  if (searchResult.status === 200 && searchResult.data.results && searchResult.data.results.length > 0) {
    const existingPage = searchResult.data.results[0];
    pageId = existingPage.id;
    version = existingPage.version.number + 1;
    console.log(`   页面已存在，ID: ${pageId}，当前版本: ${version - 1}，新版本: ${version}\n`);

    console.log('4. 更新现有页面...');
    const updateResult = await makeRequest(email, token, 'PUT', `/content/${pageId}`, {
      id: pageId,
      type: 'page',
      title: PAGE_TITLE,
      space: { key: CONFLUENCE_SPACE },
      body: {
        storage: {
          value: storageFormat,
          representation: 'storage'
        }
      },
      version: { number: version, message: `更新POD竞品分析报告 v2 - ${new Date().toISOString().split('T')[0]}` }
    });

    if (updateResult.status === 200) {
      console.log('   ✅ 页面更新成功!\n');
    } else {
      console.log('   ❌ 更新失败:', updateResult.data);
    }
  } else {
    console.log('   页面不存在，创建新页面...\n');

    console.log('4. 创建新页面...');
    const createResult = await makeRequest(email, token, 'POST', '/content', {
      type: 'page',
      title: PAGE_TITLE,
      space: { key: CONFLUENCE_SPACE },
      body: {
        storage: {
          value: storageFormat,
          representation: 'storage'
        }
      }
    });

    if (createResult.status === 200) {
      pageId = createResult.data.id;
      console.log('   ✅ 页面创建成功!\n');
    } else {
      console.log('   ❌ 创建失败:', createResult.data);
    }
  }

  console.log('=== 完成 ===');
  console.log(`页面链接: https://${CONFLUENCE_DOMAIN}/wiki/spaces/${CONFLUENCE_SPACE}/pages/${pageId}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('使用方法: node upload_confluence.js <email> <api_token>');
  console.log('');
  console.log('示例: node upload_confluence.js dennis@gaatu.com your-api-token');
  console.log('');
  console.log('获取API Token: https://id.atlassian.com/manage-profile/security/api-tokens');
  process.exit(1);
}

const email = args[0];
const token = args[1];

uploadToConfluence(email, token).catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
