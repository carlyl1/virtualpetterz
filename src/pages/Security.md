# Security Notes

- Never commit secrets (HF_API_KEY, wallet keys). Use environment variables.
- Chat proxy limits: rate-limited and 15s timeout. Increase cautiously.
- Helmet and compression enabled on server; CSP disabled due to scripts; tighten if hosting strictly.
- If enabling analytics later, use privacy-preserving tools and disclose in Privacy.
- Review third-party packages periodically; keep dependencies updated.