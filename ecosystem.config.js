module.exports = {
  apps: [
    {
      name: 'shop-droneagri',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/var/www/shop-droneagri',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3020,
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: 'postgresql://droneagri:DroneAgri2024@localhost:5432/shop_droneagri',
        JWT_SECRET: 'droneagri-shop-jwt-secret-min-32-chars-long-production',
      },
    },
  ],
};
