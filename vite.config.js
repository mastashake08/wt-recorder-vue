import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const repoName = 'wt-recorder-vue';

export default defineConfig({
  plugins: [vue()],
  base: `/${repoName}/`, // Ensures correct asset paths
});
