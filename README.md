# backend-Infrastructure

Building a fully functional and scalable backend system with Nest.js for photography management.

## 📸 Features

### Google Drive Integration (Enhanced)

- **Connect Google Drive folders to events** - Admins can add Google Drive URLs to events
- **Display images from Google Drive** - Automatically fetch and display images from linked folders
- **Dual URL Strategy** - Each photo has both a direct Google Drive URL and a backend proxy URL for maximum reliability
- **Image Optimization** - Backend proxy supports automatic resizing and compression
- **Token-based photo selection** - Secure, shareable links with optional expiration
- **ZIP downloads** - Download multiple selected photos as a single ZIP file
- **Automatic cleanup** - Expired selections are automatically removed
- **High performance** - Cached folder and file IDs for faster operations

See [Setup Enhanced Features](./docs/SETUP_ENHANCED_FEATURES.md) for setup instructions.

### Country-Based Multi-Tenancy

The API implements country-based access control to support multi-region operations (Nigeria and UK). All requests are automatically scoped to a specific country.

#### Country Detection

The system detects the country from (in order of priority):

1. **X-Country Header**

   ```bash
   curl -H "X-Country: NG" http://localhost:3000/events
   ```

2. **Subdomain**

   ```bash
   # Automatically detects NG
   curl http://ng.yourdomain.com/events

   # Automatically detects UK
   curl http://uk.yourdomain.com/events
   ```

3. **Query Parameter**

   ```bash
   curl http://localhost:3000/events?country=UK
   ```

4. **Default**: Nigeria (NG) if no country is specified

#### Country Scoping

**Country-Scoped Resources:**

- **Events** - Filtered by requesting country, includes all operations (photos, sync, downloads)
- **Bookings** - Filtered by requesting country, includes assignments
- **Clients** - Filtered by requesting country
- **Download Links** - Region-locked to the country where they were created

**Global Resources:**

- **Users** - Accessible from all countries (staff can work across regions)

#### Security

- **Access Control**: Users cannot access resources from other countries even with valid IDs
- **Generic Errors**: Failed cross-country access returns "not found" without revealing data existence
- **Automatic Assignment**: New resources inherit country from request context

#### Example Usage

```bash
# Create an event in Nigeria
curl -X POST http://localhost:3000/events \
  -H "X-Country: NG" \
  -H "Content-Type: application/json" \
  -d '{"name": "Lagos Wedding", "slug": "lagos-wedding", "category": "WEDDING"}'

# Try to access from UK (will fail)
curl -H "X-Country: UK" http://localhost:3000/events/{lagos-wedding-id}
# Returns: null or 404

# List UK events only
curl -H "X-Country: UK" http://localhost:3000/events
```

See [Country Filtering Guide](./docs/COUNTRY_FILTERING.md) for complete documentation.

## 🚀 Quick Start

### Installation

```bash
$ yarn install
```

### Environment Setup

1. Copy the example environment file:

```bash
$ cp .env.example .env
```

2. Configure your environment variables:
   - `JWT_SECRET` - Your JWT secret key
   - `DATABASE_URL` - Your database connection string
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` - Google service account private key

See [Google Drive Setup Guide](./docs/GOOGLE_DRIVE_SETUP.md) for detailed instructions on obtaining Google credentials.

### Database Setup

```bash
# Generate Prisma Client
$ yarn prisma:generate

# Run migrations
$ yarn prisma:migrate

