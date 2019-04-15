import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.iframe`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 290px;
  height: 500px;
`;

const Discord = () => (
  <Wrapper
    allowtransparency
    frameBorder="0"
    src="https://discordapp.com/widget?id=567407250428264465&theme=dark"
    title="Discord"
  />
);

export default Discord;
