import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';

import {
  videoChildrenValidator,
  fromTimeToPercent,
  fromPercentToTime,
  formatTime,
  isFullscreenMode,
  requestFullscreen,
  exitFullscreen
} from '@/utils';

class Player extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(videoChildrenValidator),
      videoChildrenValidator
    ]),
    autoPlay: PropTypes.bool,
    autohidecontrolsdelay: PropTypes.number         // Hide controls delay when playing and mouse is outside player (ms)
  }

  static defaultProps = {
    autohidecontrolsdelay: 3000
  }

  constructor(props) {
    super(props);

    // Reference to player and video tag
    this.player = null;
    this.video = null;

    // Reference to timer which hide controls
    this.hideControlsTimer = null;

    this.state = {
      isPlaying: !!props.autoPlay,
      progress: 0,                    // How many percent of the movie has been played
      remainingTime: 0,               // Remaining time
      mouseOver: false,               // Is mouse over player?
      mouseMoving: false,             // Is mouse moving over player?
      showControls: !props.autoPlay,  // Show controls when component loads
      muted: !!props.muted,
      fullscreen: isFullscreenMode()  // Is player in fullscreen mode?
    };

    this.getCurrentProgress = this.getCurrentProgress.bind(this);
    this.getRemainingTime = this.getRemainingTime.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.onTimeUpdate = _.debounce(this.onTimeUpdate.bind(this), 150);
    this.onEnd = this.onEnd.bind(this);
    this.mute = this.mute.bind(this);
    this.unmute = this.unmute.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.enterFullscreen = this.enterFullscreen.bind(this);
    this.exitFullscreen = this.exitFullscreen.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  render() {
    // Isolate necessary props from rest props
    const {
      children,
      ...restProps
    } = this.props;

    // Define/overwrite props for video tag based on rest of Player props
    // This approach will allow us to pass extra props to video tag in <Player/>
    let videoProps = {
      ...restProps,
      controls: false             // Disable native controls
    };

    let playerClasses = classNames('player', {
      'player--fullscreen': this.state.fullscreen,
      'player--controls-hidden': !this.state.showControls
    });

    let videoStateIconClasses = classNames('fa', {
      'fa-play': !this.state.isPlaying,
      'fa-pause': this.state.isPlaying
    });

    let soundClasses = classNames('fa', {
      'fa-volume-off': this.state.muted,
      'fa-volume-up': !this.state.muted,
    });

    return (
      <div
        className={playerClasses}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        ref={player => this.player = player}
      >

        <video
          onClick={this.togglePlay}
          onDoubleClick={this.toggleFullscreen}
          ref={video => this.video = video}
          {...videoProps}
        >
          {children}
        </video>

        <div className="player__controls">
          <div className="video-state" onClick={this.togglePlay}>
            <i className={videoStateIconClasses}></i>
          </div>
          <div className="progress-bar">
            <input
              className="progress-bar__range"
              type="range"
              min="1"
              max="100"
              step="0.01"
              value={this.state.progress}
              onChange={this.updateProgressBar}
            />
          </div>
          <div className="remain-time">
            {formatTime(this.state.remainingTime)}
          </div>
          <div className="sound" onClick={this.toggleMute}>
            <i className={soundClasses}></i>
          </div>
          <div className="fullscreen" onClick={this.toggleFullscreen}>
            <i className="fa fa-expand"></i>
          </div>
        </div>

      </div>
    );
  }

  componentDidMount() {
    if (this.video === null) return;

    this.video.addEventListener('timeupdate', this.onTimeUpdate);
    this.video.addEventListener('ended', this.onEnd);

    // Calculate remaining time when video file has been loaded (before remainingTime and duration is NaN)
    this.video.addEventListener('loadeddata', () => this.setState({ remainingTime: this.getRemainingTime() }));
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      isPlaying,
      mouseOver,
      showControls
    } = this.state;

    // Show controls on mouse over
    if (!showControls && mouseOver) {
      this.setState({ showControls: true });
    }

    // Hide controls with delay (if defined), mouseOver falling edge (from true to false)
    if (showControls && isPlaying && this.hideControlsTimer === null && !mouseOver && prevState.mouseOver) {
      // Clear previous hide controls timer if exists
      if (this.hideControlsTimer) clearTimeout(this.hideControlsTimer);

      this.hideControlsTimer = setTimeout(() => {
        this.hideControlsTimer = null;

        // Check if video is playing (for safety) and hide controls
        if (isPlaying) this.setState({ showControls: false });
      }, this.props.autohidecontrolsdelay);
    }
  }

  getCurrentProgress() {
    return fromTimeToPercent(this.video.currentTime, this.video.duration);
  }

  getRemainingTime() {
    return parseInt(this.video.duration - this.video.currentTime);
  }

  onMouseEnter() {
    this.setState({ mouseOver: true });
  }

  onMouseLeave() {
    this.setState({ mouseOver: false });
  }

  play(time) {
    this.setState({ isPlaying: true }, () => {
      if (time !== undefined) this.video.currentTime = time;
      this.video.play()
    });
  }

  pause() {
    this.setState({ isPlaying: false }, () => this.video.pause());
  }

  togglePlay() {
    this.state.isPlaying ? this.pause() : this.play();
  }

  updateProgressBar(event) {
    let progress = event.target.value;
    let ended = (progress === 100);

    this.setState({
      isPlaying: !ended,
      remainingTime: this.getRemainingTime(),
      progress
    });

    // Pause video if user rewind to end (play with given time otherwise)
    if (ended) {
      this.pause();
    } else {
      this.play(fromPercentToTime(progress, this.video.duration))
    }
  }

  onTimeUpdate() {
    this.setState({
      progress: this.getCurrentProgress(),
      remainingTime: this.getRemainingTime()
    });
  }

  onEnd() {
    this.setState({
      isPlaying: false,
      remainingTime: this.getRemainingTime(),
      showControls: true
    });
  }

  mute() {
    this.setState({ muted: true }, () => this.video.muted = true);
  }

  unmute() {
    this.setState({ muted: false }, () => this.video.muted = false);
  }

  toggleMute() {
    this.state.muted ? this.unmute() : this.mute();
  }

  enterFullscreen() {
    this.setState({ fullscreen: true }, () => requestFullscreen(this.player));
  }

  exitFullscreen() {
    this.setState({ fullscreen: false }, () => exitFullscreen(this.player));
  }

  toggleFullscreen() {
    this.state.fullscreen ? this.exitFullscreen() : this.enterFullscreen();
  }

  componentWillUnmount() {
    // Clear hide controls timer
    if (this.hideControlsTimer) clearTimeout(this.hideControlsTimer);
  }
}

export default Player;