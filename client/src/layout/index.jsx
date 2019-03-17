import PropTypes from 'prop-types';
import React from 'react';
import LoadingBar from 'react-redux-loading-bar';
import styled from 'styled-components';
import Session from '@/components/session';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;

const loadingBarStyle = {
  backgroundColor: '#393',
  zIndex: 1,
};

const Layout = ({ children }) => (
  <div>
    <LoadingBar style={loadingBarStyle} />
    <Session />
    <Wrapper>
      { children }
    </Wrapper>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
