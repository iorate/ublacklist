const path = require('path');

module.exports = {
  exportMessages(messages) {
    return () => ({
      code: JSON.stringify(
        Object.fromEntries(
          Object.entries(messages).map(([messageName, message]) => [messageName, { message }]),
        ),
        null,
        2,
      ),
      cacheable: true,
      dependencies: [path.resolve(__dirname, 'locale.d.ts'), __filename],
    });
  },
};
