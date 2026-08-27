# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in APU, please **do not** open a public GitHub issue. Instead, please email the maintainers directly with details about the vulnerability.

When reporting a security issue, please include:

- Description of the vulnerability
- Steps to reproduce (if possible)
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt of your report within 48 hours and will work to address the issue promptly.

## Supported Versions

We release security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

When using APU, please follow these security best practices:

- Keep your dependencies up to date
- Use environment variables for sensitive configuration
- Validate all inputs
- Use HTTPS in production
- Keep your Node.js version updated
- Review security advisories regularly

## Dependencies

We regularly monitor dependencies for security vulnerabilities. To check for vulnerabilities in your installation:

```bash
npm audit
npm audit fix
```

## Contact

For security concerns, please reach out to the maintainers through GitHub.

Thank you for helping keep APU secure!
