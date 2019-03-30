
const puppeteer = require('puppeteer');

class Screenshots {
  constructor() {
    this.queue = [];
    puppeteer
      .launch({
        args: ['--no-sandbox'],
        headless: false,
      })
      .then((browser) => {
        this.browser = browser;
        this.processQueue();
      });
  }

  capture({ model, url }) {
    const { browser } = this;
    return browser
      .newPage()
      .then(page => (
        page
          // .on('console', msg => console.log('PAGE LOG:', msg.text()))
          .evaluateOnNewDocument('window.__SCREENSHOT__ = true')
          .then(() => (
            page
              .setViewport({ width: 512, height: 512 })
          ))
          .then(() => (
            page
              .goto(url)
          ))
          .then(() => (
            page
              .waitForFunction('!!window.__SCREENSHOT_READY__', { timeout: 10000 })
          ))
          .then(() => (
            page
              .screenshot({
                type: 'jpeg',
                quality: 85,
              })
          ))
          .then((buffer) => {
            model.screenshot = buffer;
            return model
              .save();
          })
          .finally(() => (
            page
              .close()
          ))
      ));
  }

  processQueue() {
    const { queue } = this;
    const job = queue.shift();
    if (!job) return;
    this.isBusy = true;
    this.capture(job)
      .catch(() => {})
      .finally(() => {
        this.isBusy = false;
        this.processQueue();
      });
  }

  update({ model, url }) {
    const { browser, isBusy, queue } = this;
    queue.push({ model, url });
    if (browser && !isBusy) {
      this.processQueue();
    }
  }
}

module.exports = new Screenshots();
