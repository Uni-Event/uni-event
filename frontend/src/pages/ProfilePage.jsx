import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import styles from "../styles/Profile.module.css";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // organizer request
  const [orgReq, setOrgReq] = useState(null);
  const [orgReqLoading, setOrgReqLoading] = useState(true);
  const [orgReqError, setOrgReqError] = useState("");

  const [orgName, setOrgName] = useState("");
  const [orgDetails, setOrgDetails] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgMsg, setOrgMsg] = useState("");

  // change password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusUi = useMemo(() => {
    const s = orgReq?.status;
    if (s === "approved") return { text: "Aprobat", cls: styles.badgeApproved };
    if (s === "rejected") return { text: "Respins", cls: styles.badgeRejected };
    if (s === "pending") return { text: "În așteptare", cls: styles.badgePending };
    return null;
  }, [orgReq?.status]);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const res = await api.get("/api/users/profile/");
      setProfile(res.data);
    } catch (e) {
      const status = e?.response?.status;
      setProfile(null);
      setProfileError(
        status === 401
          ? "Trebuie să fii autentificat ca să vezi profilul."
          : "Nu am putut încărca profilul."
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchOrganizerRequest = useCallback(async () => {
    setOrgReqLoading(true);
    setOrgReqError("");
    setOrgMsg("");
    try {
      const res = await api.get("/api/users/organizer-request/me/");
      setOrgReq(res.data);
    } catch (e) {
      const status = e?.response?.status;
      // 404 => nu există cerere
      if (status === 404) {
        setOrgReq(null);
      } else if (status === 401) {
        setOrgReq(null);
        setOrgReqError("Trebuie să fii autentificat.");
      } else {
        setOrgReq(null);
        setOrgReqError("Nu am putut încărca cererea de organizator.");
      }
    } finally {
      setOrgReqLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    // cererea are sens doar dacă user-ul NU e organizer (dar o putem cere oricum)
    fetchOrganizerRequest();
  }, [fetchOrganizerRequest]);

  const submitOrganizerRequest = async () => {
    setOrgMsg("");
    setOrgReqError("");

    if (!orgName.trim()) {
      setOrgReqError("Completează numele organizației.");
      return;
    }

    setOrgSaving(true);
    try {
      const res = await api.post("/api/users/organizer-request/", {
        organization_name: orgName.trim(),
        details: orgDetails.trim(),
      });
      setOrgReq(res.data);
      setOrgMsg("Cererea a fost trimisă.");
      setOrgName("");
      setOrgDetails("");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        "Nu am putut trimite cererea.";
      setOrgReqError(String(msg));
    } finally {
      setOrgSaving(false);
    }
  };

  const submitChangePassword = async () => {
    setPassMsg("");
    setPassError("");

    if (!oldPass || !newPass || !newPass2) {
      setPassError("Completează toate câmpurile.");
      return;
    }
    if (newPass !== newPass2) {
      setPassError("Parolele noi nu se potrivesc.");
      return;
    }

    setPassSaving(true);
    try {
      const res = await api.post("/api/users/change-password/", {
        old_password: oldPass,
        new_password: newPass,
        new_password2: newPass2,
      });

      setPassMsg(res?.data?.detail || "Parola a fost schimbată.");
      setOldPass("");
      setNewPass("");
      setNewPass2("");
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data?.detail ||
        data?.old_password ||
        data?.new_password ||
        data?.new_password2 ||
        (typeof data === "string" ? data : null) ||
        "Nu am putut schimba parola.";
      setPassError(Array.isArray(msg) ? String(msg[0]) : String(msg));
    } finally {
      setPassSaving(false);
    }
  };

  const isOrganizer = Boolean(profile?.is_organizer);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Profil</h1>
            <p className={styles.subtitle}>Datele contului și setări.</p>
          </div>

          <button
            className={styles.refreshBtn}
            type="button"
            onClick={() => {
              fetchProfile();
              fetchOrganizerRequest();
            }}
            disabled={profileLoading || orgReqLoading}
            title="Reîncarcă"
          >
            Reîncarcă
          </button>
        </div>

        {profileLoading && <p>Se încarcă...</p>}
        {!profileLoading && profileError && (
          <p className={styles.error}>{profileError}</p>
        )}

        {!profileLoading && !profileError && profile && (
          <div className={styles.grid}>
            {/* ACCOUNT CARD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.sectionTitle}>Date cont</div>
                  <div className={styles.sectionHint}>Informații de bază</div>
                </div>

                <span className={`${styles.badge} ${isOrganizer ? styles.badgeApproved : styles.badgeNeutral}`}>
                  {isOrganizer ? "Organizator" : "Utilizator"}
                </span>
              </div>

              <div className={styles.kv}>
                <div className={styles.kRow}>
                  <div className={styles.k}>Email</div>
                  <div className={styles.v}>{profile.email || "—"}</div>
                </div>

                <div className={styles.kRow}>
                  <div className={styles.k}>Nume</div>
                  <div className={styles.v}>
                    {`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "—"}
                  </div>
                </div>

                <div className={styles.kRow}>
                  <div className={styles.k}>Student</div>
                  <div className={styles.v}>{profile.is_student ? "Da" : "Nu"}</div>
                </div>

                <div className={styles.kRow}>
                  <div className={styles.k}>Creat la</div>
                  <div className={styles.v}>{formatDate(profile.date_joined)}</div>
                </div>
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.sectionTitle}>Schimbă parola</div>
                  <div className={styles.sectionHint}>Pentru securitatea contului</div>
                </div>
              </div>

              <div className={styles.form}>
                <Field
                  label="Parola veche"
                  type="password"
                  value={oldPass}
                  onChange={setOldPass}
                  placeholder="••••••••"
                />
                <div className={styles.twoCols}>
                  <Field
                    label="Parola nouă"
                    type="password"
                    value={newPass}
                    onChange={setNewPass}
                    placeholder="Minim 8 caractere"
                  />
                  <Field
                    label="Confirmă parola nouă"
                    type="password"
                    value={newPass2}
                    onChange={setNewPass2}
                    placeholder="Repetă parola"
                  />
                </div>

                {passError ? <div className={styles.errorBox}>{passError}</div> : null}
                {passMsg ? <div className={styles.successBox}>{passMsg}</div> : null}

                <div className={styles.actions}>
                  <button
                    className={styles.primaryBtn}
                    type="button"
                    onClick={submitChangePassword}
                    disabled={passSaving}
                    title={passSaving ? "Se salvează..." : "Schimbă parola"}
                  >
                    {passSaving ? "Se salvează..." : "Schimbă parola"}
                  </button>
                </div>
              </div>
            </div>

            {/* ORGANIZER REQUEST (only if not organizer) */}
            {!isOrganizer && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.sectionTitle}>Devino organizator</div>
                    <div className={styles.sectionHint}>
                      Trimite o cerere pentru a putea publica și gestiona evenimente.
                    </div>
                  </div>
                </div>

                {orgReqLoading ? (
                  <p className={styles.muted}>Se încarcă...</p>
                ) : orgReq ? (
                  <div className={styles.reqBox}>
                    <div className={styles.reqTop}>
                      <div className={styles.reqTitle}>
                        Cerere trimisă: <b>{orgReq.organization_name || "—"}</b>
                      </div>
                      {statusUi ? (
                        <span className={`${styles.badge} ${statusUi.cls}`}>
                          {statusUi.text}
                        </span>
                      ) : null}
                    </div>

                    {orgReq.details ? (
                      <div className={styles.reqDetails}>{orgReq.details}</div>
                    ) : (
                      <div className={styles.reqDetailsMuted}>Fără detalii.</div>
                    )}

                    <div className={styles.reqMeta}>
                      Trimisa la: <b>{formatDate(orgReq.created_at)}</b>
                    </div>

                    {orgReqError ? <div className={styles.errorBox}>{orgReqError}</div> : null}
                    {orgMsg ? <div className={styles.successBox}>{orgMsg}</div> : null}
                  </div>
                ) : (
                  <div className={styles.form}>
                    <Field
                      label="Nume organizație"
                      value={orgName}
                      onChange={setOrgName}
                      placeholder="Ex: Liga Studenților, Facultatea X..."
                    />

                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Detalii</div>
                      <textarea
                        className={styles.textarea}
                        value={orgDetails}
                        onChange={(e) => setOrgDetails(e.target.value)}
                        placeholder="Spune pe scurt cine ești și ce tip de evenimente vei organiza..."
                        rows={5}
                      />
                      <div className={styles.helper}>
                        Opțional — ajută adminul să aprobe mai repede.
                      </div>
                    </div>

                    {orgReqError ? <div className={styles.errorBox}>{orgReqError}</div> : null}
                    {orgMsg ? <div className={styles.successBox}>{orgMsg}</div> : null}

                    <div className={styles.actions}>
                      <button
                        className={styles.primaryBtn}
                        type="button"
                        onClick={submitOrganizerRequest}
                        disabled={orgSaving}
                      >
                        {orgSaving ? "Se trimite..." : "Trimite cererea"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <input
        className={styles.input}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default ProfilePage;