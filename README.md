# Dicasa Analytics API

![Dicasa Logo](https://i.imgur.com/O8bS3bB.png)

[![Build Status](https://img.shields.io/travis/com/your-username/dicasa-analytics.svg?style=flat-square)](https://travis-ci.com/your-username/dicasa-analytics)
[![Coverage Status](https://img.shields.io/coveralls/github/your-username/dicasa-analytics.svg?style=flat-square)](https://coveralls.io/github/your-username/dicasa-analytics)
[![License: MIT](httpshttps://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Introduction

Dicasa Analytics is a robust backend service built with NestJS, designed to provide insightful analytics for the Dicasa real estate platform. It tracks user engagement, monitors security, and delivers key performance indicators (KPIs) to help optimize the user experience and business strategy.

## Features

- **Visit Tracking:** Monitors unique user visits and their navigation paths.
- **Session Management:** Tracks user sessions to calculate engagement metrics like average permanence time.
- **Appointment Scheduling Analytics:** Calculates the success rate of property appointment scheduling.
- **Security Monitoring:** Enforces HTTPS and logs connection attempts, alerting on insecure requests.
- **Metric Aggregation:** Provides endpoints for various metrics, including:
  - User permanence
  - HTTPS connection compliance
  - Appointment scheduling rates
- **Scalable Architecture:** Built with NestJS, providing a modular and scalable structure.

## Technologies Used

- [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [MongoDB](https://www.mongodb.com/) - A NoSQL database for storing analytics data.
- [Mongoose](https://mongoosejs.com/) - An elegant mongodb object modeling for node.js.
- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/dicasa-analytics.git
    cd dicasa-analytics
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:

    ```env
    DATABASE_URI=your-mongodb-connection-string
    PORT=3000
    ```

4.  **Run the application:**
    ```bash
    bun run start:dev
    ```

The application will be running on `http://localhost:3000`.

## API Endpoints

### Analytics

| Method | Endpoint                              | Description                                        |
| ------ | ------------------------------------- | -------------------------------------------------- |
| POST   | `/analytics/visit`                    | Creates a new visit record.                        |
| POST   | `/analytics/session/start`            | Starts a new user session.                         |
| POST   | `/analytics/session/heartbeat`        | Sends a heartbeat to keep a session alive.         |
| GET    | `/analytics/metrics/permanence`       | Retrieves user permanence metrics.                 |
| GET    | `/analytics/metrics/cipher`           | Retrieves HTTPS connection compliance metrics.     |
| GET    | `/analytics/metrics/scheduling-rate`  | Retrieves appointment scheduling rate metrics.     |
| GET    | `/analytics/visits`                   | Retrieves the total number of visits.              |
| GET    | `/analytics/visits/count/by-day?day=` | Retrieves the number of visits for a specific day. |

## Environment Variables

- `DATABASE_URI`: The connection string for your MongoDB database.
- `PORT`: The port on which the application will run. Defaults to `3000`.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
