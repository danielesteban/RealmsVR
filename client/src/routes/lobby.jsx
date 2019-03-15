import React from 'react';
import styled from 'styled-components';
import Renderer from '@/components/lobby/renderer';
import Session from '@/components/lobby/session';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Lobby = () => (
  <Wrapper>
    <Renderer />
    <Session />
  </Wrapper>
);

export default Lobby;
