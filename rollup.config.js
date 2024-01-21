import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'multiplyingWTrail/main.js',  // Your main script file
	plugins: [resolve()]
    output: {
        file: 'multiplyingWTrail/bundle.js', // Output bundle
        format: 'iife'    // Format (iife for browsers)
    }
};

