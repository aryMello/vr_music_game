// ========================================
// UTILITY FUNCTIONS MODULE
// ========================================

class Utils {
  static logInfo(...args) {
    console.log('ℹ️ [INFO]', ...args);
  }

  static logDebug(...args) {
    console.log('🔍 [DEBUG]', ...args);
  }

  static logWarn(...args) {
    console.warn('⚠️ [WARN]', ...args);
  }

  static logError(...args) {
    console.error('❌ [ERROR]', ...args);
  }
}

export default Utils;
