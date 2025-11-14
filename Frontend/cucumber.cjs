module.exports = {
  default: {
    require: ['features/**/*.cjs'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    publishQuiet: true,
    timeout: 60000 // 60 seconds timeout for each step
  },
  headless: {
    require: ['features/**/*.cjs'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    publishQuiet: true,
    timeout: 60000, // 60 seconds timeout for each step
    worldParameters: {
      headless: true
    }
  }
};