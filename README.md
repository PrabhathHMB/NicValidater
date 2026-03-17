# MobiOs NIC Validator Application

A full-stack, microservices-based application designed to validate Sri Lankan National Identity Card (NIC) numbers. It processes both old and new NIC formats, extracting key details such as Date of Birth, Age, and Gender.

## 🌟 Key Features

- **NIC Validation**: Highly accurate parsing and validation for both old (e.g., `901234567V`) and new (e.g., `199012345678`) NIC formats.
- **Batch Processing**: Upload CSV files for batch processing of multiple NIC numbers.
- **Dashboard & Reporting**: Real-time statistics and generated reports available through a dedicated dashboard.
- **User Management**: Secure authentication and role-based authorization (Admin / User).
- **Microservices Architecture**: Built with Spring Cloud, utilizing an API Gateway and Netflix Eureka for service discovery.

## 🏗️ Architecture Stack

### Backend (Java / Spring Boot)
- **API Gateway** (Port `8080`)
- **Eureka Service Registry** (Port `8761`)
- **Auth Service** (Port `8081`)
- **File Processing Service** (Port `8082`)
- **NIC Validation Service** (Port `8083`)
- **Dashboard Service** (Port `8084`)
- **Report Service** (Port `8085`)

### Frontend (React / Vite)
- Modern, responsive Single Page Application (SPA) running on Port `5173`.

## ⚙️ Prerequisites

To run this project locally, ensure you have the following installed:
- [Java 17+](https://adoptium.net/)
- [Maven](https://maven.apache.org/)
- [Node.js & npm](https://nodejs.org/)

## 🚀 Getting Started

1. **Navigate to the project root:**
   ```bash
   cd /path/to/mobiOs
   ```

2. **Initialize Database:**
   (If required, execute the DB setup script)
   ```bash
   chmod +x setup_db.sh
   ./setup_db.sh
   ```

3. **Run the Application:**
   The project includes a convenient startup script that builds the backend modules, starts all Spring Boot microservices, and launches the React frontend.
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   *Note: The first run may take a few minutes as Maven downloads dependencies and builds the project.*

4. **Access the Services:**
   Once the script finishes starting all services:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)
   - **Gateway API**: [http://localhost:8080](http://localhost:8080)
   - **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)

## 🔐 Default Credentials

You can log in to the application using the following test accounts:
- **Admin**: `admin` / `789789`
- **User**: `bhanu` / `123123`

## 📂 Project Structure

- `/backend` - Contains all Spring Boot microservice modules.
- `/frontend` - Contains the React Vite application.
- `/test-data` - Sample test datasets (e.g., CSV files for batch upload).
- `/start.sh` - Automated build and startup shell script.
- `/setup_db.sh` - Database initialization script.
- `nic-backend.postman_collection.json` - Postman collection for API testing.

## 🛠️ Troubleshooting

- **Service Registration**: Microservices may take around 15 seconds to register with the Eureka server. If the frontend cannot reach the API right after startup, wait a few moments and try again.
- **Port Conflicts**: Ensure ports `5173`, `8080-8085`, and `8761` are completely free on your host machine before starting the script.
