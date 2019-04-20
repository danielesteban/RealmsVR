import DefaultLayout from './default';
import ExokitLayout from './exokit';

export default () => {
  if (~window.navigator.userAgent.indexOf('Exokit')) {
    return ExokitLayout;
  }
  return DefaultLayout;
};
