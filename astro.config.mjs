export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
