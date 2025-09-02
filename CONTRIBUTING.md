# Contributing to MMW Hubix

Thank you for your interest in contributing to MMW Hubix! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mmw-hubix.git
cd mmw-hubix

# Add the original repository as upstream
git remote add upstream https://github.com/codelsaac/mmw-hubix.git
```

### 2. Create a Branch
```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes
- Follow the coding standards outlined in `PROJECT_RULES.md`
- Write tests for new functionality
- Update documentation as needed
- Ensure all existing tests pass

### 4. Commit Changes
```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat(auth): add user registration functionality"
```

### 5. Push and Create Pull Request
```bash
# Push your branch to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the project's style guidelines
- [ ] All tests pass locally
- [ ] New features include tests
- [ ] Documentation is updated
- [ ] No merge conflicts exist
- [ ] Branch is up to date with main

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
```

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for utility functions
- Write component tests for React components
- Write integration tests for API routes
- Aim for high test coverage (>80%)

### Test Structure
```typescript
// Example test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

## 🎨 Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type assertions sparingly
- Prefer type over interface for simple objects

### React Components
```typescript
// Component structure
interface ComponentProps {
  // Define props with types
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.ts`
- Pages: `page.tsx` (Next.js convention)

## 📝 Documentation Guidelines

### Code Documentation
```typescript
/**
 * Calculates the total price including tax
 * @param basePrice - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.1 for 10%)
 * @returns The total price including tax
 */
export const calculateTotalPrice = (basePrice: number, taxRate: number): number => {
  return basePrice * (1 + taxRate);
};
```

### README Updates
When adding new features, update the README.md:
- Add new installation steps if needed
- Update feature descriptions
- Add new environment variables
- Update API documentation

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Try the latest version
3. Reproduce the bug

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js version: [e.g., 18.0.0]

## Additional Context
Any other context about the problem
```

## ✨ Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other context or screenshots
```

## 🔒 Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** create a public issue
2. Email the security team directly
3. Include detailed information about the vulnerability
4. Allow time for the team to respond before public disclosure

## 📚 Development Setup

### Prerequisites
- Node.js 18.0 or higher
- npm or pnpm
- Git

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/codelsaac/mmw-hubix.git
cd mmw-hubix

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file with:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Email**: Contact the development team directly

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing to MMW Hubix, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MMW Hubix! 🚀
