import React, { Component } from 'react';

import Player from '@/components/video/player';

class App extends Component {
  render() {
    return (
      <div className="container">
        <h1 className="mt-4 mb-4">NECOsport player example</h1>

        <div className="text-center">
          {/*Feel free to use HTML5 video tag props on Player component such as muted, autoPlay etc.*/}
          <Player className="embed-responsive">
            <source
              src="https://s3-eu-west-1.amazonaws.com/onrewind-test-bucket/big_buck_bunny.mp4"
              type="video/mp4"
            />
          </Player>
        </div>

      </div>
    );
  }
}

export default App;