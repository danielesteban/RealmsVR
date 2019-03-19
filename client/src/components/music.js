import { PureComponent } from 'react';

class Music extends PureComponent {
  constructor(props) {
    super(props);
    // Shuffle tracks
    const tracks = [...Music.tracks];
    for (let index = tracks.length - 1; index >= 0; index -= 1) {
      const random = Math.floor(Math.random() * tracks.length);
      const temp = tracks[index];
      tracks[index] = tracks[random];
      tracks[random] = temp;
    }
    this.tracks = tracks;
    this.track = 0;
  }

  componentDidMount() {
    // Load soundcloud API
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://connect.soundcloud.com/sdk/sdk-3.3.1.js';
    document.body.appendChild(script);
    this.waitForFirstInteraction();
    this.waitForSoundcloudApi();
  }

  waitForFirstInteraction() {
    const first = () => {
      window.removeEventListener('mousedown', first);
      window.removeEventListener('touchstart', first);
      window.removeEventListener('vrdisplayactivate', first);
      this.hasInteracted = true;
      if (this.api) {
        this.play();
      }
    };
    window.addEventListener('mousedown', first, false);
    window.addEventListener('touchstart', first, false);
    window.addEventListener('vrdisplayactivate', first, false);
  }

  waitForSoundcloudApi() {
    if (!window.SC) {
      setTimeout(this.waitForSoundcloudApi.bind(this), 10);
      return;
    }
    // Initialize
    this.api = window.SC;
    this.api.initialize({
      client_id: 'eb5fcff9e107aab508431b4c3c416415',
    });
    // this.api.resolve('https://soundcloud.com/mikey-rogowski/sets/space-ambient').then(({ tracks }) => {
    //   console.log(JSON.stringify(tracks.map(({ id }) => (id))));
    // });
    // Start playing
    if (this.hasInteracted) {
      this.play();
    }
  }

  next() {
    this.track = (this.track + 1) % this.tracks.length;
    this.play();
  }

  play() {
    const {
      api,
      player,
      track,
      tracks,
    } = this;
    // Dispose current player (if any)
    if (player) {
      player.kill();
      delete this.player;
    }
    // Stream the current track
    const id = tracks[track];
    if (!__PRODUCTION__) {
      console.log(`playing: ${id}`);
    }
    api.stream(`/tracks/${id}`).then((player) => {
      this.player = player;
      player.on('audio_error', () => this.next());
      player.on('finish', () => this.next());
      player.setVolume(0.8);
      player.play();
    }).catch(() => {
      this.next();
    });
  }

  render() {
    return null;
  }
}

// eslint-disable-next-line
Music.tracks = [334831124,3654595,3654647,62965282,55529274,40801532,28921242,58102473,65194517,44049414,584470,348172961,348172759,118227213,58103033,58102746,255599053,29062473,73664676,217254339,26016069,143994169,34751566,22899851,19645145,14604316,14604145,9747273,290203217,290202627,290203029,290203125,230280393,230280565,230280839,290202890,230280665,230280740,174033188,238809205,219872323,85441920,85442027,85442324,85442658,295429557,31232642,118720768,66345578,64979755,9747680,3654444,354826097,174209343,374346584,374346578,374346566,374346536,374346518,374346506,374346440,272272960,82537981,272272962,331110005,253646536,69972925,297108748,95089740,264157290,3654394,51204969,28460870,270165801,93513660,107137565,200476847,241036508,345846433,13728685,3193491,235796705,74366070,293115267,65027631,226460783,132730188,267647225,331743020,348075711,328602395,232135696,13385987,261520524,303726380];

export default Music;
