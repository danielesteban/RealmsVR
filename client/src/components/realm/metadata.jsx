import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { TiEdit } from 'react-icons/ti';
import { connect } from 'react-redux';
import { Translate } from 'react-redux-i18n';
import styled from 'styled-components';
import Popup from '@/components/popup';
import {
  hideMetadataPopup as hide,
  showMetadataPopup as show,
  updateMetadata as update,
} from '@/actions/realm';

const Toggle = styled.form`
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  .icon {
    position: absolute;
    font-size: 2.5rem;
    top: ${100 / 3}%;
    left: ${100 / 3}%;
    transform: translate(-50%, -50%);
  }
`;

const Content = styled.div`
  button {
    display: flex;
    align-items: center;
    border: 1px solid #555;
    background: #222;
    padding: 0.5rem 1rem;
    margin: 0;
    font-family: inherit;
    font-weight: 700;
    font-size: 1.2rem;
    color: inherit;
    cursor: pointer;
    outline: 0;
    > svg {
      font-size: 1.5em;
      margin-right: 0.5rem;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  > label {
    width: 100%;
    padding: 0;
  }
  > input {
    box-sizing: border-box;
    border: 1px solid #333;
    width: 100%;
    background: #222;
    color: inherit;
    font-family: inherit;
    font-weight: 400;
    font-size: 2em;
    padding: 0.5rem;
    margin: 0 0 1rem;
  }
`;

class Metadata extends PureComponent {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const { target: form } = e;
    const { update } = this.props;
    update({
      name: form.name.value,
    });
  }

  render() {
    const {
      isEditingMetadata,
      name,
      hide,
      show,
    } = this.props;
    return (
      <div>
        <Toggle
          onClick={show}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 250 250"
            fill="#fff"
          >
            <path
              d="M0,250 L250,0 L0,0 Z"
              fill="#000"
            />
          </svg>
          <TiEdit className="icon" />
        </Toggle>
        <Popup
          heading={<Translate value="Realm.editMetadata" />}
          isShowing={isEditingMetadata}
          hide={hide}
        >
          <Content>
            <Form
              onSubmit={this.onSubmit}
            >
              <label><Translate value="Realm.name" /></label>
              <input
                type="text"
                name="name"
                defaultValue={name}
                required
              />
              <button
                type="submit"
              >
                <TiEdit />
                <Translate value="Realm.save" />
              </button>
            </Form>
          </Content>
        </Popup>
      </div>
    );
  }
}

Metadata.propTypes = {
  isEditingMetadata: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  hide: PropTypes.func.isRequired,
  show: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
};

export default connect(
  ({
    realm: {
      isEditingMetadata,
      name,
    },
  }) => ({
    isEditingMetadata,
    name,
  }),
  {
    hide,
    show,
    update,
  }
)(Metadata);
