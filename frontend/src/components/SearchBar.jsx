import React from "react";
import styles from "../styles/SearchBar.module.css";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Caută după titlu...",
}) {
  const hasValue = Boolean(value && value.trim());

  return (
    <div className={styles.wrapper}>
      <FiSearch className={styles.icon} />

      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {hasValue && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => onChange("")}
          aria-label="Șterge"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}