# (Optional) Open Prisma Studio to view data
$ yarn prisma:studio
```

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 Documentation

### Quick Start

- **[Setup Enhanced Features](./docs/SETUP_ENHANCED_FEATURES.md)** - Quick setup for new features (3 steps)
- **[Google Drive Quick Start](./docs/GOOGLE_DRIVE_QUICK_START.md)** - 5-minute setup guide

### Photo Management

- **[Photo URL Strategy](./docs/PHOTO_URL_STRATEGY.md)** - 🆕 Guide to using dual URLs (Google Drive + Proxy)
- **[Dual URL Implementation](./docs/DUAL_URL_IMPLEMENTATION.md)** - 🆕 Quick reference for frontend integration
- **[Image Optimization](./docs/IMAGE_OPTIMIZATION.md)** - Backend image resizing and compression

### Google Drive Integration

- **[Google Drive Setup Guide](./docs/GOOGLE_DRIVE_SETUP.md)** - Detailed Google Drive configuration
- **[Get Google Credentials](./docs/HOW_TO_GET_GOOGLE_CREDENTIALS.md)** - Step-by-step credential setup
- **[Google Drive API Documentation](./docs/GOOGLE_DRIVE_API.md)** - Complete API reference
- **[Enhanced Features Guide](./docs/GOOGLE_DRIVE_ENHANCED_FEATURES.md)** - Detailed feature documentation

### Architecture

- **[Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)** - Overview of what was implemented
- **[Country Filtering Guide](./docs/COUNTRY_FILTERING.md)** - Country-based multi-tenancy documentation
- **[Country Routing](./docs/COUNTRY_ROUTING.md)** - Multi-country support documentation

## 🏗️ Architecture

1. **Microservices Architecture:**

   - Use microservices to divide the application into smaller, manageable services.
   - Ensure each microservice handles a specific business function (e.g., user management, transaction processing, reporting).

2. **API Gateway:**

   - Implement an API Gateway to manage and route requests to appropriate microservices.
   - Handle cross-cutting concerns like authentication, logging, and rate limiting at the gateway level.

3. **Scalability:**

   - Design for horizontal scalability, allowing services to scale independently based on load.
   - Use containerization (e.g., Docker) and orchestration tools (e.g., Kubernetes) to manage scaling.

4. **Database Management:**

   - Choose a suitable database (SQL, NoSQL) based on the requirements (e.g., PostgreSQL for relational data, MongoDB for document-based data).
   - Implement database replication and sharding for scalability and high availability.

5. **Event-Driven Architecture:**

   - Use message brokers (e.g., RabbitMQ, Kafka) for inter-service communication to decouple services and ensure reliability.
   - Implement event sourcing for auditing and tracking changes over time.

6. **Security:**

   - Implement robust authentication and authorization mechanisms (e.g., OAuth2, JWT).
   - Ensure secure data transmission using HTTPS and encrypt sensitive data at rest.
   - Regularly update dependencies and perform security audits.

7. **Error Handling and Logging:**

   - Implement centralized logging (e.g., ELK stack) to monitor and debug issues.
   - Ensure proper error handling to gracefully manage and recover from failures.

8. **Testing:**

   - Write comprehensive unit, integration, and end-to-end tests to ensure code quality.
   - Use testing frameworks like Jest and Supertest for Nest.js applications.

9. **Performance Monitoring:**

   - Use monitoring tools (e.g., Prometheus, Grafana) to track performance metrics.
   - Implement health checks and alerts to proactively manage issues.

10. **Documentation:**

    - Provide thorough API documentation using tools like Swagger or OpenAPI.
    - Maintain up-to-date technical and architectural documentation for developers.

11. **DevOps and CI/CD:**

    - Implement continuous integration and continuous deployment (CI/CD) pipelines.
    - Use tools like Jenkins, GitLab CI, or GitHub Actions to automate testing and deployment.

12. **Compliance:**

    - Ensure compliance with relevant regulations (e.g., GDPR, PCI-DSS) in the fintech domain.
    - Implement data protection and privacy measures accordingly.

13. **Caching:**

    - Use caching mechanisms (e.g., Redis) to improve performance and reduce load on the database.
    - Implement appropriate cache invalidation strategies.

14. **Rate Limiting and Throttling:**

    - Protect the system from abuse and ensure fair usage by implementing rate limiting and throttling mechanisms.

15. **Backup and Disaster Recovery:**
    - Set up regular backups and disaster recovery plans to protect against data loss and ensure business continuity.

## 🧪 Testing

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
