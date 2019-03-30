import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  > a > img {
    width: 100px;
    height: 100px;
    background: #000;
    border: 0;
    outline: none;
    vertical-align: middle;
  }
  > div {
    background: rgba(0, 0, 0, .5);
    font-size: 1.4em;
    line-height: 1.5em;
    padding: 0.5rem 1rem;
    border-radius: 0 4px 0 0;
    > a {
      display: block;
      text-decoration: none;
      outline: none;
      &:hover {
        text-decoration: underline;
      }
    }
    > a:nth-child(1) {
      color: #eee;
    }
    > a:nth-child(2) {
      color: #aaa;
    }
  }
`;

class Music extends PureComponent {
  constructor(props) {
    super(props);
    // Shuffle tracks
    const tracks = [...Music.tracks];
    for (let iteration = 0; iteration < ((Date.now() % 10) + 1); iteration += 1) {
      for (let index = tracks.length - 1; index >= 0; index -= 1) {
        const random = Math.floor(Math.random() * tracks.length);
        const temp = tracks[index];
        tracks[index] = tracks[random];
        tracks[random] = temp;
      }
    }
    // Initialize state
    this.player = document.createElement('audio');
    this.player.onended = this.next.bind(this);
    this.player.volume = 0.5;
    this.state = { track: undefined };
    this.tracks = tracks;
    this.track = 0;
  }

  componentDidMount() {
    this.waitForFirstInteraction();
  }

  waitForFirstInteraction() {
    const first = () => {
      window.removeEventListener('mousedown', first);
      window.removeEventListener('touchstart', first);
      window.removeEventListener('vrdisplayactivate', first);
      this.play();
    };
    window.addEventListener('mousedown', first, false);
    window.addEventListener('touchstart', first, false);
    window.addEventListener('vrdisplayactivate', first, false);
  }

  next() {
    const { player } = this;
    // Stop current player
    if (!player.paused) {
      player.pause();
    }
    player.src = '';
    // Loop through the track list
    this.track = (this.track + 1) % this.tracks.length;
    this.play();
  }

  play() {
    const {
      player,
      track,
      tracks,
    } = this;
    // Fetch the current track
    const clientId = 'client_id=eb5fcff9e107aab508431b4c3c416415';
    const id = tracks[track];
    if (!__PRODUCTION__) {
      console.log(`playing: ${id}`);
    }
    fetch(`https://api.soundcloud.com/tracks/${id}?format=json&${clientId}`)
      .then(res => res.json())
      .then((track) => {
        if (!track) {
          throw new Error(`Couldn't fetch track: ${id}`);
        }
        // Play the track
        player.src = `${track.stream_url}?${clientId}`;
        player.play();
        this.setState({ track });
      })
      .catch(() => (
        this.next()
      ));
  }

  render() {
    const { track } = this.state;
    if (!track) {
      return null;
    }
    const {
      title,
      artwork_url: artwork,
      permalink_url: link,
      user: { username, permalink_url: userlink },
      waveform_url: waveform,
    } = track;
    return (
      <Wrapper>
        <a
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          <img alt={title} src={artwork || waveform} />
        </a>
        <div>
          <a
            href={link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {title}
          </a>
          <a
            href={userlink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {username}
          </a>
        </div>
      </Wrapper>
    );
  }
}

// eslint-disable-next-line
Music.tracks = [334831124,3654595,3654647,62965282,55529274,40801532,28921242,58102473,65194517,44049414,584470,348172961,348172759,118227213,58103033,58102746,255599053,29062473,73664676,217254339,26016069,143994169,34751566,22899851,19645145,14604316,14604145,9747273,290203217,290202627,290203029,290203125,230280393,230280565,230280839,290202890,230280665,230280740,174033188,238809205,219872323,85441920,85442027,85442324,85442658,295429557,31232642,118720768,66345578,64979755,9747680,3654444,354826097,174209343,374346584,374346578,374346566,374346536,374346518,374346506,374346440,272272960,82537981,272272962,331110005,253646536,69972925,297108748,95089740,264157290,3654394,51204969,28460870,270165801,93513660,107137565,200476847,241036508,345846433,13728685,3193491,235796705,74366070,293115267,65027631,226460783,132730188,267647225,331743020,348075711,328602395,232135696,13385987,303726380];

export default Music;
