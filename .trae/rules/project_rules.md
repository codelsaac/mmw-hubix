## MMW Hubix - Project Rules & Guidelines

## 🤖 AI Assistant Rules

### Documentation Updates
- **MANDATORY**: AI must update `README.md` whenever:
  - Repository URL changes
  - New features are added
  - Dependencies are updated
  - Installation instructions change
  - New environment variables are added
  - Deployment process changes

### Code Quality Standards
- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Code must pass ESLint checks before committing
- **Naming Conventions**: 
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Files: kebab-case (e.g., `user-profile.tsx`)
  - Variables: camelCase (e.g., `userName`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Git Workflow Rules
- **Branch Naming**: 
  - Features: `feature/description` (e.g., `feature/user-authentication`)
  - Bug fixes: `fix/description` (e.g., `fix/login-error`)
  - Hotfixes: `hotfix/description` (e.g., `hotfix/security-patch`)
- **Commit Messages**: 
  - Format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(auth): add user login functionality`

### Security Rules
- **Environment Variables**: Never commit `.env` files
- **API Keys**: Use environment variables for all sensitive data
- **Authentication**: Always validate user permissions
- **Input Validation**: Sanitize all user inputs

## 📁 File Organization Rules

### Directory Structure
```
app/                    # Next.js App Router pages only
├── (auth)/            # Route groups for authentication
├── admin/             # Admin-only pages
├── api/               # API routes
└── dashboard/         # Dashboard pages

components/            # Reusable React components
├── ui/               # Base UI components (shadcn/ui)
├── auth/             # Authentication components
├── admin/            # Admin-specific components
└── dashboard/        # Dashboard components

lib/                  # Utility functions and configurations
hooks/                # Custom React hooks
config/               # Configuration files
```

### Import Rules
- **Absolute Imports**: Use `@/` prefix for internal imports
- **Order**: 
  1. React imports
  2. Third-party libraries
  3. Internal components
  4. Types and interfaces
  5. Relative imports

## 🧪 Testing Rules

### Test Requirements
- **Unit Tests**: Required for utility functions
- **Component Tests**: Required for complex components
- **Integration Tests**: Required for API routes
- **E2E Tests**: Required for critical user flows

### Test File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## 🚀 Deployment Rules

### Environment Management
- **Development**: Use `.env.local`
- **Staging**: Use `.env.staging`
- **Production**: Use `.env.production`

### Build Requirements
- **TypeScript**: Must compile without errors
- **ESLint**: Must pass all linting rules
- **Tests**: All tests must pass
- **Bundle Size**: Monitor and optimize bundle size

## 📝 Documentation Rules

### Code Documentation
- **Functions**: Document complex functions with JSDoc
- **Components**: Document component props and usage
- **API Routes**: Document request/response schemas
- **Database Models**: Document relationships and constraints

### README Updates
AI must update README.md when:
- ✅ New features are implemented
- ✅ Dependencies are added/removed
- ✅ Installation process changes
- ✅ Environment variables are added
- ✅ API endpoints are modified
- ✅ Database schema changes
- ✅ Deployment process updates

## 🔒 Security Guidelines

### Authentication & Authorization
- Use NextAuth.js for authentication
- Implement role-based access control (RBAC)
- Validate permissions on both client and server
- Use secure session management

### Data Protection
- Sanitize all user inputs
- Use parameterized queries (Prisma)
- Implement rate limiting
- Log security events

### Environment Security
- Never commit secrets to version control
- Use different secrets for different environments
- Rotate secrets regularly
- Monitor for exposed credentials

## 🎨 UI/UX Rules

### Design System
- Use shadcn/ui components as base
- Follow consistent spacing (Tailwind CSS)
- Maintain color scheme consistency
- Ensure responsive design

### Accessibility
- Use semantic HTML
- Provide alt text for images
- Ensure keyboard navigation
- Test with screen readers

## 📊 Performance Rules

### Optimization Requirements
- **Images**: Use Next.js Image component
- **Fonts**: Use Next.js Font optimization
- **Code Splitting**: Implement dynamic imports
- **Caching**: Use appropriate caching strategies

### Monitoring
- Monitor Core Web Vitals
- Track bundle size
- Monitor API response times
- Log performance metrics

## 🐛 Bug Reporting Rules

### Issue Templates
- Use provided issue templates
- Include reproduction steps
- Provide environment details
- Add relevant screenshots/logs

### Bug Fix Process
1. Create issue with detailed description
2. Assign appropriate labels
3. Create feature branch
4. Implement fix with tests
5. Submit pull request
6. Code review and merge

## 🔄 Code Review Rules

### Review Requirements
- At least one approval required
- All CI checks must pass
- No merge conflicts
- Updated documentation

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

## 📈 Version Control Rules

### Semantic Versioning
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Process
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production
5. Update documentation

## 🚨 Emergency Procedures

### Security Incidents
1. Immediately revoke compromised credentials
2. Assess impact and scope
3. Notify stakeholders
4. Implement fixes
5. Document incident

### Critical Bugs
1. Create hotfix branch
2. Implement minimal fix
3. Test thoroughly
4. Deploy immediately
5. Follow up with proper fix

---

## 📋 Compliance Checklist

Before any deployment or major release:

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: IT Prefect Team, C.C.C. Mong Man Wai College