module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/app/apps/web",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "backend",
      cwd: "/app/apps/api",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
      },
    },
  ],
}

