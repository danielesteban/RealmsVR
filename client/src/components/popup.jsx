import PropTypes from 'prop-types';
import React from 'react';
import { TiTimes } from 'react-icons/ti';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, .5);
`;

const Wrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 512px;
  background: #444;
  box-shadow: 0 0 32px rgba(0, 0, 0, .5);
`;

const Heading = styled.div`
  background: #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  > span {
    padding: 0 1.5em;
  }
  > a {
    padding: 1rem;
    cursor: pointer;
    > svg {
      font-size: 1.5em;
    }
  }
`;

const Content = styled.div`
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
  }
`;

const Popup = ({
  children,
  heading,
  isShowing,
  hide,
}) => {
  if (!isShowing) {
    return null;
  }
  return (
    <Overlay>
      <Wrapper>
        <Heading>
          {heading}
          <a
            onClick={hide}
          >
            <TiTimes />
          </a>
        </Heading>
        <Content>
          {children}
        </Content>
      </Wrapper>
    </Overlay>
  );
};

Popup.propTypes = {
  children: PropTypes.node.isRequired,
  heading: PropTypes.node.isRequired,
  isShowing: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
};

export default Popup;
