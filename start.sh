

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"

echo "🚀 Starting MobiOs NIC Validator Application..."
echo ""

# Check Java
if ! command -v java &>/dev/null; then
  echo "❌ Java 17 is required but not found. Install from https://adoptium.net"
  exit 1
fi

# Check Maven
if ! command -v mvn &>/dev/null; then
  echo "❌ Maven is required but not found. Install from https://maven.apache.org"
  exit 1
fi

# Check Node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required but not found. Install from https://nodejs.org"
  exit 1
fi

echo "📦 Building backend (this may take a few minutes on first run)..."
cd "$BACKEND"
mvn clean install -DskipTests -q

echo ""
echo "🎯 Starting services..."
echo ""

start_service() {
  local name=$1
  local module=$2
  local port=$3
  echo "  ▶ Starting $name on port $port..."
  cd "$BACKEND/$module"
  mvn spring-boot:run -q &
  echo "    PID: $!"
  sleep 3
}

start_service "Eureka Server" "eureka-server" 8761
sleep 5  # Give Eureka time to fully start

start_service "API Gateway" "api-gateway" 8080
start_service "Auth Service" "auth-service" 8081
start_service "NIC Validation Service" "nic-service" 8083
start_service "File Processing Service" "file-service" 8082
start_service "Dashboard Service" "dashboard-service" 8084
start_service "Report Service" "report-service" 8085

echo ""
echo "⏳ Waiting for services to register with Eureka (15s)..."
sleep 15

echo ""
echo "🌐 Starting React Frontend..."
cd "$ROOT/frontend"
npm run dev &

echo ""
echo "✅ All services started!"
echo ""
echo "  📊 Eureka Dashboard:  http://localhost:8761"
echo "  🔀 API Gateway:       http://localhost:8080"
echo "  🌐 React App:         http://localhost:5173"
echo ""
echo "  🔑 Default Login: admin / 789789"
echo "  🔑 Default Login: bhanu / 123123"
echo ""
wait
