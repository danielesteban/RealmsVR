import React from 'react';
import Loader from '@/components/realm/loader';
import Mesher from '@/components/realm/mesher';
import Renderer from '@/components/realm/renderer';
import styled from 'styled-components';

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
