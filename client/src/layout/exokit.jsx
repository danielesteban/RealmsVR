import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import Music from '@/components/music';
import Renderer from '@/components/renderer';
import Scenes from '@/scenes';

class Layout extends PureComponent {
  constructor(props) {
    super(props);
    this.renderer = React.createRef();
  }

  render() {
    const { renderer } = this;
    return (
      <div>
        <Renderer ref={renderer} />
        <Scenes renderer={renderer} />
        <Music renderUI={false} />
      </div>
    );
  }
}

export default hot(module)(Layout);
