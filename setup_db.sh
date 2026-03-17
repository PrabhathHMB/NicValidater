#!/bin/bash
# Script to initialize the mobiO database
# Optimized for Mac (XAMPP/Brew/Standard)

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCHEMA_FILE="$SCRIPT_DIR/database/schema.sql"
DB_NAME="mobiO"

echo "🛠 Initializing database: $DB_NAME"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Schema file not found at $SCHEMA_FILE"
    exit 1
fi

# Define possible mysql binary paths
MYSQL_PATHS=(
    "/Applications/XAMPP/bin/mysql"
    "/usr/local/mysql/bin/mysql"
    "/opt/homebrew/bin/mysql"
    "/usr/local/bin/mysql"
    "mysql"
)

MYSQL_BIN=""
for path in "${MYSQL_PATHS[@]}"; do
    if command -v "$path" &>/dev/null; then
        MYSQL_BIN="$path"
        break
    fi
done

if [ -n "$MYSQL_BIN" ]; then
    echo "📦 Found MySQL binary at: $MYSQL_BIN"
    echo "📦 Running schema initialization..."
    "$MYSQL_BIN" -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null
    "$MYSQL_BIN" -u root "$DB_NAME" < "$SCHEMA_FILE"
    if [ $? -eq 0 ]; then
        echo "✅ Database $DB_NAME initialized successfully."
    else
        echo "❌ Failed to initialize database. Please check if MySQL is running."
        echo "Tip: If using XAMPP, ensure the MySQL module is started in the XAMPP Control Panel."
        exit 1
    fi
else
    echo "❌ 'mysql' command not found in common locations."
    echo "Please run the SQL script manually in your MySQL client:"
    echo "Source file: $SCHEMA_FILE"
    exit 1
fi
