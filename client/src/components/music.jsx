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
    width: 220px;
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
  align-items: center;
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
  > span {
    margin-left: auto;
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
      time: '0:00',
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
    const min = Math.floor(player.currentTime / 60);
    const sec = Math.floor(player.currentTime % 60);
    this.setState({
      playhead: player.currentTime / player.duration,
      time: `${min}:${sec < 10 ? '0' : ''}${sec}`,
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
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Couldn't fetch track: ${id}`);
        }
        return res.json();
      })
      .then((track) => {
        // Cleanup track title
        const userOnTitle = `${track.user.username} - `;
        if (track.title.indexOf(userOnTitle) === 0) {
          track.title = track.title.substr(userOnTitle.length);
        }
        // Play the track
        player.src = `${track.stream_url}?${clientId}`;
        player.play();
        this.setState({
          isPlaying: true,
          playhead: 0,
          time: '0:00',
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
      time,
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
            <span>
              { time }
            </span>
          </Controls>
        </div>
      </Wrapper>
    );
  }
}

/* eslint-disable */
Music.tracks = [
  334831124,3654595,3654647,62965282,55529274,40801532,28921242,58102473,44049414,584470,348172961,348172759,118227213,58103033,58102746,29062473,73664676,217254339,26016069,143994169,34751566,22899851,19645145,14604316,14604145,9747273,290203217,290202627,290203029,290203125,230280393,230280565,230280839,290202890,230280665,230280740,174033188,238809205,219872323,85441920,85442027,85442324,85442658,295429557,31232642,118720768,66345578,64979755,9747680,3654444,354826097,174209343,374346584,374346578,374346566,374346536,374346518,374346506,374346440,272272960,82537981,272272962,331110005,253646536,69972925,297108748,95089740,264157290,3654394,51204969,28460870,270165801,93513660,107137565,200476847,241036508,345846433,13728685,3193491,235796705,74366070,293115267,65027631,226460783,132730188,267647225,331743020,348075711,328602395,232135696,13385987,303726380,
  319470292,312179497,300022056,212600702,336206149,319100206,299965683,308768675,202903037,220992150,221433894,223843476,155626389,155626391,306589305,304501298,305600086,300328640,283863336,283863306,260674048,117308221,78683752,340317786,277352612,226847547,220656015,224154466,240254433,249957904,260419888,250754945,235013168,336784751,277029337,229288316,343272434,343194325,334599482,343032721,343661072,343552665,344563095,285122161,1687603,286269026,340681124,265119655,345756307,351035779,350060806,352308515,353896778,353896991,353896595,355550264,360321368,337715872,272189608,43751468,65190792,200959753,347608134,133531982,183519916,185401372,42227482,376984973,372830927,376671563,376317227,342538038,338288083,338266624,265353084,159115092,122088683,85356706,69351024,18159187,28667337,169274681,221402560,402032439,401604759,416088969,424864200,424881921,426294102,430158741,441378576,440982825,438854664,451627668,285022424,416942091,289481139,236661381,289727425,302903905,284737661,275642447,291943120,284052253,228088399,209533328,90164812,43727131,175757015,
];
/* eslint-enable */

export default Music;
