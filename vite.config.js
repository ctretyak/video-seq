export default {
  base: '/video-seq',
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        main: 'index.html',
        callback: 'callback.html',
        purervfc: 'pure-rvfc.html',
      },
    },
  }
}
