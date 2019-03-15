import React from 'react';
import styled from 'styled-components';
import Loader from '@/components/realm/loader';
import Mesher from '@/components/realm/mesher';
import Renderer from '@/components/realm/renderer';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Realm = () => (
  <Wrapper>
    <Loader />
    <Mesher />
    <Renderer />
  </Wrapper>
);

export default Realm;
