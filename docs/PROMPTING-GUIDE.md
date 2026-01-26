# Prompting Guide for AI Assistants

This guide explains how to write effective prompts when asking AI assistants (Claude, ChatGPT, Copilot, etc.) to add new features to this codebase.

## Why This Matters

This project follows **Clean Architecture** with strict layer separation. The `CLAUDE.md` file contains instructions that AI assistants will follow automatically. However, well-structured prompts result in:

- Fewer iterations and corrections
- Code that matches your exact requirements
- Proper validation and error handling
- Consistent patterns across the codebase

## Prompt Template

### Basic Structure

```
Add a "[feature name]" module.

Entity:
- [field]: [type], [constraints]
- [field]: [type], [constraints]

Operations:
- [Operation 1]
- [Operation 2]

Business rules:
- [Rule 1]
- [Rule 2]
```

### Complete Template

```
Add a "[feature name]" module.

Entity: [EntityName]
- [field]: [type], [required/optional], [constraints]
- [field]: [type], [required/optional], [default value]
- [relationship]: references [OtherEntity]

Operations:
- Create [entity]
- Get [entity] by ID
- List [entities] (paginated)
- Update [entity]
- Delete [entity]
- [Custom operation]

Business rules:
- [Validation rule]
- [Authorization rule]
- [Domain logic]

Additional requirements:
- [ ] Include unit tests
- [ ] Include integration tests
- [ ] Add seed data
```

## Field Type Reference

| Type | Example | Notes |
|------|---------|-------|
| `string` | `name: string, required, max 100 chars` | Specify length limits |
| `number` | `price: number, required, positive` | Specify constraints |
| `boolean` | `active: boolean, default true` | Specify default |
| `date` | `publishedAt: date, optional` | |
| `enum` | `status: enum (draft, published, archived)` | List all values |
| `relation` | `authorId: references User` | Specify related entity |
| `array` | `tags: string[]` | |

## Examples by Complexity

### Simple CRUD Module

```
Add a "categories" module.

Entity:
- name: string, required, unique, max 50 chars
- description: string, optional, max 500 chars
- color: string, optional, hex color code

Operations:
- Create category
- Get category by ID
- List all categories
- Update category
- Delete category

Business rules:
- Cannot delete category if posts are using it
```

### Module with Relationships

```
Add a "posts" module.

Entity:
- title: string, required, max 200 chars
- slug: string, auto-generated from title, unique
- content: string, required
- excerpt: string, optional, max 300 chars
- published: boolean, default false
- publishedAt: date, optional
- authorId: references User
- categoryId: references Category

Operations:
- Create post (draft)
- Get post by ID
- Get post by slug
- List posts (paginated, filter by published/author/category)
- Update post
- Publish post
- Unpublish post
- Delete post

Business rules:
- Slug must be unique
- Only author can edit their posts
- publishedAt is set automatically when publishing
- Cannot publish without title and content
```

### Module with Complex Business Logic

```
Add a "comments" module.

Entity:
- content: string, required, max 1000 chars
- postId: references Post
- authorId: references User
- parentId: references Comment (optional, for replies)
- status: enum (pending, approved, spam, deleted)
- createdAt: date
- updatedAt: date

Operations:
- Add comment to post
- Reply to comment
- List comments for post (threaded/nested view)
- Approve comment (admin only)
- Mark as spam (admin only)
- Delete comment (soft delete)
- Get comment count for post

Business rules:
- Cannot comment on unpublished posts
- New comments are "pending" by default
- Maximum 3 levels of nesting for replies
- Deleted comments show as "[deleted]" but keep replies
- Author of post can delete any comment on their post
```

### Many-to-Many Relationship

```
Add a "tags" module and connect to posts.

Entity: Tag
- name: string, required, unique, max 30 chars
- slug: string, auto-generated, unique

Entity: PostTag (join table)
- postId: references Post
- tagId: references Tag
- unique constraint on (postId, tagId)

Operations:
- Create tag
- List all tags
- Add tags to post
- Remove tag from post
- Get posts by tag
- Get popular tags (by post count)

Business rules:
- Tag names are case-insensitive (store lowercase)
- Maximum 10 tags per post
```

