import React from 'react';
import Icon from './Icon';
import Reveal from './Reveal';
import './TopperGrid.css';

const rankLabel = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];

/** Board position holders. Shared by the home page and the results page. */
const TopperGrid = ({ toppers, total = 1100 }) => (
  <ol className="topper-grid">
    {toppers.map((topper, i) => (
      <Reveal
        as="li"
        key={topper.name}
        delay={Math.min(i, 3) * 110}
        className={`topper${topper.rank === 1 ? ' topper--first' : ''}`}
      >
        <div className="topper__rank">
          <span className="topper__rank-num">{topper.rank}</span>
          <span className="topper__rank-word">{rankLabel[topper.rank]} position</span>
        </div>

        {topper.rank === 1 && (
          <span className="topper__crown">
            <Icon name="trophy" size={20} />
          </span>
        )}

        <h3 className="topper__name">{topper.name}</h3>

        <p className="topper__score">
          <span className="topper__marks">{topper.score}</span>
          <span className="topper__total">/{'\u2009'}{total}</span>
        </p>

        <div className="topper__meter" aria-hidden="true">
          <span style={{ width: `${(topper.score / total) * 100}%` }} />
        </div>

        <span className="topper__grade">Grade {topper.grade}</span>
      </Reveal>
    ))}
  </ol>
);

export default TopperGrid;
