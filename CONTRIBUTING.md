# Contributing to MCP Integration Platform

We're excited that you're interested in contributing to the MCP Integration Platform! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to be respectful and professional.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Rust 1.70+ and Cargo
- PostgreSQL 14+
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-integration-platform.git
   cd mcp-integration-platform
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/slab1/mcp-integration-platform.git
   ```

### Development Setup

1. **Frontend Setup:**
   ```bash
   cd mcp-platform
   pnpm install
   cp .env.example .env.local
   # Configure your environment variables
   pnpm dev
   ```

2. **Backend Setup:**
   ```bash
   cd rust-ai-agent-system
   cargo build
   cp configs/development.toml.example configs/development.toml
   # Configure your database settings
   cargo run
   ```

3. **Database Setup:**
   ```bash
   cd supabase
   supabase start
   supabase db reset
   ```

## 📝 Making Changes

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/issue-number-description` - Feature branches
- `hotfix/issue-number-description` - Urgent fixes

### Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/123-add-new-agent-type
   ```

2. **Make your changes:**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes:**
   ```bash
   # Frontend tests
   cd mcp-platform && pnpm test
   
   # Backend tests
   cd rust-ai-agent-system && cargo test
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add support for new agent type (#123)"
   ```

5. **Push and create a PR:**
   ```bash
   git push origin feature/123-add-new-agent-type
   ```
   Then create a Pull Request on GitHub.

## 🎨 Code Style

### TypeScript/React

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful component and variable names

### Rust

- Follow `rustfmt` formatting
- Use `clippy` for linting
- Write comprehensive error handling
- Include unit tests for public functions
- Document public APIs with doc comments

### General

- Write clear commit messages following [Conventional Commits](https://conventionalcommits.org/)
- Keep PRs focused and reasonably sized
- Include relevant tests
- Update documentation

## 🧪 Testing

### Frontend Testing

```bash
cd mcp-platform
pnpm test          # Unit tests
pnpm test:e2e      # End-to-end tests
pnpm test:coverage # Coverage report
```

### Backend Testing

```bash
cd rust-ai-agent-system
cargo test                           # Unit tests
cargo test --features integration    # Integration tests
cargo tarpaulin --out Html          # Coverage report
```

### Test Requirements

- All new features must include tests
- Maintain or improve test coverage
- Tests should be fast and reliable
- Use descriptive test names

## 📚 Documentation

### Code Documentation

- Document all public APIs
- Include usage examples
- Explain complex algorithms
- Keep comments up-to-date

### User Documentation

- Update relevant user guides
- Add new features to documentation
- Include screenshots for UI changes
- Test documentation accuracy

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Details:**
   - OS and version
   - Node.js/Rust versions
   - Browser (for frontend issues)

2. **Reproduction Steps:**
   - Clear step-by-step instructions
   - Expected vs actual behavior
   - Screenshots/videos if helpful

3. **Additional Context:**
   - Error messages and stack traces
   - Related issues or PRs
   - Possible solutions you've tried

## ✨ Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with implementation details
4. **Consider alternatives** and trade-offs
5. **Discuss impact** on existing functionality

## 🔍 Code Review

### For Contributors

- Respond to feedback promptly
- Ask questions if unclear
- Make requested changes
- Keep discussions professional

### For Reviewers

- Be constructive and respectful
- Focus on code quality and correctness
- Suggest improvements
- Approve when ready

## 📋 Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for changes
- [ ] Updated documentation

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Changes generate no new warnings
- [ ] Tests added for new functionality
```

### Review Process

1. **Automated Checks:** CI/CD pipeline runs tests
2. **Code Review:** Maintainers review code quality
3. **Testing:** Manual testing if needed
4. **Approval:** At least one maintainer approval required
5. **Merge:** Squash and merge to main

## 🏗️ Architecture Guidelines

### Frontend Architecture

- Use React functional components
- Implement proper state management
- Follow component composition patterns
- Use TypeScript for type safety

### Backend Architecture

- Follow Rust best practices
- Use proper error handling
- Implement comprehensive logging
- Design for scalability

### Database Design

- Use proper normalization
- Implement row-level security
- Add appropriate indexes
- Consider performance implications

## 🎯 Performance Guidelines

### Frontend Performance

- Optimize bundle size
- Implement code splitting
- Use proper caching strategies
- Minimize re-renders

### Backend Performance

- Optimize database queries
- Implement proper caching
- Use connection pooling
- Monitor memory usage

## 🔒 Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines

## 📞 Getting Help

- **GitHub Issues:** For bugs and feature requests
- **Discussions:** For questions and general discussion
- **Email:** For security-related issues
- **Discord:** For real-time chat (link in README)

## 🙏 Recognition

We appreciate all contributions! Contributors will be:

- Listed in our contributors section
- Mentioned in release notes
- Invited to contributor events
- Considered for maintainer roles

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the MCP Integration Platform! 🚀