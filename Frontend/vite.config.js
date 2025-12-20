module.exports = async () => {
  // Dynamically Import The ESM-Only Plugin To Be Compatible When Running
  // This Config Under CommonJS. Vite Supports Returning A Promise That Resolves
  // To The Configuration Object.
  const { default: react } = await import('@vitejs/plugin-react');

  return {
    plugins: [react()],
    server: {
      port: 3000
    },
    // Treat .js Files As JSX So Existing CRA-Style .js Files With JSX Work Without Renaming
    esbuild: {
      loader: 'jsx'
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    }
  };
};