import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import LoadingBar from 'react-redux-loading-bar';
import styled from 'styled-components';
import Github from '@/components/github';
import Music from '@/components/music';
import Renderer from '@/components/renderer';
import Session from '@/components/session';
import Scenes from '@/scenes';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;

const loadingBarStyle = {
  backgroundColor: '#393',
  zIndex: 1,
};

class Layout extends PureComponent {
  constructor(props) {
    super(props);
    this.renderer = React.createRef();
  }

  render() {
    const { renderer } = this;
    const isScreenshot = window.__SCREENSHOT__;
    return (
      <div>
        <LoadingBar style={loadingBarStyle} />
        <Wrapper>
          <Renderer ref={renderer} />
        </Wrapper>
        <Scenes renderer={renderer} />
        <Music />
        {!isScreenshot ? <Github /> : null}
        <Session />
      </div>
    );
  }
}

export default hot(module)(Layout);
