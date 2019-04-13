import React, { PureComponent } from 'react';
import {
  TiMediaFastForward,
  TiMediaPause,
  TiMediaPlay,
} from 'react-icons/ti';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 0 8px rgba(0, 0, 0, .4);
  > a > img {
    width: 100px;
    height: 100px;
    background: #000;
    border: 0;
    outline: none;
    vertical-align: middle;
  }
  > div {
    box-sizing: border-box;
    width: 250px;
    height: 100px;
    background: rgba(0, 0, 0, .5);
    padding: 0.5rem 1rem;
    border-radius: 0 4px 0 0;
    > a {
      display: block;
      text-decoration: none;
      outline: none;
      font-size: 1.25em;
      line-height: 1.5em;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
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

const Progress = styled.div`
  height: 3px;
  margin: 0.5rem 0;
  background-color: #333;
  border-radius: 2px;
  overflow: hidden;
  > div {
    height: 100%;
    background-color: #393;
  }
`;

const Controls = styled.div`
  display: flex;
  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #333;
    border: 1px solid #111;
    color: #fff;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    padding: 0.25rem 0;
    width: 2.5rem;
    border-radius: 2px;
    margin-right: 0.125rem;
    cursor: pointer;
    outline: none;
  }
`;

const MAX_UINT32 = (2 ** 32) - 1;
const aux = new Uint32Array(1);
const getRandomValue = ceiling => Math.floor(
  (
    window.crypto && window.crypto.getRandomValues ? (
      window.crypto.getRandomValues(aux)[0] / MAX_UINT32
    ) : (
      Math.random()
    )
  )
  * ceiling
);

class Music extends PureComponent {
  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.toggle = this.toggle.bind(this);
    // Shuffle tracks
    const tracks = [...Music.tracks];
    for (let index = tracks.length - 1; index >= 0; index -= 1) {
      const random = getRandomValue(index + 1);
      const temp = tracks[index];
      tracks[index] = tracks[random];
      tracks[random] = temp;
    }
    // Initialize state
    this.player = document.createElement('audio');
    this.player.ontimeupdate = this.onTimeUpdate.bind(this);
    this.player.onended = this.next;
    this.player.volume = 0.5;
    this.state = {
      isPlaying: false,
      playhead: 0,
      track: undefined,
    };
    this.track = 0;
    this.tracks = tracks;
  }

  componentDidMount() {
    this.waitForFirstInteraction();
  }

  onTimeUpdate() {
    const { player } = this;
    this.setState({
      playhead: player.currentTime / player.duration,
    });
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
    const { player, tracks } = this;
    // Stop current player
    if (!player.paused) {
      player.pause();
    }
    player.src = '';
    // Loop through the track list
    this.track = (this.track + 1) % tracks.length;
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
        this.setState({
          isPlaying: true,
          playhead: 0,
          track,
        });
      })
      .catch(() => (
        this.next()
      ));
  }

  toggle() {
    const { player } = this;
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
    this.setState({ isPlaying: !player.paused });
  }

  render() {
    const {
      isPlaying,
      playhead,
      track,
    } = this.state;
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
    let trackTitle = title;
    const userOnTitle = `${username} - `;
    if (trackTitle.indexOf(userOnTitle) === 0) {
      trackTitle = trackTitle.substr(userOnTitle.length);
    }
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
            {trackTitle}
          </a>
          <a
            href={userlink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {username}
          </a>
          <Progress>
            <div style={{ width: `${playhead * 100}%` }} />
          </Progress>
          <Controls>
            <button
              type="button"
              onClick={this.toggle}
            >
              {isPlaying ? <TiMediaPause /> : <TiMediaPlay />}
            </button>
            <button
              type="button"
              onClick={this.next}
            >
              <TiMediaFastForward />
            </button>
          </Controls>
        </div>
      </Wrapper>
    );
  }
}

// eslint-disable-next-line
Music.tracks = [334831124,3654595,3654647,62965282,55529274,40801532,28921242,58102473,44049414,584470,348172961,348172759,118227213,58103033,58102746,255599053,29062473,73664676,217254339,26016069,143994169,34751566,22899851,19645145,14604316,14604145,9747273,290203217,290202627,290203029,290203125,230280393,230280565,230280839,290202890,230280665,230280740,174033188,238809205,219872323,85441920,85442027,85442324,85442658,295429557,31232642,118720768,66345578,64979755,9747680,3654444,354826097,174209343,374346584,374346578,374346566,374346536,374346518,374346506,374346440,272272960,82537981,272272962,331110005,253646536,69972925,297108748,95089740,264157290,3654394,51204969,28460870,270165801,93513660,107137565,200476847,241036508,345846433,13728685,3193491,235796705,74366070,293115267,65027631,226460783,132730188,267647225,331743020,348075711,328602395,232135696,13385987,303726380];

export default Music;
