module.exports = {
  apps : [{
    name   : "xScraper",
    script : "./server.js"
  }],
  deploy: {

    production: {
      user: 'liexin',
      host: '35.227.115.93',
      key: '~/.ssh/id_rsa',
      ref: 'origin/master',
      repo: 'https://github.com/makeshapeshare/xScraper.git',
      path: '/home/liexin/xScraper',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
