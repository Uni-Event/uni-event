import React, { useMemo } from "react";
import styles from "../../styles/EventStatsPanel.module.css";
import { FiUsers, FiCheckCircle, FiStar } from "react-icons/fi";

function pct(x) {
  const v = Number(x || 0) * 100;
  return `${Math.round(v)}%`;
}

function formatDateShort(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Dată invalidă";
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(user) {
  const fn = user?.first_name || "";
  const ln = user?.last_name || "";
  const text = `${fn} ${ln}`.trim();
  if (!text) return "U";
  const parts = text.split(" ").filter(Boolean);
  return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
}

export default function EventStatsPanel({ event, stats, loading, error }) {
  const breakdown = useMemo(() => stats?.rating_breakdown || {}, [stats]);
  const reviews = useMemo(() => stats?.latest_reviews || [], [stats]);

  const ticketsTotal = stats?.tickets_total ?? 0;
  const checkedIn = stats?.checked_in_total ?? 0;
  const rate = stats?.checkin_rate ?? 0;
  const avg = stats?.avg_rating ?? 0;
  const reviewsCount = stats?.reviews_count ?? 0;

  const maxBreak = Math.max(
    1,
    ...[1, 2, 3, 4, 5].map((i) => Number(breakdown?.[String(i)] || 0))
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.sectionTitle}>Statistici eveniment</div>
          <h2 className={styles.title}>{event?.title || "Eveniment"}</h2>
          <div className={styles.subtitle}>
            {formatDateShort(event?.start_date)} → {formatDateShort(event?.end_date)}
          </div>
        </div>
      </div>

      {loading ? <div className={styles.info}>Se încarcă statisticile…</div> : null}
      {!loading && error ? <div className={styles.error}>{error}</div> : null}

      {!loading && !error && stats ? (
        <>
          {/* KPI */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <FiUsers className={styles.kpiIcon} />
              <div>
                <div className={styles.kpiLabel}>Înscriși</div>
                <div className={styles.kpiValue}>{ticketsTotal}</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <FiCheckCircle className={styles.kpiIcon} />
              <div>
                <div className={styles.kpiLabel}>Validări</div>
                <div className={styles.kpiValue}>{checkedIn}</div>
                <div className={styles.kpiHint}>Rată: {pct(rate)}</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <FiStar className={styles.kpiIcon} />
              <div>
                <div className={styles.kpiLabel}>Rating</div>
                <div className={styles.kpiValue}>{avg ? avg.toFixed(1) : "0.0"}</div>
                <div className={styles.kpiHint}>{reviewsCount} review-uri</div>
              </div>
            </div>
          </div>

          {/* Rating breakdown + reviews */}
          <div className={styles.grid2}>
            <div className={styles.box}>
              <div className={styles.boxTitle}>Distribuție rating</div>

              <div className={styles.breakdown}>
                {[5, 4, 3, 2, 1].map((i) => {
                  const c = Number(breakdown?.[String(i)] || 0);
                  const w = Math.round((c / maxBreak) * 100);
                  return (
                    <div key={i} className={styles.breakRow}>
                      <div className={styles.breakLeft}>
                        <span className={styles.starNum}>{i}</span>
                        <FiStar className={styles.starIcon} />
                      </div>

                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${w}%` }} />
                      </div>

                      <div className={styles.count}>{c}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.box}>
              <div className={styles.boxTitle}>Ultimele feedback-uri</div>

              {reviews.length ? (
                <div className={styles.reviews}>
                  {reviews.map((r) => (
                    <div key={r.id} className={styles.reviewRow}>
                      <div className={styles.avatar}>
                        {initials(r.user)}
                      </div>

                      <div className={styles.reviewBody}>
                        <div className={styles.reviewTop}>
                          <div className={styles.name}>
                            {(r.user?.first_name || r.user?.last_name)
                              ? `${r.user?.first_name || ""} ${r.user?.last_name || ""}`.trim()
                              : (r.user?.email || "User")}
                          </div>
                          <div className={styles.rating}>
                            <FiStar />
                            <span>{r.rating}</span>
                          </div>
                        </div>

                        <div className={styles.comment}>
                          {(r.comment || "").trim() || "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.info}>Nu există review-uri încă.</div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}