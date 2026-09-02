import React from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import TopperGrid from '../components/TopperGrid';
import {
  gradeDistribution,
  placements,
  resultHistory,
  school,
  toppers,
} from '../data/site';
import './Results.css';

const latest = resultHistory[0];
const totalPlaced = placements.reduce((sum, p) => sum + p.count, 0);

const Results = () => (
  <div className="results-page">
    <PageHero
      breadcrumb="Results"
      tone="gold"
      variant="deep"
      eyebrow={`Matriculation ${latest.year}`}
      title="Results we publish in full"
      lead={`Every board cohort since 2020, with pass rates, grade spread and where our leavers went next. Examined under ${school.board}.`}
    />

    {/* ==================== HEADLINE ==================== */}
    <section className="section section--tight headline">
      <div className="container">
        <div className="headline-grid">
          {[
            { value: latest.passRate, suffix: '%', label: 'Pass rate', caption: `${latest.year} cohort` },
            { value: latest.aPlus, suffix: '', label: 'A+ grades', caption: `of ${latest.candidates} candidates` },
            { value: latest.topScore, suffix: '', label: 'Top score', caption: 'out of 1100 marks' },
            { value: totalPlaced, suffix: '', label: 'Placed in college', caption: 'Leavers of 2024' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90} className="headline-card">
              <span className="headline-card__value">
                <CountUp end={stat.value} duration={1.4} enableScrollSpy scrollSpyOnce />
                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
              </span>
              <span className="headline-card__label">{stat.label}</span>
              <span className="headline-card__caption">{stat.caption}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== TOPPERS ==================== */}
    <section className="section section--dark toppers-section">
      <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Position holders</p>
          <h2>Our {latest.year} toppers</h2>
          <p>
            Board examination performance out of 1100 marks. Four students crossed 1080 — every
            one of them an A+ grade.
          </p>
        </Reveal>

        <TopperGrid toppers={toppers} />
      </div>
    </section>

    {/* ==================== HISTORY ==================== */}
    <section className="section section--elevated history">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Five-year record</p>
          <h2>Board results since 2020</h2>
          <p>
            Pass rate is the share of candidates who cleared the board examination. A+ counts
            students scoring 1000 marks or above.
          </p>
        </Reveal>

        <Reveal variant="fade" className="table-wrap">
          <table className="results-table">
            <caption className="sr-only">
              Matriculation board results by year, 2020 to {latest.year}
            </caption>
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">Candidates</th>
                <th scope="col">Pass rate</th>
                <th scope="col">A+ grades</th>
                <th scope="col">Top score</th>
              </tr>
            </thead>
            <tbody>
              {resultHistory.map((row) => (
                <tr key={row.year} className={row.year === latest.year ? 'is-latest' : undefined}>
                  <th scope="row">
                    <span className="year-cell">
                      {row.year}
                      {row.year === latest.year && <span className="chip chip--gold">Latest</span>}
                    </span>
                  </th>
                  <td>{row.candidates}</td>
                  <td>
                    <span className="rate">
                      <span className="rate__bar" aria-hidden="true">
                        <span style={{ width: `${row.passRate}%` }} />
                      </span>
                      <span className="rate__value">{row.passRate}%</span>
                    </span>
                  </td>
                  <td>{row.aPlus}</td>
                  <td>{row.topScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <p className="history__note">
          Detailed sheets for the current cohort are compiled after the board announces results
          — call the office for provisional figures.
        </p>
      </div>
    </section>

    {/* ==================== GRADES + PLACEMENTS ==================== */}
    <section className="section section--sunken breakdown">
      <div className="container breakdown__grid">
        <Reveal variant="left" className="grade-panel">
          <p className="eyebrow">Grade spread</p>
          <h2>How the {latest.year} cohort graded</h2>
          <p className="breakdown__note">
            Share of candidates in each band. Nearly three quarters finished at A or above.
          </p>

          <ul className="grade-list">
            {gradeDistribution.map((band) => (
              <li key={band.grade}>
                <div className="grade-list__head">
                  <span className="grade-list__grade">{band.grade}</span>
                  <span className="grade-list__share">{band.share}%</span>
                </div>
                <div className="grade-list__bar" aria-hidden="true">
                  <span style={{ width: `${band.share}%` }} />
                </div>
                <span className="grade-list__note">{band.note}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variant="right" delay={120} className="placement-panel">
          <p className="eyebrow">Next steps</p>
          <h2>Where our leavers went</h2>
          <p className="breakdown__note">
            Colleges taken up by the {latest.year} Matriculation cohort.
          </p>

          <ul className="placement-list">
            {placements.map((place) => (
              <li key={place.institution}>
                <span className="icon-tile icon-tile--navy">
                  <Icon name="cap" size={18} />
                </span>
                <span className="placement-list__name">{place.institution}</span>
                <span className="placement-list__count">
                  {place.count}
                  <span className="sr-only"> students</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>

    {/* ==================== CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">Admissions</p>
            <h2>These results start in Grade 1</h2>
            <p className="cta-panel__text">
              Board performance is the sum of nine years of teaching before it. The earlier a
              student joins, the more of that we can give them.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/admissions" className="btn btn--gold btn--lg">
              Apply for admission
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </Link>
            <Link to="/academics" className="btn btn--on-dark btn--lg">
              How we teach
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Results;
