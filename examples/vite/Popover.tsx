import React from 'react';
import { Popover } from '@base-ui/react/popover';
import { cx } from 'puttycss';

export function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger
        {...cx({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 6,
          border: '1px solid var(--gray-6)',
          backgroundColor: 'white',
          color: 'var(--gray-12)',
          transition: 'background-color 100ms ease',
          '&:hover': {
            backgroundColor: 'var(--gray-4)',
          },
          '&:focus-visible': {
            outline: '2px solid var(--blue-9)',
            outlineOffset: -1,
          },
          '&[data-popup-open]': {
            backgroundColor: 'var(--gray-4)',
          },
        })}
      >
        <BellIcon />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            {...cx({
              paddingBlock: 16,
              paddingInline: 24,
              borderRadius: 8,
              backgroundColor: 'white',
              color: 'var(--gray-12)',
              boxShadow: 'var(--shadow-4)',
              border: '1px solid var(--gray-4)',
              transformOrigin: 'var(--transform-origin)',
              transition: 'transform 150ms, opacity 150ms',
              '&[data-starting-style]': {
                opacity: 0,
                transform: 'scale(0.95)',
              },
              '&[data-ending-style]': {
                opacity: 0,
                transform: 'scale(0.95)',
              },
            })}
          >
            <Popover.Arrow
              {...cx({
                display: 'flex',
                '&[data-side=bottom]': {
                  top: -8,
                },
                '&[data-side=top]': {
                  bottom: -8,
                  transform: 'rotate(180deg)',
                },
                '&[data-side=left]': {
                  right: -13,
                  transform: 'rotate(90deg)',
                },
                '&[data-side=right]': {
                  left: -13,
                  transform: 'rotate(-90deg)',
                },
              })}
            >
              <ArrowSvg />
            </Popover.Arrow>

            <Popover.Title
              {...cx({
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.25,
              })}
            >
              Notifications
            </Popover.Title>

            <Popover.Description
              {...cx({
                margin: 0,
                marginTop: 8,
                fontSize: 14,
                color: 'var(--gray-11)',
                lineHeight: 1.5,
              })}
            >
              You are all caught up. Good job!
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function BellIcon() {
  return (
    <svg fill="currentcolor" width="20" height="20" viewBox="0 0 16 16">
      <path d="M 8 1 C 7.453125 1 7 1.453125 7 2 L 7 3.140625 C 5.28125 3.589844 4 5.144531 4 7 L 4 10.984375 C 4 10.984375 3.984375 11.261719 3.851563 11.519531 C 3.71875 11.78125 3.558594 12 3 12 L 3 13 L 13 13 L 13 12 C 12.40625 12 12.253906 11.78125 12.128906 11.53125 C 12.003906 11.277344 12 11.003906 12 11.003906 L 12 7 C 12 5.144531 10.71875 3.589844 9 3.140625 L 9 2 C 9 1.453125 8.546875 1 8 1 Z M 8 13 C 7.449219 13 7 13.449219 7 14 C 7 14.550781 7.449219 15 8 15 C 8.550781 15 9 14.550781 9 14 C 9 13.449219 8.550781 13 8 13 Z M 8 4 C 9.664063 4 11 5.335938 11 7 L 11 10.996094 C 11 10.996094 10.988281 11.472656 11.234375 11.96875 C 11.238281 11.980469 11.246094 11.988281 11.25 12 L 4.726563 12 C 4.730469 11.992188 4.738281 11.984375 4.742188 11.980469 C 4.992188 11.488281 5 11.015625 5 11.015625 L 5 7 C 5 5.335938 6.335938 4 8 4 Z" />
    </svg>
  );
}

function ArrowSvg() {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        fill="white"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        fill="#ededed"
      />
    </svg>
  );
}

