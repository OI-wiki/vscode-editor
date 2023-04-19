const esbuildPlugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const polyfills = require("node-stdlib-browser");
const esbuild = require("esbuild");
(async () => {
    const globalShimsPath = require.resolve('node-stdlib-browser/helpers/esbuild/shim');
	const ctx = await esbuild.context({
		entryPoints: {
			extension: './src/web/extension.ts',
			preview: "./preview-src/index.ts"
		},
		bundle: true,
		outdir: './dist',
		external: ['vscode'],
		format: 'cjs',
		platform: 'node',
		tsconfig: './tsconfig.json',
		define: process.argv.includes('--production') ? { 'process.env.NODE_ENV': '"production"' } : undefined,
		minify: process.argv.includes('--production'),
		sourcemap: !process.argv.includes('--production'),
        plugins: [
            esbuildPlugin(polyfills),
            {
              name: 'vite-plugin-node-polyfills-shims-resolver',
              setup(build) {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
                const escapedGlobalShimsPath = globalShimsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const filter = new RegExp(`^${escapedGlobalShimsPath}$`);

                // https://esbuild.github.io/plugins/#on-resolve
                build.onResolve({ filter }, () => {
                  return {
                    // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1468
                    external: false,
                    path: globalShimsPath,
                  };
                });
              },
            },
          ],
	});

	if (process.argv.includes('--watch')) {
		await ctx.watch();
		console.log('watching...');
	}
	else {
		await ctx.rebuild();
		await ctx.dispose();
	}
})();