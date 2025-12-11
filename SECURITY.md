# Security Guide

This document outlines the security measures implemented in this dApp and best practices for secure deployment.

## 🔒 Security Features Implemented

### 1. Input Validation & Sanitization

- **XSS Prevention**: All user inputs are sanitized to prevent cross-site scripting attacks
- **Input Length Limits**: 
  - NFT Name: Max 100 characters
  - NFT Description: Max 2000 characters
- **Character Filtering**: Removes HTML tags, script tags, and dangerous patterns
- **File Validation**: 
  - MIME type validation (only image types allowed)
  - File extension validation
  - File size limits (10MB client-side, 100MB for IPFS)

### 2. Contract Address Validation

- Validates Ethereum address format (0x + 40 hex characters)
- Prevents zero address usage
- Validates contract addresses before blockchain interactions

### 3. Error Message Sanitization

- Removes sensitive information from error messages
- Masks API keys, tokens, and file paths
- Prevents information leakage that could aid attackers

### 4. File Upload Security

- **MIME Type Validation**: Only allows image types (JPEG, PNG, GIF, WebP, SVG)
- **File Extension Validation**: Additional check on file extensions
- **Size Limits**: Prevents DoS attacks via large file uploads
- **File Type Verification**: Validates actual file content, not just extension

### 5. Environment Variables

- `.env` file is in `.gitignore` (verified)
- API keys are never committed to version control
- Client-side environment variables (VITE_*) are bundled but should not contain sensitive server-side keys

## ⚠️ Security Considerations

### Client-Side API Keys

**IMPORTANT**: This dApp uses `VITE_` prefixed environment variables, which means they are bundled into the client-side JavaScript. This is acceptable for:

- ✅ Public API keys (like Pinata JWT tokens for IPFS uploads)
- ✅ Public contract addresses
- ✅ Public RPC endpoints

**NOT acceptable for**:
- ❌ Private keys
- ❌ Server-side secrets
- ❌ Admin credentials

### Best Practices

1. **Never commit `.env` files** - Already configured in `.gitignore`
2. **Rotate API keys regularly** - If a key is exposed, rotate it immediately
3. **Use environment-specific keys** - Use different keys for development and production
4. **Monitor API usage** - Watch for unusual activity that might indicate key compromise
5. **Limit API key permissions** - Only grant minimum necessary permissions

## 🛡️ Additional Security Recommendations

### For Production Deployment

1. **Content Security Policy (CSP)**
   - Add CSP headers to prevent XSS attacks
   - Restrict resource loading to trusted domains

2. **HTTPS Only**
   - Always use HTTPS in production
   - Configure HSTS headers

3. **Rate Limiting**
   - Implement server-side rate limiting for API calls
   - Client-side rate limiting is implemented but can be bypassed

4. **CORS Configuration**
   - Configure CORS properly if using a backend API
   - Restrict origins to trusted domains

5. **Dependency Security**
   - Regularly update dependencies: `npm audit`
   - Use `npm audit fix` to fix vulnerabilities
   - Monitor for security advisories

6. **Smart Contract Security**
   - Audit smart contracts before deployment
   - Use established libraries (OpenZeppelin)
   - Test thoroughly before mainnet deployment

## 🔍 Security Audit Checklist

- [x] Input validation and sanitization
- [x] XSS prevention
- [x] File upload validation
- [x] Error message sanitization
- [x] Contract address validation
- [x] `.env` in `.gitignore`
- [ ] Content Security Policy headers (recommended for production)
- [ ] Rate limiting (server-side recommended)
- [ ] Dependency security audit
- [ ] Smart contract audit

## 🚨 If You Suspect a Security Breach

1. **Immediately rotate all API keys**
2. **Check API usage logs** for unauthorized access
3. **Review recent commits** for accidental key exposure
4. **Update all dependencies** to latest secure versions
5. **Notify users** if user data may be compromised

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Web3 Security Guide](https://www.web3.university/article/web3-security-guide)

## 🔐 Key Security Files

- `src/utils/security.ts` - Security utilities and validation functions
- `.gitignore` - Ensures `.env` is not committed
- `SECURITY.md` - This file

---

**Last Updated**: 2024
**Security Contact**: Review this document regularly and update as needed

