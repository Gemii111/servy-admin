/** Suppress broken source-map warning from stylis-plugin-rtl in node_modules */
module.exports = {
  webpack: {
    configure: (config) => {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /Failed to parse source map/,
        (warning) => {
          const resource =
            warning?.module?.resource ??
            warning?.file ??
            (typeof warning === 'string' ? warning : '');
          return String(resource).includes('stylis-plugin-rtl');
        },
      ];

      const patchSourceMapRules = (rules) => {
        if (!Array.isArray(rules)) return;
        for (const rule of rules) {
          if (rule.oneOf) patchSourceMapRules(rule.oneOf);
          const uses = rule.use
            ? Array.isArray(rule.use)
              ? rule.use
              : [rule.use]
            : rule.loader
              ? [{ loader: rule.loader }]
              : [];
          const hasSourceMapLoader = uses.some((u) =>
            String(u?.loader || u).includes('source-map-loader')
          );
          if (hasSourceMapLoader) {
            const prev = rule.exclude;
            rule.exclude = [
              ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
              /node_modules[\\/]stylis-plugin-rtl/,
            ];
          }
        }
      };

      patchSourceMapRules(config.module?.rules);
      return config;
    },
  },
};
