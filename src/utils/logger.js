// Logger 
function info(message, meta = null) {
  if (meta) {
    console.log(`[INFO] ${message}`, meta);
    return;
  }
  console.log(`[INFO] ${message}`);
}

function warn(message, meta = null) {
  if (meta) {
    console.warn(`[WARN] ${message}`, meta);
    return;
  }
  console.warn(`[WARN] ${message}`);
}

function error(message, meta = null) {
  if (meta) {
    console.error(`[ERROR] ${message}`, meta);
    return;
  }
  console.error(`[ERROR] ${message}`);
}

module.exports = { logger: { info, warn, error } };
// Implemeting logging
