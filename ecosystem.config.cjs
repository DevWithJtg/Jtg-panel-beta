module.exports = {
  apps: [
    {
      name: "jtg-panel",
      script: "dist/server.cjs",
      env: {
        NODE_ENV: "production",
        // Notice port 3000 is required for AI Studio, but user wants 6767. 
        // We will run the server taking process.env.PORT || 6767
        PORT: 6767,
      },
    },
  ],
};