### Feature with External Integration

```
Add file upload for user avatars.

Entity: Update User entity
- avatarUrl: string, optional

Operations:
- Upload avatar (image file)
- Remove avatar
- Get avatar URL

Technical requirements:
- Accept: jpg, png, webp
- Max size: 5MB
- Resize to 200x200
- Storage: local filesystem (configurable for S3 later)

Business rules:
- Only user can change their own avatar
- Old avatar is deleted when new one is uploaded
```

## Prompt Modifiers

Add these phrases to customize the output:

| Modifier | Effect |
|----------|--------|
| `"with unit tests"` | Creates test files for use cases |
| `"with integration tests"` | Creates API route tests |
| `"with seed data"` | Adds entries to `prisma/seed.ts` |
| `"minimal implementation"` | Only essential code, no extras |
| `"with documentation"` | Adds JSDoc comments |
| `"following existing patterns"` | Matches style of User module |

### Example with Modifiers

```
Add a "categories" module with unit tests and seed data.
Follow the existing User module patterns.

Entity:
- name: string, required, unique
- description: string, optional

Operations:
- CRUD operations
- List with pagination
```

## Anti-Patterns to Avoid

### ❌ Too Vague

```
Add posts to the app
```

*Problem: No field definitions, no operations specified, ambiguous requirements*

### ❌ Too Implementation-Focused

```
Create a PostController with getAll, getById, create, update, delete methods.
Add Post model to Prisma with title, content, userId fields.
Create PostService class.
```

*Problem: Dictating implementation details instead of requirements. Let the AI follow the architecture.*

### ❌ Missing Business Rules

```
Add a comments module with content, postId, userId fields.
CRUD operations.
```

*Problem: No validation rules, no authorization rules, no edge cases*

### ✅ Good Prompt

```
Add a "comments" module.

Entity:
- content: string, required, 1-1000 chars
- postId: references Post
- authorId: references User

Operations:
- Add comment to post
- List comments for post (paginated, newest first)
- Delete comment

Business rules:
- Cannot comment on unpublished posts
- Only comment author or post author can delete
- Validate post exists before creating comment
```

## Quick Reference Prompts

Copy-paste these and modify:

### Basic CRUD
```
Add a "[name]" module.

Entity:
- name: string, required
- description: string, optional

Operations: Full CRUD with pagination on list.
```

### Child Entity
```
Add "[child]" that belongs to [Parent].

Entity:
- [fields]
- parentId: references [Parent]

Operations:
- Create [child] for [parent]
- List [children] by [parent]
- Delete [child]

Business rules:
- [Parent] must exist
- Cascade delete when [parent] is deleted
```

### Enum Status Field
```
Add status workflow to [Entity].

Status values: draft, pending, approved, rejected

Operations:
- Submit for approval (draft → pending)
- Approve (pending → approved)
- Reject (pending → rejected)

Business rules:
- Only [role] can approve/reject
- Cannot edit after approved
```

### Search/Filter
```
Add search and filtering to [Entity] list.

Filters:
- status: exact match
- category: exact match
- createdAt: date range
- search: full-text on title and content

Sort options:
- createdAt (default, desc)
- title (asc)
- popularity
```

## What Happens After You Prompt

The AI will create files following this structure:

