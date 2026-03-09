/** إخفاء تحذير source-map من stylis-plugin-rtl */
module.exports = {
  webpack: {
    configure: (config) => {
      const rule = config.module.rules.find(
        (r) => r.enforce === 'pre' && r.use?.some?.((u) => String(u?.loader || u).includes('source-map-loader'))
      );
      if (rule) {
        const prev = rule.exclude;
        rule.exclude = [
          ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
          /stylis-plugin-rtl/,
        ];
      }
      return config;
    },
  },
};
