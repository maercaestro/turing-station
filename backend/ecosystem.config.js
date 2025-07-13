module.exports = {
  apps: [
    {
      name: "turing-station-backend",
      script: "server.js",
      cwd: "/home/ubuntu/turing-station/backend",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: "3001"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3001"
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/home/ubuntu/logs/turing-station-error.log",
      out_file: "/home/ubuntu/logs/turing-station-out.log",
      log_file: "/home/ubuntu/logs/turing-station-combined.log",
      time: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
