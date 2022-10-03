import {
  render as renderRtl,
  screen,
  act,
  createEvent,
  fireEvent,
} from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import type { TextFieldProps } from './TextField';
import { TextField } from './TextField';

const user = userEvent.setup();

describe('TextField', () => {
  it('should trigger onPaste when pasting into input', () => {
    const handlePaste = jest.fn();
    render({
      onPaste: handlePaste,
    });

    const element = screen.getByRole('textbox');
    const paste = createEvent.paste(element, {
      clipboardData: {
        getData: () => 'hello world',
      },
    });

    fireEvent(element, paste);

    expect(handlePaste).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event when field loses focus', async () => {
    const handleChange = jest.fn();
    render({ onBlur: handleChange });

    const element = screen.getByRole('textbox');
    await user.click(element);
    expect(element).toHaveFocus();
    await user.tab();

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should trigger onChange event for each keystroke', async () => {
    const handleChange = jest.fn();
    render({ onChange: handleChange });

    const element = screen.getByRole('textbox');
    await user.click(element);
    expect(element).toHaveFocus();
    await user.keyboard('test');

    expect(handleChange).toHaveBeenCalledTimes(4);
  });

  describe('number-format-input', () => {
    it('should trigger onPaste when pasting into input', () => {
      const handlePaste = jest.fn();
      render({
        onPaste: handlePaste,
        formatting: { number: { prefix: '$' } },
      });

      const element = screen.getByRole('textbox');
      const paste = createEvent.paste(element, {
        clipboardData: {
          getData: () => '123456',
        },
      });

      fireEvent(element, paste);

      expect(handlePaste).toHaveBeenCalledTimes(1);
    });

    it('should render as a NumberFormat element if format.number is specified', () => {
      render({ isValid: true, formatting: { number: { prefix: '$' } } });
      expect(
        screen.getByTestId('id-formatted-number-default'),
      ).toBeInTheDocument();
    });

    it('should trigger onBlur event when field loses focus', async () => {
      const handleChange = jest.fn();
      render({ onBlur: handleChange, formatting: { number: { prefix: '$' } } });

      const element = screen.getByRole('textbox');
      await user.click(element);
      expect(element).toHaveFocus();
      await user.tab();

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should trigger onChange for every keystroke, and the event value should not contain formatting', async () => {
      let testValue;
      const handleChange = jest.fn(
        (event: React.ChangeEvent<HTMLInputElement>) => {
          testValue = event.target.value;
        },
      );
      render({
        onChange: handleChange,
        formatting: { number: { prefix: '$', thousandSeparator: ' ' } },
      });

      const element = screen.getByRole('textbox');
      await user.click(element);
      expect(element).toHaveFocus();

      await act(async () => {
        await user.keyboard('1234');
      });

      expect(screen.getByDisplayValue('$1 234')).toBeInTheDocument();
      expect(handleChange).toHaveBeenCalledTimes(4);
      expect(testValue).toBe('1234');
    });

    it('should not trigger onChange when component is rerendered', async () => {
      const handleChange = jest.fn();
      const { rerender } = render({
        onChange: handleChange,
        value: '1234',
        formatting: { number: { prefix: '$', thousandSeparator: ' ' } },
      });

      expect(screen.getByDisplayValue('$1 234')).toBeInTheDocument();
      expect(handleChange).not.toHaveBeenCalled();

      rerender(
        <TextField
          onChange={handleChange}
          value='12345'
          formatting={{ number: { prefix: '$', thousandSeparator: ' ' } }}
        />,
      );

      expect(screen.getByDisplayValue('$12 345')).toBeInTheDocument();
      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});

const render = (props: Partial<TextFieldProps> = {}) => {
  const allProps = {
    id: 'id',
    onChange: jest.fn(),
    ...props,
  } as TextFieldProps;

  return renderRtl(<TextField {...allProps} />);
};