```
Created/Modified Files:
├── prisma/schema.prisma          (add model)
├── src/domain/
│   ├── entities/[name].entity.ts
│   ├── repositories/[name].repository.ts
│   └── errors/[name].errors.ts
├── src/application/
│   ├── dto/[name].dto.ts
│   └── use-cases/[name]/
│       ├── create-[name].use-case.ts
│       ├── get-[name]-by-id.use-case.ts
│       ├── list-[names].use-case.ts
│       ├── update-[name].use-case.ts
│       └── delete-[name].use-case.ts
├── src/infrastructure/
│   └── repositories/
│       ├── prisma-[name].repository.ts
│       └── [name].mapper.ts
├── src/interfaces/http/
│   ├── controllers/[name].controller.ts
│   └── routes/[name].routes.ts
├── src/main/
│   └── container.ts              (wire dependencies)
└── tests/                        (if requested)
    ├── unit/use-cases/
    └── integration/routes/
```

## After Code is Generated

Run these commands:

```bash
# 1. Generate migration
npm run prisma:migrate:dev -- --name add_[feature]

# 2. Verify types
npm run typecheck

# 3. Run linter
npm run lint

# 4. Run tests
npm test

# 5. Start dev server and test manually
npm run dev
```

## Complex (Non-CRUD) Features

For features beyond basic CRUD, use these templates:

---

### Authentication & Authorization

```
Add JWT authentication.

Features:
- Register with email/password
- Login (returns access + refresh tokens)
- Logout (invalidate refresh token)
- Refresh token endpoint
- Password reset via email

Technical details:
- Access token: 15 min expiry
- Refresh token: 7 days expiry, stored in database
- Password: bcrypt hashed, min 8 chars

Protected routes:
- All /api/* routes except /auth/*
- Attach user to request object

Include:
- Auth middleware
- Current user endpoint (GET /auth/me)
```

---

### Role-Based Access Control (RBAC)

```
Add role-based permissions.

Roles:
- user (default)
- moderator
- admin

Permissions:
- user: CRUD own resources
- moderator: user + approve/reject content, view all users
- admin: all permissions + manage users/roles

Implementation:
- Add role field to User (enum)
- Create authorization middleware
- Protect routes by role

Example rules:
- DELETE /users/:id → admin only
- PATCH /posts/:id/approve → moderator+
- GET /admin/stats → admin only
```

---

### File Upload

```
Add image upload for [entity].

Requirements:
- Accepted formats: jpg, png, webp
- Max file size: 5MB
- Resize to: 800x800 max (maintain aspect ratio)
- Generate thumbnail: 200x200

Storage:
- Development: local filesystem (uploads/)
- Production: [S3/Cloudinary/local]

API:
- POST /[entity]/:id/image (multipart/form-data)
- DELETE /[entity]/:id/image
- Return image URL in entity response

Business rules:
- Only owner can upload/delete
- Replace existing image on new upload
- Clean up orphaned files
```

---

### Payment Integration

```
Add Stripe payment processing.

Features:
- Create payment intent
- Handle webhook events
- Store payment records

Entities:
Payment:
- id, visitorId, visitorInfoId, amount, currency, status
- stripePaymentIntentId
- createdAt, paidAt

Flow:
1. Client requests payment intent
2. Server creates Stripe PaymentIntent
3. Client completes payment with Stripe.js
4. Stripe sends webhook
5. Server updates payment status

Webhook events to handle:
- payment_intent.succeeded
- payment_intent.failed

Security:
- Verify webhook signature
- Idempotency for webhook processing
```

---

### Background Jobs / Async Processing

```
Add background job processing.

Use case: [Send welcome email after registration]

Requirements:
- Job queue (Bull/BullMQ with Redis, or simple DB-based)
- Retry failed jobs (max 3 attempts)
- Job status tracking

Jobs to implement:
1. SendEmailJob
   - Input: { to, subject, template, data }
   - Retry: 3 times with exponential backoff

2. ProcessImageJob
   - Input: { imageId, operations: ['resize', 'thumbnail'] }
   - Retry: 2 times

API:
- Jobs are dispatched from use cases
- GET /admin/jobs - list recent jobs (admin only)
- POST /admin/jobs/:id/retry - retry failed job
```

---

### Real-time Features (WebSockets)

