function listRoutes(app) {
    const routes = [];
  
    function getRoutes(layer, basePath = '') {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
        const fullPath = basePath + layer.route.path;
        methods.forEach(method => routes.push({ method, path: fullPath }));
      } else if (layer.name === 'router' && layer.handle.stack) {
        const newBasePath = basePath + cleanRegex(layer.regexp);
        layer.handle.stack.forEach(subLayer => getRoutes(subLayer, newBasePath));
      }
    }
  
    function cleanRegex(regex) {
      return regex
        .toString()
        .replace(/^\/\^/, '')             // Remove leading /^
        .replace(/\\\/\?$/, '')           // Remove trailing \/?$
        .replace(/\(\?:\\\/\)\?/, '/')    // Clean up optional non-capturing groups
        .replace(/\(\?\=\\\/\|\$\)/, '')  // Remove non-capturing group
        .replace(/\?\//g, '')             // Remove '?/' patterns (optional segments)
        .replace(/\/i/, '')               // Remove /i for case-insensitive flags
        .replace(/\\/g, '');              // Remove unnecessary backslashes
    }
  
    app._router.stack.forEach(layer => getRoutes(layer));
  
    return routes;
  }
  
  module.exports = listRoutes;
  