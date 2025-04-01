const https = require('https');
const fs = require('fs');
const path = require('path');

// SSL certificate options
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/certificate.crt'))
};

// Define the port for HTTPS (using 3001 for development to avoid conflicts)
const PORT = 3001;

// Create a secure file server with URL rewriting
const server = https.createServer(options, (req, res) => {
  // Parse the URL
  const parsedUrl = new URL(req.url, `https://${req.headers.host}`);
  let pathname = parsedUrl.pathname;
  
  // Remove trailing slash except for root
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
    // Redirect to the URL without trailing slash
    res.writeHead(301, { 'Location': pathname + parsedUrl.search });
    res.end();
    return;
  }
  
  // Get the requested URL path
  let filePath;
  
  // Handle root path
  if (pathname === '/') {
    filePath = path.join(__dirname, 'index.html');
  } 
  // Handle clean URLs (no file extension in URL)
  else if (!path.extname(pathname)) {
    // Check if a directory exists with this name
    const dirPath = path.join(__dirname, pathname.substring(1));
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      filePath = path.join(dirPath, 'index.html');
    } else {
      // Check if HTML file exists
      const htmlPath = path.join(__dirname, pathname.substring(1) + '.html');
      if (fs.existsSync(htmlPath)) {
        filePath = htmlPath;
      } else {
        // Default to treating it as a directory with index.html
        filePath = path.join(__dirname, pathname.substring(1), 'index.html');
      }
    }
  } 
  // Handle direct file requests (with extension)
  else {
    filePath = path.join(__dirname, pathname.substring(1));
  }

  // Get the file extension
  const extname = path.extname(filePath);
  
  // Define content types for different file extensions
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  
  // Set the content type based on the file extension
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Read the file and serve it
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          if (err) {
            // No custom 404 page, send simple message
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}/`);
});

// Add a redirect from HTTP to HTTPS
const http = require('http');
http.createServer((req, res) => {
  // Extract the hostname but replace the port with the HTTPS port
  const host = req.headers.host.split(':')[0];
  res.writeHead(301, { 'Location': `https://${host}:${PORT}${req.url}` });
  res.end();
}).listen(8091, () => {
  console.log('HTTP to HTTPS redirect server running on port 8091');
});
