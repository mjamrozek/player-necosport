/**
 * Prop types validator for HTML video tag childrens
 * @param propValue
 * @param key
 * @param componentName
 * @param location
 * @param propFullName
 * @returns Error|null
 */
export function videoChildrenValidator(propValue, key, componentName, location, propFullName) {
  if (propValue[key].type !== 'source') {
    return new Error(`Invalid prop ${propFullName} supplied to ${componentName}. Validation failed.`);
  }

  return null;
}

/**
 * Calculate percentage of played video based on current time and video duration
 * @param currentTime
 * @param duration
 * @returns {number}
 */
export function fromTimeToPercent(currentTime, duration) {
  return Math.ceil((currentTime/duration) * 10000) / 100;
}

/**
 * Calculate current video time based on percentage
 * @param percent
 * @param duration
 * @returns {number}
 */
export function fromPercentToTime(percent, duration) {
  return ((percent * duration) / 100);
}

/**
 * Fill missing chars with zeros (from left)
 * @param number
 * @param size
 * @returns {string}
 */
export function zerofill(number, size) {
  let numberString = number.toString();
  let numberLength = numberString.length;
  let toFill = size - numberLength;

  if (toFill <= 0) return numberString;

  let result = '0'.repeat(toFill) + numberString;

  return result;
}

/**
 * Format time with minutes and seconds from seconds
 * @param seconds
 * @returns {string}
 */
export function formatTime(time) {
  time = parseInt(time);

  let minutes = parseInt(time / 60);
  let hours = parseInt(minutes / 60);
  let seconds = time % 60;

  let formattedTime = `${zerofill(minutes, 2)}:${zerofill(seconds, 2)}`;

  if (hours > 0) {
    formattedTime = `${zerofill(hours, 2)}:${formattedTime}`;
  }

  return formattedTime;
}

/**
 * Check if browser is in fullscreen mode
 * @returns {boolean}
 */
export function isFullscreenMode() {
  return !!(document.fullScreen ||
    document.webkitIsFullScreen ||
    document.mozFullScreen ||
    document.msFullscreenElement ||
    document.fullscreenElement);
}

/**
 * Make request to fulscreen (fulscreen API)
 * @param target
 * @returns {void}
 */
export function requestFullscreen(target) {
  if (target.requestFullscreen) {
    target.requestFullscreen();
  } else if (target.webkitRequestFullscreen) {
    target.webkitRequestFullscreen();
  } else if (target.mozRequestFullScreen) {
    target.mozRequestFullScreen();
  } else if (target.msRequestFullscreen) {
    target.msRequestFullscreen();
  }
}

/**
 * Exit from fullsscreen mode (fulscreen API)
 * @returns {void}
 */
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}