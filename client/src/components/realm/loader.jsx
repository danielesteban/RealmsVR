import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetch, reset } from '@/actions/realm';

class Loader extends Component {
  componentWillMount() {
    const {
      match: { params: { slug } },
      fetch,
    } = this.props;
    fetch(slug);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    return null;
  }
}

Loader.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  fetch: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};

export default withRouter(connect(
  () => ({}),
  {
    fetch,
    reset,
  }
)(Loader));
