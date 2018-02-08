import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Player from '../video/player';
import renderer from 'react-test-renderer';

import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

test('mouseenter / mouseleave events', () => {
  const component = renderer.create(
    <Player>
      <source
        src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
        type="video/mp4"
      />
    </Player>
  );

  let tree = component.toJSON();
  let componentInstance = component.getInstance();

  expect(componentInstance.state.mouseOver).toBe(false);

  // Trigger onMouseEnter event
  tree.props.onMouseEnter();
  expect(componentInstance.state.mouseOver).toBe(true);

  // Trigger onMouseLeave event
  tree.props.onMouseLeave();
  expect(componentInstance.state.mouseOver).toBe(false);
});

test('hide controls after timeout', done => {
  const hideControlsTimeout = 500;

  const component = renderer.create(
    <Player autohidecontrolsdelay={hideControlsTimeout}>
      <source
        src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
        type="video/mp4"
      />
    </Player>
  );

  let tree = component.toJSON();
  let componentInstance = component.getInstance();

  // Simulate video playing
  componentInstance.state.isPlaying = true;

  // Trigger onMouseEnter and onMouseLeave events
  tree.props.onMouseEnter();
  tree.props.onMouseLeave();

  // After mouse enter/leave on player controls should be shown
  expect(componentInstance.state.showControls).toBe(true);

  // Check if controls are visible
  setTimeout(() => {
    // After timeout controls should be hidden
    expect(componentInstance.state.showControls).toBe(false);

    // Check if Player have player--controls-hidden class
    tree = component.toJSON();
    expect(tree.props.className.match(/player--controls-hidden/)).not.toBeNull();

    done();
  }, hideControlsTimeout);
});

test('autoplay', () => {
  const component = renderer.create(
    <Player autoPlay>
      <source
        src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
        type="video/mp4"
      />
    </Player>
  );

  let componentInstance = component.getInstance();

  expect(componentInstance.state.isPlaying).toBe(true);

  // Hide controls when component is playing
  expect(componentInstance.state.showControls).toBe(false);
});

test('muted', () => {
  const component = renderer.create(
    <Player muted>
      <source
        src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
        type="video/mp4"
      />
    </Player>
  );

  let componentInstance = component.getInstance();

  expect(componentInstance.state.muted).toBe(true);
});

test('fullscreen mode button', () => {
  const player = mount(
    <Player>
      <source
        src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
        type="video/mp4"
      />
    </Player>
  );

  // Simulate click on fullscreen
  let fullscreenControl = player.find('.fullscreen');
  fullscreenControl.simulate('click');

  let playerInstance = player.instance();

  expect(playerInstance.state.fullscreen).toBe(true);

});

test('fullscreen mode double click on video area', () => {
  const player = mount(
    <Player>
      <source
        src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
        type="video/mp4"
      />
    </Player>
  );

  // Simulate click on video
  player.find('video').simulate('doubleclick');

  let playerInstance = player.instance();

  expect(playerInstance.state.fullscreen).toBe(true);
});