```
Add real-time notifications.

Features:
- WebSocket connection for authenticated users
- Send notification when:
  - Someone comments on user's post
  - Someone likes user's post
  - New follower

Implementation:
- Socket.io or ws library
- Authenticate socket connection with JWT
- Room per user (user:{userId})

Events:
- Server → Client:
  - notification:new { type, message, data, createdAt }
  - notification:count { unread: number }

- Client → Server:
  - notification:markRead { notificationId }
  - notification:markAllRead

Entity: Notification
- id, visitorId, visitorInfoId, type, message, data (JSON), read, createdAt
```

---

### Search & Filtering

```
Add full-text search to posts.

Search fields:
- title (weight: high)
- content (weight: medium)
- tags (weight: low)

API:
GET /posts/search?q=keyword&filters=...

Filters (combinable):
- category: exact match
- author: exact match
- published: boolean
- dateRange: { from, to }
- tags: array (any match)

Sort options:
- relevance (default for search)
- newest
- oldest
- popular (by likes/views)

Pagination:
- Cursor-based for infinite scroll
- Include total count

Technical:
- Use PostgreSQL full-text search (ts_vector)
- Or integrate Elasticsearch/Meilisearch
```

---

### State Machine / Workflow

```
Add order status workflow.

States:
- pending (initial)
- confirmed
- processing
- shipped
- delivered
- cancelled

Transitions:
- pending → confirmed (by system after payment)
- pending → cancelled (by user or timeout)
- confirmed → processing (by admin)
- processing → shipped (by admin, requires tracking number)
- shipped → delivered (by system or admin)
- confirmed/processing → cancelled (by admin only, requires reason)

Entity changes:
- Add status: enum
- Add statusHistory: JSON[] (track all changes)
- Add cancelReason: string (optional)
- Add trackingNumber: string (optional)

API:
- PATCH /orders/:id/status { status, reason?, trackingNumber? }
- GET /orders/:id/history

Business rules:
- Validate transition is allowed
- Record who made the change and when
- Send notification on status change
- Cannot modify order after delivered/cancelled
```

---

### External API Integration

```
Add weather data integration.

Provider: OpenWeatherMap API

Features:
- Get current weather by city
- Get 5-day forecast
- Cache results (TTL: 30 minutes)

API:
- GET /weather/current?city=London
- GET /weather/forecast?city=London&days=5

Implementation:
- Create WeatherService in infrastructure/services/
- Handle API errors gracefully
- Return normalized response (not raw API data)
- Add rate limiting (100 requests/hour)

Environment variables:
- WEATHER_API_KEY
- WEATHER_API_URL

Caching:
- Cache key: weather:{type}:{city}
- Use Redis or in-memory cache
```

---

### Analytics / Reporting

```
Add analytics dashboard data.

Metrics:
1. User stats
   - Total users
   - New users (today/week/month)
   - Active users (last 7 days)

2. Content stats
   - Total posts
   - Posts by status (draft/published)
   - Posts per category (chart data)

3. Engagement stats
   - Total comments
   - Comments per day (last 30 days)
   - Top posts by comments

API:
- GET /admin/analytics/overview
- GET /admin/analytics/users?period=month
- GET /admin/analytics/content
- GET /admin/analytics/engagement?days=30

Response format:
{
  "metric": "newUsers",
  "value": 150,
  "change": "+12%",
  "data": [{ "date": "2024-01-01", "value": 10 }, ...]
}

Authorization: Admin only
Caching: 5 minutes TTL
```

---

### Multi-tenancy

```
Add organization/workspace support.

Model:
- Organization { id, name, slug, plan, createdAt }
- OrganizationMember { visitorInfoId, visitorId, role }
- All existing entities get organizationId

Roles within org:
- owner (1 per org, can delete org)
- admin (manage members, settings)
- member (standard access)

Behavior:
- Users can belong to multiple orgs
- All queries scoped to current org
- Org selected via header: X-Organization-Id
- Validate user has access to org

API changes:
- POST /organizations (create org, user becomes owner)
- GET /organizations (list user's orgs)
- POST /organizations/:id/members (invite)
- All other endpoints now org-scoped
```

