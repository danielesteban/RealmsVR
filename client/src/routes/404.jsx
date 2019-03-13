import React from 'react';
import { TiArrowBack } from 'react-icons/ti';
import { Translate } from 'react-redux-i18n';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Status = styled.div`
  font-size: 6em;
  line-height: 0.8em;
  color: #656565;
  margin-bottom: 2rem;
`;

const Description = styled.div`
  font-size: 1.5em;
`;

const Alternative = styled.div`
  margin: 2rem 0 4rem;
  > a {
    display: flex;
    align-items: center;
    text-decoration: none;
    font-size: 1.2em;
    color: inherit;
    > svg {
      margin-right: 0.5rem;
    }
  }
`;

const NotFound = () => (
  <Wrapper>
    <Status>
      404
    </Status>
    <Description>
      <Translate value="NotFound.description" />
    </Description>
    <Alternative>
      <Link to={{ pathname: '/' }}>
        <TiArrowBack />
        <Translate value="NotFound.goBack" />
      </Link>
    </Alternative>
  </Wrapper>
);

export default NotFound;
