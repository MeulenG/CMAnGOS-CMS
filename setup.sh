#!/bin/bash

echo "========================================="
echo "CMAnGOS CMS API - Database Setup"
echo "========================================="
echo ""

if ! command -v dotnet &> /dev/null; then
    echo ".NET SDK not found. Please install .NET 8.0 SDK"
    exit 1
fi

echo ".NET SDK found: $(dotnet --version)"
echo ""

echo "Please enter your MySQL connection details:"
read -p "MySQL Host (default: localhost): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "MySQL Port (default: 3306): " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -p "MySQL Username (default: root): " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "MySQL Password: " MYSQL_PASSWORD
echo ""

read -p "CMAnGOS Expansion (classic/tbc/wotlk, default: classic): " EXPANSION
EXPANSION=${EXPANSION:-classic}

read -p "Enable Auto-Detection? (y/n, default: y): " AUTO_DETECT
AUTO_DETECT=${AUTO_DETECT:-y}

if [ "$AUTO_DETECT" = "y" ] || [ "$AUTO_DETECT" = "Y" ]; then
    AUTO_DETECT_VALUE="true"
else
    AUTO_DETECT_VALUE="false"
fi

echo ""
echo "========================================="
echo "Configuration Summary:"
echo "========================================="
echo "Host: $MYSQL_HOST"
echo "Port: $MYSQL_PORT"
echo "User: $MYSQL_USER"
echo "Expansion: $EXPANSION"
echo "Auto-Detection: $AUTO_DETECT_VALUE"
echo ""

CONNECTION_STRING="Server=$MYSQL_HOST;Port=$MYSQL_PORT;Database={prefix}realmd;Uid=$MYSQL_USER;Pwd=$MYSQL_PASSWORD;"

echo "Updating appsettings.json..."

cat > CMAnGOS-CMS-API.Server/appsettings.json << EOF
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "RealmdDatabase": "$CONNECTION_STRING",
    "CharactersDatabase": "Server=$MYSQL_HOST;Port=$MYSQL_PORT;Database={prefix}characters;Uid=$MYSQL_USER;Pwd=$MYSQL_PASSWORD;",
    "MangosDatabase": "Server=$MYSQL_HOST;Port=$MYSQL_PORT;Database={prefix}mangos;Uid=$MYSQL_USER;Pwd=$MYSQL_PASSWORD;",
    "LogsDatabase": "Server=$MYSQL_HOST;Port=$MYSQL_PORT;Database={prefix}logs;Uid=$MYSQL_USER;Pwd=$MYSQL_PASSWORD;"
  },
  "CMAnGOS": {
    "ExpansionPrefix": "$EXPANSION",
    "AutoDetectExpansion": $AUTO_DETECT_VALUE
  },
  "AllowedHosts": "*"
}
EOF

echo "Configuration updated successfully!"
echo ""
echo "========================================="
echo "Building the application..."
echo "========================================="

cd CMAnGOS-CMS-API.Server
dotnet build

if [ $? -eq 0 ]; then
    echo ""
    echo "Build successful!"
    echo ""
    echo "========================================="
    echo "Setup Complete!"
    echo "========================================="
    echo ""
    echo "To start the server:"
    echo "  cd CMAnGOS-CMS-API.Server"
    echo "  dotnet run"
    echo ""
    echo "The API will be available at:"
    echo "  - https://localhost:5001"
    echo "  - Swagger UI: https://localhost:5001/swagger"
    echo ""
    echo "Test the connection:"
    echo "  curl https://localhost:5001/api/database/status"
    echo ""
else
    echo "Build failed. Please check the errors above."
    exit 1
fi