---

### Rate Limiting

```
Add API rate limiting.

Limits:
- Anonymous: 20 requests/minute
- Authenticated: 100 requests/minute
- Premium users: 1000 requests/minute

Per-endpoint limits:
- POST /auth/login: 5/minute (prevent brute force)
- POST /upload: 10/minute
- Search endpoints: 30/minute

Implementation:
- Use Redis for distributed counting
- Return headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Return 429 Too Many Requests when exceeded

Configuration:
- Limits configurable via environment
- Whitelist certain IPs (internal services)
```

---

### Scheduled Tasks (Cron Jobs)

```
Add scheduled tasks.

Tasks:
1. Clean expired sessions
   - Schedule: Every hour
   - Delete sessions older than 7 days

2. Send weekly digest email
   - Schedule: Every Monday 9am UTC
   - Send to users with notifications enabled
   - Include: new posts, popular content

3. Generate sitemap
   - Schedule: Every day at midnight
   - Output: public/sitemap.xml

Implementation:
- Use node-cron or similar
- Log task execution
- Handle errors without crashing
- Prevent duplicate runs (distributed lock if multiple instances)

Environment:
- ENABLE_CRON=true/false (disable in dev)
```

---

## Describing Complex Logic

When your feature has complex logic, structure your prompt like this:

```
Add [feature name].

## Overview
[2-3 sentences explaining the feature and why it's needed]

## User Stories
- As a [role], I want to [action] so that [benefit]
- As a [role], I want to [action] so that [benefit]

## Technical Requirements
- [Requirement 1]
- [Requirement 2]

## Data Model
[Describe entities and relationships]

## API Endpoints
[List the endpoints needed]

## Business Rules
[List validation and logic rules]

## Error Handling
[Describe expected error cases]

## Security Considerations
[Auth, permissions, validation]

## Out of Scope
[What this feature does NOT include - helps set boundaries]
```

### Example: Complex Feature Prompt

```
Add a referral system.

## Overview
Users can invite friends via unique referral links. Both referrer and
referee get rewards when the referee completes their first purchase.

## User Stories
- As a user, I want to share my referral link so I can earn rewards
- As a new user, I want to use a referral code to get a discount
- As an admin, I want to see referral statistics

## Data Model
Referral:
- id
- referrerId: references User
- refereeId: references User (nullable until signup)
- code: string, unique
- status: enum (pending, completed, expired, rewarded)
- rewardAmount: number
- createdAt, completedAt, rewardedAt

## API Endpoints
- GET /referrals/my-code - get or generate user's referral code
- GET /referrals/stats - user's referral statistics
- POST /referrals/validate - check if referral code is valid
- POST /auth/register - accept optional referralCode
- GET /admin/referrals - list all referrals with filters

## Business Rules
- Each user has one unique referral code (generated on first request)
- Referral code expires after 30 days of inactivity
- Referee must complete purchase within 14 days
- Reward: $10 credit for referrer, 10% discount for referee
- Maximum 50 successful referrals per user
- Cannot refer yourself or existing users

## Error Handling
- Invalid/expired referral code
- User already referred
- Referral limit reached
- Self-referral attempt

## Security
- Validate code format before database lookup
- Rate limit code validation endpoint
- Log suspicious activity (many failed validations)

## Out of Scope
- Multi-level referrals (MLM style)
- Referral leaderboard
- Social sharing integrations
```

---

## Tips for Best Results

1. **Be specific about field constraints** - "max 100 chars" is better than "string"

2. **Explicitly state relationships** - "references User" not "has userId"

3. **Include authorization rules** - "only author can edit" or "admin only"

4. **Mention edge cases** - "cannot delete if has children"

5. **Reference existing modules** - "similar to User module" helps maintain consistency

6. **One module at a time** - Complex features should be added incrementally
