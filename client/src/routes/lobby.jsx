import React from 'react';
import styled from 'styled-components';
import Session from '@/components/lobby/session';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Lobby = () => (
  <Wrapper>
    <Session />
  </Wrapper>
);

export default Lobby;
