module.exports = async () => {
  const { default: react } = await import('@vitejs/plugin-react');

  return {
    plugins: [react()],
    server: {
      port: 3001
    },
    esbuild: {
      loader: 'jsx'
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' }
      }
    }
  };
};