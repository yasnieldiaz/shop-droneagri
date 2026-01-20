module.exports = {
  apps: [
    {
      name: 'shop-droneagri',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/shop.droneagri.pl',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
