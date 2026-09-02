import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { newsPosts, school, upcomingEvents } from '../data/site';
import './News.css';

const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const parts = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return {
    day: date.getDate(),
    month: date.toLocaleString('en-GB', { month: 'short' }),
    full: longDate.format(date),
  };
};

const News = () => (
  <div className="news-page">
    <PageHero
      tone="sky"
      variant="compact"
      breadcrumb="News & Events"
      eyebrow="Noticeboard"
      title="What is happening at school"
      lead="Announcements from the office and the dates families need in the diary. Anything urgent is also sent home with students."
    />

    <section className="section news-main">
      <div className="bg-dots" aria-hidden="true" />

      <div className="container news-main__grid">
        {/* ---------- Announcements ---------- */}
        <div className="news-column">
          <Reveal className="section-head">
            <p className="eyebrow">Announcements</p>
            <h2>Latest from the office</h2>
          </Reveal>

          <ol className="news-list">
            {newsPosts.map((post, i) => {
              const date = parts(post.date);
              return (
                <Reveal as="li" key={post.title} delay={Math.min(i, 2) * 90} className="news-item">
                  <div className="news-item__date">
                    <span className="news-item__day">{date.day}</span>
                    <span className="news-item__month">{date.month}</span>
                  </div>

                  <div className="news-item__body">
                    <span className="chip">{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <time dateTime={post.date} className="news-item__stamp">
                      {date.full}
                    </time>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>

        {/* ---------- Events calendar ---------- */}
        <aside className="events-column" aria-label="Upcoming events">
          <Reveal variant="right" className="events-panel">
            <div className="events-panel__head">
              <span className="icon-tile icon-tile--gold">
                <Icon name="clock" size={22} />
              </span>
              <div>
                <h2>Upcoming events</h2>
                <p>Dates for the coming session</p>
              </div>
            </div>

            <ol className="event-list">
              {upcomingEvents.map((event) => {
                const date = parts(event.date);
                return (
                  <li key={event.title}>
                    <div className="event-list__date">
                      <span>{date.month}</span>
                      <strong>{date.day}</strong>
                    </div>
                    <div className="event-list__body">
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                      <span className="event-list__audience">
                        <Icon name="users" size={13} />
                        {event.audience}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="events-panel__foot">
              <Icon name="phone" size={16} />
              <span>
                Dates can shift. Confirm with the office on{' '}
                <a href={school.phoneHref}>{school.phone}</a>.
              </span>
            </div>
          </Reveal>
        </aside>
      </div>
    </section>

    {/* ==================== CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">Stay in touch</p>
            <h2>Not receiving school notices?</h2>
            <p className="cta-panel__text">
              Make sure the office has your current phone number and email. Notices go out by
              SMS and are posted here on the same day.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/contact#enquiry" className="btn btn--primary btn--lg">
              Update your details
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </Link>
            <a href={school.phoneHref} className="btn btn--on-dark btn--lg">
              <Icon name="phone" size={17} />
              {school.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default News;
