# 1099reps.com Secure HTTPS Setup

This README provides instructions for setting up and running the 1099reps.com website with HTTPS.

## Setup Instructions

### 1. Update your hosts file

To test the website locally with the domain name, add the following entry to your hosts file:

```text
127.0.0.1 1099reps.com www.1099reps.com
```

On macOS, you can edit the hosts file with:

```bash
sudo nano /etc/hosts
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Start the HTTPS server

```bash
npm start
```

This will start:

- HTTPS server on port 3000
- HTTP to HTTPS redirect server on port 8090

### 4. Access the secure website

Open your browser and navigate to:

```text
https://1099reps.com:3000
```

Note: Since we're using a self-signed certificate, your browser will show a security warning. This is normal for development environments. Click "Advanced" and then "Proceed" to access the site.

## Production Deployment

For a production environment, you should:

1. Obtain a proper SSL certificate from a trusted Certificate Authority (like Let's Encrypt)
2. Configure your web server (Apache, Nginx, etc.) to use the certificate
3. Set up proper redirects from HTTP to HTTPS

## Security Notes

- The self-signed certificate is for development purposes only
- In production, always use a certificate from a trusted authority
- Ensure all resources (images, scripts, etc.) are loaded over HTTPS
