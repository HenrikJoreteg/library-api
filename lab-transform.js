// The test framework 'lab' https://github.com/hapijs/lab
// uses this to allow us to write ES6
var Babel = require('babel-core')

module.exports = [
  {
    ext: '.js',
    transform: function (content, filename) {
      var result
      // Make sure to only transform your code or the dependencies we wrote
      if (filename.indexOf('node_modules') === -1) {
        result = Babel.transform(content, { sourceMap: 'inline', filename: filename, sourceFileName: filename })
        return result.code
      }

      return content
    }
  }
]
