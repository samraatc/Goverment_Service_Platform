/**
 * PM2 Ecosystem Configuration
 * Government Services Aggregator Platform — Backend
 *
 * Usage:
 *   pm2 start ecosystem.config.js              # Start production
 *   pm2 start ecosystem.config.js --env dev    # Start development
 *   pm2 reload ecosystem.config.js             # Zero-downtime reload
 *   pm2 stop ecosystem.config.js               # Stop all
 *   pm2 delete ecosystem.config.js             # Remove from PM2
 *   pm2 save                                   # Save process list
 *   pm2 startup                                # Configure auto-start on boot
 */

module.exports = {
  apps: [
    // ─── Production App ─────────────────────────────────────────────────────
    {
      name: 'govservices-api',
      script: 'dist/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Cluster mode for load balancing
      autorestart: true,
      watch: false, // Never watch in production
      max_memory_restart: '500M',

      // ─── Environment ────────────────────────────────────────────────────
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_dev: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // ─── Logging ────────────────────────────────────────────────────────
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_type: 'json',

      // ─── Crash Recovery ─────────────────────────────────────────────────
      min_uptime: '10s', // Minimum uptime before considered stable
      max_restarts: 10, // Max restarts in min_uptime window
      restart_delay: 4000, // Delay between restarts (ms)
      exp_backoff_restart_delay: 100, // Exponential backoff for restarts

      // ─── Graceful Shutdown ──────────────────────────────────────────────
      kill_timeout: 5000, // Grace period before SIGKILL (ms)
      wait_ready: true, // Wait for process.send('ready')
      listen_timeout: 10000, // Time to wait for listen event (ms)
      shutdown_with_message: true,

      // ─── Node.js Arguments ──────────────────────────────────────────────
      node_args: [
        '--max-old-space-size=512', // Memory limit per instance
        '--enable-source-maps', // Source map support for stack traces
      ],

      // ─── Source Maps ────────────────────────────────────────────────────
      source_map_support: true,

      // ─── Monitoring ─────────────────────────────────────────────────────
      pmx: true, // Enable PM2+ monitoring integration
    },

    // ─── Development App (hot reload via tsx) ───────────────────────────────
    {
      name: 'govservices-api-dev',
      script: 'node_modules/.bin/tsx',
      args: 'watch src/server.ts',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false, // tsx watch handles this
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-dev-error.log',
      out_file: './logs/pm2-dev-out.log',
      merge_logs: true,
      interpreter: 'node',
    },
  ],

  // ─── PM2 Deploy Configuration ─────────────────────────────────────────────
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/govservices.git',
      path: '/var/www/govservices',
      'pre-deploy-local': '',
      'post-deploy':
        'cd backend && npm ci --omit=dev && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': '',
      ssh_options: ['StrictHostKeyChecking=no'],
    },

    staging: {
      user: 'deploy',
      host: ['your-staging-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/govservices.git',
      path: '/var/www/govservices-staging',
      'post-deploy':
        'cd backend && npm ci && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      ssh_options: ['StrictHostKeyChecking=no'],
    },
  },
};
