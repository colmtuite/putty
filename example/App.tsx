import React from 'react';
import { cx } from './theme';

export function App() {
  return (
    <div>
      <div
        {...cx({
          margin: '0 auto',
          maxWidth: '960px',
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '$4',
          paddingRight: '$4',
        })}
      >
        <h1
          {...cx({
            fontFamily: 'test die grotesk d',
            fontSize: '$9',
            fontWeight: '$2',
            color: '$gray12',
            lineHeight: '$2',
          })}
        >
          Zero-runtime tooling for CSS
        </h1>

        <p
          {...cx({
            fontFamily: '$sans',
            fontSize: '$5',
            color: '$gray11',
            lineHeight: '$3',
          })}
        >
          Type-safe CSS-in-JS with zero runtime, mapping CSS properties to tokens, structured theme object.
        </p>

        <div
          {...cx({
            display: 'flex',
            gap: '$3',
            flexWrap: 'wrap',
          })}
        >
          <a
            {...cx({
              fontFamily: 'test die grotesk a',
              paddingInline: '$4',
              paddingBlock: '0',
              lineHeight: '1',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              backgroundImage: 'linear-gradient(to bottom, #008cff, #0073ff)',
              textDecoration: 'none',
              color: 'white',
              fontWeight: '$2',
              fontSize: '16px',
              borderRadius: '$5',
            })}
            href='https://github.com/zero-css/zero-css'
          >
            Primary Button
          </a>

          <a
            {...cx({
              fontFamily: 'test die grotesk a',
              paddingInline: '$4',
              paddingBlock: '0',
              lineHeight: '1',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              backgroundImage: 'linear-gradient(to bottom, #ededed, #e0e0e0)',
              textDecoration: 'none',
              color: 'black',
              fontWeight: '$2',
              fontSize: '16px',
              borderRadius: '$5',
            })}
            href='https://github.com/zero-css/zero-css'
          >
            Secondary Button
          </a>
        </div>

        <div
          {...cx({
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: '$4',
            marginTop: '$4',
          })}
        >
          <div>
            <h2>Built-in theme support</h2>
            <p
              {...cx({
                fontSize: '$2',
                marginTop: '$2',
                lineHeight: '$3',
              })}
            >
              Mobile-first breakpoints with object syntax
            </p>
          </div>
          <div
            {...cx({
              padding: '$4',
              backgroundColor: 'gainsboro',
              borderRadius: '$4',
              color: '$white',
            })}
          >
            <strong>Token mapping</strong>
            <p
              {...cx({
                fontSize: '$2',
                marginTop: '$2',
                lineHeight: '$3',
              })}
            >
              CSS custom properties from theme
            </p>
          </div>
          <div>
            <h2>Property shorthands</h2>
            <p
              {...cx({
                fontSize: '$2',
                marginTop: '$2',
                lineHeight: '$3',
              })}
            >
              Mobile-first breakpoints with object syntax
            </p>
          </div>
          <div
            {...cx({
              padding: '$4',
              backgroundColor: 'gainsboro',
              borderRadius: '$4',
              color: '$white',
            })}
          >
            <strong>Simplify syntax</strong>
            <p
              {...cx({
                fontSize: '$2',
                marginTop: '$2',
                lineHeight: '$3',
              })}
            >
              CSS custom properties from theme
            </p>
          </div>
          <div>
            <h2>Built-in theme support</h2>
            <p
              {...cx({
                fontSize: '$2',
                marginTop: '$2',
                lineHeight: '$3',
              })}
            >
              Mobile-first breakpoints with object syntax
            </p>
          </div>
          <div
            {...cx({
              padding: '$4',
              backgroundColor: 'gainsboro',
              borderRadius: '$4',
              color: '$white',
            })}
          >
            <strong>Tokens</strong>
            <p
              {...cx({
                fontSize: '$2',
                marginTop: '$2',
                lineHeight: '$3',
              })}
            >
              CSS custom properties from theme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
