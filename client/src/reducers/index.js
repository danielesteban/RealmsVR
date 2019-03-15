import { combineReducers } from 'redux';
import { i18nReducer as i18n } from 'react-redux-i18n';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';
import lobby from './lobby';
import realm from './realm';
import user from './user';

const rootReducer = combineReducers({
  i18n,
  loadingBar,
  lobby,
  realm,
  user,
});

export default rootReducer;
