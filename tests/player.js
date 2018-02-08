module.exports = {
  'Test if player is visible': function (browser) {
    browser
      .url('http://localhost:8080/')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('.player', 1000)
      .waitForElementVisible('.player__controls', 100)
      .waitForElementVisible('.video-state', 100)
      .end();
  }
};