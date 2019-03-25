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
            const check = () => {
              if (document.fonts.check(`1rem ${font}`)) {
                loaded[font] = true;
                resolve();
                return;
              }
              setTimeout(check, 10);
            };
            check();
          })
        ))
    );
  }
}

export default new Fonts();
