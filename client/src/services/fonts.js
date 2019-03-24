class Fonts {
  constructor() {
    this.loaded = {};
  }

  waitUntilLoaded(fonts) {
    const { loaded } = this;
    if (!Array.isArray(fonts)) {
      fonts = [fonts];
    }
    return Promise.all(
      fonts
        .map(font => (
          new Promise((resolve) => {
            if (loaded[font]) {
              resolve();
              return;
            }
            const tester = document.createElement('div');
            tester.innerText = 'QW@HhsXJ\ue900';
            tester.style.position = 'absolute';
            tester.style.fontFamily = 'sans-serif';
            tester.style.top = '-999999px';
            document.body.appendChild(tester);
            const { width: initialWidth } = tester.getBoundingClientRect();
            const check = () => {
              const { width } = tester.getBoundingClientRect();
              if (Math.abs(width - initialWidth) > 1) {
                document.body.removeChild(tester);
                loaded[font] = true;
                resolve();
                return;
              }
              setTimeout(check, 10);
            };
            tester.style.fontFamily = font;
            setTimeout(check, 10);
          })
        ))
    );
  }
}

export default new Fonts();
