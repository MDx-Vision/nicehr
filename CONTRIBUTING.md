# Contributing to NiceHR

Thank you for your interest in contributing to NiceHR! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Commit Guidelines](#commit-guidelines)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what is best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct that could be considered inappropriate

### Enforcement

Violations may result in temporary or permanent exclusion from the project. Report issues to conduct@nicehr.com.

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14+
- Git
- npm or yarn

### Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/nicehr.git
   cd nicehr
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/mdxvision/nicehr.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

6. **Set up database**

   ```bash
   npm run db:push
   npm run seed  # Optional: seed demo data
   ```

7. **Start development server**

   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Urgent production fixes |

### Creating a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define types for all function parameters and returns
- Avoid `any` type when possible

```typescript
// Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Avoid
function calculateTotal(items: any): any {
  return items.reduce((sum: any, item: any) => sum + item.price, 0);
}
```

### React Components

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components focused and small

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User.ts` |
| Tests | Same as file + `.cy.js` or `.test.ts` | `UserProfile.cy.js` |

### Code Organization

```
client/src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
├── pages/          # Page components
└── types/          # TypeScript types

server/
├── routes/         # API route handlers
├── services/       # Business logic
├── utils/          # Utility functions
└── middleware/     # Express middleware
```

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Max line length: 100 characters

We recommend using Prettier with the project's configuration.

---

## Testing Requirements

### Test Coverage

All new features must include tests:

| Change Type | Required Tests |
|-------------|----------------|
| New feature | E2E tests + unit tests |
| Bug fix | Regression test |
| API endpoint | API integration test |
| UI component | E2E test |

### Running Tests

```bash
# Run all E2E tests
CYPRESS_TEST=true npx cypress run

# Run specific test file
CYPRESS_TEST=true npx cypress run --spec "cypress/e2e/your-test.cy.js"

# Open Cypress UI
CYPRESS_TEST=true npx cypress open
```

### Writing E2E Tests

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
    cy.visit('/page');
  });

  it('should do something specific', () => {
    // Arrange
    cy.get('[data-testid="button"]').should('be.visible');

    // Act
    cy.get('[data-testid="button"]').click();

    // Assert
    cy.contains('Expected result').should('be.visible');
  });
});
```

### Test Naming

- Use descriptive test names
- Follow "should [expected behavior]" pattern
- Group related tests with `describe`

### Test Data

- Use `data-testid` attributes for test selectors
- Mock API responses for predictable tests
- Clean up test data after tests

---

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`CYPRESS_TEST=true npx cypress run`)
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Commits are clean and well-organized

### Creating a Pull Request

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**

   - Use a clear, descriptive title
   - Fill out the PR template
   - Link related issues

3. **PR Title Format**

   ```
   type(scope): brief description

   Examples:
   feat(crm): add contact import feature
   fix(auth): resolve session timeout issue
   docs(api): update endpoint documentation
   ```

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
- [ ] Tests added/updated
- [ ] All tests passing

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
```

### Review Process

1. Automated checks run (tests, linting)
2. Code review by maintainer
3. Address feedback
4. Approval and merge

### After Merge

```bash
# Delete local branch
git checkout main
git branch -d feature/your-feature-name

# Sync with upstream
git pull upstream main
```

---

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
feat(crm): add bulk contact import

# Bug fix
fix(auth): resolve session expiration issue

# Documentation
docs(api): add CRM endpoint examples

# Refactor
refactor(storage): simplify database queries
```

### Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive messages
- Reference issues when applicable (`Fixes #123`)

---

## Documentation

### When to Update Documentation

- New features: Add to FEATURES.md and API.md
- API changes: Update API.md
- Configuration changes: Update README.md
- Architecture changes: Update ARCHITECTURE.md

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use markdown formatting consistently

### Adding API Documentation

When adding new endpoints, document in API.md:

```markdown
### Endpoint Name

```http
METHOD /api/endpoint
```

**Description:** What the endpoint does

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | Description |

**Response:**
```json
{
  "data": { ... }
}
```
```

---

## Questions?

- **General questions:** Create a GitHub Discussion
- **Bug reports:** Create a GitHub Issue
- **Security issues:** Email security@nicehr.com

Thank you for contributing to NiceHR!
